package com.campushub.service;

import com.campushub.domain.College;
import com.campushub.domain.Gig;
import com.campushub.domain.Order;
import com.campushub.domain.User;
import com.campushub.dto.admin.*;
import com.campushub.exception.ApiException;
import com.campushub.repository.CollegeRepository;
import com.campushub.repository.ConversationRepository;
import com.campushub.repository.GigRepository;
import com.campushub.repository.MessageRepository;
import com.campushub.repository.OrderRepository;
import com.campushub.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.TimeUnit;

@Service
public class AdminService {

    private static final Logger log = LoggerFactory.getLogger(AdminService.class);

    private final UserRepository userRepository;
    private final GigRepository gigRepository;
    private final OrderRepository orderRepository;
    private final CollegeRepository collegeRepository;
    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final RedisTemplate<String, Object> redisTemplate;
    private final NotificationService notificationService;

    @org.springframework.beans.factory.annotation.Value("${brevo.api.key}")
    private String brevoApiKey;

    private final org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();

    public AdminService(
            UserRepository userRepository,
            GigRepository gigRepository,
            OrderRepository orderRepository,
            CollegeRepository collegeRepository,
            ConversationRepository conversationRepository,
            MessageRepository messageRepository,
            RedisTemplate<String, Object> redisTemplate,
            NotificationService notificationService
    ) {
        this.userRepository = userRepository;
        this.gigRepository = gigRepository;
        this.orderRepository = orderRepository;
        this.collegeRepository = collegeRepository;
        this.conversationRepository = conversationRepository;
        this.messageRepository = messageRepository;
        this.redisTemplate = redisTemplate;
        this.notificationService = notificationService;
    }

    // 1. USER MANAGEMENT
    public Page<AdminUserResponse> getUsers(String search, String role, Boolean isVerified, Pageable pageable) {
        return userRepository.findAdminFiltered(search, role, isVerified, pageable)
                .map(this::toAdminUserResponse);
    }

    @Transactional
    public AdminUserResponse banUser(String id, BanUserRequest req) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setBanned(req.banned());
        
        if (req.banned()) {
            redisTemplate.opsForValue().set("blacklist:user:" + user.getId(), true, 30, TimeUnit.DAYS);
            sendAdminEmail(user.getEmail(), "Account Banned", 
                    "Your account has been banned. Reason: " + req.reason());
        } else {
            redisTemplate.delete("blacklist:user:" + user.getId());
            sendAdminEmail(user.getEmail(), "Account Restored", 
                    "Your account ban has been lifted.");
        }
        
