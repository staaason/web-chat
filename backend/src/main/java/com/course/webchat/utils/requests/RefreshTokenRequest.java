package com.course.webchat.utils.requests;


import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class RefreshTokenRequest {


    String refreshToken;
}
