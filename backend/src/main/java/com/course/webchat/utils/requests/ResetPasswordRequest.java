package com.course.webchat.utils.requests;


import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ResetPasswordRequest {

    private String token;
    private String password;
}
