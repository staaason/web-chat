package com.course.webchat.service;

import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;

@Service
public class ImageService {
    private final RedisTemplate<String, byte[]> redisTemplate;

    @Value("${cloud.container.name}")
    private String CONTAINER_NAME;
    private final Storage storage;

    public ImageService(RedisTemplate<String, byte[]> redisTemplate, Storage storage) {
        this.redisTemplate = redisTemplate;
        this.storage = storage;
    }

    public String refactorImage(String imageName) {
        byte[] imageData = redisTemplate.opsForValue().get(imageName);
        if (imageData == null) {
            BlobId blobId = BlobId.of(CONTAINER_NAME, imageName);
            Blob blob = storage.get(blobId);
            imageData = blob.getContent();
            redisTemplate.opsForValue().set(imageName, imageData, Duration.ofHours(1));
        }
        return new String(Base64.getEncoder().encode(imageData), StandardCharsets.UTF_8);
    }
}

