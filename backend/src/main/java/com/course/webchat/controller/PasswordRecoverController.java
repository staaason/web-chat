package com.course.webchat.controller;

import com.course.webchat.entity.RecoveryToken;
import com.course.webchat.entity.User;
import com.course.webchat.utils.requests.ResetPasswordRequest;
import com.course.webchat.service.RecoveryTokenService;
import com.course.webchat.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;


@RequiredArgsConstructor
@RestController
@RequestMapping("/api/v1/recover-password")
public class PasswordRecoverController {
    private UserService userService;
    private RecoveryTokenService recoveryTokenService;
    private  PasswordEncoder passwordEncoder;

    @Autowired
    public PasswordRecoverController(UserService userService, RecoveryTokenService recoveryTokenService,
                                     PasswordEncoder passwordEncoder) {
        this.userService = userService;
        this.recoveryTokenService = recoveryTokenService;
        this.passwordEncoder = passwordEncoder;
    }

    @Operation(
            tags = {"User"},
            summary = "Recover password",
            description = "Retrieves a recovery token and checks if it is valid and not expired. If the token is valid, " +
                    "it indicates that the user can proceed to enter a new password."
    )
    @GetMapping
    public ResponseEntity<?> recoverPassword(@RequestParam("token") String token) {
        RecoveryToken recoveryToken = recoveryTokenService.getRecoveryTokenByToken(token);
        if (recoveryToken == null || recoveryTokenService.isExpiredRecoveryToken(recoveryToken)) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
        return ResponseEntity.ok("Please enter a new password for");
    }

    @Operation(
            tags = {"User"},
            summary = "Reset password",
            description = "Resets the password for a user using a recovery token. The method verifies the token's validity " +
                    "and expiration, checks if the associated user exists, updates the user's password, and deletes the " +
                    "recovery token."
    )
    @PostMapping
    public ResponseEntity<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        RecoveryToken recoveryToken = recoveryTokenService.getRecoveryTokenByToken(request.getToken());
        if (recoveryToken == null || recoveryTokenService.isExpiredRecoveryToken(recoveryToken)) {
            return ResponseEntity.badRequest().body("Invalid or expired token");
        }
        User user = recoveryToken.getUser();
        if (user == null) {
            return ResponseEntity.badRequest().body("User is not found");
        }
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        userService.saveUser(user);
        recoveryTokenService.deleteRecoveryToken(recoveryToken);
        return ResponseEntity.ok("Password reset successfully");
    }
}
