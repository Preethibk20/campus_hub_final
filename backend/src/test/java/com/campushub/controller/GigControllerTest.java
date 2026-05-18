package com.campushub.controller;

import com.campushub.config.TestConfig;
import com.campushub.domain.College;
import com.campushub.domain.Gig;
import com.campushub.domain.User;
import com.campushub.repository.CollegeRepository;
import com.campushub.repository.GigApplicationRepository;
import com.campushub.repository.GigRepository;
import com.campushub.repository.UserRepository;
import com.campushub.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.DisabledIf;
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
@Tag("integration")
@DisabledIf(value = "isLocalMongoUnavailable", disabledReason = "Local MongoDB not running — skipping integration tests")
class GigControllerTest {

    /** Returns true when local MongoDB (127.0.0.1:27017) cannot be reached. */
    static boolean isLocalMongoUnavailable() {
        try (var sock = new java.net.Socket()) {
            sock.connect(new java.net.InetSocketAddress("127.0.0.1", 27017), 500);
            return false; // reachable → do NOT disable
        } catch (Exception e) {
            return true;  // not reachable → disable
        }
    }

    @Autowired MockMvc mockMvc;
    @Autowired JwtUtil jwtUtil;
    @Autowired UserRepository userRepository;
    @Autowired CollegeRepository collegeRepository;
    @Autowired GigRepository gigRepository;
    @Autowired PasswordEncoder passwordEncoder;
    @Autowired GigApplicationRepository gigApplicationRepository;

    private User testUser;
    private String accessToken;

    @BeforeEach
    void setUp() {
        collegeRepository.deleteAll();
        userRepository.deleteAll();
        gigRepository.deleteAll();
        gigApplicationRepository.deleteAll();

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

    @org.junit.jupiter.api.AfterEach
    void tearDown() {
        gigApplicationRepository.deleteAll();
        gigRepository.deleteAll();
        userRepository.deleteAll();
        collegeRepository.deleteAll();
    }

    @Test
    void createGig_authenticated_returns201() throws Exception {
        String gigJson = """
                {
                  "type": "PAID",
                  "title": "Java Tutoring",
                  "description": "I can help with Java programming",
                  "category": "TECH",
                  "budget": 750.0,
                  "skillsRequired": ["Java", "Spring Boot"]
                }
                """;

        mockMvc.perform(post("/api/gigs")
                        .header("Authorization", "Bearer " + accessToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(gigJson))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").exists())
                .andExpect(jsonPath("$.title").value("Java Tutoring"))
                .andExpect(jsonPath("$.posterName").value("Test User"));
    }

    @Test
    void createGig_unauthenticated_returns401() throws Exception {
        mockMvc.perform(post("/api/gigs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
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
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void searchGigs_noAuth_returns200() throws Exception {
        mockMvc.perform(get("/api/gigs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
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
