package com.course.webchat.security;

import com.course.webchat.service.JwtService;
import com.course.webchat.utils.CurrentUser;
import com.course.webchat.entity.User;
import com.course.webchat.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.core.MethodParameter;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

@Component
public class CurrentUserHandlerMethodArgumentResolver implements HandlerMethodArgumentResolver {


    private final UserService userService;

    private final JwtService jwtService;


    public CurrentUserHandlerMethodArgumentResolver(UserService userService, JwtService jwtService) {
        this.userService = userService;
        this.jwtService = jwtService;
    }

    @Override
    public boolean supportsParameter(MethodParameter parameter) {
    return parameter.getParameterAnnotation(CurrentUser.class) != null &&
            parameter.getParameterType().equals(User.class);
    }

    @Override
    public Object resolveArgument(@NonNull MethodParameter parameter, ModelAndViewContainer mavContainer,
                                  NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
        final String jwt;
        final String userEmail;
        HttpServletRequest request = (HttpServletRequest) webRequest.getNativeRequest();
        String authHeader = request.getHeader("Authorization");
        if (authHeader == null) {
            return null;
        }
        jwt = authHeader.substring(7);

        // Decode the JWT token to extract the user information
        userEmail = jwtService.extractFromAccessTokenUsername(jwt);
        return userService.getUserByEmail(userEmail);
    }
}
