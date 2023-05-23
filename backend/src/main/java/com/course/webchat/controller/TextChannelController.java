package com.course.webchat.controller;

import com.course.webchat.entity.*;
import com.course.webchat.exception.TextChannelNotFoundException;
import com.course.webchat.repository.TemporaryLinkRepository;
import com.course.webchat.service.ChatService;
import com.course.webchat.service.TemporaryLinkService;
import com.course.webchat.service.TextChannelService;
import com.course.webchat.utils.CurrentUser;
import com.course.webchat.utils.responses.ConnectChatResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/text-channels")
public class TextChannelController {

    final
    SimpMessagingTemplate template;
    private final TextChannelService textChannelService;


    private final TemporaryLinkRepository temporaryLinkRepository;

    private final ChatService chatService;

    private final TemporaryLinkService temporaryLinkService;


    @Autowired
    public TextChannelController(TextChannelService textChannelService,
                                ChatService chatService, SimpMessagingTemplate template,
                                TemporaryLinkRepository temporaryLinkRepository,
                                 TemporaryLinkService temporaryLinkService) {
        this.textChannelService = textChannelService;
        this.chatService = chatService;
        this.template = template;
        this.temporaryLinkRepository = temporaryLinkRepository;
        this.temporaryLinkService = temporaryLinkService;
    }


    @Operation(
            tags = {"Text Channels"},
            summary = "Create a text channel",
            description = "Creates a new text channel with the provided information. The text channel is created by the " +
                    "authenticated user, and it returns a response with HTTP status 200 (OK) and the created text channel " +
                    "details in the response body."
    )
    @PostMapping
    public ResponseEntity<ConnectChatResponse> createTextChannel(@RequestBody TextChannel textChannel,
                                                                 @CurrentUser User user) {
        TextChannel createdTextChannel = textChannelService.createTextChannel(textChannel);
        Chat chat = chatService.createChat(createdTextChannel, user);
        return new ResponseEntity<>(ConnectChatResponse.builder()
                .chatId(chat.getTextChannel().getId())
                .chatName(chat.getTextChannel().getName()).build()
                , HttpStatus.OK);
    }

    @Operation(
            tags = {"Text Channels"},
            summary = "Get a text channel by ID",
            description = "Retrieves the text channel with the specified ID. It returns a response with HTTP status 200 (OK) " +
                    "and the text channel in the response body if it is found. If the text channel is not found, " +
                    "it returns an HTTP status 404 (Not Found) without a response body."
    )
    @GetMapping("/{id}")
    public ResponseEntity<TextChannel> getTextChannel(@PathVariable Long id) {
        Optional<TextChannel> textChannel = textChannelService.getTextChannelById(id);
        return textChannel.map(channel ->
                new ResponseEntity<>(channel, HttpStatus.OK)).orElseGet(() ->
                new ResponseEntity<>(HttpStatus.NOT_FOUND));
    }

    @Operation(
            tags = {"Text Channels"},
            summary = "Connect to a text channel",
            description = "This operation connects the current user to a text channel using a temporary link."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully connected to the text channel"),
            @ApiResponse(responseCode = "409", description = "Conflict: User is the creator of the temporary link or already connected to the text channel"),
            @ApiResponse(responseCode = "404", description = "Not Found: Temporary link not found")
    })
    @PostMapping("/connect/{link}")
    public ResponseEntity<?> connectTextChannel(@CurrentUser User user, @PathVariable String link) {
        Optional<TemporaryLink> optionalTemporaryLink = temporaryLinkRepository.findByLink(link);
        if (optionalTemporaryLink.isPresent()) {
            TemporaryLink temporaryLink = optionalTemporaryLink.get();
            User creatorUser = temporaryLink.getUser();
            if (creatorUser.equals(user)) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }

            if (chatService.getChatByTextChannelAndUser(temporaryLink.getTextChannel(), user).isPresent()) {
                return new ResponseEntity<>(HttpStatus.CONFLICT);
            }

            return textChannelService.connectToTextChannel(temporaryLink, user);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully disconnected from the text channel"),
            @ApiResponse(responseCode = "404", description = "Not Found: Text channel not found")
    })
    @DeleteMapping("/disconnect/{channelId}")
    public ResponseEntity<?> disconnectTextChannel(@CurrentUser User user, @PathVariable String channelId) {
        Optional<TextChannel> textChannel = textChannelService.getTextChannelById(Long.valueOf(channelId));
        if (textChannel.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        return textChannelService.disconnectFromTextChannel(textChannel.get(), user);
    }

    @Operation(
            tags = {"Temporary Links"},
            summary = "Create a temporary link for a text channel",
            description = "This operation creates a temporary link for a text channel with the specified ID. " +
                    "The temporary link allows users to connect to the text channel temporarily."
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "Successfully created a temporary link",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = Map.class))),
            @ApiResponse(responseCode = "404", description = "Not Found: Text channel not found")
    })
    @PostMapping("/temporary-link/{channelId}")
    public ResponseEntity<?> createTemporaryLink(@PathVariable Long channelId, @CurrentUser User user) {
        Optional<TextChannel> textChannel = textChannelService.getTextChannelById(channelId);
        if (textChannel.isEmpty()) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        Optional<TemporaryLink> temporaryLinkPresented = temporaryLinkRepository.findByTextChannelAndUser(
                textChannel.get(), user);
        if (temporaryLinkPresented.isPresent()) {
            TemporaryLink existingLink = temporaryLinkPresented.get();
            if (existingLink.getExpiryDate().after(new Date())) {
                return new ResponseEntity<>(Map.of(
                        "link", existingLink.getLink(),
                        "channelId", textChannel.get().getId()
                ), HttpStatus.OK);
            } else {
                temporaryLinkRepository.delete(existingLink);
            }
        }
        String link = textChannelService.generateUniqueLink();
        Date expiryDate = temporaryLinkService.getExpiryDate();
        TemporaryLink temporaryLink = textChannelService.createTemporaryLink(link, user, textChannel.get(), expiryDate);
        temporaryLinkRepository.save(temporaryLink);

        return new ResponseEntity<>(Map.of(
                "link", link,
                "channelId", textChannel.get().getId()
        ), HttpStatus.OK);
    }


    @Operation(
            tags = {"Text Channels"},
            summary = "Get the users in a text channel",
            description = "Retrieves the users present in the specified text channel identified by its ID. It returns a response " +
                    "with HTTP status 200 (OK) and a list of users in the response body. If the text channel is not found, " +
                    "it returns an HTTP status 404 (Not Found) without a response body."
    )
    @GetMapping("/{textChannelId}/users")
    public ResponseEntity<?> getUsersInTextChannel(@PathVariable Long textChannelId) {
        try{
            return new ResponseEntity<>(chatService.getUsersInTextChannel(textChannelId)
                    , HttpStatus.OK);

        }catch(TextChannelNotFoundException e){
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}
