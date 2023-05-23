package com.course.webchat.controller;


import com.course.webchat.exception.EmailExistsException;
import com.course.webchat.exception.EmailNotVerifiedException;
import com.course.webchat.utils.requests.AuthenticationRequest;
import com.course.webchat.utils.responses.AuthenticationResponse;
import com.course.webchat.service.AuthenticationService;
import com.course.webchat.utils.requests.RegisterRequest;
import com.course.webchat.service.VerificationTokenService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.session.SessionInformation;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.*;
import java.util.logging.Logger;


@CrossOrigin
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthenticationController {

    private static final Logger logger = Logger.getLogger(AuthenticationController.class.getName());
    private SessionRegistry sessionRegistry;
    private final AuthenticationService authenticationService;

    private VerificationTokenService verificationTokenService;

    @Autowired
    public AuthenticationController(SessionRegistry sessionRegistry, AuthenticationService authenticationService,
                                    VerificationTokenService verificationTokenService) {
        this.sessionRegistry = sessionRegistry;
        this.authenticationService = authenticationService;
        this.verificationTokenService = verificationTokenService;
    }

    @Operation(
            tags = {"User"},
            summary = "Register a new user",
            description = "Registers a new user with the provided registration request. If the registration is successful, " +
                    "an email with a verification token is sent to the user's email address. If the email already exists, " +
                    "a conflict status is returned with HTTP status 409 (Conflict). Otherwise, a success message is returned " +
                    "with HTTP status 200 (OK)."
    )
    @PostMapping("/register")
    public ResponseEntity<?> register(
        @RequestBody RegisterRequest request){
      try{
          verificationTokenService.createVerificationToken(request);
        }catch (EmailExistsException e) {
          return new ResponseEntity<>(e.getMessage(), HttpStatus.CONFLICT);
      }
        return ResponseEntity.ok("Email was sent");
    }

    @Operation(
            tags = {"User"},
            summary = "Authenticate a user",
            description = "Authenticates a user with the provided authentication request. If the authentication is successful, " +
                    "an authentication response containing the authentication token and user details is returned. If the " +
                    "username is not found, a not found status is returned with HTTP status 404 (Not Found). If the email is " +
                    "not verified, an unauthorized status is returned with HTTP status 401 (Unauthorized). Otherwise, a " +
                    "success response is returned with HTTP status 200 (OK)."
    )
    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody AuthenticationRequest request,
                                          HttpServletRequest httpServletRequest,
                                          HttpServletResponse httpServletResponse) {
        AuthenticationResponse auth;
        try {
            auth = authenticationService.authenticate(request, httpServletResponse);
            SessionInformation lastSession = authenticationService.getLastSessionInformation(sessionRegistry,
                    httpServletRequest, request.getEmail());
            if (lastSession != null) {
                logger.info("Session ID: " + lastSession.getSessionId() +
                        ", User: " + lastSession.getPrincipal() + ", Last accessed: " + lastSession.getLastRequest());
            }
        } catch (UsernameNotFoundException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.NOT_FOUND);
        } catch (EmailNotVerifiedException e) {
            return new ResponseEntity<>(e.getMessage(), HttpStatus.UNAUTHORIZED);
        }
        return ResponseEntity.ok(auth);
    }

    @Operation(
            tags = {"User"},
            summary = "Logout the user",
            description = "Logs out the currently authenticated user. It clears the cookies associated with the user's " +
                    "session and returns a success response with HTTP status 200 (OK)."
    )
    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        Cookie[] cookies = request.getCookies();
        authenticationService.clearCookies(response, cookies);
        logger.info("LOGOUT");
        return ResponseEntity.ok().build();
    }

    @Operation(
            tags = {"Authentication"},
            summary = "Refresh the access token",
            description = "Refreshes the access token for the currently authenticated user. It generates a new access token " +
                    "and returns it in the response body along with a success response with HTTP status 200 (OK)."
    )
    @PostMapping("/refresh-token")
    public ResponseEntity<?> refreshAccessToken(HttpServletRequest request, HttpServletResponse response) {
        String accessToken = authenticationService.refreshAccessToken(request, response);
        logger.info("ACCESS TOKEN: " + accessToken);
        return ResponseEntity.ok(AuthenticationResponse.builder().accessToken(accessToken).build());
    }

}
