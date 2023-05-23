package com.course.webchat.exception;


public class TextChannelNotFoundException extends RuntimeException{
    public TextChannelNotFoundException(Long id) {
        super("Text channel with ID " + id + " not found");
    }
}