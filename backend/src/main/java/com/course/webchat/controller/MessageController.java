package com.course.webchat.controller;

import com.course.webchat.entity.Message;
import com.course.webchat.entity.Reaction;
import com.course.webchat.entity.User;
import com.course.webchat.service.ImageService;
import com.course.webchat.service.ChatResponseService;
import com.course.webchat.service.MessageService;
import com.course.webchat.utils.CurrentUser;
import com.course.webchat.utils.responses.ChatResponse;
import com.course.webchat.utils.responses.UserResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/messages")
public class MessageController {
    private final SimpMessagingTemplate template;
    private final MessageService messageService;
    private final ImageService imageService;
    private final ChatResponseService chatResponseService;

    public MessageController(SimpMessagingTemplate template, MessageService messageService,
                            ImageService imageService,
                             ChatResponseService chatResponseService) {
        this.template = template;
        this.messageService = messageService;

        this.imageService = imageService;
        this.chatResponseService = chatResponseService;
    }


    private ChatResponse createChatResponse(Message message) {
        ChatResponse chatResponse = new ChatResponse();
        chatResponse.setChatId(message.getTextChannel().getId());
        chatResponse.setMessageId(message.getId());
        chatResponse.setMessage(message.getContent());
        User author = message.getAuthor();
        if (author != null) {
            UserResponse userResponse = new UserResponse();
            userResponse.setUid(author.getId());
            userResponse.setLastName(author.getLastName());
            userResponse.setFirstName(author.getFirstName());
            String userImageName = author.getImage();
            if (userImageName != null && !userImageName.isEmpty()) {
                userResponse.setImage(imageService.refactorImage(author.getImage()));
            }
            ChatResponseService.setReactionList(message, chatResponse, userResponse);
        }

        chatResponse.setCreatedAt(message.getCreatedAt());
        chatResponse.setType(message.getType());
        return chatResponse;
    }

    @Operation(
            tags = {"Messages"},
            summary = "Retrieve messages by text channel ID",
            description = "This operation retrieves a list of messages from the database that correspond" +
                    " to the text channel ID specified in the URL path."
    )
    @GetMapping("/{textChannelId}")
    public ResponseEntity<List<ChatResponse>> getMessagesByTextChannelId(@PathVariable Long textChannelId){
        List<Message> channelMessages = messageService.getMessagesByTextChannelId(textChannelId);
        if(channelMessages == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        List<ChatResponse> chatResponse = new ArrayList<>();
        for (Message message : channelMessages) {
            chatResponse.add( createChatResponse(message));
        }
        return new ResponseEntity<>(chatResponse, HttpStatus.OK);
    }

    @Operation(
            tags = {"Messages"},
            summary = "Create a reaction to a message",
            description = "This operation creates a new reaction for the message with the specified ID, " +
                    "or updates the count of an existing reaction of the same type if the user has already reacted to " +
                    "the message with that type of reaction.")
    @PostMapping("/{id}/reactions")
    public ResponseEntity<?> createReaction(@PathVariable Long id, @RequestBody Reaction reaction,
                                            @CurrentUser User user) {
        messageService.createReaction(id, reaction, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(tags = {"Messages"}, summary = "Reduce or delete reaction of message",
            description = "This operation reduce the count of an existing reaction for the message with the specified " +
                    "ID if count bigger than  one, " +
                    "or delete an existing reaction of the same type if the count equals one")
    @PutMapping("/{id}/reactions")
    public ResponseEntity<?> putReaction(@PathVariable Long id, @RequestBody Reaction reaction,
                                         @CurrentUser User user) {
        messageService.updateReaction(id, reaction, user);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @Operation(tags = {"Messages"}, summary = "Create a user message in channel with ID",
            description = "Creates a new message in a text channel with the specified ID. " +
                    "The message must include a message content and an author. " +
                    "The response contains the created message and a ChatResponse object. " +
                    "The WebSocket topic is used to broadcast the new message to all connected clients in real-time."
            ,requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(description =
            "The request body contains the message details to be created.",
            content = @Content(schema = @Schema(implementation = ChatResponse.class))))
    @PostMapping("/{textChannelId}")
    public ResponseEntity<ChatResponse> createMessage(@PathVariable Long textChannelId, @RequestBody Message message,
                                                      @CurrentUser User user) {

        Message createdMessage = messageService.saveMessage(textChannelId, message, user);
        ChatResponse chatResponse = chatResponseService.createChatResponse(createdMessage);
        template.convertAndSend("/topic/message", Map.of("method", "add-message",
                "message",chatResponse));
        return new ResponseEntity<>(chatResponse, HttpStatus.OK);}

    @Operation(tags = {"Messages"}, summary = "Edit Message",
            description = "This API endpoint allows a user to edit an existing message.")
    @PutMapping
    public ResponseEntity<ChatResponse> editMessage(@RequestBody Message message,
                                                    @CurrentUser User ignoredUser){
        Message editedMessage = messageService.editMessage(message);
        ChatResponse chatResponse = chatResponseService.createChatResponse(editedMessage);
        template.convertAndSend("/topic/message", Map.of("method", "add-message",
                "message",chatResponse));
        return new ResponseEntity<>(chatResponse, HttpStatus.OK);
    }


    @Operation(
            summary = "Delete a message",
            description = "Deletes a message with the specified ID and sends the ID" +
                    " to the corresponding WebSocket topic.",
            tags = {"Messages"}
    )
    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long messageId, @CurrentUser User ignoredUser){
        messageService.deleteMessageById(messageId);
        Map<String, String> message = new HashMap<>();
        message.put("messageId", String.valueOf(messageId));
        message.put("status", "deleted");
        template.convertAndSend("/topic/delete-message", message);
        return new ResponseEntity<>(HttpStatus.OK);
    }

    @MessageMapping("/sendMessage")
    public void receiveMessage(@Payload Message ignoredMessage) {
        // receive message from client
    }

    @Operation(tags = {"Messages"}, summary = "Deletes a user reaction to a message",
    description = "Deletes a user reaction to a message. Requires a valid messageId and reactionId in the URL path. " +
            "Returns a response entity with HTTP status codes indicating the result of the operation. " +
            "If the reaction or message is not found, returns an error response with the appropriate status code. " +
            "If the user has not already reacted to this message, returns an error response with HTTP OK status code.")
    @DeleteMapping("/{messageId}/reactions/{reactionId}")
    public ResponseEntity<?> deleteReaction(@PathVariable Long messageId,
                                            @PathVariable Long reactionId,
                                            @CurrentUser User user) {
        return messageService.deleteReaction(messageId, reactionId, user);
    }
}