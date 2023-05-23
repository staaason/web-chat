package com.course.webchat.service;


import com.course.webchat.entity.Post;
import com.course.webchat.entity.User;
import com.course.webchat.exception.SlugExistsException;
import com.course.webchat.repository.PostRepository;
import com.course.webchat.utils.requests.PostRequest;
import com.course.webchat.utils.responses.PostResponse;
import com.google.cloud.ReadChannel;
import com.google.cloud.storage.Blob;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutionException;
import java.util.stream.Collectors;

@Service
public class PostService {
    private final PostRepository postRepository;

    private final GcpService gcpService;

    private final RedisTemplate<String, byte []> redisTemplate;

    public PostService(PostRepository postRepository, GcpService gcpService, RedisTemplate<String,
            byte[]> redisTemplate) {
        this.postRepository = postRepository;
        this.gcpService = gcpService;
        this.redisTemplate = redisTemplate;
    }

    public Post createPost(PostRequest postRequest, User user, String structureURL,
                           String coverImageURL){
        LocalDateTime published_at = LocalDateTime.now();
        try{
            if(postRepository.findPostBySlug(postRequest.getSlug()).isPresent()){
                throw new SlugExistsException(postRequest.getSlug());
            }

            Post post = Post.builder()
                    .title(postRequest.getTitle())
                    .coverPhoto(coverImageURL)
                    .content(structureURL)
                    .description(postRequest.getDescription())
                    .user(user)
                    .slug(postRequest.getSlug())
                    .date_published(published_at)
                    .build();
            return postRepository.save(post);

        }catch (SlugExistsException ex){
            return null;

        }
    }


    public Optional<List<Post>> findAllPosts(){
        List<Post> posts = postRepository.findAll();
        return Optional.of(posts);
    }

    public Optional<PostResponse> getPost(String slug){
        Optional<Post> optionalPost = postRepository.findPostBySlug(slug);
        if (optionalPost.isPresent()) {
            PostResponse postRequest = createPostResponse(optionalPost.get());
            return Optional.of(postRequest);
        }
        return Optional.empty();
    }
    public Optional<List<PostResponse>> getPosts(){
        Optional<List<Post>> optionalPosts = findAllPosts();
        if (optionalPosts.isPresent()) {
            List<PostResponse> postRequests = optionalPosts.get().stream()
                    .map(this::createPostResponse)
                    .peek(postResponse -> postResponse.setStructureHtml(null))
                    .collect(Collectors.toList());
            return Optional.of(postRequests);
        }
        return Optional.empty();
    }



    public PostResponse createPostResponse(Post post) {
        String coverImageName = post.getCoverPhoto();
        String contentHtmlName = post.getContent();
        byte[] imageData;
        byte[] contentData;

        CompletableFuture<byte[]> coverImageDataFuture = CompletableFuture.supplyAsync(() -> {
            byte[] data = redisTemplate.opsForValue().get(coverImageName);
            if (data == null) {
                Blob blob = gcpService.getBlob(coverImageName);
                data = addDataToRedis(blob, coverImageName);
            }
            return data;
        });

        CompletableFuture<byte[]> contentDataFuture = CompletableFuture.supplyAsync(() -> {
            byte[] data = redisTemplate.opsForValue().get(contentHtmlName);
            if (data == null) {
                Blob blob = gcpService.getBlob(contentHtmlName);
                data = addDataToRedis(blob, contentHtmlName);
            }
            return data;
        });

        try {
            imageData = coverImageDataFuture.get();
            contentData = contentDataFuture.get();
        } catch (InterruptedException | ExecutionException e) {
            throw new RuntimeException("Failed to retrieve data from Redis", e);
        }

        return PostResponse.builder()
                .title(post.getTitle())
                .slug(post.getSlug())
                .coverImage(Base64.getEncoder().encodeToString(imageData))
                .structureHtml(Base64.getEncoder().encodeToString(contentData))
                .description(post.getDescription())
                .date_published(post.getDate_published())
                .build();


    }

    private byte[] addDataToRedis(Blob blob, String fileName){
        try (ReadChannel channel = blob.reader();ByteArrayOutputStream output = new ByteArrayOutputStream()) {
            ByteBuffer buffer = ByteBuffer.allocate(8192);
            while (channel.read(buffer) > 0) {
                buffer.flip();
                output.write(buffer.array(), 0, buffer.limit());
                buffer.clear();
            }
            byte[] fileData = output.toByteArray();
            redisTemplate.opsForValue().set(fileName, fileData, Duration.ofHours(1));
            return fileData;
        } catch (IOException e) {
            throw new RuntimeException("Failed to read file", e);
        }
    }


}
