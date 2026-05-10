package com.campushub.domain;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.DBRef;

import java.time.Instant;


@Document(collection = "messages")
public class Message {

    public enum MessageType { text, file, image }

    @Id
    private String id;

    @DBRef
    private Conversation conversation;

    @DBRef
    private User sender;

    private String content;

    private MessageType type = MessageType.text;

    @Field("file_url")
    private String fileUrl;

    @Field("is_read")
    private boolean isRead = false;

    @Field("created_at")
    private Instant createdAt = Instant.now();

    public Message() {}

    public Message(String id, Conversation conversation, User sender, String content, MessageType type, String fileUrl, boolean isRead, Instant createdAt) {
        this.id = id;
        this.conversation = conversation;
        this.sender = sender;
        this.content = content;
        this.type = (type != null) ? type : MessageType.text;
        this.fileUrl = fileUrl;
        this.isRead = isRead;
        this.createdAt = createdAt;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public Conversation getConversation() { return conversation; }
    public void setConversation(Conversation conversation) { this.conversation = conversation; }
    public User getSender() { return sender; }
    public void setSender(User sender) { this.sender = sender; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public MessageType getType() { return type; }
    public void setType(MessageType type) { this.type = type; }
    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }
    public boolean isRead() { return isRead; }
    public void setRead(boolean isRead) { this.isRead = isRead; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public static MessageBuilder builder() { return new MessageBuilder(); }

    public static class MessageBuilder {
        private String id;
        private Conversation conversation;
        private User sender;
        private String content;
        private MessageType type = MessageType.text;
        private String fileUrl;
        private boolean isRead = false;
        private Instant createdAt;

        public MessageBuilder id(String id) { this.id = id; return this; }
        public MessageBuilder conversation(Conversation conversation) { this.conversation = conversation; return this; }
        public MessageBuilder sender(User sender) { this.sender = sender; return this; }
        public MessageBuilder content(String content) { this.content = content; return this; }
        public MessageBuilder type(MessageType type) { this.type = type; return this; }
        public MessageBuilder fileUrl(String fileUrl) { this.fileUrl = fileUrl; return this; }
        public MessageBuilder isRead(boolean isRead) { this.isRead = isRead; return this; }
        public MessageBuilder createdAt(Instant createdAt) { this.createdAt = createdAt; return this; }

        public Message build() {
            return new Message(id, conversation, sender, content, type, fileUrl, isRead, createdAt);
        }
    }
}



