package com.campushub.service;

import com.campushub.dto.user.SkillRequest;
import com.campushub.dto.user.UpdateProfileRequest;
import com.campushub.dto.user.UserProfileResponse;

public interface UserService {
    UserProfileResponse getMe(String userId);
    UserProfileResponse updateMe(String userId, UpdateProfileRequest req);
    UserProfileResponse getPublicProfile(String userId);
    void deleteSkill(String userId, String skillId);
}



