package com.course.webchat.controller;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

import com.course.webchat.entity.User;
import com.course.webchat.service.GcpService;
import com.course.webchat.service.UserService;
import com.course.webchat.utils.CurrentUser;
import com.google.cloud.ReadChannel;
import com.google.cloud.storage.Blob;
import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/v1/gcp")
public class GCPStorageController {

    private final GcpService gcpService;

    public GCPStorageController(GcpService gcpService) {
        this.gcpService = gcpService;
    }

    @PostMapping
    public void uploadAvatar(@CurrentUser User currentUser, @RequestBody Map<String, String> data) {
        gcpService.uploadAvatar(currentUser, data);
    }


    @GetMapping
    public String loadAvatar(@CurrentUser User user) {
        return gcpService.loadAvatar(user);
    }
}

