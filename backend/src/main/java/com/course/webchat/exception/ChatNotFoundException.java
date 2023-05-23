package com.course.webchat.exception;

public class ChatNotFoundException extends RuntimeException{
    public ChatNotFoundException() {
        super("Chat not found");
    }
}
