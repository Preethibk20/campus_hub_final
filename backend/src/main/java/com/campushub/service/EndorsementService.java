package com.campushub.service;

import com.campushub.domain.Endorsement;
import com.campushub.domain.Skill;
import com.campushub.domain.User;
import com.campushub.dto.endorsement.EndorsementRequest;
import com.campushub.dto.endorsement.EndorsementResponse;
import com.campushub.dto.endorsement.SkillEndorsementResponse;
import com.campushub.exception.ApiException;
import com.campushub.repository.EndorsementRepository;
import com.campushub.repository.SkillRepository;
import com.campushub.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EndorsementService {

    private final EndorsementRepository endorsementRepository;
    private final UserRepository userRepository;
    private final SkillRepository skillRepository;

    @Transactional
    public void create(EndorsementRequest req, String endorserId) {
        if (req.endorseeId().equals(endorserId)) {
            throw ApiException.badRequest("You cannot endorse your own skills");
        }

        if (endorsementRepository.existsByEndorserIdAndSkillId(endorserId, req.skillId())) {
            throw ApiException.badRequest("You have already endorsed this skill for someone");
        }

        User endorser = userRepository.findById(endorserId)
                .orElseThrow(() -> ApiException.notFound("Endorser not found"));
        User endorsee = userRepository.findById(req.endorseeId())
                .orElseThrow(() -> ApiException.notFound("Endorsee not found"));
        Skill skill = skillRepository.findById(req.skillId())
                .orElseThrow(() -> ApiException.notFound("Skill not found"));

        Endorsement endorsement = Endorsement.builder()
                .endorser(endorser)
                .endorsee(endorsee)
                .skill(skill)
                .comment(req.comment())
                .build();

        endorsementRepository.save(endorsement);
    }

    public List<SkillEndorsementResponse> getForUser(String userId) {
        List<Endorsement> endorsements = endorsementRepository.findByEndorseeId(userId);

        Map<Skill, List<Endorsement>> grouped = endorsements.stream()
                .collect(Collectors.groupingBy(Endorsement::getSkill));

        return grouped.entrySet().stream()
                .map(e -> new SkillEndorsementResponse(
                        e.getKey().getId(),
                        e.getKey().getName(),
                        e.getValue().stream().map(this::toResponse).toList()
                ))
                .toList();
    }

    private EndorsementResponse toResponse(Endorsement e) {
        return new EndorsementResponse(
                e.getId(),
                e.getEndorser().getId(),
                e.getEndorser().getName(),
                Optional.ofNullable(e.getComment()),
                e.getCreatedAt()
        );
    }
}



