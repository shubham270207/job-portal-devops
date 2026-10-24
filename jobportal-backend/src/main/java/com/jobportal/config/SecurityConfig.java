package com.jobportal.config;

import com.jobportal.auth.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter)
            throws Exception {

        http
                .csrf(csrf -> csrf.disable())

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()

                        // Admin-only: create and delete jobs
                        .requestMatchers(HttpMethod.POST, "/api/jobs").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/jobs/**").hasRole("ADMIN")

                        // Admin-only: update application status
                        .requestMatchers(HttpMethod.PUT, "/api/applications/*/status").hasRole("ADMIN")

                        // Admin-only: view all applications (GET /api/applications without path params)
                        .requestMatchers(HttpMethod.GET, "/api/applications").hasRole("ADMIN")

                        // Admin-only: user management
                        .requestMatchers("/api/users/**").hasRole("ADMIN")

                        // All authenticated users: view jobs, apply, view own applications
                        .requestMatchers(HttpMethod.GET, "/api/jobs/**").authenticated()
                        .requestMatchers(HttpMethod.POST, "/api/applications").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/applications/user/**").authenticated()
                        .requestMatchers(HttpMethod.GET, "/api/applications/job/**").authenticated()
                        .requestMatchers(HttpMethod.DELETE, "/api/applications/**").authenticated()

                        .anyRequest().authenticated()
                )

                .addFilterBefore(
                        jwtAuthenticationFilter,
                        UsernamePasswordAuthenticationFilter.class
                );

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOriginPatterns(
                List.of(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "http://13.60.232.53:*"
                )
        );

        configuration.setAllowedMethods(
                List.of("GET", "POST", "PUT", "DELETE", "OPTIONS")
        );

        configuration.setAllowedHeaders(
                List.of("*")
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
                new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration(
                "/**",
                configuration
        );

        return source;
    }
}