        return toAdminUserResponse(userRepository.save(user));
    }

    @Transactional
    public void verifyUser(String id) {
        User user = userRepository.findById(id).orElseThrow(() -> ApiException.notFound("User not found"));
        user.setVerified(true);
        userRepository.save(user);
        notificationService.send(user, "user_verified", "Account Verified", "Your account has been manually verified by admin.", Map.of());
    }

    // 2. GIG MODERATION
    public Page<AdminGigResponse> getGigs(String status, String category, Pageable pageable) {
        return gigRepository.findAdminFiltered(status, category, pageable).map(this::toAdminGigResponse);
    }

    @Transactional
    public void removeGig(String id) {
        Gig gig = gigRepository.findById(id).orElseThrow(() -> ApiException.notFound("Gig not found"));
        gig.setStatus(Gig.Status.CANCELLED);
        gigRepository.save(gig);
        
        User poster = userRepository.findById(gig.getPostedBy()).orElse(null);
        if (poster != null) {
            notificationService.send(poster, "gig_removed", "Gig Removed", "Your gig '" + gig.getTitle() + "' was removed by admin.", Map.of());
        }
    }

    // 3. TRANSACTIONS
    public Page<AdminTransactionResponse> getTransactions(String status, Instant from, Instant to, Pageable pageable) {
        return orderRepository.findAdminTransactions(status, from, to, pageable).map(this::toAdminTxResponse);
    }

    public String exportTransactionsCsv() {
        List<Order> orders = orderRepository.findAll();
        StringBuilder csv = new StringBuilder("OrderID,GigTitle,Buyer,Seller,Amount,Fee,Status,CreatedAt\n");
        for (Order o : orders) {
            csv.append(String.format("%s,\"%s\",\"%s\",\"%s\",%.2f,%.2f,%s,%s\n",
                    o.getId(),
                    o.getGig().getTitle().replace("\"", "\"\""),
                    o.getBuyer().getName().replace("\"", "\"\""),
                    o.getSeller().getName().replace("\"", "\"\""),
                    o.getAmount(),
                    o.getPlatformFee() != null ? o.getPlatformFee() : BigDecimal.ZERO,
                    o.getEscrowStatus(),
                    o.getCreatedAt()
            ));
        }
        return csv.toString();
    }

    // 4. DISPUTES
    public Page<AdminDisputeResponse> getDisputes(Pageable pageable) {
        return orderRepository.findDisputedOrders(pageable).map(this::toAdminDisputeResponse);
    }

    public AdminDisputeDetailResponse getDisputeDetail(String orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> ApiException.notFound("Order not found"));
        AdminDisputeResponse disputeInfo = toAdminDisputeResponse(order);

        List<com.campushub.dto.message.MessageResponse> messages =
                conversationRepository.findBetween(
                        order.getBuyer().getId(), order.getSeller().getId())
                .map(conv -> messageRepository
                        .findByConversationIdOrderByCreatedAtAsc(
                                conv.getId(), PageRequest.of(0, 100))
                        .stream()
                        .map(m -> new com.campushub.dto.message.MessageResponse(
                                m.getId(), m.getConversation().getId(),
                                m.getSender().getId(), m.getSender().getName(),
                                m.getContent(), m.getType(), m.getFileUrl(),
                                m.isRead(), m.getCreatedAt()))
                        .toList())
                .orElse(List.of());

        return new AdminDisputeDetailResponse(disputeInfo, messages);
    }

    @Transactional
    public void resolveDispute(String orderId, DisputeResolutionRequest res, String adminId) {
        Order order = orderRepository.findById(orderId).orElseThrow(() -> ApiException.notFound("Order not found"));
        if (order.getEscrowStatus() != Order.EscrowStatus.disputed) {
            throw ApiException.badRequest("Order is not disputed");
        }
        
        if ("refund".equalsIgnoreCase(res.resolution())) {
            order.setEscrowStatus(Order.EscrowStatus.refunded);
            sendAdminEmail(order.getBuyer().getEmail(), "Dispute Resolved", "Refund issued. Note: " + res.note());
            sendAdminEmail(order.getSeller().getEmail(), "Dispute Resolved", "Funds returned to buyer. Note: " + res.note());
        } else {
            order.setEscrowStatus(Order.EscrowStatus.released);
            order.setReleasedAt(Instant.now());
            sendAdminEmail(order.getBuyer().getEmail(), "Dispute Resolved", "Funds released to seller. Note: " + res.note());
            sendAdminEmail(order.getSeller().getEmail(), "Dispute Resolved", "Funds released to you. Note: " + res.note());
        }
        
        orderRepository.save(order);
        log.info("Admin {} resolved dispute on order {} with: {}", adminId, orderId, res.resolution());
    }

    // 5. ANALYTICS
    public AdminAnalyticsResponse getAnalytics() {
        String cacheKey = "admin:analytics";
        AdminAnalyticsResponse cached = (AdminAnalyticsResponse) redisTemplate.opsForValue().get(cacheKey);
        if (cached != null) return cached;

        long totalUsers = userRepository.count();
        long newUsersThisWeek = userRepository.countByCreatedAtAfter(Instant.now().minus(7, ChronoUnit.DAYS));
        
        long totalGigs = gigRepository.count();
        long activeGigs = gigRepository.countByStatus(Gig.Status.OPEN);

        long totalOrders = orderRepository.count();
        long completedOrders = orderRepository.countByEscrowStatus(Order.EscrowStatus.released);
        long disputedOrders = orderRepository.countByEscrowStatus(Order.EscrowStatus.disputed);

        BigDecimal totalRevenue = orderRepository.totalPlatformRevenue();
        if (totalRevenue == null) totalRevenue = BigDecimal.ZERO;
        
        Instant startOfMonth = Instant.now().truncatedTo(ChronoUnit.DAYS).minus(30, ChronoUnit.DAYS);
        BigDecimal revenueThisMonth = orderRepository.revenueThisMonth(startOfMonth);
        if (revenueThisMonth == null) revenueThisMonth = BigDecimal.ZERO;

        List<Map<String, Object>> topCategories = List.of();
        List<Map<String, Object>> dailyOrders = List.of();

        AdminAnalyticsResponse ans = new AdminAnalyticsResponse(
            totalUsers, newUsersThisWeek, totalGigs, activeGigs,
            totalOrders, completedOrders, disputedOrders,
            totalRevenue, revenueThisMonth, topCategories, dailyOrders
        );

        redisTemplate.opsForValue().set(cacheKey, ans, 5, TimeUnit.MINUTES);
        return ans;
    }

    // 6. COLLEGES
    @Transactional
    public CollegeDto addCollege(CollegeRequest req) {
        if (collegeRepository.findByEmailDomain(req.emailDomain()).isPresent()) {
            throw ApiException.badRequest("College domain already registered");
        }
        College c = College.builder()
                .name(req.name())
                .emailDomain(req.emailDomain())
                .isActive(true)
                .build();
        c = collegeRepository.save(c);
        return new CollegeDto(c.getId(), c.getName(), c.getEmailDomain());
    }

    public List<CollegeDto> getColleges() {
        return collegeRepository.findAll().stream()
                .map(c -> new CollegeDto(c.getId(), c.getName(), c.getEmailDomain()))
                .toList();
    }

    @Transactional
    public void removeCollege(String id) {
        collegeRepository.deleteById(id);
    }

    // -- Helpers --
    private AdminUserResponse toAdminUserResponse(User u) {
        return new AdminUserResponse(u.getId(), u.getName(), u.getEmail(), 
            u.getRole(), u.isVerified(), u.getCreatedAt(), 
            u.getReviewCount() == null ? 0 : u.getReviewCount(), 
            u.getAvgRating() == null ? BigDecimal.ZERO : u.getAvgRating(), 
            u.isBanned());
    }

    private AdminGigResponse toAdminGigResponse(Gig g) {
        String posterName = userRepository.findById(g.getPostedBy())
                .map(User::getName).orElse("Unknown");
        return new AdminGigResponse(g.getId(), g.getTitle(), posterName,
            g.getCategory().name(), g.getStatus().name(), g.getBudgetMin(), g.getBudgetMax(), g.getCreatedAt());
    }

    private AdminTransactionResponse toAdminTxResponse(Order o) {
        return new AdminTransactionResponse(o.getId(), o.getGig().getTitle(), o.getBuyer().getName(), o.getSeller().getName(),
            o.getAmount(), o.getPlatformFee(), o.getEscrowStatus().name(), o.getCreatedAt());
    }

    private AdminDisputeResponse toAdminDisputeResponse(Order o) {
        return new AdminDisputeResponse(o.getId(), o.getGig().getTitle(), o.getBuyer().getName(), o.getSeller().getName(),
            o.getAmount(), o.getEscrowStatus().name(), o.getCreatedAt(), o.getCreatedAt()
        );
    }

    private void sendAdminEmail(String toEmail, String subject, String content) {
        try {
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.setContentType(org.springframework.http.MediaType.APPLICATION_JSON);
            headers.set("api-key", brevoApiKey);

            String body = """
                    {
                      "sender": {"name": "Campus Hub Admin", "email": "noreply@campushub.in"},
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
            log.info("Admin email sent to {} via Brevo API", toEmail);
        } catch (Exception e) {
            log.error("Brevo admin email failed to {}: {}", toEmail, e.getMessage());
        }
    }
}



