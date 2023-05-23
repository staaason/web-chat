package com.course.webchat.repository;

import com.course.webchat.entity.RecoveryToken;
import com.course.webchat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

public interface RecoveryTokenRepository extends JpaRepository<RecoveryToken, Long> {
    RecoveryToken findRecoveryTokenByToken(String token);

    @Transactional
    void deleteRecoveryTokenByUser(User user);
}
