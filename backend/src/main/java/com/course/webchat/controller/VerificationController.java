package com.course.webchat.controller;

import com.course.webchat.entity.User;
import com.course.webchat.entity.VerificationToken;
import com.course.webchat.repository.VerificationTokenRepository;
import com.course.webchat.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/verify")
public class VerificationController {

    private final VerificationTokenRepository verificationTokenRepository;

    private final UserService userService;

    public VerificationController(VerificationTokenRepository verificationTokenRepository, UserService userService) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.userService = userService;
    }

    @Operation(
            tags = {"User"},
            summary = "Verify user email",
            description = "Verifies the user's email address using the provided verification token. If the token is valid " +
                    "and not expired, the user's email is marked as verified and a success message is returned with HTTP " +
                    "status 200 (OK). If the token is invalid or expired, a conflict status is returned with HTTP status " +
                    "409 (Conflict)."
    )
    @GetMapping
    public ResponseEntity<?> verify(@RequestParam("token") String token) {
        VerificationToken verificationToken = verificationTokenRepository.findByToken(token);
        if (verificationToken == null || verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        User user = verificationToken.getUser();
        user.setEnabled(true);
        userService.saveUser(user);
        verificationTokenRepository.delete(verificationToken);
        return ResponseEntity.ok("User email was verified");
    }
}
