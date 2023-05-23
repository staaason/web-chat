package com.course.webchat.repository;

import com.course.webchat.entity.Chat;
import com.course.webchat.entity.TextChannel;
import com.course.webchat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatRepository extends JpaRepository<Chat, Long> {
     List<Chat> findAllByUserId(Long userId);

     Optional<Chat> findByTextChannelAndUser(TextChannel channel, User user);

     List<Chat> getChatsByTextChannelId(Long id);
     List<Chat> findByTextChannelId(Long id);
}
