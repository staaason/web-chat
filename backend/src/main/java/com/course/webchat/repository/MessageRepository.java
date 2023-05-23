package com.course.webchat.repository;

import com.course.webchat.entity.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findMessagesByTextChannelIdOrderByCreatedAtAsc(Long id);
    Message findMessagesById(Long id);




}
