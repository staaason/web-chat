package com.course.webchat.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Service
public class JwtService {

    @Value("${ACCESS_TOKEN_SECRET_KEY}")
    private  String ACCESS_TOKEN_SECRET_KEY;
//    private  final long ACCESS_TOKEN_VALIDITY = 10000;
    private  final long ACCESS_TOKEN_VALIDITY = 86400000;
    @Value("${REFRESH_TOKEN_SECRET_KEY}")
    private   String REFRESH_TOKEN_SECRET_KEY;
//    private  final long REFRESH_TOKEN_VALIDITY = 15000;
    private  final long REFRESH_TOKEN_VALIDITY = 2592000000L;

    public String extractFromAccessTokenUsername(String token) {
        return extractClaim(token, Claims::getSubject, ACCESS_TOKEN_SECRET_KEY);
    }

    public String extractFromRefreshTokenUsername(String token) {
        return extractClaim(token, Claims::getSubject, REFRESH_TOKEN_SECRET_KEY);
    }



    public boolean isAccessTokenValid(String token, UserDetails userDetails){
        final String  username = extractFromAccessTokenUsername(token);
        return username.equals(userDetails.getUsername()) && !isAccessTokenExpired(token);
    }

    public boolean isRefreshTokenValid(String token, UserDetails userDetails){
        final String  username = extractFromRefreshTokenUsername(token);
        return username.equals(userDetails.getUsername()) && !isRefreshTokenExpired(token);
    }



    public boolean isAccessTokenExpired(String token) {
        return extractExpiration(token, ACCESS_TOKEN_SECRET_KEY).before(new Date());
    }

    private boolean isRefreshTokenExpired(String token) {
        return extractExpiration(token, REFRESH_TOKEN_SECRET_KEY).before(new Date());
    }

    private Date extractExpiration(String token, String secretKey) {
        return extractClaim(token, Claims::getExpiration, secretKey);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails,
                                String secretKey,  Long tokenValidity){
        Date now = new Date();
        Date expiration = new Date(now.getTime() + tokenValidity);
        return Jwts
                .builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(getSignInKey(secretKey), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateAccessToken(UserDetails userDetails){
        return generateToken(new HashMap<>(), userDetails, ACCESS_TOKEN_SECRET_KEY, ACCESS_TOKEN_VALIDITY);
    }

    public String generateRefreshToken(UserDetails userDetails){
        return generateToken(new HashMap<>(), userDetails, REFRESH_TOKEN_SECRET_KEY, REFRESH_TOKEN_VALIDITY);
    }


    private Claims extractAllClaims(String token, String secretKey){
        return Jwts
                .parserBuilder()
                .setSigningKey(getSignInKey(secretKey))
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver, String secretKey){
        final Claims claims = extractAllClaims(token, secretKey);
        return claimsResolver.apply(claims);
    }

    private Key getSignInKey(String secretKey) {
        byte[] keyBytes  = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }


    public long getRefreshTokenExpiration() {
        return REFRESH_TOKEN_VALIDITY;
    }
}
