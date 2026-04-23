package in.satyamtiwari.authify.controller;

import in.satyamtiwari.authify.io.ProfileRequest;
import in.satyamtiwari.authify.io.ProfileResponse;
import in.satyamtiwari.authify.services.EmailService;
import in.satyamtiwari.authify.services.ProfileServices;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.CurrentSecurityContext;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor()
public class ProfileController {
    private final ProfileServices profileServices;
    private final EmailService emailService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public ProfileResponse register(@Valid @RequestBody ProfileRequest request){
        ProfileResponse response;
        response = profileServices.createProfile(request);
        emailService.sendWelcomeEmail(response.getEmail(), response.getName());
        return response;
    }

    @GetMapping("/profile")
    public ProfileResponse profileResponse(@CurrentSecurityContext(expression = "authentication?.name") String email){
        return profileServices.getProfile(email);
    }


}
