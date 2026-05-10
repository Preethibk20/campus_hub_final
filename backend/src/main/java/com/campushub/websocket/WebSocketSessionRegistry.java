package com.campushub.websocket;

import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Tracks which user IDs currently have an active STOMP session.
 * Updated by WebSocketEventListener.
 */
@Component
public class WebSocketSessionRegistry {

    private final Set<String> connectedUsers = Collections.newSetFromMap(new ConcurrentHashMap<>());

    public void register(String userId)   { connectedUsers.add(userId); }
    public void deregister(String userId) { connectedUsers.remove(userId); }
    public boolean isOnline(String userId){ return connectedUsers.contains(userId); }
}


