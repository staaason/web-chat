package com.course.webchat.service;

import com.course.webchat.utils.UserRole;
import com.course.webchat.entity.User;
import com.course.webchat.entity.VerificationToken;
import com.course.webchat.exception.EmailExistsException;
import com.course.webchat.repository.UserRepository;
import com.course.webchat.repository.VerificationTokenRepository;
import com.course.webchat.utils.requests.RegisterRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationTokenService {

    private final PasswordEncoder passwordEncoder;
    private final VerificationTokenRepository verificationTokenRepository;

    private final MailSenderService mailSenderService;
    private final UserRepository userRepository;

    @Autowired
    public VerificationTokenService(VerificationTokenRepository verificationTokenRepository,
                                    MailSenderService mailSenderService, UserRepository userRepository,
                                    PasswordEncoder passwordEncoder ) {
        this.verificationTokenRepository = verificationTokenRepository;
        this.mailSenderService = mailSenderService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public void createVerificationToken(RegisterRequest request) {
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);
        var user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(UserRole.USER)
                .build();

        if (userRepository.existsUserByEmail(request.getEmail())) {
            throw new EmailExistsException(request.getEmail());
        }
        userRepository.save(user);
        VerificationToken verificationToken = VerificationToken
                .builder()
                .token(token)
                .user(user)
                .expiryDate(expiryDate)
                .build();
        verificationTokenRepository.save(verificationToken);

        String subject = "Email Verification";
        String url = "http://localhost:3000/verify?token=" + token;
        String body = "Please click the link below to verify your email, url will be invalid in 1 hour:\n" + url;

        mailSenderService.sendVerificationMail(user.getEmail(), subject, body);
    }
}
