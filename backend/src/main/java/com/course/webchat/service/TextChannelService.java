package com.course.webchat.service;

import com.course.webchat.entity.*;
import com.course.webchat.exception.TextChannelNotFoundException;
import com.course.webchat.repository.TemporaryLinkRepository;
import com.course.webchat.repository.TextChannelRepository;
import com.course.webchat.utils.responses.ChatResponse;
import com.course.webchat.utils.responses.ConnectChatResponse;
import com.course.webchat.utils.responses.UserResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Date;
import java.util.Map;
import java.util.Optional;

@Service
public class TextChannelService {


    private final ChatService chatService;

    private final ImageService imageService;

    private final MessageService messageService;

    private final SimpMessagingTemplate template;
    private final TemporaryLinkRepository temporaryLinkRepository;

    private final TemporaryLinkService temporaryLinkService;

    private final TextChannelRepository textChannelRepository;

    public TextChannelService(ChatService chatService, ImageService imageService, MessageService messageService,
                              SimpMessagingTemplate template, TemporaryLinkRepository temporaryLinkRepository,
                              TemporaryLinkService temporaryLinkService, TextChannelRepository textChannelRepository) {
        this.chatService = chatService;
        this.imageService = imageService;
        this.messageService = messageService;
        this.template = template;
        this.temporaryLinkRepository = temporaryLinkRepository;
        this.temporaryLinkService = temporaryLinkService;
        this.textChannelRepository = textChannelRepository;
    }


    public TextChannel createTextChannel(TextChannel textChannel) {
        return textChannelRepository.save(textChannel);
    }

    public void deleteTextChannelById(Long id){
        Optional<TextChannel> optionalTextChannel = textChannelRepository.findById(id);
        if (optionalTextChannel.isPresent()) {
            textChannelRepository.deleteById(id);
        } else {
            throw new TextChannelNotFoundException(id);
        }
    }

    public Optional<TextChannel> getTextChannelById(Long id) {
        return textChannelRepository.findById(id);
    }

    public ResponseEntity<?> connectToTextChannel(TemporaryLink temporaryLink, User user) {
        if (temporaryLink.getExpiryDate().after(new Date())) {
            TextChannel textChannel = temporaryLink.getTextChannel();
            Chat chat = chatService.createChat(textChannel, user);
            UserResponse.UserResponseBuilder builder = UserResponse.builder()
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .uid(user.getId());
            String userImageName = user.getImage();
            if (userImageName != null && !userImageName.isEmpty()) {
                builder.image(imageService.refactorImage(userImageName));
            }

            Message message = messageService.saveSystemMessage(textChannel.getId(),
                    Message.builder().content(user.getFirstName() + " " +
                            user.getLastName() + " " + "connected to channel").build(), "connect-channel");

            sendChannelJoinNotification(textChannel.getId(), builder.build(), message);

            return new ResponseEntity<>(ConnectChatResponse.builder()
                    .chatId(chat.getTextChannel().getId())
                    .chatName(chat.getTextChannel().getName())
                    .build(), HttpStatus.OK);
        } else {
            temporaryLinkRepository.delete(temporaryLink);
            return new ResponseEntity<>(HttpStatus.GONE);
        }
    }

    private void sendChannelJoinNotification(Long textChannelId, UserResponse user, Message message) {
        template.convertAndSend("/topic/channel", Map.of(
                "method", "join-channel",
                "info", Map.of(
                        "user", user,
                        "channelId", textChannelId,
                        "message", ChatResponse.builder()
                                .message(message.getContent())
                                .createdAt(message.getCreatedAt())
                                .messageId(message.getId())
                                .chatId(textChannelId)
                                .build()
                )
        ));
    }


    public ResponseEntity<?> disconnectFromTextChannel(TextChannel textChannel, User user) {
        Optional<Chat> optionalChat = chatService.getChatByTextChannelAndUser(textChannel, user);
        if (optionalChat.isPresent()) {
            if (chatService.getChatsByTextChannelId(textChannel.getId()).size() > 1) {
                return leaveTextChannel(textChannel, user);
            } else {
                return deleteTextChannel(textChannel, user);
            }
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    private ResponseEntity<?> leaveTextChannel(TextChannel textChannel, User user) {
        chatService.deleteChatByTextChannelAndUser(textChannel, user);
        temporaryLinkService.deleteTemporaryLinkByTextChannelAndUser(textChannel, user);

        Message message = messageService.saveSystemMessage(textChannel.getId(),
                Message.builder().content(user.getFirstName() + " " +
                        user.getLastName() + " " + "leave the channel").build(), "leave-channel");

        sendChannelLeaveNotification(textChannel.getId(), user, message);

        return new ResponseEntity<>(HttpStatus.OK);
    }

    private ResponseEntity<?> deleteTextChannel(TextChannel textChannel, User user) {
        chatService.deleteChatByTextChannelAndUser(textChannel, user);
        temporaryLinkService.deleteTemporaryLinkByTextChannelAndUser(textChannel, user);
        deleteTextChannelById(textChannel.getId());

        return new ResponseEntity<>(HttpStatus.OK);
    }

    private void sendChannelLeaveNotification(Long textChannelId, User user, Message message) {
        template.convertAndSend("/topic/channel", Map.of(
                "method", "leave-channel",
                "info", Map.of(
                        "uid", user.getId(),
                        "channelId", textChannelId,
                        "message", ChatResponse.builder()
                                .message(message.getContent())
                                .createdAt(message.getCreatedAt())
                                .messageId(message.getId())
                                .chatId(textChannelId)
                                .build()
                )
        ));
    }

    public String generateUniqueLink() {
        String link;
        do {
            link = temporaryLinkService.generateRandomLink();
            Optional<TemporaryLink> existingLink = temporaryLinkRepository.findByLink(link);
            if (existingLink.isEmpty() || existingLink.get().getExpiryDate().before(new Date())) {
                break;
            }
        } while (true);

        return link;
    }

    public TemporaryLink createTemporaryLink(String link, User user, TextChannel textChannel, Date expiryDate) {
        return TemporaryLink.builder()
                .link(link)
                .user(user)
                .textChannel(textChannel)
                .expiryDate(expiryDate)
                .build();
    }
}
