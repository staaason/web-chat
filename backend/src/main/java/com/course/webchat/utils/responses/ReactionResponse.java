package com.course.webchat.utils.responses;

import lombok.*;

import java.util.ArrayList;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ReactionResponse {

    private String type;

    private int count;

    private ArrayList<UserChatResponse> users;

    private Long id;
}
