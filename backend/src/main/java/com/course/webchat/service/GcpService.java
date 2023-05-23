package com.course.webchat.service;


import com.course.webchat.entity.User;
import com.course.webchat.exception.InvalidFileTypeException;
import com.google.cloud.ReadChannel;
import com.google.cloud.WriteChannel;
import com.google.cloud.storage.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;


@Service
public class GcpService {

    @Value("${cloud.container.name}")
    private String CONTAINER_NAME;
    private final Storage storage;
    private final UserService userService;
    private final RedisTemplate<String, byte[]> redisTemplate;
    public GcpService(Storage storage, UserService userService, RedisTemplate<String, byte[]> redisTemplate) {
        this.storage = storage;
        this.userService = userService;
        this.redisTemplate = redisTemplate;
    }


    public String uploadPostContent(MultipartFile file) {
        String fileName = UUID.randomUUID().toString();
        String contentType = file.getContentType();
        if (contentType == null) {
            throw new InvalidFileTypeException("Invalid file type");
        }
        String folderName = getFolderName(contentType);
        byte[] fileContent = getFileContent(file);
        fileName = folderName + fileName;
        storeFileInGCS(contentType, fileContent, fileName);
        return fileName;
    }

    private String getFolderName(String contentType) {
        if (contentType.startsWith("image/")) {
            return "cover-images/";
        } else {
            return "structure-post/";
        }
    }

    private byte[] getFileContent(MultipartFile file) {
        try {
            return file.getBytes();
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }

    private void storeFileInGCS(String contentType, byte[] fileContent, String gcsObjectName) {
        Storage storage = StorageOptions.getDefaultInstance().getService();
        BlobId blobId = BlobId.of(CONTAINER_NAME, gcsObjectName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(contentType)
                .build();
        try (WriteChannel writer = storage.writer(blobInfo)) {
            assert fileContent != null;
            writer.write(ByteBuffer.wrap(fileContent));
        } catch (IOException e) {
            e.printStackTrace();
        }
    }

    public Blob getBlob(String fileName) {
        Storage storage = StorageOptions.getDefaultInstance().getService();
        BlobId blobId = BlobId.of(CONTAINER_NAME,fileName);
        return storage.get(blobId);
    }



    public void uploadAvatar(User currentUser, Map<String, String> data) {
        String previousImageName = getCurrentUserImageName(currentUser);
        if (previousImageName != null) {
            deleteImageFromCloud(previousImageName);
        }
        String fileName = generateFileName();
        BlobId blobId = BlobId.of(CONTAINER_NAME, fileName);
        String[] fileParts = data.get("file").split(",");
        String fileContentType = getFileContentType(fileParts[0]);
        validateImageFile(fileContentType);
        String fileExtension = getFileExtension(fileContentType);
        BlobInfo blobInfo = createBlobInfo(blobId, fileExtension);
        byte[] fileBytes = decodeFileBytes(fileParts[1]);
        try (var writeChannel = storage.writer(blobInfo)) {
            writeChannel.write(java.nio.ByteBuffer.wrap(fileBytes));
            updateUserAvatar(currentUser, fileName);
        } catch (StorageException | IOException ex) {
            throw new RuntimeException("Failed to upload file", ex);
        }
    }


    private String getCurrentUserImageName(User currentUser) {
        User userDTO = getUserByEmail(currentUser.getEmail());
        return userDTO.getImage();
    }

    private void deleteImageFromCloud(String imageName) {
        BlobId blobId = BlobId.of(CONTAINER_NAME, imageName);
        storage.delete(blobId);
    }

    private String generateFileName() {
        return UUID.randomUUID().toString();
    }

    private String getFileContentType(String fileHeader) {
        return fileHeader.split(":")[1];
    }

    private void validateImageFile(String fileContentType) {
        if (!fileContentType.startsWith("image/")) {
            throw new IllegalArgumentException("File must be an image");
        }
    }

    private String getFileExtension(String fileContentType) {
        return fileContentType.split("/")[1].split(";")[0];
    }

    private BlobInfo createBlobInfo(BlobId blobId, String fileExtension) {
        return BlobInfo.newBuilder(blobId)
                .setContentType("image/" + fileExtension)
                .build();
    }

    private byte[] decodeFileBytes(String fileData) {
        return Base64.getDecoder().decode(fileData);
    }

    private void updateUserAvatar(User user, String fileName) {
        user.setImage(fileName);
        userService.saveUser(user);
    }


    public String loadAvatar(User user) {
        User userDTO = getUserByEmail(user.getEmail());
        String imageName = userDTO.getImage();
        if(imageName == null){
            return "";
        }
        byte[] imageData = getAvatarImageData(imageName);
        if (imageData == null) {
            imageData = readImageDataFromStorage(imageName);
            cacheAvatarImageData(imageName, imageData);
        }

        return encodeImageData(imageData);
    }

    private User getUserByEmail(String email) {
        return userService.getUserByEmail(email);
    }

    private byte[] getAvatarImageData(String imageName) {
        return redisTemplate.opsForValue().get(imageName);
    }

    private byte[] readImageDataFromStorage(String imageName) {
        BlobId blobId = BlobId.of(CONTAINER_NAME, imageName);
        Blob blob = storage.get(blobId);
        try (ReadChannel channel = blob.reader()) {
            ByteBuffer buffer = ByteBuffer.allocate(8192);
            ByteArrayOutputStream output = new ByteArrayOutputStream();
            while (channel.read(buffer) > 0) {
                buffer.flip();
                output.write(buffer.array(), 0, buffer.limit());
                buffer.clear();
            }
            return output.toByteArray();
        } catch (IOException ex) {
            throw new RuntimeException("Failed to read file", ex);
        }
    }

    private void cacheAvatarImageData(String imageName, byte[] imageData) {
        redisTemplate.opsForValue().set(imageName, imageData, Duration.ofHours(1));
    }

    private String encodeImageData(byte[] imageData) {
        return new String(Base64.getEncoder().encode(imageData), StandardCharsets.UTF_8);
    }
}
