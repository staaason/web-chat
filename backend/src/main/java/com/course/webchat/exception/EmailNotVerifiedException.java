package com.course.webchat.exception;

public class EmailNotVerifiedException extends RuntimeException{
    public EmailNotVerifiedException(String message) {
        super(message);
    }
}
