package com.course.webchat.controller;


import com.course.webchat.entity.Post;
import com.course.webchat.entity.User;
import com.course.webchat.service.GcpService;
import com.course.webchat.service.PostService;
import com.course.webchat.utils.CurrentUser;
import com.course.webchat.utils.UserRole;
import com.course.webchat.utils.requests.PostRequest;
import com.course.webchat.utils.responses.PostResponse;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;


@Controller
@RequestMapping("/api/v1/posts")
public class PostController {
    private final PostService postService;

    private final GcpService gcpService;

    public PostController(PostService postService, GcpService gcpService) {
        this.postService = postService;
        this.gcpService = gcpService;
    }

    @Operation(
            tags = {"Posts"},
            summary = "Create a post",
            description = "Creates a new post with the provided information, including the post content in HTML format " +
                    "and a cover image. Only users with the role of ADMIN are allowed to create posts. The method " +
                    "handles both multipart form data and JSON request payloads."
    )
    @PostMapping(consumes = {MediaType.MULTIPART_FORM_DATA_VALUE,
            MediaType.APPLICATION_JSON_VALUE})
    public ResponseEntity<?> createPost(@RequestParam("info") String postInfoString, @CurrentUser User user,
                                        @RequestParam("htmlFile") MultipartFile htmlFile,
                                        @RequestParam("coverImage") MultipartFile coverImage){
        ObjectMapper mapper = new ObjectMapper();
        try {
            PostRequest postRequest = mapper.readValue(postInfoString, PostRequest.class);
            if(user.getRole() != UserRole.ADMIN){
                return new ResponseEntity<>(HttpStatus.FORBIDDEN);
            }
            String structureFileName = gcpService.uploadPostContent(htmlFile);
            String coverImageFileName = gcpService.uploadPostContent(coverImage);
            Post post = postService.createPost(postRequest, user, structureFileName, coverImageFileName );
            if(post == null){
                return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
            }
            return new ResponseEntity<>(post, HttpStatus.OK);
        } catch (JsonProcessingException e) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }
    }

    @Operation(
            tags = {"Posts"},
            summary = "Get posts",
            description = "Retrieves a list of posts. If posts exist, the method returns them with HTTP status 200 (OK). If " +
                    "no posts are found, it returns HTTP status 204 (No Content)."
    )
    @GetMapping
    public ResponseEntity<?>  getPosts()
    {
        Optional<List<PostResponse>> posts = postService.getPosts();
        if(posts.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(posts.get(),HttpStatus.OK);
    }

    @Operation(
            tags = {"Posts"},
            summary = "Get a post",
            description = "Retrieves a post with the specified slug. If the post exists, the method returns it with HTTP " +
                    "status 200 (OK). If no post is found, it returns HTTP status 204 (No Content)."
    )
    @GetMapping("/{slug}")
    public ResponseEntity<?>  getPost(@PathVariable String slug)
    {
        Optional<PostResponse> post = postService.getPost(slug);
        if(post.isEmpty()){
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        }
        return new ResponseEntity<>(post.get(),HttpStatus.OK);
    }

}
