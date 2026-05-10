package com.campushub.storage;

import io.minio.*;
import io.minio.errors.MinioException;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Set;
import java.util.UUID;


@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "minio")
public class MinioStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(MinioStorageService.class);
    private static final long MAX_BYTES = 10 * 1024 * 1024L;
    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "application/pdf",
            "application/zip", "video/mp4");

    private final MinioClient minio;
    private final String bucket;
    private final String publicUrl;

    public MinioStorageService(
            @Value("${minio.url}") String minioUrl,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey,
            @Value("${minio.bucket:campushub-dev}") String bucket) {
        this.bucket    = bucket;
        this.publicUrl = minioUrl;
        this.minio = MinioClient.builder()
                .endpoint(minioUrl)
                .credentials(accessKey, secretKey)
                .build();
    }

    @PostConstruct
    public void ensureBucketExists() {
        try {
            boolean exists = minio.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
            if (!exists) {
                minio.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                String policy = """
                        {"Version":"2012-10-17","Statement":[{"Effect":"Allow",
                        "Principal":{"AWS":["*"]},"Action":["s3:GetObject"],
                        "Resource":["arn:aws:s3:::%s/*"]}]}""".formatted(bucket);
                minio.setBucketPolicy(SetBucketPolicyArgs.builder()
                        .bucket(bucket).config(policy).build());
                log.info("Created MinIO bucket: {}", bucket);
            }
        } catch (Exception e) {
            log.error("Failed to initialise MinIO bucket '{}': {}", bucket, e.getMessage());
        }
    }

    @Override
    public String upload(MultipartFile file, String folder) {
        validateFile(file);
        String ext = getExtension(file.getOriginalFilename());
        String key = folder + "/" + UUID.randomUUID() + ext;
        try {
            minio.putObject(PutObjectArgs.builder()
                    .bucket(bucket)
                    .object(key)
                    .stream(file.getInputStream(), file.getSize(), -1)
                    .contentType(file.getContentType())
                    .build());
        } catch (Exception e) {
            throw new RuntimeException("MinIO upload failed: " + e.getMessage(), e);
        }
        return publicUrl + "/" + bucket + "/" + key;
    }

    @Override
    public void delete(String fileUrl) {
        String prefix = "/" + bucket + "/";
        int idx = fileUrl.indexOf(prefix);
        if (idx < 0) return;
        String key = fileUrl.substring(idx + prefix.length());
        try {
            minio.removeObject(RemoveObjectArgs.builder().bucket(bucket).object(key).build());
        } catch (Exception e) {
            log.warn("MinIO delete failed for key '{}': {}", key, e.getMessage());
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File is empty");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new IllegalArgumentException("File exceeds 10 MB limit");
        }
        String ct = file.getContentType();
        if (ct == null || !ALLOWED_TYPES.contains(ct)) {
            throw new IllegalArgumentException(
                    "File type not allowed. Allowed: jpg, png, pdf, zip, mp4");
        }
    }

    private String getExtension(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return dot >= 0 ? filename.substring(dot) : "";
    }
}


