package com.campushub.service;

import com.campushub.domain.Gig;
import com.campushub.domain.GigApplication;
import com.campushub.domain.User;
import com.campushub.dto.GigResponseDTO;
import com.campushub.repository.GigApplicationRepository;
import com.campushub.repository.GigRepository;
import com.campushub.repository.UserRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Optional;

import java.util.Map;

@Service
@Validated
public class GigService {

    private static final Logger log = LoggerFactory.getLogger(GigService.class);
    private final GigRepository gigRepository;
    private final GigApplicationRepository gigApplicationRepository;
    private final UserRepository userRepository;
    private final RestTemplate restTemplate = new RestTemplate();

    @org.springframework.beans.factory.annotation.Value("${brevo.api.key}")
    private String brevoApiKey;

    private final com.campushub.repository.CollegeRepository collegeRepository;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    public GigService(GigRepository gigRepository, GigApplicationRepository gigApplicationRepository, UserRepository userRepository, com.campushub.repository.CollegeRepository collegeRepository, org.springframework.data.mongodb.core.MongoTemplate mongoTemplate) {
        this.gigRepository = gigRepository;
        this.gigApplicationRepository = gigApplicationRepository;
        this.userRepository = userRepository;
        this.collegeRepository = collegeRepository;
        this.mongoTemplate = mongoTemplate;
    }
    /**
     * Mongoose stores _id as ObjectId. Spring Data's findById auto-converts String→ObjectId
     * but the conversion sometimes fails silently. This helper tries ObjectId first, then String.
     */
    private boolean isSameUser(Object userA, Object userB) {
        if (userA == null || userB == null) return false;
        
        String idA = normalizeId(userA);
        String idB = normalizeId(userB);
        
        return idA.equalsIgnoreCase(idB);
    }

    private String normalizeId(Object idObj) {
        if (idObj == null) return "";
        
        try {
            // Handle direct types
            if (idObj instanceof org.bson.types.ObjectId) {
                return idObj.toString();
            }
            if (idObj instanceof com.mongodb.DBRef) {
                com.mongodb.DBRef dbRef = (com.mongodb.DBRef) idObj;
                return dbRef.getId().toString();
            }
            if (idObj instanceof org.bson.Document) {
                org.bson.Document doc = (org.bson.Document) idObj;
                if (doc.containsKey("$id")) return doc.get("$id").toString();
                if (doc.containsKey("_id")) return doc.get("_id").toString();
            }

            String id = idObj.toString().trim();
            // Handle ObjectId("...") string format
            if (id.contains("ObjectId(")) {
                int first = id.indexOf("\"");
                int last = id.lastIndexOf("\"");
                if (first != -1 && last != -1 && first != last) {
                    return id.substring(first + 1, last);
                }
            }
            return id;
        } catch (Exception e) {
            return idObj.toString();
        }
    }

    private java.util.Optional<Gig> findGigById(String id) {
        if (id == null) return java.util.Optional.empty();
        try {
            // Try as ObjectId first (Mongoose default)
            if (org.bson.types.ObjectId.isValid(id)) {
                org.bson.Document doc = mongoTemplate.getCollection("gigs")
                    .find(new org.bson.Document("_id", new org.bson.types.ObjectId(id)))
                    .first();
                if (doc != null) {
                    return java.util.Optional.ofNullable(
                        mongoTemplate.getConverter().read(Gig.class, doc));
                }
            }
            // Fallback: try as plain string
            org.bson.Document doc = mongoTemplate.getCollection("gigs")
                .find(new org.bson.Document("_id", id))
                .first();
            if (doc != null) {
                return java.util.Optional.ofNullable(
                    mongoTemplate.getConverter().read(Gig.class, doc));
            }
        } catch (Exception e) {
            log.warn("findGigById failed for '{}': {}", id, e.getMessage());
        }
        return java.util.Optional.empty();
    }

    private com.campushub.domain.User findUserByIdRaw(String id) {
        if (id == null) return null;
        try {
            if (org.bson.types.ObjectId.isValid(id)) {
                org.bson.Document doc = mongoTemplate.getCollection("users")
                    .find(new org.bson.Document("_id", new org.bson.types.ObjectId(id)))
                    .first();
                if (doc != null) {
                    return mongoTemplate.getConverter().read(com.campushub.domain.User.class, doc);
                }
            }
            org.bson.Document doc = mongoTemplate.getCollection("users")
                .find(new org.bson.Document("_id", id))
                .first();
            if (doc != null) {
                return mongoTemplate.getConverter().read(com.campushub.domain.User.class, doc);
            }
        } catch (Exception e) {
            log.warn("findUserByIdRaw failed for '{}': {}", id, e.getMessage());
        }
        return null;
    }

