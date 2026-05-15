package com.campushub.storage;

import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

@Service
@ConditionalOnProperty(name = "storage.provider", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    @Override
    public String upload(MultipartFile file, String folder) {
        // Return a dummy URL for local development
        return "http://localhost:8080/local-storage/" + folder + "/" + file.getOriginalFilename();
    }

    @Override
    public void delete(String fileUrl) {
        // No-op for local development
    }
}
