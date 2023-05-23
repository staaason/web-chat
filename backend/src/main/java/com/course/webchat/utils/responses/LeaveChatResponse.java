package com.course.webchat.utils.responses;

import lombok.*;


@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class LeaveChatResponse {
    private Long chatId;
}
