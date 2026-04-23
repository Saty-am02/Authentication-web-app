package in.satyamtiwari.authify.filter;

import in.satyamtiwari.authify.services.AppsUserDetailsService;
import in.satyamtiwari.authify.util.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
@RequiredArgsConstructor
public class JwtRequestFilter extends OncePerRequestFilter {
    
    private final AppsUserDetailsService appsUserDetailsService;
    private final JwtUtil jwtUtil;

    private static final List<String> PUBLIC_URL = List.of("/error","/login", "/register", "/send-reset-otp", "/reset-password", "/logout");

    // REMOVED: private final Filter filter; (This was causing injection issues)

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain) throws ServletException, IOException {
        String path = request.getServletPath();

        // 1. Skip filtering for public URLs
        if(PUBLIC_URL.contains(path)) {
            filterChain.doFilter(request, response);
            return; // FIXED: Added return to prevent double-execution
        }

        String jwt = null;
        String email = null;

        // 2. Try to get JWT from the Authorization header
        // FIXED: Corrected spelling to "Authorization"
        final String authorizationHeader = request.getHeader("Authorization");
        if(authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) { // Added space after Bearer
            jwt = authorizationHeader.substring(7);
        }

        // 3. Fallback: Try to get JWT from Cookies if header is missing
        if (jwt == null) {
            Cookie[] cookies = request.getCookies();
            if(cookies != null) {
                for(Cookie cookie : cookies) {
                    if ("jwt".equals(cookie.getName())) {
                        jwt = cookie.getValue();
                        break;
                    }
                }
            }
        }

        // 4. Validate token and set security context
        if (jwt != null) {
            email = jwtUtil.extractEmail(jwt);
            if(email != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = appsUserDetailsService.loadUserByUsername(email);

                if (jwtUtil.validateToken(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authenticationToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            }
        }

        // 5. Continue the filter chain for authenticated requests
        filterChain.doFilter(request, response);
    }
}