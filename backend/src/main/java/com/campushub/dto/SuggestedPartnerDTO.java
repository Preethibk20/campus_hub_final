package com.campushub.dto;

import com.campushub.domain.HackathonPost;
import java.util.List;

/**
 * A HackathonPost enriched with a relevance score for the
 * getSuggestedPartners() algorithm. Score = number of overlapping
 * skills between the user's skill set and the post's rolesNeeded.
 */
public class SuggestedPartnerDTO {
    private HackathonPost post;
    private int           score;            // number of overlapping skills
    private List<String>  matchedSkills;    // which specific skills matched

    public SuggestedPartnerDTO() {}

    public SuggestedPartnerDTO(HackathonPost post, int score, List<String> matchedSkills) {
        this.post = post;
        this.score = score;
        this.matchedSkills = matchedSkills;
    }

    public HackathonPost getPost() { return post; }
    public void setPost(HackathonPost post) { this.post = post; }
    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public List<String> getMatchedSkills() { return matchedSkills; }
    public void setMatchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; }

    public static SuggestedPartnerDTOBuilder builder() { return new SuggestedPartnerDTOBuilder(); }

    public static class SuggestedPartnerDTOBuilder {
        private HackathonPost post;
        private int           score;
        private List<String>  matchedSkills;

        public SuggestedPartnerDTOBuilder post(HackathonPost post) { this.post = post; return this; }
        public SuggestedPartnerDTOBuilder score(int score) { this.score = score; return this; }
        public SuggestedPartnerDTOBuilder matchedSkills(List<String> matchedSkills) { this.matchedSkills = matchedSkills; return this; }

        public SuggestedPartnerDTO build() {
            return new SuggestedPartnerDTO(post, score, matchedSkills);
        }
    }
}



