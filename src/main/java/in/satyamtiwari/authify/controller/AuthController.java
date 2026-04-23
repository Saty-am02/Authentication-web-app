package in.satyamtiwari.authify.controller;
import in.satyamtiwari.authify.io.AuthRequest;
import in.satyamtiwari.authify.io.AuthResponse;
import in.satyamtiwari.authify.io.ResetPasswordRequest;
import in.satyamtiwari.authify.services.AppsUserDetailsService;
import in.satyamtiwari.authify.services.ProfileServices;
import in.satyamtiwari.authify.util.JwtUtil;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequiredArgsConstructor
public class AuthController {
    private final AuthenticationManager authenticationManager;
    private final AppsUserDetailsService appsUserDetailsService;
    private final JwtUtil jwtUtil;
    private final ProfileServices profileServices;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request){
        try{

            authenticate(request.getEmail(), request.getPassword());
            final UserDetails userDetails = appsUserDetailsService.loadUserByUsername(request.getEmail());
            final String jwtToken = jwtUtil.genrateToken(userDetails);
            ResponseCookie cookie = ResponseCookie.from("jwt",jwtToken)
                    .httpOnly(true)
                    .path("/")
                    .maxAge(Duration.ofDays(1))
                    .sameSite("Strict")
                    .build();
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString())
                    .body(new AuthResponse(request.getEmail(),jwtToken));

        } catch (BadCredentialsException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error",true);
            error.put("message","Email or Password is incorrect");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
        catch (DisabledException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error",true);
            error.put("message","Account is disabled");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }catch (Exception e) {
            // ADD THIS LINE to see the real error in your terminal!
            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();
            error.put("error", true);
            error.put("message", "Authentication is failed: " + e.getMessage()); // Optional: send the message to Postman
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }

    private void authenticate(String email, String password) {
    authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(email,password));
    }
    @GetMapping("/is-authenticated")
    public ResponseEntity<Boolean> isAuthenticated(@CurrentSecurityContext(expression = "authentication?.name") String email){
        return ResponseEntity.ok(email != null);
    }
    @PostMapping("/send-reset-otp")
    public void sendResetOtp(@RequestParam String email){
        try{
            profileServices.sendResetOtp(email);
        }catch (Exception e)
        {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,e.getMessage());
        }
    }

    @PostMapping("/reset-password")
    public void resetPassword(@Valid @RequestBody ResetPasswordRequest request)
    {
        try{
            profileServices.resetPassword(request.getEmail(),request.getOtp(),request.getNewPassword());
        }catch (Exception e)
        {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,e.getMessage());
        }
    }

    @PostMapping("/send-otp")
    public void sendVerifyOtp(@CurrentSecurityContext(expression = "authentication?.name")String email)
    {
        try{
            profileServices.sendOtp(email);
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,e.getMessage());
        }
    }
    @PostMapping("/verify-otp")
    public ResponseEntity<?> verifyEmail(
            @RequestBody Map<String, Object> request,
            @CurrentSecurityContext(expression = "authentication?.name") String email) {

        System.out.println("Verifying OTP for email: " + email);

        Object otpObj = request.get("otp");
        if (otpObj == null || otpObj.toString().trim().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "OTP is required");
        }

        try {
            profileServices.verifyOtp(email, otpObj.toString());

            // 🔥 RETURN UPDATED STATE
            return ResponseEntity.ok(Map.of(
                    "message", "Email verified",
                    "isAccVerified", true
            ));

        } catch (RuntimeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        } catch (Exception e) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected error occurred");
        }
    }
    @PostMapping("/logout")
    public ResponseEntity<?>logout(HttpServletResponse response){
    ResponseCookie cookie = ResponseCookie.from("jwt","")
            .httpOnly(true)
            .secure(false)
            .path("/")
            .maxAge(0)
            .sameSite("Strict")
            .build();
    return ResponseEntity.ok()
            .header(HttpHeaders.SET_COOKIE,cookie.toString())
            .body("Logged out Successfully");
    }

}

