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
    private boolean isSameUser(String id1, String id2) {
        if (id1 == null || id2 == null) return false;
        String s1 = id1.trim();
        String s2 = id2.trim();
        if (s1.equalsIgnoreCase(s2)) return true;
        
        // If one is ObjectId hex and other might have different format, try to normalize
        if (org.bson.types.ObjectId.isValid(s1) && org.bson.types.ObjectId.isValid(s2)) {
            return new org.bson.types.ObjectId(s1).equals(new org.bson.types.ObjectId(s2));
        }
        return false;
    }

    /**
     * Mongoose stores _id as ObjectId. Spring Data's findById auto-converts String→ObjectId
     * but the conversion sometimes fails silently. This helper tries ObjectId first, then String.
     */
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
        return gigRepository.findAll().stream().map(this::mapToDTO).toList();
    }

    public Optional<GigResponseDTO> getGigById(String id, String currentUserId) {
        return findGigById(id).map(g -> mapToDTO(g, currentUserId));
    }

    public List<GigResponseDTO> getGigsByUser(String userId) {
        if (userId == null) return java.util.Collections.emptyList();
        
        org.bson.Document query = new org.bson.Document();
        if (org.bson.types.ObjectId.isValid(userId)) {
            // Match either as ObjectId OR as plain string
            query.append("$or", java.util.Arrays.asList(
                new org.bson.Document("posted_by", new org.bson.types.ObjectId(userId)),
                new org.bson.Document("posted_by", userId)
            ));
        } else {
            query.append("posted_by", userId);
        }

        List<Gig> gigs = mongoTemplate.getCollection("gigs")
                .find(query)
                .into(new java.util.ArrayList<>())
                .stream()
                .map(doc -> mongoTemplate.getConverter().read(Gig.class, doc))
                .toList();

        return gigs.stream().map(g -> mapToDTO(g, userId)).toList();
    }

    public void applyToGig(String gigId, String userId) {
        Gig gig = findGigById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));
        
        if (isSameUser(gig.getPostedBy(), userId)) {
            throw new RuntimeException("You cannot apply to your own gig");
        }
        
        if (gigApplicationRepository.existsByGigIdAndApplicantId(gigId, userId)) {
            throw new RuntimeException("You have already applied to this gig");
        }
        
        User applicant = java.util.Optional.ofNullable(findUserByIdRaw(userId))
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        GigApplication application = GigApplication.builder()
                .gig(gig)
                .applicant(applicant)
                .status(GigApplication.Status.pending)
                .build();
        
        gigApplicationRepository.save(application);

        // Notify Poster
        User poster = findUserByIdRaw(gig.getPostedBy());
        if (poster != null) {
            sendEmail(poster.getEmail(), "New Application for " + gig.getTitle(), 
                "Hi %s, %s has applied for your gig '%s'.".formatted(poster.getName(), applicant.getName(), gig.getTitle()));
        }
    }

    public List<User> getApplicationsForGig(String gigId, String ownerId) {
        Gig gig = findGigById(gigId).orElse(null);
        if (gig == null) return java.util.Collections.emptyList();
        
        // Only owner can view applications; return empty for unauthenticated/unauthorized
        if (ownerId == null || !isSameUser(gig.getPostedBy(), ownerId)) {
            return java.util.Collections.emptyList();
        }
        
        List<String> userIds = gig.getInterestedUsers();
        if (userIds == null || userIds.isEmpty()) return java.util.Collections.emptyList();
        
        return userIds.stream()
                .map(id -> findUserByIdRaw(id))
                .filter(java.util.Objects::nonNull)
                .toList();
    }

    public GigResponseDTO acceptApplicant(String gigId, String applicantId, String ownerId) {
        Gig gig = findGigById(gigId).orElseThrow(() -> new RuntimeException("Gig not found"));
        if (!isSameUser(gig.getPostedBy(), ownerId)) {
            throw new RuntimeException("Unauthorized: Only the owner can accept applicants");
        }
        if (gig.getInterestedUsers().remove(applicantId)) {
            gig.getAcceptedUsers().add(applicantId);
            gigRepository.save(gig);

            // Notify Applicant
            User applicant = findUserByIdRaw(applicantId);
            if (applicant != null) {
                sendEmail(applicant.getEmail(), "Application Accepted - " + gig.getTitle(), 
                    "Congratulations! Your application for '%s' has been accepted.".formatted(gig.getTitle()));
            }
        }
        return mapToDTO(gig, ownerId);
    }

    public GigResponseDTO rejectApplicant(String gigId, String applicantId, String ownerId) {
        Gig gig = findGigById(gigId).orElseThrow(() -> new RuntimeException("Gig not found"));
        if (!isSameUser(gig.getPostedBy(), ownerId)) {
            throw new RuntimeException("Unauthorized: Only the owner can reject applicants");
        }
        if (gig.getInterestedUsers().remove(applicantId)) {
            gig.getRejectedUsers().add(applicantId);
            gigRepository.save(gig);

            // Notify Applicant
            User applicant = findUserByIdRaw(applicantId);
            if (applicant != null) {
                sendEmail(applicant.getEmail(), "Application Update - " + gig.getTitle(), 
                    "Thank you for your interest. Your application for '%s' was not selected this time.".formatted(gig.getTitle()));
            }
        }
        return mapToDTO(gig, ownerId);
    }

    public GigResponseDTO recordInterest(String gigId, String userId) {
        Gig gig = findGigById(gigId)
                .orElseThrow(() -> new RuntimeException("Gig not found"));

        if (gig.getPostedBy().equals(userId)) {
            throw new RuntimeException("You cannot express interest in your own gig");
        }

        if (gig.getInterestedUsers().contains(userId)) {
            throw new RuntimeException("You have already expressed interest in this gig");
        }

        gig.getInterestedUsers().add(userId);
        Gig saved = gigRepository.save(gig);
        return mapToDTO(saved, userId);
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
        List<Gig> gigs = gigRepository.findAll();
        
        // Apply filters in memory (can be optimized with custom queries later)
        if (category != null) {
            gigs = gigs.stream().filter(gig -> gig.getCategory() == category).toList();
        }
        if (type != null) {
            gigs = gigs.stream().filter(gig -> gig.getType() == type).toList();
        }
        if (skills != null && !skills.isEmpty()) {
            gigs = gigs.stream().filter(gig -> 
                gig.getSkillsRequired() != null && 
                gig.getSkillsRequired().containsAll(skills)
            ).toList();
        }
        
        return gigs.stream().map(g -> mapToDTO(g, currentUserId)).toList();
    }

    private GigResponseDTO mapToDTO(Gig gig) {
        return mapToDTO(gig, null);
    }

    private GigResponseDTO mapToDTO(Gig gig, String currentUserId) {
        long applyCount = gig.getInterestedUsers().size();
        boolean hasApplied = false;
        if (currentUserId != null) {
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
            com.campushub.domain.User user = findUserByIdRaw(gig.getPostedBy());
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
    private void sendEmail(String toEmail, String subject, String content) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            String body = """
                    {
                      "sender": {"name": "Campus Hub", "email": "noreply@campushub.in"},
                      "to": [{"email": "%s"}],
                      "subject": "%s",
                      "textContent": "%s"
                    }
                    """.formatted(toEmail, subject, content);

            org.springframework.http.HttpEntity<String> request = new org.springframework.http.HttpEntity<>(body, headers);
            restTemplate.postForEntity(
                    "https://api.brevo.com/v3/smtp/email",
                    request,
                    String.class);
            log.info("Email sent to {} via Brevo API: {}", toEmail, subject);
        } catch (Exception e) {
            log.error("Brevo send failed to {}: {}", toEmail, e.getMessage());
        }
    }
}