    public GigResponseDTO createGig(@Valid Gig gig) {
        if (gig.getGigId() == null) {
            gig.setGigId(java.util.UUID.randomUUID().toString());
        }
        Gig saved = gigRepository.save(gig);
        return mapToDTO(saved);
    }

    public List<GigResponseDTO> getAllGigs() {
        return gigRepository.findAll().stream()
                .map(g -> mapToDTO(g, null))
                .toList();
    }

    public Optional<GigResponseDTO> getGigById(String id, String currentUserId) {
        return findGigById(id).map(g -> mapToDTO(g, currentUserId));
    }

    public List<GigResponseDTO> getGigsByUser(String userId) {
        if (userId == null) return java.util.Collections.emptyList();
        
        try {
            User user = findUserByIdRaw(userId);
            String userEmail = (user != null) ? user.getEmail() : null;

            return gigRepository.findAll().stream()
                    .filter(g -> {
                        if (g == null) return false;
                        boolean match = isSameUser(g.getPostedBy(), userId);
                        if (!match && userEmail != null && g.getPostedBy() != null) {
                            match = g.getPostedBy().equalsIgnoreCase(userEmail);
                        }
                        return match;
                    })
                    .map(g -> mapToDTO(g, userId))
                    .toList();
        } catch (Exception e) {
            log.error("Error fetching gigs for user {}: {}", userId, e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    public com.campushub.dto.gig.MyGigsResponse getMyGigs(String userId) {
        try {
            log.info("Fetching MyGigs for user ID: {}", userId);
            List<GigResponseDTO> created = getGigsByUser(userId);
            log.info("Found {} created gigs for user {}", created.size(), userId);
            
            List<GigResponseDTO> applied = gigApplicationRepository.findByApplicantId(userId)
                    .stream()
                    .map(app -> {
                        try {
                            Gig gig = findGigById(app.getGigId()).orElse(null);
                            if (gig == null) {
                                log.warn("Gig {} not found for application {}", app.getGigId(), app.getId());
                                return null;
                            }
                            GigResponseDTO dto = mapToDTO(gig, userId);
                            if (dto == null) return null;
                            
                            String appStatus = (app.getStatus() != null) ? app.getStatus().name() : "pending";
                            
                            // Attach user-specific status for the "Applied Gigs" view
                            return new GigResponseDTO(
                                dto.getId(), dto.getTitle(), dto.getDescription(), dto.getCategory(), 
                                dto.getType(), dto.getBudget(), dto.getSkillsRequired(), dto.getPostedBy(), 
                                dto.getStatus(), dto.getCreatedAt(), dto.getPosterName(), dto.getPosterCollege(),
                                dto.getPosterBranch(), dto.getPosterAcademicYear(), dto.getPosterProfilePic(),
                                dto.getApplicationCount(), dto.isHasApplied(), appStatus
                            );
                        } catch (Exception e) {
                            log.error("Error processing application {}: {}", app.getId(), e.getMessage());
                            return null;
                        }
                    })
                    .filter(java.util.Objects::nonNull)
                    .toList();
            
            log.info("Found {} applied gigs for user {}", applied.size(), userId);
            return new com.campushub.dto.gig.MyGigsResponse(created, applied);
        } catch (Exception e) {
            log.error("getMyGigs failed for user {}: {}", userId, e.getMessage());
            // Return empty lists instead of crashing with 500
            return new com.campushub.dto.gig.MyGigsResponse(java.util.Collections.emptyList(), java.util.Collections.emptyList());
        }
    }

    public void applyToGig(String gigId, String userId) {
        log.info("Applying to gig: {} | User: {}", gigId, userId);
        Gig gig = findGigById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));
        
        if (isSameUser(gig.getPostedBy(), userId)) {
            throw new RuntimeException("You cannot apply to your own gig");
        }
        
        if (gigApplicationRepository.existsByGigIdAndApplicantId(gigId, userId)) {
            throw new RuntimeException("You have already applied to this gig");
        }
        
        // 1. Create GigApplication (the manageable record)
        GigApplication application = GigApplication.builder()
                .gigId(gigId)
                .applicantId(userId)
                .status(GigApplication.Status.pending)
                .build();
        gigApplicationRepository.save(application);

        // 2. Add to interestedUsers (the counter)
        if (gig.getInterestedUsers() == null) {
            gig.setInterestedUsers(new java.util.ArrayList<>());
        }
        if (!isUserInList(gig.getInterestedUsers(), userId)) {
            gig.getInterestedUsers().add(userId);
            gigRepository.save(gig);
        }

        // 3. Notify Poster
        User applicant = java.util.Optional.ofNullable(findUserByIdRaw(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        User poster = findUserByIdRaw(gig.getPostedBy());
        if (poster != null) {
            sendEmail(poster.getEmail(), "New Application for " + gig.getTitle(), 
                "Hi %s, %s has applied for your gig '%s'.".formatted(poster.getName(), applicant.getName(), gig.getTitle()));
        }
    }

    public List<com.campushub.dto.gig.ApplicationResponse> getApplicationsForGig(String gigId, String ownerId) {
        log.info("Fetching applications for Gig: {} | Requested by: {}", gigId, ownerId);
        Gig gig = findGigById(gigId).orElse(null);
        if (gig == null) {
            log.warn("Gig not found for ID: {}", gigId);
            return java.util.Collections.emptyList();
        }
        
        log.info("Gig Poster: {} | Requester: {}", gig.getPostedBy(), ownerId);
        
        // 1. Check for legacy interest records that haven't been converted to GigApplication
        if (gig.getInterestedUsers() != null && !gig.getInterestedUsers().isEmpty()) {
            for (String userId : gig.getInterestedUsers()) {
                if (!gigApplicationRepository.existsByGigIdAndApplicantId(gigId, userId)) {
                    log.info("Auto-repair: Creating missing GigApplication for user {} on gig {}", userId, gigId);
                    GigApplication application = GigApplication.builder()
                            .gigId(gigId)
                            .applicantId(userId)
                            .status(GigApplication.Status.pending)
                            .build();
                    gigApplicationRepository.save(application);
                }
            }
        }
        
        // Fetch all applications for this gig from the dedicated collection
        return gigApplicationRepository.findByGigId(gigId)
                .stream()
                .map(app -> {
                    User user = findUserByIdRaw(app.getApplicantId());
                    if (user == null) return null;
                    return new com.campushub.dto.gig.ApplicationResponse(
                        app.getId(), 
                        gigId, 
                        user.getId(),
                        user.getName(), 
                        user.getProfilePicUrl(),
                        user.getCollegeId(), 
                        user.getBranch(), 
                        user.getAcademicYear(),
                        null, // message field not yet used
                        app.getStatus(), 
                        app.getCreatedAt()
                    );
                })
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public GigResponseDTO acceptApplicant(String gigId, String applicantId, String ownerId) {
        Gig gig = findGigById(gigId).orElseThrow(() -> new RuntimeException("Gig not found"));
        if (!isSameUser(gig.getPostedBy(), ownerId)) {
            throw new RuntimeException("Unauthorized: Only the owner can accept applicants");
        }
        
        // Update Gig lists (ensure consistency)
        removeUserFromList(gig.getInterestedUsers(), applicantId);
        removeUserFromList(gig.getRejectedUsers(), applicantId);
        if (!isUserInList(gig.getAcceptedUsers(), applicantId)) {
            gig.getAcceptedUsers().add(applicantId);
        }
        gigRepository.save(gig);

        // Update GigApplication record
        updateGigApplicationStatus(gigId, applicantId, GigApplication.Status.accepted);

        // Notify Applicant via Email
        User applicant = findUserByIdRaw(applicantId);
        if (applicant != null && applicant.getEmail() != null) {
            sendEmail(applicant.getEmail(), 
                "Application Accepted - " + gig.getTitle(), 
                "Congratulations %s! 🎉\n\nYour application for '%s' has been accepted by the poster.\n\nYou can now message them to discuss next steps.\n\nBest,\nCampus Hub Team"
                    .formatted(applicant.getName(), gig.getTitle()));
        }

        return mapToDTO(gig, ownerId);
    }

    public GigResponseDTO rejectApplicant(String gigId, String applicantId, String ownerId) {
        Gig gig = findGigById(gigId).orElseThrow(() -> new RuntimeException("Gig not found"));
        if (!isSameUser(gig.getPostedBy(), ownerId)) {
            throw new RuntimeException("Unauthorized: Only the owner can reject applicants");
        }
        
        // Update Gig lists (ensure consistency)
        removeUserFromList(gig.getInterestedUsers(), applicantId);
        removeUserFromList(gig.getAcceptedUsers(), applicantId);
        if (!isUserInList(gig.getRejectedUsers(), applicantId)) {
            gig.getRejectedUsers().add(applicantId);
        }
        gigRepository.save(gig);

        // Update GigApplication record
        updateGigApplicationStatus(gigId, applicantId, GigApplication.Status.rejected);

        // Notify Applicant via Email
        User applicant = findUserByIdRaw(applicantId);
        if (applicant != null && applicant.getEmail() != null) {
            sendEmail(applicant.getEmail(), 
                "Application Status Update - " + gig.getTitle(), 
                "Hi %s,\n\nThank you for your interest in '%s'. The poster has decided to move forward with other applicants at this time.\n\nDon't give up! There are many other gigs waiting for your skills on Campus Hub.\n\nBest,\nCampus Hub Team"
                    .formatted(applicant.getName(), gig.getTitle()));
        }

        return mapToDTO(gig, ownerId);
    }

    /**
     * ObjectId-safe removal: iterates the list and uses isSameUser() for comparison,
     * since List.remove(String) uses String.equals() which fails on ObjectId format mismatches.
     */
    private boolean removeUserFromList(java.util.List<String> list, String userId) {
        if (list == null || userId == null) return false;
        java.util.Iterator<String> it = list.iterator();
        while (it.hasNext()) {
            if (isSameUser(it.next(), userId)) {
                it.remove();
                return true;
            }
        }
        return false;
    }

    /**
     * Update GigApplication status if a GigApplication record exists for this gig+applicant.
     */
    private void updateGigApplicationStatus(String gigId, String applicantId, GigApplication.Status status) {
        try {
            gigApplicationRepository.findByGigIdAndApplicantId(gigId, applicantId)
                .ifPresent(app -> {
                    app.setStatus(status);
                    gigApplicationRepository.save(app);
                });
        } catch (Exception e) {
            log.warn("Could not update GigApplication status for gig={} applicant={}: {}", gigId, applicantId, e.getMessage());
        }
    }

    public GigResponseDTO recordInterest(String gigId, String userId) {
        // We reuse the applyToGig logic to ensure consistency
        applyToGig(gigId, userId);
        return findGigById(gigId)
                .map(g -> mapToDTO(g, userId))
                .orElseThrow(() -> new RuntimeException("Gig not found after application"));
    }

    public GigResponseDTO updateGig(String id, @Valid Gig updatedGig) {
        return findGigById(id)
                .map(existingGig -> {
                    existingGig.setTitle(updatedGig.getTitle());
                    existingGig.setDescription(updatedGig.getDescription());
                    existingGig.setCategory(updatedGig.getCategory());
                    existingGig.setType(updatedGig.getType());
                    existingGig.setBudget(updatedGig.getBudget());
                    existingGig.setSkillsRequired(updatedGig.getSkillsRequired());
                    existingGig.setStatus(updatedGig.getStatus());
                    Gig saved = gigRepository.save(existingGig);
                    return mapToDTO(saved);
                })
                .orElseThrow(() -> new RuntimeException("Gig not found with id: " + id));
    }

    public void deleteGig(String id) {
        gigRepository.deleteById(id);
    }

    public List<GigResponseDTO> filterGigs(Gig.Category category, Gig.Type type, List<String> skills, String currentUserId) {
        try {
            List<Gig> allGigs = gigRepository.findAll();
            if (allGigs == null) return java.util.Collections.emptyList();

            return allGigs.stream()
                .filter(gig -> {
                    if (gig == null) return false;
                    if (category != null && gig.getCategory() != category) return false;
                    if (type != null && gig.getType() != type) return false;
                    if (skills != null && !skills.isEmpty()) {
                        if (gig.getSkillsRequired() == null) return false;
                        if (!gig.getSkillsRequired().containsAll(skills)) return false;
                    }
                    return true;
                })
                .map(g -> {
                    try {
                        return mapToDTO(g, currentUserId);
                    } catch (Exception e) {
                        return null;
                    }
                })
                .filter(java.util.Objects::nonNull)
                .collect(java.util.stream.Collectors.toList());
        } catch (Exception e) {
            log.error("filterGigs failed: {}", e.getMessage());
            return java.util.Collections.emptyList();
        }
    }

    private GigResponseDTO mapToDTO(Gig gig) {
        return mapToDTO(gig, null);
    }

    private GigResponseDTO mapToDTO(Gig gig, String currentUserId) {
        if (gig == null) return null;
        long applyCount = gig.getInterestedUsers() != null ? gig.getInterestedUsers().size() : 0;
        boolean hasApplied = false;
        if (currentUserId != null && gig.getInterestedUsers() != null) {
            hasApplied = gig.getInterestedUsers().contains(currentUserId);
        }

        GigResponseDTO builder = GigResponseDTO.builder()
                .id(gig.getGigId())
                .title(gig.getTitle())
                .description(gig.getDescription())
                .category(gig.getCategory())
                .type(gig.getType())
                .budget(gig.getBudget())
                .skillsRequired(gig.getSkillsRequired())
                .postedBy(gig.getPostedBy())
                .status(gig.getStatus())
                .createdAt(gig.getCreatedAt())
                .applicationCount(applyCount)
                .hasApplied(hasApplied)
                .build();

        try {
            String posterId = normalizeId(gig.getPostedBy());
            com.campushub.domain.User user = findUserByIdRaw(posterId);
            if (user != null) {
                builder.setPosterName(user.getName());
                builder.setPosterBranch(user.getBranch());
                builder.setPosterAcademicYear(user.getAcademicYear());
                builder.setPosterProfilePic(user.getProfilePicUrl());
                builder.setPosterCollege(user.getCollegeId());
            }
        } catch (Exception e) {
            log.warn("Could not fetch user details for poster {}: {}", gig.getPostedBy(), e.getMessage());
        }

        return builder;
    }
    @org.springframework.beans.factory.annotation.Value("${brevo.user:noreply@campushub.in}")
    private String brevoUser;

    private void sendEmail(String toEmail, String subject, String content) {
        if (toEmail == null || toEmail.isBlank()) {
            log.warn("sendEmail skipped — no recipient email");
            return;
        }
        if (brevoApiKey == null || brevoApiKey.isBlank()) {
            log.warn("sendEmail skipped — BREVO_API_KEY not configured");
            return;
        }

        String maskedKey = brevoApiKey.length() > 5 ? brevoApiKey.substring(0, 5) + "..." : "EMPTY/SHORT";
        log.info("Attempting to send email to {} using key starting with: {}", toEmail, maskedKey);

        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.setAccept(java.util.List.of(org.springframework.http.MediaType.APPLICATION_JSON));
            headers.set("api-key", brevoApiKey.trim());
            headers.set("x-sib-api-key", brevoApiKey.trim());

            Map<String, Object> payload = new java.util.LinkedHashMap<>();
            // Use the verified sender from .env if available, otherwise fallback
            payload.put("sender", Map.of("name", "Campus Hub", "email", brevoUser));
            payload.put("to", java.util.List.of(Map.of("email", toEmail)));
            payload.put("subject", subject);
            payload.put("textContent", content);

            com.fasterxml.jackson.databind.ObjectMapper mapper = new com.fasterxml.jackson.databind.ObjectMapper();
            String body = mapper.writeValueAsString(payload);

            org.springframework.http.HttpEntity<String> request = new org.springframework.http.HttpEntity<>(body, headers);
            
            org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    request,
                    String.class);
            
            log.info("Email sent successfully to {}. Response: {}", toEmail, response.getBody());
        } catch (org.springframework.web.client.HttpStatusCodeException e) {
            log.error("Brevo rejected the email! Status: {} | Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Brevo send failed to {}: {}", toEmail, e.getMessage());
        }
    }



    private boolean isUserInList(java.util.List<String> list, String userId) {
        if (list == null || userId == null) return false;
        return list.stream().anyMatch(uid -> isSameUser(uid, userId));
    }

}



