package com.course.webchat.repository;

import com.course.webchat.entity.TemporaryLink;
import com.course.webchat.entity.TextChannel;
import com.course.webchat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TemporaryLinkRepository extends JpaRepository<TemporaryLink, Long> {
    Optional<TemporaryLink> findByLink(String link);
    Optional<TemporaryLink> findByTextChannelAndUser(TextChannel textChannel, User user);

    Optional<TemporaryLink> findByUserAndTextChannel(User user, TextChannel textChannel);
}
