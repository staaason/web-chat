package com.course.webchat.config;

import com.course.webchat.security.CurrentUserHandlerMethodArgumentResolver;
import com.course.webchat.service.JwtService;
import com.course.webchat.service.UserService;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

@Configuration
public class WebConfig implements WebMvcConfigurer {
    private final UserService userService;

    private final JwtService jwtService;

    public WebConfig(UserService userService,  JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @Override
    public void addArgumentResolvers(List<HandlerMethodArgumentResolver> argumentResolvers) {
        argumentResolvers.add(new CurrentUserHandlerMethodArgumentResolver(userService, jwtService));
    }
}
