package com.course.webchat.utils.responses;


import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ConnectChatResponse {

    private Long chatId;
    private String chatName;
}
