package com.campushub.service;

import com.campushub.domain.HackathonPost;
import com.campushub.domain.MatchRequest;
import com.campushub.dto.SuggestedPartnerDTO;
import com.campushub.repository.HackathonPostRepository;
import com.campushub.repository.MatchRequestRepository;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private static final Logger log = LoggerFactory.getLogger(MatchingService.class);

    private final HackathonPostRepository postRepo;
    private final MatchRequestRepository  requestRepo;
    private final RestTemplate            restTemplate;

    @Value("${auth.service.url:http://localhost:3001}")
    private String authServiceUrl;

    public MatchingService(HackathonPostRepository postRepo, MatchRequestRepository requestRepo, RestTemplate restTemplate) {
        this.postRepo = postRepo;
        this.requestRepo = requestRepo;
        this.restTemplate = restTemplate;
    }

    public HackathonPost createPost(@Valid HackathonPost post, String currentUserId) {
        post.setPostId(java.util.UUID.randomUUID().toString());
        post.setPostedBy(currentUserId);
        post.setStatus(HackathonPost.Status.OPEN);
        post.setCurrentSize(1);
        log.info("Creating hackathon post '{}' for user {}", post.getTitle(), currentUserId);
        return postRepo.save(post);
    }

    public List<HackathonPost> getAllPosts(String status, String mode, String role) {
        if (role != null && !role.isBlank()) {
            return postRepo.findByRoleNeeded(role);
        }

        HackathonPost.Status statusEnum = parseStatus(status);
        HackathonPost.Mode   modeEnum   = parseMode(mode);

        if (statusEnum != null && modeEnum != null) {
            return postRepo.findByStatusAndMode(statusEnum, modeEnum);
        }
        if (statusEnum != null) {
            return postRepo.findByStatus(statusEnum);
        }
        if (modeEnum != null) {
            return postRepo.findByMode(modeEnum);
        }
        return postRepo.findAll();
    }

    public HackathonPost getPostById(String postId) {
        return postRepo.findById(postId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Hackathon post not found: " + postId));
    }

    public List<HackathonPost> getMyPosts(String userId) {
        return postRepo.findByPostedBy(userId);
    }

    public MatchRequest sendMatchRequest(String postId, String fromUserId, String message) {
        HackathonPost post = getPostById(postId);

        if (post.getPostedBy().equals(fromUserId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "You cannot send a request to your own post");
        }

        if (!post.hasOpenSpots()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "This team is already full or the post is closed");
        }

        requestRepo.findByPostIdAndFromUserId(postId, fromUserId).ifPresent(existing -> {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "You have already sent a request to this post (status: " + existing.getStatus() + ")");
        });

        MatchRequest req = MatchRequest.builder()
                .requestId(java.util.UUID.randomUUID().toString())
                .postId(postId)
                .fromUserId(fromUserId)
                .toUserId(post.getPostedBy())
                .message(message)
                .status(MatchRequest.Status.PENDING)
                .createdAt(Instant.now())
                .build();

        log.info("User {} sent match request to post {}", fromUserId, postId);
        MatchRequest savedReq = requestRepo.save(req);
        
        notifyMatchAsync(post.getPostedBy(), fromUserId, post.getTitle());
        
        return savedReq;
    }

    public List<MatchRequest> getIncomingRequests(String userId) {
        return requestRepo.findByToUserIdAndStatus(userId, MatchRequest.Status.PENDING);
    }

    public List<MatchRequest> getOutgoingRequests(String userId) {
        return requestRepo.findByFromUserId(userId);
    }

    public MatchRequest respondToRequest(String requestId, String newStatus, String currentUserId) {
        MatchRequest req = requestRepo.findById(requestId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Match request not found: " + requestId));

        if (!req.getToUserId().equals(currentUserId)) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "Only the post owner can respond to this request");
        }

        if (req.getStatus() != MatchRequest.Status.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Request has already been responded to");
        }

        MatchRequest.Status parsed = switch (newStatus.toUpperCase()) {
            case "ACCEPTED" -> MatchRequest.Status.ACCEPTED;
            case "REJECTED" -> MatchRequest.Status.REJECTED;
            default -> throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Status must be ACCEPTED or REJECTED");
        };

        req.setStatus(parsed);
        req.setRespondedAt(Instant.now());
        requestRepo.save(req);

        if (parsed == MatchRequest.Status.ACCEPTED) {
            HackathonPost post = getPostById(req.getPostId());
            post.setCurrentSize(post.getCurrentSize() + 1);
            if (post.getCurrentSize() >= post.getTeamSize()) {
                post.setStatus(HackathonPost.Status.CLOSED);
                log.info("Post {} is now full — auto-closed", post.getPostId());
                notifyTeamCompleteAsync(post.getPostedBy(), post.getTitle());
            }
            postRepo.save(post);
            
            // Notify the applicant that they've been accepted
            notifyAcceptAsync(req.getFromUserId(), post.getTitle());
        }

        log.info("Request {} {} by {}", requestId, parsed, currentUserId);
        return req;
    }

    public List<SuggestedPartnerDTO> getSuggestedPartners(String userId) {
        List<String> userSkills = fetchUserSkills(userId);
        if (userSkills.isEmpty()) {
            log.warn("User {} has no skills — returning open posts by recency", userId);
            return postRepo.findByStatus(HackathonPost.Status.OPEN)
                    .stream()
                    .filter(p -> !p.getPostedBy().equals(userId))
                    .limit(10)
                    .map(p -> SuggestedPartnerDTO.builder()
                            .post(p)
                            .score(0)
                            .matchedSkills(List.of())
                            .build())
                    .collect(Collectors.toList());
        }

        Set<String> normalizedSkills = userSkills.stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());

        List<HackathonPost> candidates = postRepo
                .findByStatus(HackathonPost.Status.OPEN)
                .stream()
                .filter(p -> !p.getPostedBy().equals(userId))
                .filter(HackathonPost::hasOpenSpots)
                .collect(Collectors.toList());

        return candidates.stream()
                .map(post -> {
                    List<String> matched = post.getRolesNeeded().stream()
                            .filter(role -> normalizedSkills.contains(role.toLowerCase()))
                            .collect(Collectors.toList());
                    List<String> techMatched = post.getTechStack().stream()
                            .filter(t -> normalizedSkills.contains(t.toLowerCase()))
                            .collect(Collectors.toList());
                    int score = (matched.size() * 2) + techMatched.size();
                    List<String> allMatched = new ArrayList<>(matched);
                    allMatched.addAll(techMatched);
                    return SuggestedPartnerDTO.builder()
                            .post(post)
                            .score(score)
                            .matchedSkills(allMatched)
                            .build();
                })
                .filter(dto -> dto.getScore() > 0)
                .sorted(Comparator.comparingInt(SuggestedPartnerDTO::getScore).reversed())
                .limit(10)
                .collect(Collectors.toList());
    }

    private List<String> fetchUserSkills(String userId) {
        String url = authServiceUrl + "/api/profile/" + userId;
        try {
            ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    null,
                    new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                Object skillsObj = resp.getBody().get("skills");
                if (skillsObj instanceof List<?> rawList) {
                    return rawList.stream()
                            .map(item -> item != null ? item.toString() : null)
                            .filter(Objects::nonNull)
                            .collect(Collectors.toList());
                }
            }
        } catch (RestClientException e) {
            log.warn("Could not reach Auth service at {}: {}", url, e.getMessage());
        }
        return List.of();
    }

    private void notifyMatchAsync(String toUserId, String fromUserId, String postTitle) {
        new Thread(() -> {
            try {
                String fromUserName = fetchUserName(fromUserId);
                String url = authServiceUrl + "/api/notify/match";
                Map<String, String> payload = Map.of(
                        "toUserId", toUserId,
                        "fromUserName", fromUserName != null ? fromUserName : "A user",
                        "postTitle", postTitle
                );
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("x-internal-secret", "super_secret_internal_key");
                HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
                restTemplate.postForEntity(url, request, String.class);
                log.info("Match notification triggered for user {}", toUserId);
            } catch (Exception e) {
                log.error("Failed to trigger match notification: {}", e.getMessage());
            }
        }).start();
    }

    private String fetchUserName(String userId) {
        String url = authServiceUrl + "/api/profile/" + userId;
        try {
            ResponseEntity<Map<String, Object>> resp = restTemplate.exchange(
                    url, HttpMethod.GET, null, new ParameterizedTypeReference<Map<String, Object>>() {}
            );
            if (resp.getStatusCode().is2xxSuccessful() && resp.getBody() != null) {
                Object name = resp.getBody().get("name");
                return name != null ? name.toString() : null;
            }
        } catch (RestClientException e) {
            log.warn("Could not fetch user name for {}: {}", userId, e.getMessage());
        }
        return null;
    }

    private void notifyTeamCompleteAsync(String toUserId, String postTitle) {
        new Thread(() -> {
            try {
                String url = authServiceUrl + "/api/notify/team-complete";
                Map<String, String> payload = Map.of(
                        "toUserId", toUserId,
                        "postTitle", postTitle
                );
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("x-internal-secret", "super_secret_internal_key");
                HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
                restTemplate.postForEntity(url, request, String.class);
                log.info("Team complete notification triggered for user {}", toUserId);
            } catch (Exception e) {
                log.error("Failed to trigger team complete notification: {}", e.getMessage());
            }
        }).start();
    }

    private void notifyAcceptAsync(String toUserId, String postTitle) {
        new Thread(() -> {
            try {
                String url = authServiceUrl + "/api/notify/match-accepted";
                Map<String, String> payload = Map.of(
                        "toUserId", toUserId,
                        "postTitle", postTitle
                );
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("x-internal-secret", "super_secret_internal_key");
                HttpEntity<Map<String, String>> request = new HttpEntity<>(payload, headers);
                restTemplate.postForEntity(url, request, String.class);
                log.info("Match acceptance notification triggered for user {}", toUserId);
            } catch (Exception e) {
                log.error("Failed to trigger match acceptance notification: {}", e.getMessage());
            }
        }).start();
    }

    private HackathonPost.Status parseStatus(String status) {
        if (status == null || status.isBlank()) return null;
        try { return HackathonPost.Status.valueOf(status.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }

    private HackathonPost.Mode parseMode(String mode) {
        if (mode == null || mode.isBlank()) return null;
        try { return HackathonPost.Mode.valueOf(mode.toUpperCase()); }
        catch (IllegalArgumentException e) { return null; }
    }
}



