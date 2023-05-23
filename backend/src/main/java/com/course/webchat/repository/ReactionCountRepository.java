package com.course.webchat.repository;

import com.course.webchat.entity.ReactionCount;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReactionCountRepository extends JpaRepository<ReactionCount, Long> {
}
