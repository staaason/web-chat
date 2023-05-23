package com.course.webchat.exception;

public class MessageNotFoundException extends RuntimeException{
    public MessageNotFoundException(Long id) {
        super("Message not found with id : " + id);
    }
}
