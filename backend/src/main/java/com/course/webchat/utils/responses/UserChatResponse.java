package com.course.webchat.utils.responses;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserChatResponse {

    private String firstName;

    private String lastName;

    private Long uid;
}
