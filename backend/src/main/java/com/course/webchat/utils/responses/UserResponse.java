package com.course.webchat.utils.responses;


import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserResponse {

    String firstName;

    String lastName;

    String image;

    Long uid;
}
