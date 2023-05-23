package com.course.webchat.utils.requests;

import lombok.*;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class PostRequest {

    private String title;

    private String description;

    private String slug;
}
