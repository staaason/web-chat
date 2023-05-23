package com.course.webchat.service;


import com.course.webchat.entity.User;
import com.course.webchat.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {
    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User getUserByEmail(String email) {
        return userRepository.findUserByEmail(email);
    }

    public boolean isEmailExists(String email) {
        Optional<User> user = userRepository.findByEmail(email);
        return user.isPresent();
    }
    public void saveUser(User user) {
        userRepository.save(user);
    }

}
