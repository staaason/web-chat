package com.course.webchat.config;

import lombok.NonNull;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.WebSocketHandler;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;
import org.springframework.web.socket.server.support.HttpSessionHandshakeInterceptor;

import java.util.Map;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    /*
    * This method we will use for setting websocket endpoint connection into WebSocket.
    * */


    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws-message")
                .setAllowedOriginPatterns("*")
                .addInterceptors(new HttpSessionHandshakeInterceptor() {
                    @Override
                    public boolean beforeHandshake(@NonNull ServerHttpRequest request, @NonNull
                    ServerHttpResponse response, @NonNull WebSocketHandler wsHandler,
                                                   @NonNull Map<String, Object> attributes) throws Exception {
                        attributes.remove("HTTP.SESSION.ID"); // Remove HTTP session attribute from handshake request
                        return super.beforeHandshake(request, response, wsHandler, attributes);
                    }
                })
                .withSockJS();
    }



    /*
    *  This Method we will use for setting application destination proxies websocket
    *  and enable simple broker for topic to subscribe in our project websocket
    * */
    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        config.enableSimpleBroker("/topic");
        config.setApplicationDestinationPrefixes("/app");
    }

}
