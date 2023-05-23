package com.course.webchat.service;


import com.course.webchat.entity.Message;
import com.course.webchat.entity.Reaction;
import com.course.webchat.utils.responses.ChatResponse;
import com.course.webchat.utils.responses.ReactionResponse;
import com.course.webchat.utils.responses.UserChatResponse;
import com.course.webchat.utils.responses.UserResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class ChatResponseService {
    private final ImageService imageService;

    public ChatResponseService(ImageService imageService) {
        this.imageService = imageService;
    }
    public ChatResponse createChatResponse(Message message) {
        String userImageName = message.getAuthor().getImage();
        ChatResponse chatResponse = new ChatResponse();
        UserResponse userResponse = new UserResponse();
        chatResponse.setChatId(message.getTextChannel().getId());
        chatResponse.setMessageId(message.getId());
        chatResponse.setMessage(message.getContent());
        userResponse.setUid(message.getAuthor().getId());
        userResponse.setLastName(message.getAuthor().getLastName());
        userResponse.setFirstName(message.getAuthor().getFirstName());
        if(userImageName != null && !userImageName.isEmpty()) {
            userResponse.setImage(imageService.refactorImage(message.getAuthor().getImage()));
        }
        setReactionList(message, chatResponse, userResponse);
        chatResponse.setCreatedAt(message.getCreatedAt());
        return chatResponse;
    }

    public static void setReactionList(Message message, ChatResponse chatResponse, UserResponse userResponse) {
        chatResponse.setUser(userResponse);
        List<ReactionResponse> reactions = new ArrayList<>();
        for (Reaction reaction : message.getReactions()) {
            List<UserChatResponse> userResponses = reaction.getUsers().stream().map(user -> UserChatResponse.builder()
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .uid(user.getId())
                    .build()).toList();
            ReactionResponse reactionResponse = ReactionResponse.builder()
                    .type(reaction.getType())
                    .count(reaction.getUsers().size())
                    .users(new ArrayList<>(userResponses))
                    .id(reaction.getId())
                    .build();
            reactions.add(reactionResponse);
        }
        chatResponse.setReactions(reactions);
    }
}
