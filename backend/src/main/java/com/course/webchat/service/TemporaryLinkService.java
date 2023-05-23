package com.course.webchat.service;
import com.course.webchat.entity.TemporaryLink;
import com.course.webchat.entity.TextChannel;
import com.course.webchat.entity.User;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import com.course.webchat.repository.TemporaryLinkRepository;
import org.springframework.stereotype.Service;
import java.util.Calendar;
import java.util.Date;
import java.util.Optional;

@Service
public class TemporaryLinkService {
    private final TemporaryLinkRepository temporaryLinkRepository;

    public TemporaryLinkService(TemporaryLinkRepository temporaryLinkRepository) {
        this.temporaryLinkRepository = temporaryLinkRepository;
    }


    public String generateRandomLink() {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String randomString = encoder.encode(Double.toString(Math.random()));
        randomString = randomString.replaceAll("[^a-zA-Z]", "").substring(0, 9);
        return randomString;
    }

    public Date getExpiryDate() {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(new Date());
        calendar.add(Calendar.DATE, 7);
        return calendar.getTime();
    }


    public void deleteTemporaryLinkByTextChannelAndUser(TextChannel textChannel, User user) {
        Optional<TemporaryLink> optionalTemporaryLink = temporaryLinkRepository.findByUserAndTextChannel(user, textChannel);
        optionalTemporaryLink.ifPresent(temporaryLinkRepository::delete);
    }


}
