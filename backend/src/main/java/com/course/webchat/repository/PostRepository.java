package com.course.webchat.repository;

import com.course.webchat.entity.Post;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface  PostRepository extends JpaRepository<Post, Long> {
    Optional<Post> findPostBySlug(String slug);
}
