package com.course.webchat.service;

import com.course.webchat.entity.*;
import com.course.webchat.exception.BadRequestException;
import com.course.webchat.exception.ForbiddenException;
import com.course.webchat.exception.MessageNotFoundException;
import com.course.webchat.exception.ResourceNotFoundException;
import com.course.webchat.repository.MessageRepository;
import com.course.webchat.repository.ReactionRepository;
import com.course.webchat.repository.TextChannelRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class MessageService {
    private final MessageRepository messageRepository;
    private final TextChannelRepository textChannelRepository;
    private final SimpMessagingTemplate simpMessagingTemplate;
    private final ReactionRepository reactionRepository;

    public MessageService(MessageRepository messageRepository, TextChannelRepository textChannelRepository,
                          SimpMessagingTemplate simpMessagingTemplate, ReactionRepository reactionRepository) {
        this.messageRepository = messageRepository;
        this.textChannelRepository = textChannelRepository;
        this.simpMessagingTemplate = simpMessagingTemplate;
        this.reactionRepository = reactionRepository;
    }


    public Message saveMessage(Long textChannelId, Message message, User user) {
        assignChannelToMessage(textChannelId, message);
        message.setAuthor(user);
        return messageRepository.save(message);
    }

    private void assignChannelToMessage(Long textChannelId, Message message) {
        Optional<TextChannel> optionalTextChannel = textChannelRepository.findById(textChannelId);
        if (optionalTextChannel.isEmpty()) {
            throw new ResourceNotFoundException("Text channel not found with id " + textChannelId);
        }
        TextChannel textChannel = optionalTextChannel.get();
        message.setTextChannel(textChannel);
        message.setCreatedAt(LocalDateTime.now());
    }

    public Message saveSystemMessage(Long textChannelId, Message message, String type) {
        assignChannelToMessage(textChannelId, message);
        message.setType(type);
        return messageRepository.save(message);
    }


    public List<Message> getMessagesByTextChannelId(Long textChannelId){
        return messageRepository.findMessagesByTextChannelIdOrderByCreatedAtAsc(textChannelId);
    }

    public Message editMessage(Message message){
        Message messageToEdit = messageRepository.findMessagesById(message.getId());
        if(messageToEdit == null){
            throw new ResourceNotFoundException("Message not found with id " + message.getId());
        }
        messageToEdit.setContent(message.getContent());
        return messageRepository.save(messageToEdit);
    }

    public void save(Message message){
        Message messageToSave = messageRepository.findMessagesById(message.getId());
        if(messageToSave == null){
            throw new ResourceNotFoundException("Message not found with id " + message.getId());
        }
        messageRepository.save(message);
    }

    public Message findById(Long id){
        Message message = messageRepository.findMessagesById(id);
        if(message == null){
            throw new ResourceNotFoundException("Message not found with id " + id);
        }
        return message;
    }


    public void deleteMessageById(Long id) {
        Optional<Message> optionalMessage = messageRepository.findById(id);
        if (optionalMessage.isPresent()) {
            messageRepository.deleteById(id);
        } else {
            throw new MessageNotFoundException(id);
        }
    }


    public void createReaction(Long id, Reaction reaction, User user) {
        Message message = messageRepository.findById(id).orElseThrow(() -> new MessageNotFoundException(id));
        Reaction existingReaction = message.getReactions()
                .stream().filter(r -> r.getType().equals(reaction.getType())).findFirst().orElse(null);

        if (existingReaction != null && !existingReaction.getUsers().contains(user)) {
            Reaction finalExistingReaction = existingReaction;
            message.getReactionCountList().stream()
                    .filter(rc -> rc.getType().equals(finalExistingReaction.getType()))
                    .findFirst().ifPresent(reactionCount -> reactionCount.setCount(reactionCount.getCount() + 1));
            existingReaction.getUsers().add(user);
            reactionRepository.save(existingReaction);
        } else if (existingReaction == null) {
            Reaction newReaction = new Reaction();
            newReaction.setType(reaction.getType());
            newReaction.setMessage(message);
            Set<User> reactedUsers = new HashSet<>();
            reactedUsers.add(user);
            newReaction.setUsers(reactedUsers);
            message.getReactions().add(newReaction);
            reactionRepository.save(newReaction);
            ReactionCount newReactionCount = ReactionCount.builder()
                    .type(reaction.getType())
                    .count(1)
                    .message(message)
                    .build();
            message.getReactionCounts().add(newReactionCount);
        } else {
            if (existingReaction.getUsers().contains(user)) {
                throw new BadRequestException("User already pressed reaction");
            }
        }
        messageRepository.save(message);
        existingReaction = message.getReactions().stream().filter(r -> r.getType().equals(reaction.getType())).findFirst().orElse(null);
        Reaction finalExistingReaction1 = existingReaction;
        assert existingReaction != null;
        simpMessagingTemplate.convertAndSend("/topic/add-reaction", Map.of("method", "addReaction",
                "message", Map.of("type", existingReaction.getType(),
                        "id", existingReaction.getId(),
                        "count", message.getReactionCountList().stream()
                                .filter(rc -> rc.getType().equals(finalExistingReaction1.getType()))
                                .findFirst()
                                .map(ReactionCount::getCount)
                                .orElse(0),
                        "message", message.getId())));
    }

    public void updateReaction(Long messageId, Reaction reaction, User user){
        Message message = findById(messageId);
        Reaction existingReaction = message.getReactions()
                .stream().filter(r -> r.getType().equals(reaction.getType())).findFirst().orElse(null);
        if (existingReaction == null) {
            throw new ResourceNotFoundException("Reaction not found");
        } else if (!existingReaction.getUsers().contains(user)) {
            throw new ForbiddenException("User has not reacted to this message");
        } else {
            existingReaction.getUsers().remove(user);
            Reaction finalExistingReaction = existingReaction;
            message.getReactionCountList().stream()
                    .filter(rc -> rc.getType().equals(finalExistingReaction.getType()))
                    .findFirst().ifPresent(reactionCount -> reactionCount.setCount(reactionCount.getCount() - 1));
            if (existingReaction.getUsers().isEmpty()) {
                message.getReactions().remove(existingReaction);
                reactionRepository.delete(existingReaction);
                Reaction finalExistingReaction2 = existingReaction;
                message.getReactionCounts().removeIf(rc -> rc.getType().equals(finalExistingReaction2.getType()));
            } else {
                reactionRepository.save(existingReaction);
            }
            save(message);
            existingReaction = message.getReactions()
                    .stream().filter(r -> r.getType().equals(reaction.getType())).findFirst().orElse(null);
            Reaction finalExistingReaction1 = existingReaction;
            assert existingReaction != null;
            simpMessagingTemplate.convertAndSend("/topic/add-reaction", Map.of( "method", "putReaction",
                    "message", Map.of("type", existingReaction.getType(),
                            "id", existingReaction.getId(),
                            "count", message.getReactionCountList().stream()
                                    .filter(rc -> rc.getType().equals(finalExistingReaction1.getType()))
                                    .findFirst()
                                    .map(ReactionCount::getCount)
                                    .orElse(0),
                            "message", message.getId())));
        }
    }


    public ResponseEntity<?> deleteReaction(Long messageId, Long reactionId, User user) {
        Message message = findById(messageId);
        Reaction existingReaction = message.getReactions()
                .stream().filter(r -> r.getId().equals(reactionId)).findFirst().orElse(null);

        if (existingReaction == null) {
            return new ResponseEntity<>("Reaction not found", HttpStatus.NOT_FOUND);
        } else if (!existingReaction.getUsers().contains(user)) {
            return new ResponseEntity<>("User has not reacted to this message", HttpStatus.OK);
        } else {
            existingReaction.getUsers().remove(user);
            message.getReactionCountList().stream()
                    .filter(rc -> rc.getType().equals(existingReaction.getType()))
                    .findFirst().ifPresent(reactionCount -> reactionCount.setCount(reactionCount.getCount() - 1));
            if (existingReaction.getUsers().isEmpty()) {
                message.getReactions().remove(existingReaction);
                reactionRepository.delete(existingReaction);
                message.getReactionCounts().removeIf(rc -> rc.getType().equals(existingReaction.getType()));
                simpMessagingTemplate.convertAndSend("/topic/add-reaction",
                        Map.of("method", "deleteReaction",
                        "message", Map.of("type", existingReaction.getType(),
                                "id", existingReaction.getId(),

                                "message", message.getId())));
            } else {
                reactionRepository.save(existingReaction);
            }
            save(message);
            return new ResponseEntity<>(HttpStatus.OK);
        }
    }
}