package com.course.webchat.controller;

import com.course.webchat.entity.Chat;
import com.course.webchat.entity.User;
import com.course.webchat.utils.UserDto;
import com.course.webchat.service.ChatService;
import com.course.webchat.service.RecoveryTokenService;
import com.course.webchat.service.TextChannelService;
import com.course.webchat.service.UserService;
import com.course.webchat.utils.CurrentUser;
import com.course.webchat.utils.responses.ConnectChatResponse;
import com.course.webchat.utils.responses.EmailCooldownResponse;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.mail.MessagingException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.ArrayList;
import java.util.List;



@PreAuthorize("hasAuthority('USER')")
@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final SessionRegistry sessionRegistry;

    final RecoveryTokenService recoveryTokenService;

    final UserService userService;

    private final ChatService chatService;

    final TextChannelService textChannelService;

    public UserController(RecoveryTokenService recoveryTokenService, UserService userService,
                          TextChannelService textChannelService, ChatService chatService,
                          SessionRegistry sessionRegistry) {
        this.recoveryTokenService = recoveryTokenService;
        this.userService = userService;
        this.textChannelService = textChannelService;
        this.chatService = chatService;
        this.sessionRegistry = sessionRegistry;
    }



    @Operation(
            tags = {"User"},
            summary = "Get user information",
            description = "Retrieves information about the authenticated user.")
    @GetMapping
    public ResponseEntity<UserDto> getUser(Principal principal) {
        User user = userService.getUserByEmail(principal.getName());
        if (user == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(UserDto
                .builder()
                .lastName(user.getLastName())
                .firstName(user.getFirstName())
                .email(user.getEmail())
                .uid(user.getId())
                .image(user.getImage())
                .role(user.getRole())
                .build());
    }

    @Operation(
            tags = {"Channels"},
            summary = "Get all text channels by user",
            description = "Retrieves all text channels associated with the specified user."
    )
    @GetMapping("/channels")
    public ResponseEntity<?> getAllTextChannelsByUser(@CurrentUser User user){
        List<Chat> textChannels = chatService.getAllTextChannels(user.getId());
        if(textChannels.isEmpty()){
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        List<ConnectChatResponse> response = new ArrayList<>();
        for (Chat chat:
             textChannels) {
            response.add(ConnectChatResponse
                    .builder()
                    .chatId(chat.getTextChannel().getId())
                    .chatName(chat.getTextChannel().getName())
                    .build());

        }
        return ResponseEntity.ok(response);
    }

    @Operation(
            tags = {"Sessions"},
            summary = "Get active sessions",
            description = "Retrieves a list of active session IDs for all currently logged-in users."
    )
    @GetMapping("/sessions")
    public ResponseEntity<List<String>> getActiveSessions() {
        List<String> activeSessions = new ArrayList<>();
        List<Object> principals = sessionRegistry.getAllPrincipals();

        for (Object principal : principals) {
            if (principal instanceof UserDetails) {
                List<SessionInformation> sessions = sessionRegistry.getAllSessions(principal, false);
                for (SessionInformation session : sessions) {
                    activeSessions.add(session.getSessionId());
                }
            }
        }

        return ResponseEntity.ok(activeSessions);
    }

    @Operation(
            tags = {"User"},
            summary = "Check if email exists",
            description = "Checks if the given email address exists in the system. If the email exists, it sends a password " +
                    "recovery email to the provided email address."
    )
    @GetMapping("/email-exists")
    @ResponseBody
    public ResponseEntity<?> recoverPassword(@RequestParam String email) throws MessagingException {
        boolean isEmailExists = userService.isEmailExists(email);
        if(isEmailExists){
            if(recoveryTokenService.checkEmailWasSent(email)){
                long cooldownRemainingSeconds = recoveryTokenService.getCooldownRemainingEmailSent(email);
                return new ResponseEntity<>(EmailCooldownResponse.builder().timestamp(cooldownRemainingSeconds).build(),
                        HttpStatus.TOO_MANY_REQUESTS);

            }
            recoveryTokenService.saveEmailWasSent(email);
            recoveryTokenService.sendPasswordRecoveryEmail(email);
            return new ResponseEntity<>(HttpStatus.OK);
        }else{
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }
}