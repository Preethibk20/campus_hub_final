package com.campushub.service.impl;

import com.campushub.domain.Skill;
import com.campushub.domain.User;
import com.campushub.dto.user.UpdateProfileRequest;

import com.campushub.dto.user.UserProfileResponse;
import com.campushub.exception.ApiException;
import com.campushub.repository.CollegeRepository;
import com.campushub.repository.ReviewRepository;
import com.campushub.repository.SkillRepository;
import com.campushub.repository.UserRepository;
import com.campushub.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final SkillRepository skillRepository;
    private final ReviewRepository reviewRepository;
    private final CollegeRepository collegeRepository;
    private final org.springframework.data.mongodb.core.MongoTemplate mongoTemplate;

    public UserServiceImpl(
            UserRepository userRepository,
            SkillRepository skillRepository,
            ReviewRepository reviewRepository,
            CollegeRepository collegeRepository,
            org.springframework.data.mongodb.core.MongoTemplate mongoTemplate
    ) {
        this.userRepository = userRepository;
        this.skillRepository = skillRepository;
        this.reviewRepository = reviewRepository;
        this.collegeRepository = collegeRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public UserProfileResponse getMe(String userId) {
        User user = findUser(userId);
        return toFullProfile(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateMe(String userId, UpdateProfileRequest req) {
        User user = findUser(userId);
        if (req.name()          != null) user.setName(req.name());
        if (req.profilePicUrl() != null) user.setProfilePicUrl(
                req.profilePicUrl().isBlank() ? null : req.profilePicUrl());
        if (req.bio()          != null) user.setBio(req.bio());
        if (req.academicYear() != null) user.setYear(req.academicYear());
        if (req.branch()       != null) user.setCourse(req.branch());
        if (req.linkedinUrl()  != null) user.setLinkedinUrl(req.linkedinUrl());
        if (req.githubUrl()    != null) user.setGithubUrl(req.githubUrl());
        if (req.hourlyRate()   != null) user.setHourlyRate(req.hourlyRate());
        if (req.availability() != null) user.setAvailability(req.availability());
        if (req.portfolioUrl() != null) user.setPortfolioUrl(req.portfolioUrl());
        if (req.domains()      != null) user.setDomains(req.domains());
        
        if (req.college() != null) {
            // Try to find the college by name to get its ID
            collegeRepository.findAll().stream()
                    .filter(c -> c.getName().equalsIgnoreCase(req.college()))
                    .findFirst()
                    .ifPresentOrElse(
                            c -> user.setCollegeId(c.getId()),
                            () -> user.setCollegeId(req.college()) // Fallback to raw string
                    );
        }
        
        // Handle skills (save them to skillRepository or just update the user.skills string list depending on how the frontend relies on it)
        if (req.skills() != null) {
            user.setSkills(req.skills());
            // Optionally, we could create Skill entities in skillRepository here if needed,
            // but the frontend already uses `addSkill` for that. We'll update the user's string list just in case.
        }
        return toFullProfile(userRepository.save(user));

    }

    @Override
    public UserProfileResponse getPublicProfile(String userId) {
        User user = findUser(userId);
        return toFullProfile(user);
    }

    @Override
    @Transactional
    public void deleteSkill(String userId, String skillId) {
        Skill skill = skillRepository.findById(skillId)
                .orElseThrow(() -> ApiException.notFound("Skill not found"));
        if (!skill.getUser().getId().equals(userId)) {
            throw ApiException.forbidden("Not your skill");
        }
        skill.setActive(false);
        skillRepository.save(skill);
    }

    private User findUser(String id) {
        if (id == null) throw ApiException.notFound("User not found");
        try {
            // Try as ObjectId first (Mongoose default)
            if (org.bson.types.ObjectId.isValid(id)) {
                org.bson.Document doc = mongoTemplate.getCollection("users")
                    .find(new org.bson.Document("_id", new org.bson.types.ObjectId(id)))
                    .first();
                if (doc != null) {
                    return mongoTemplate.getConverter().read(User.class, doc);
                }
            }
            // Fallback: try as plain string
            org.bson.Document doc = mongoTemplate.getCollection("users")
                .find(new org.bson.Document("_id", id))
                .first();
            if (doc != null) {
                return mongoTemplate.getConverter().read(User.class, doc);
            }
        } catch (Exception e) {
            // Log and fallback to repository just in case
        }
        
        return userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private UserProfileResponse toFullProfile(User user) {
        long reviewCount = reviewRepository.countByRevieweeId(user.getId());
        double avgRating = reviewRepository.avgRatingByRevieweeId(user.getId())
                .orElse(0.0);

        List<Skill> skills = skillRepository.findByUserIdAndIsActiveTrue(user.getId());
        List<UserProfileResponse.SkillDto> skillDtos = skills.stream()
                .map(this::toSkillDto)
                .collect(Collectors.toList());

        String collegeName = null;
        if (user.getCollegeId() != null) {
            collegeName = collegeRepository.findById(user.getCollegeId())
                    .map(com.campushub.domain.College::getName)
                    .orElse(user.getCollegeId());
        }

        int completion = 0;
        if (user.getName() != null && !user.getName().trim().isEmpty()) completion += 10;
        if (user.getEmail() != null && !user.getEmail().trim().isEmpty()) completion += 10;
        if (user.getBio() != null && !user.getBio().trim().isEmpty()) completion += 20;
        if (user.getCollegeId() != null && !user.getCollegeId().trim().isEmpty()) completion += 15;
        if (user.getBranch() != null && !user.getBranch().trim().isEmpty()) completion += 10;
        if (user.getAcademicYear() != null && !user.getAcademicYear().trim().isEmpty()) completion += 10;
        if (skills != null && !skills.isEmpty()) completion += 15;
        if (user.getGithubUrl() != null && !user.getGithubUrl().trim().isEmpty()) completion += 5;
        if (user.getLinkedinUrl() != null && !user.getLinkedinUrl().trim().isEmpty()) completion += 5;
        completion = Math.min(100, completion);

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.isVerified(),
                user.getBio(),
                collegeName,
                user.getYear(),
                user.getCourse(),
                skills.stream().map(Skill::getName).collect(Collectors.toList()),
                skillDtos,
                user.getDomains(),

                user.getAvailability(),
                completion,
                user.getProfilePicUrl(),
                user.getLinkedinUrl(),
                user.getGithubUrl(),
                null, // portfolioUrl
                user.getHourlyRate(),
                collegeName,
                reviewCount,
                avgRating,
                user.getCreatedAt()
        );

    }

    private UserProfileResponse.SkillDto toSkillDto(Skill s) {
        return new UserProfileResponse.SkillDto(
                s.getId(), s.getName(), s.getCategory(),
                s.getRateType() != null ? s.getRateType().name() : null,
                s.getRateAmount());
    }
}





