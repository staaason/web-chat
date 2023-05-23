package com.course.webchat.utils.responses;


import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NonNull;

@Data
@Builder
@AllArgsConstructor
public class MessageResponse {

    private String name;

    private String message;
}
