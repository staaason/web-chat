package com.course.webchat.security;


import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.session.SessionRegistry;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.util.matcher.AntPathRequestMatcher;



@EnableWebSecurity
@Configuration
@RequiredArgsConstructor
public class WebSecurityConfig {
    private final JwtAuthenticationFilter jwtAuthFilter;
    private final AuthenticationProvider authenticationProvider;

    private final SessionRegistry sessionRegistry;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.cors().and()
                .csrf()
                .disable()
                .authorizeHttpRequests()
                .requestMatchers(
                        new AntPathRequestMatcher("/api/v1/auth/login", HttpMethod.GET.toString()),
                        new AntPathRequestMatcher("/api/v1/auth/login", HttpMethod.POST.toString()),
                        new AntPathRequestMatcher("/api/v1/auth/register", HttpMethod.GET.toString()),
                        new AntPathRequestMatcher("/api/v1/auth/register", HttpMethod.POST.toString()),
                        new AntPathRequestMatcher("/ws-message/**"),
                        new AntPathRequestMatcher("/api/v1/verify"),
                        new AntPathRequestMatcher("/api/v1/users/email-exists"),
                        new AntPathRequestMatcher("/api/v1/recover-password/**"),
                        new AntPathRequestMatcher("/api/v1/posts"),
                        new AntPathRequestMatcher("/web/logout"),
                        new AntPathRequestMatcher("/api/v1/auth/refresh-token", HttpMethod.POST.toString())
                )
                .permitAll()
                .anyRequest()
                .authenticated()
                .and()
//                .formLogin()  //start
//                .and()
//                .logout()
//                .logoutUrl("/web/logout")
//                .logoutSuccessUrl("/web/login")
//                .logoutRequestMatcher(new AntPathRequestMatcher("/web/logout", "POST"))
//                .invalidateHttpSession(true)
//                .deleteCookies("JSESSIONID")
//                .permitAll()
//                .and()   //end
                .sessionManagement()
                .maximumSessions(200)
                .sessionRegistry(sessionRegistry)
                .and()
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                .and()
                .authenticationProvider(authenticationProvider)
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }



}
