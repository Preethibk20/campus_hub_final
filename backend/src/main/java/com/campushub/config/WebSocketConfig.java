package com.campushub.config;

import com.campushub.security.JwtUtil;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.*;
import org.springframework.web.socket.server.HandshakeInterceptor;

import java.security.Principal;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private static final Logger log = LoggerFactory.getLogger(WebSocketConfig.class);
    private final JwtUtil jwtUtil;

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic", "/queue");
        registry.setApplicationDestinationPrefixes("/app");
        registry.setUserDestinationPrefix("/user");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*")
                .addInterceptors(jwtHandshakeInterceptor())
                .withSockJS();
    }

    /**
     * Reads ?token=... from the HTTP upgrade request and sets the
     * WebSocket session attribute "userId" for use in STOMP CONNECT.
     */
    private HandshakeInterceptor jwtHandshakeInterceptor() {
        return new HandshakeInterceptor() {
            @Override
            public boolean beforeHandshake(ServerHttpRequest request,
                                           ServerHttpResponse response,
                                           WebSocketHandler wsHandler,
                                           Map<String, Object> attributes) {
                String query = request.getURI().getQuery();
                if (query != null) {
                    for (String param : query.split("&")) {
                        if (param.startsWith("token=")) {
                            String token = param.substring(6);
                            try {
                                Claims claims = jwtUtil.validateToken(token);
                                attributes.put("userId", claims.getSubject());
                                attributes.put("role",   claims.get("role", String.class));
                                attributes.put("token",  token);
                            } catch (JwtException e) {
                                log.debug("WS handshake rejected — invalid token");
                                return false;
                            }
                        } else if (param.startsWith("lastSeen=")) {
                            attributes.put("lastSeen", param.substring(9));
                        }
                    }
                }
                return true;
            }

            @Override
            public void afterHandshake(ServerHttpRequest req, ServerHttpResponse res,
                                       WebSocketHandler h, Exception ex) {}
        };
    }

    /**
     * Channel interceptor: on STOMP CONNECT, promote the session attribute
     * into a Spring Security Principal so @AuthenticationPrincipal works in
     * @MessageMapping methods.
     */
    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(new ChannelInterceptor() {
            @Override
            public Message<?> preSend(Message<?> message, MessageChannel channel) {
                StompHeaderAccessor accessor =
                        MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
                if (accessor == null) return message;

                if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                    // Try Authorization header first (native STOMP clients)
                    String authHeader = accessor.getFirstNativeHeader("Authorization");
                    String token = null;
                    if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        token = authHeader.substring(7);
                    } else {
                        // Fall back to session attribute set by handshake interceptor
                        Object t = accessor.getSessionAttributes() != null
                                ? accessor.getSessionAttributes().get("token") : null;
                        if (t != null) token = t.toString();
                    }

                    if (token != null) {
                        try {
                            Claims claims = jwtUtil.validateToken(token);
                            String userId = claims.getSubject();
                            String role   = claims.get("role", String.class);
                            Principal principal = new UsernamePasswordAuthenticationToken(
                                    userId, null,
                                    List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase())));
                            accessor.setUser(principal);
                        } catch (JwtException e) {
                            log.debug("STOMP CONNECT rejected — invalid token");
                        }
                    }
                }
                return message;
            }
        });
    }
}


