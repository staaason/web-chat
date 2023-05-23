package com.course.webchat.exception;

public class EmailExistsException extends IllegalArgumentException{
    public EmailExistsException(String email) {
        super("Email already exists " + email);
    }
}
