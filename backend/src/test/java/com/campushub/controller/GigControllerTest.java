package com.campushub.controller;

import com.campushub.config.TestConfig;
import com.campushub.domain.College;
import com.campushub.domain.Gig;
import com.campushub.domain.User;
import com.campushub.repository.CollegeRepository;
import com.campushub.repository.GigRepository;
import com.campushub.repository.UserRepository;
import com.campushub.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import(TestConfig.class)
class GigControllerTest {

    @Autowired MockMvc mockMvc;
    @Autowired JwtUtil jwtUtil;
    @Autowired UserRepository userRepository;
    @Autowired CollegeRepository collegeRepository;
    @Autowired GigRepository gigRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private User testUser;
    private String accessToken;

    @BeforeEach
    void setUp() {
        College college = collegeRepository.save(College.builder()
                .name("Test University").emailDomain("test.edu").build());

        testUser = userRepository.save(User.builder()
                .name("Test User")
                .email("user@test.edu")
                .password(passwordEncoder.encode("password"))
                .role("student")
                .collegeId(college.getId())
                .isVerified(true)
                .build());

        accessToken = jwtUtil.generateAccessToken(
                testUser.getId(), testUser.getEmail(), testUser.getRole());
    }

    @Test
    void createGig_authenticated_returns201() throws Exception {
        mockMvc.perform(multipart("/api/gigs")
                        .file(new MockMultipartFile("attachments", "test.png",
                                "image/png", new byte[100]))
                        .param("type", "PAID")
                        .param("title", "Java Tutoring")
                        .param("description", "I can help with Java programming")
                        .param("category", "TECH")
                        .param("budgetMin", "500")
                        .param("budgetMax", "1000")
                        .param("timelineDays", "7")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Java Tutoring"))
                .andExpect(jsonPath("$.posterName").value("Test User"));
    }

    @Test
    void createGig_unauthenticated_returns401() throws Exception {
        mockMvc.perform(multipart("/api/gigs")
                        .param("type", "PAID")
                        .param("title", "Java Tutoring")
                        .param("description", "Help with Java")
                        .param("category", "TECH")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void searchGigs_byKeyword_returnsMatchingGigs() throws Exception {
        // Seed a gig directly
        gigRepository.save(Gig.builder()
                .postedBy(testUser.getId().toString())
                .type(Gig.Type.PAID)
                .title("Python Data Science")
                .description("Help with pandas and numpy")
                .category(Gig.Category.TECH)
                .status(Gig.Status.OPEN)
                .build());

        mockMvc.perform(get("/api/gigs")
                        .param("q", "python")
                        .param("category", "TECH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void searchGigs_noAuth_returns200() throws Exception {
        mockMvc.perform(get("/api/gigs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    void getGigById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/gigs/00000000-0000-0000-0000-000000000000"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteGig_softDeletes_setsStatusCancelled() throws Exception {
        Gig gig = gigRepository.save(Gig.builder()
                .postedBy(testUser.getId().toString())
                .type(Gig.Type.PAID)
                .title("To Delete")
                .description("Will be cancelled")
                .category(Gig.Category.OTHER)
                .status(Gig.Status.OPEN)
                .build());

        mockMvc.perform(delete("/api/gigs/" + gig.getId())
                        .header("Authorization", "Bearer " + accessToken))
                .andExpect(status().isNoContent());

        Gig updated = gigRepository.findById(gig.getId()).orElseThrow();
        assert updated.getStatus() == Gig.Status.CANCELLED;
    }
}
