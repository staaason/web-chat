package com.course.webchat.utils.responses;


import lombok.*;
import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class PostResponse {

    private String title;
    private String description;
    private String slug;
    private String coverImage;
    private String structureHtml;
    private LocalDateTime date_published;
}
