package com.course.webchat.entity;


import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "channels")
public class TextChannel {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;


    @OneToMany(mappedBy="textChannel", cascade=CascadeType.ALL)
    private List<Chat> channels;

    @JsonIgnore
    @OneToMany(mappedBy = "textChannel", cascade = CascadeType.ALL)
    private List<Message> messages;

}
