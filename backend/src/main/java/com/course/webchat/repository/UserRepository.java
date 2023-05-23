package com.course.webchat.repository;

import com.course.webchat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;



public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    User findUserByEmail(String email);
    boolean existsUserByEmail(String email);




}
