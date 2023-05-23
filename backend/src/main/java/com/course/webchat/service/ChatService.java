package com.course.webchat.service;


import com.course.webchat.entity.Chat;
import com.course.webchat.entity.TextChannel;
import com.course.webchat.entity.User;
import com.course.webchat.exception.ChatNotFoundException;
import com.course.webchat.exception.TextChannelNotFoundException;
import com.course.webchat.repository.ChatRepository;
import com.course.webchat.repository.TextChannelRepository;
import com.course.webchat.utils.responses.UserResponse;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ChatService {
    private final ChatRepository chatRepository;

    private final TextChannelRepository textChannelRepository;

    private final ImageService imageService;

    public ChatService(ChatRepository chatRepository, TextChannelRepository textChannelRepository, ImageService imageService) {
        this.chatRepository = chatRepository;
        this.textChannelRepository = textChannelRepository;

        this.imageService = imageService;
    }

    public Chat createChat(TextChannel textChannel, User user){
        Chat chat = new Chat();
        chat.setUser(user);
        chat.setTextChannel(textChannel);
        return chatRepository.save(chat);
    }

    public List<Chat> getAllTextChannels(Long userId) {
        return chatRepository.findAllByUserId(userId);
    }


    public void deleteChatByTextChannelAndUser(TextChannel textChannel, User user) {
        Optional<Chat> optionalChat = chatRepository.findByTextChannelAndUser(textChannel, user);
        if (optionalChat.isPresent()) {
            chatRepository.deleteById(optionalChat.get().getId());
        } else {
            throw new ChatNotFoundException();
        }
    }


    public Optional<Chat> getChatByTextChannelAndUser(TextChannel textChannel, User user){
        return chatRepository.findByTextChannelAndUser(textChannel, user);
    }


    public List<Chat> getChatsByTextChannelId(Long id){
        return chatRepository.getChatsByTextChannelId(id);
    }



    public List<UserResponse> getUsersInTextChannel(Long id) {
        TextChannel textChannel = textChannelRepository.findById(id)
                .orElseThrow(() -> new TextChannelNotFoundException(id));
        List<Chat> chats = chatRepository.findByTextChannelId(textChannel.getId());
        return chats.stream().map(chat -> {
            User user = chat.getUser();
            UserResponse.UserResponseBuilder builder = UserResponse.builder()
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .uid(user.getId());
            String userImageName = user.getImage();
            if (userImageName != null && !userImageName.isEmpty()) {
                builder.image(imageService.refactorImage(userImageName));
            }
            return builder.build();
        }).sorted(Comparator.comparingLong(UserResponse::getUid)).collect(Collectors.toList());
    }



}
