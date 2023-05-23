package com.course.webchat.service;

import com.course.webchat.entity.User;
import com.course.webchat.exception.EmailNotVerifiedException;
import com.course.webchat.exception.InvalidTokenException;
import com.course.webchat.repository.UserRepository;
import com.course.webchat.utils.requests.AuthenticationRequest;
import com.course.webchat.utils.responses.AuthenticationResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.logging.Logger;


@Slf4j
@Service
@RequiredArgsConstructor
public class AuthenticationService implements UserDetailsService {
    private static final Logger logger = Logger.getLogger(AuthenticationService.class.getName());
    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException(String.format("User %s not found", email)));

        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .authorities(user.getAuthorities())
                .accountExpired(!user.isAccountNonExpired())
                .accountLocked(!user.isAccountNonLocked())
                .credentialsExpired(!user.isCredentialsNonExpired())
                .disabled(!user.isEnabled())
                .build();
    }

    public AuthenticationResponse authenticate(AuthenticationRequest request, HttpServletResponse httpServletResponse)  {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("Email not found"));
        if(!user.getEnabled()){
            throw new EmailNotVerifiedException("Email is not verified.");
        }
        var accessToken = jwtService.generateAccessToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setPath("/");
        httpServletResponse.addCookie(refreshTokenCookie);
        return AuthenticationResponse
                .builder()
                .accessToken(accessToken)
                .build();
    }


    public String refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String refreshToken = extractRefreshTokenFromCookie(request);
        if (refreshToken != null) {
            String username = jwtService.extractFromRefreshTokenUsername(refreshToken);
            UserDetails userDetails = loadUserByUsername(username);
            if (jwtService.isRefreshTokenValid(refreshToken, userDetails)) {
                String refreshTokenGenerated = jwtService.generateRefreshToken(userDetails);
                logger.info("NEW REFRESH TOKEN:" + refreshTokenGenerated);
                String accessToken = jwtService.generateAccessToken(userDetails);
                setRefreshTokenToCookie(refreshTokenGenerated, request, response);
                return accessToken;
            } else {
                throw new InvalidTokenException();
            }
        } else {
            throw new InvalidTokenException();
        }
    }

    private String extractRefreshTokenFromCookie(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if (cookie.getName().equals("refreshToken")) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void setRefreshTokenToCookie(String refreshToken, HttpServletRequest request,
                                         HttpServletResponse response) {
        Cookie refreshTokenCookie = new Cookie("refreshToken", refreshToken);
        long refreshTokenExpiration = jwtService.getRefreshTokenExpiration();
        refreshTokenCookie.setHttpOnly(true);
        refreshTokenCookie.setMaxAge((int) (refreshTokenExpiration / 1000));
        refreshTokenCookie.setPath("/");
        refreshTokenCookie.setSecure(request.isSecure());
        response.addCookie(refreshTokenCookie);
    }

    public void clearCookies(HttpServletResponse response, Cookie[] cookies){
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                cookie.setValue("");
                cookie.setMaxAge(0);
                cookie.setPath("/");
                cookie.setHttpOnly(true);
                response.addCookie(cookie);
            }
        }
    }


    public SessionInformation getLastSessionInformation(
            SessionRegistry sessionRegistry, HttpServletRequest httpServletRequest,
                                                        String userEmail) {

        UserDetails userDetails = loadUserByUsername(userEmail);
        sessionRegistry.registerNewSession(httpServletRequest.getSession().getId(), userDetails);
        SessionInformation lastSession = null;
        List<SessionInformation> sessions = sessionRegistry.getAllSessions(userDetails, false);
        for (SessionInformation session : sessions) {
            if (lastSession == null || session.getLastRequest().after(lastSession.getLastRequest())) {
                lastSession = session;
            }
        }

        return lastSession;
    }


}
