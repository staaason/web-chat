package com.course.webchat.repository;

import com.course.webchat.entity.TextChannel;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TextChannelRepository extends JpaRepository<TextChannel, Long> {
}

