package com.course.webchat.repository;

import com.course.webchat.entity.Reaction;
import org.springframework.data.jpa.repository.JpaRepository;


public interface ReactionRepository extends JpaRepository<Reaction, Long> {
}