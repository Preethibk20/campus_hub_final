package com.campushub.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Set;

/**
 * Security utility that validates uploaded files by inspecting magic bytes
 * (file header signatures), not just the filename extension.
 */
public final class FileValidator {

    private static final Logger log = LoggerFactory.getLogger(FileValidator.class);
    private static final int READ_BYTES = 12;

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "application/pdf",
            "application/zip"
    );

    private static final java.util.regex.Pattern DANGEROUS_PATH =
            java.util.regex.Pattern.compile("(\\.\\.|/|\\\\|%2e%2e|%2f|%5c)", java.util.regex.Pattern.CASE_INSENSITIVE);

    private FileValidator() {}

    public static void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }

        String originalName = file.getOriginalFilename();
        if (originalName != null && DANGEROUS_PATH.matcher(originalName).find()) {
            throw new IllegalArgumentException("Filename contains illegal path characters");
        }

        String detectedMime = detectMimeType(file);
        if (!ALLOWED_MIME_TYPES.contains(detectedMime)) {
            throw new IllegalArgumentException(
                    "File type not allowed: " + detectedMime +
                    ". Allowed: " + ALLOWED_MIME_TYPES);
        }

        log.debug("File '{}' passed validation — detected MIME: {}", originalName, detectedMime);
    }

    private static String detectMimeType(MultipartFile file) {
        byte[] header = new byte[READ_BYTES];
        try (InputStream is = file.getInputStream()) {
            int read = is.read(header, 0, READ_BYTES);
            if (read < 3) throw new IllegalArgumentException("File too small to determine type");
        } catch (IOException e) {
            throw new IllegalArgumentException("Could not read file content", e);
        }

        if (header[0] == (byte) 0xFF && header[1] == (byte) 0xD8 && header[2] == (byte) 0xFF) {
            return "image/jpeg";
        }
        if (header[0] == (byte) 0x89 && header[1] == 0x50 && header[2] == 0x4E && header[3] == 0x47) {
            return "image/png";
        }
        if (header[0] == 0x52 && header[1] == 0x49 && header[2] == 0x46 && header[3] == 0x46
                && header[8] == 0x57 && header[9] == 0x45 && header[10] == 0x42 && header[11] == 0x50) {
            return "image/webp";
        }
        if (header[0] == 0x25 && header[1] == 0x50 && header[2] == 0x44 && header[3] == 0x46) {
            return "application/pdf";
        }
        if (header[0] == 0x50 && header[1] == 0x4B && header[2] == 0x03 && header[3] == 0x04) {
            return "application/zip";
        }

        return "application/octet-stream";
    }
}


