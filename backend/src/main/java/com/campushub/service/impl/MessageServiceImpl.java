package com.campushub.service.impl;

import com.campushub.domain.*;
import com.campushub.dto.message.ConversationResponse;
import com.campushub.dto.message.MessageResponse;
import com.campushub.exception.ApiException;
import com.campushub.repository.*;
import com.campushub.service.MessageService;
import com.campushub.service.NotificationService;
import com.campushub.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;


@Service
public class MessageServiceImpl implements MessageService {

    private static final Logger log = LoggerFactory.getLogger(MessageServiceImpl.class);

    private final MessageRepository messageRepository;
    private final ConversationRepository conversationRepository;
    private final UserRepository userRepository;
    private final GigRepository gigRepository;
    private final StorageService storageService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    public MessageServiceImpl(
            MessageRepository messageRepository,
            ConversationRepository conversationRepository,
            UserRepository userRepository,
            GigRepository gigRepository,
            StorageService storageService,
            NotificationService notificationService,
            SimpMessagingTemplate messagingTemplate,
            RedisTemplate<String, Object> redisTemplate
    ) {
        this.messageRepository = messageRepository;
        this.conversationRepository = conversationRepository;
        this.userRepository = userRepository;
        this.gigRepository = gigRepository;
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.messagingTemplate = messagingTemplate;
        this.redisTemplate = redisTemplate;
    }

    @Override
    @Transactional
    public ConversationResponse createConversation(String gigId, String requesterId) {
        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> ApiException.notFound("Gig not found"));

        String posterId = (gig.getPostedBy());
        if (posterId.equals(requesterId)) {
            throw ApiException.badRequest("Cannot start a conversation with yourself");
        }

        Conversation conv = conversationRepository
                .findByGigAndParticipants(gigId, requesterId, posterId)
                .orElseGet(() -> {
                    User requester = findUser(requesterId);
                    User b = findUser(posterId);
                    return conversationRepository.save(Conversation.builder()
                            .gig(gig)
                            .participantA(requester)
                            .participantB(b)
                            .build());
                });

