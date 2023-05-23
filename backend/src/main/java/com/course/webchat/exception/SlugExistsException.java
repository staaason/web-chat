package com.course.webchat.exception;

public class SlugExistsException extends IllegalArgumentException{
    public SlugExistsException(String slug) {
        super("Slug already exists " + slug);
    }
}
