package com.campushub.storage;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "cloudinary")
public class CloudinaryStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(CloudinaryStorageService.class);
    private final Cloudinary cloudinary;

    public CloudinaryStorageService() {
        this.cloudinary = new Cloudinary();
    }

    @Override
    public String upload(MultipartFile file, String folder) {
        FileValidator.validate(file);
        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap(
                            "folder", "campus-hub/" + folder,
                            "resource_type", "auto"
                    )
            );
            return (String) result.get("secure_url");
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed", e);
        }
    }

    @Override
    public void delete(String fileUrl) {
        try {
            String marker = "/upload/";
            int start = fileUrl.indexOf(marker);
            if (start < 0) return;
            String withVersion = fileUrl.substring(start + marker.length());
            String publicId = withVersion.replaceFirst("^v\\d+/", "");
            int dot = publicId.lastIndexOf('.');
            if (dot > 0) publicId = publicId.substring(0, dot);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
        } catch (IOException e) {
            log.warn("Cloudinary delete failed for {}: {}", fileUrl, e.getMessage());
        }
    }
}


