package com.course.webchat.utils.responses;


import lombok.*;

import java.time.LocalDateTime;
import java.util.List;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ChatResponse {

    private UserResponse user;
    private Long chatId;
    private Long messageId;
    private String message;
    private LocalDateTime createdAt;
    private List<ReactionResponse> reactions;
    private String type;
}
