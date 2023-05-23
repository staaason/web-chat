package com.course.webchat.service;

import com.course.webchat.entity.RecoveryToken;
import com.course.webchat.entity.User;
import com.course.webchat.exception.UserNotFoundException;
import com.course.webchat.repository.RecoveryTokenRepository;
import com.course.webchat.repository.UserRepository;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;
import java.util.logging.Logger;

@Service
@RequiredArgsConstructor
public class RecoveryTokenService {
    @Autowired
    private MailSenderService mailSenderService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RecoveryTokenRepository recoveryTokenRepository;

    @Autowired
    private RedisTemplate<String, String> redisTemplate;

    @Autowired
    private JavaMailSender mailSender;
    private static final Logger logger = Logger.getLogger(AuthenticationService.class.getName());


    public void sendPasswordRecoveryEmail(String email) throws MessagingException {
        Optional<User> optionalUser = userRepository.findByEmail(email);
        if (optionalUser.isEmpty()) {
            throw new UserNotFoundException(email);
        }
        recoveryTokenRepository.deleteRecoveryTokenByUser(optionalUser.get());
        logger.info("Email recover to : " + email);
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        String token = UUID.randomUUID().toString();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(1);
        recoveryTokenRepository.save(RecoveryToken
                .builder()
                        .user(optionalUser.get())
                        .token(token)
                        .expiryAt(expiryDate)
                .build());

        String recoveryUrl = "http://localhost:3000/recover-password?token=" + token;
        String subject = "Password Recovery";

        String body = "<!DOCTYPE html>\n" +
                "<html>\n" +
                "<head>\n" +
                "    <meta charset=\"UTF-8\">\n" +
                "    <title>Password Recovery</title>\n" +
                "</head>\n" +
                "<body>\n" +
                "    <p>Dear " + optionalUser.get().getFirstName() +",</p>\n" +
                "    <p>Please click the button below to reset your password:</p>\n" +
                "    <a href=\"" + recoveryUrl + "\" style=\"display:inline-block;" +
                "background-color:#007bff;color:#fff;padding:10px 20px;text-decoration:none;" +
                "border-radius:4px;font-size:16px;\">Reset Password</a>\n" +
                "    <p>If the button doesn't work, you can copy and paste this URL into your browser:</p>\n" +
                "    <p><a href=\"" + recoveryUrl + "\">Recover url</a></p>\n" +
                "    <p>Thank you,</p>\n" +
                "    <p>Your App Team</p>\n" +
                "</body>\n" +
                "</html>";
        helper.setTo(optionalUser.get().getEmail());
        helper.setSubject(subject);
        helper.setText(body, true);
        mailSenderService.sendRecoveryMail(message);
    }


    public RecoveryToken getRecoveryTokenByToken(String token){
        return recoveryTokenRepository.findRecoveryTokenByToken(token);
    }

    public boolean isExpiredRecoveryToken(RecoveryToken recoveryToken){
        return recoveryToken.getExpiryAt().isBefore(LocalDateTime.now());
    }

    public void deleteRecoveryToken(RecoveryToken recoveryToken){
        recoveryTokenRepository.delete(recoveryToken);
    }

    public void saveEmailWasSent(String email){
        redisTemplate.opsForValue().set(email, "sent", 2, TimeUnit.MINUTES);
    }

    public boolean checkEmailWasSent(String email){
        return Boolean.TRUE.equals(redisTemplate.hasKey(email));
    }

    public long getCooldownRemainingEmailSent(String email){
        Instant now = Instant.now();
        long expirationTimeRedis = redisTemplate.getExpire(email);
        Instant expirationTime = now.plus(Duration.ofSeconds(expirationTimeRedis));
        return  Duration.between(now, expirationTime).getSeconds();
    }



}