        return toConvResponse(conv, requesterId);
    }

    @Override
    @Transactional
    public ConversationResponse createConversation(String gigId, String otherUserId, String requesterId) {
        if (otherUserId.equals(requesterId)) {
            throw ApiException.badRequest("Cannot start a conversation with yourself");
        }

        Gig gig = gigRepository.findById(gigId)
                .orElseThrow(() -> ApiException.notFound("Gig not found"));

        Conversation conv = conversationRepository
                .findByGigAndParticipants(gigId, requesterId, otherUserId)
                .orElseGet(() -> {
                    User requester = findUser(requesterId);
                    User other = findUser(otherUserId);
                    return conversationRepository.save(Conversation.builder()
                            .gig(gig)
                            .participantA(requester)
                            .participantB(other)
                            .build());
                });

        return toConvResponse(conv, requesterId);
    }

    @Override
    @Transactional
    public ConversationResponse createDirectConversation(String otherUserId, String requesterId) {
        if (otherUserId.equals(requesterId)) {
            throw ApiException.badRequest("Cannot start a conversation with yourself");
        }

        Conversation conv = conversationRepository.findBetween(requesterId, otherUserId)
                .orElseGet(() -> {
                    User requester = findUser(requesterId);
                    User other = findUser(otherUserId);
                    return conversationRepository.save(Conversation.builder()
                            .participantA(requester)
                            .participantB(other)
                            .build());
                });

        return toConvResponse(conv, requesterId);
    }

    @Override
    public List<ConversationResponse> listConversations(String userId) {
        return conversationRepository
                .findByParticipantSortedByLatestMessage(userId)
                .stream()
                .map(c -> toConvResponse(c, userId))
                .toList();
    }

    @Override
    @Transactional
    public Page<MessageResponse> getMessages(String conversationId, String requesterId, Pageable pageable) {
        Conversation conv = findConv(conversationId);
        assertParticipant(conv, requesterId);
        messageRepository.markAllRead(conversationId, requesterId);
        return messageRepository
                .findByConversationIdOrderByCreatedAtAsc(conversationId, pageable)
                .map(this::toMsgResponse);
    }

    @Override
    @Transactional
    public MessageResponse sendMessage(String conversationId, String content, String senderId) {
        return handleChatSend(conversationId, content, Message.MessageType.text, senderId);
    }

    @Override
    @Transactional
    public MessageResponse sendFile(String conversationId, MultipartFile file, String senderId) {
        Conversation conv = findConv(conversationId);
        assertParticipant(conv, senderId);

        String url = storageService.upload(file, "chat");
        String ct  = file.getContentType() != null ? file.getContentType() : "";
        Message.MessageType type = ct.startsWith("image/")
                ? Message.MessageType.image : Message.MessageType.file;

        Message msg = Message.builder()
                .conversation(conv)
                .sender(findUser(senderId))
                .content(file.getOriginalFilename())
                .type(type)
                .fileUrl(url)
                .build();
        msg = messageRepository.save(msg);

        MessageResponse resp = toMsgResponse(msg);
        broadcastAndNotify(conv, senderId, resp);
        return resp;
    }

    @Override
    @Transactional
    public MessageResponse handleChatSend(String conversationId, String content,
                                           Message.MessageType type, String senderId) {
        Conversation conv = findConv(conversationId);
        assertParticipant(conv, senderId);

        Message msg = Message.builder()
                .conversation(conv)
                .sender(findUser(senderId))
                .content(content)
                .type(type != null ? type : Message.MessageType.text)
                .build();
        msg = messageRepository.save(msg);

        MessageResponse resp = toMsgResponse(msg);
        redisTemplate.convertAndSend("chat:" + conversationId, resp);

        broadcastAndNotify(conv, senderId, resp);
        return resp;
    }

    @Override
    @Transactional
    public int markRead(String conversationId, String userId) {
        return messageRepository.markAllRead(conversationId, userId);
    }

    @Override
    @Transactional
    public String getOrCreateConversation(String userAId, String userBId, String gigId) {
        return conversationRepository.findBetween(userAId, userBId)
                .map(Conversation::getId)
                .orElseGet(() -> {
                    User a = findUser(userAId);
                    User b = findUser(userBId);
                    Gig gig = gigId != null ? gigRepository.findById(gigId).orElse(null) : null;
                    return conversationRepository.save(Conversation.builder()
                            .participantA(a).participantB(b).gig(gig).build()).getId();
                });
    }

    private void broadcastAndNotify(Conversation conv, String senderId, MessageResponse resp) {
        String convId = conv.getId();
        messagingTemplate.convertAndSend("/topic/conversation." + convId, resp);
        String recipientId = conv.getParticipantA().getId().equals(senderId)
                ? conv.getParticipantB().getId()
                : conv.getParticipantA().getId();

        messagingTemplate.convertAndSendToUser(
                recipientId.toString(), "/queue/messages", resp);

        try {
            User sender = findUser(senderId);
            notificationService.sendNotification(
                    recipientId, "NEW_MESSAGE",
                    "New message from " + sender.getName(),
                    resp.content() != null
                            ? resp.content().substring(0, Math.min(80, resp.content().length()))
                            : "Sent a file",
                    Map.of("conversationId", convId.toString(),
                           "senderId", senderId.toString())
            );
        } catch (Exception e) {
            log.warn("Failed to send message notification: {}", e.getMessage());
        }
    }

    private Conversation findConv(String id) {
        return conversationRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("Conversation not found"));
    }

    private User findUser(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> ApiException.notFound("User not found"));
    }

    private void assertParticipant(Conversation conv, String userId) {
        if (!conv.getParticipantA().getId().equals(userId) &&
            !conv.getParticipantB().getId().equals(userId)) {
            throw ApiException.forbidden("Not a participant in this conversation");
        }
    }

    private ConversationResponse toConvResponse(Conversation c, String viewerId) {
        User other = c.getParticipantA().getId().equals(viewerId)
                ? c.getParticipantB() : c.getParticipantA();

        List<Message> latest = messageRepository
                .findLatestInConversation(c.getId(), PageRequest.of(0, 1));
        Message last = latest.isEmpty() ? null : latest.get(0);

        long unread = messageRepository.countUnreadForUser(c.getId(), viewerId);

        return new ConversationResponse(
                c.getId(),
                c.getGig() != null ? c.getGig().getId() : null,
                other.getId(),
                other.getName(),
                other.getProfilePicUrl(),
                last != null ? truncate(last.getContent(), 60) : null,
                last != null ? last.getCreatedAt() : null,
                unread,
                c.getCreatedAt()
        );
    }

    private MessageResponse toMsgResponse(Message m) {
        return new MessageResponse(
                m.getId(),
                m.getConversation().getId(),
                m.getSender().getId(),
                m.getSender().getName(),
                m.getContent(),
                m.getType(),
                m.getFileUrl(),
                m.isRead(),
                m.getCreatedAt()
        );
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max) + "…";
    }
}





