package in.satyamtiwari.authify.services;
import in.satyamtiwari.authify.entity.UserEntity;
import in.satyamtiwari.authify.io.ProfileRequest;
import in.satyamtiwari.authify.io.ProfileResponse;
import in.satyamtiwari.authify.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;
import java.util.UUID;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileServices {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;

    @Override
    public ProfileResponse getProfile(String email){
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User Not Found" + email));
        return convertToProfileResponse(existingUser);
    }



    @Override
    public ProfileResponse createProfile(ProfileRequest request) {

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already exists");
        }

        UserEntity newProfile = convertToUserEntity(request);
        newProfile = userRepository.save(newProfile);
        return convertToProfileResponse(newProfile);
    }

    private ProfileResponse convertToProfileResponse(UserEntity newProfile) {
        return ProfileResponse.builder()
                .name(newProfile.getName())
                .email(newProfile.getEmail())
                .userId(newProfile.getUserId())
                .isAccVerified(newProfile.isVerified())
                .build();
    }

    private UserEntity convertToUserEntity(ProfileRequest request) {
        return UserEntity.builder()
                .email(request.getEmail())
                .userId(UUID.randomUUID().toString())
                .name(request.getName())
                .password(passwordEncoder.encode(request.getPassword())) // Note: We will need to hash this later!
                .isVerified(false)
                .resetOtp(null)
                .resetOtpExp(0L)
                .verifyOtp(null)
                .verifyOtpExp(0L)
                .build();
    }

    @Override
    public void sendResetOtp(String email) {
        UserEntity existingEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found:"+email));

        String otp =String.valueOf(ThreadLocalRandom.current().nextInt(100000,1000000));

        long expiryTime = System.currentTimeMillis()+(15*60*1000);
        existingEntity.setResetOtp(otp);
        existingEntity.setResetOtpExp(expiryTime);

        userRepository.save(existingEntity);
        try{
            emailService.sendResetOtp(existingEntity.getEmail(),otp);
        }catch (Exception e){
            throw new RuntimeException("Unable to send email");
        }
    }

    @Override
    public void resetPassword(String email, String otp, String newPassword) {
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + email));

        // 1. Check if OTP matches
        if (existingUser.getResetOtp() == null || !existingUser.getResetOtp().equals(otp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        // 2. Check Expiration
        if (existingUser.getResetOtpExp() < System.currentTimeMillis()) {
            throw new ResponseStatusException(HttpStatus.GONE, "OTP Expired");
        }

        existingUser.setPassword(passwordEncoder.encode(newPassword));
        existingUser.setResetOtp(null);
        existingUser.setResetOtpExp(0L);

        userRepository.save(existingUser);
    }

    @Override
    public void sendOtp(String email) {
        // 1. Fetch user
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // 2. Generate 6-digit OTP
        String otp = String.valueOf(ThreadLocalRandom.current().nextInt(100000, 1000000));

        // Set expiry (e.g., 5 minutes)
        long expiryTime = System.currentTimeMillis() + (24 * 60 * 60 * 1000);

        // 3. Update Entity
        existingUser.setVerifyOtp(otp);
        existingUser.setVerifyOtpExp(expiryTime);

        // 4. Save to Database FIRST
        // Doing this first ensures the OTP is in the DB even if the email fails
        userRepository.save(existingUser);

        // 5. Send Email
        try {
            emailService.sendOtpEmail(existingUser.getEmail(), otp);
            System.out.println("OTP sent successfully to: " + email);
        } catch (Exception e) {
            // Log the actual error to your IDE console
            e.printStackTrace();
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "Email failed: " + e.getMessage());
        }
    }

    @Override
    public void verifyOtp(String email, String otp) {
        UserEntity existingUser = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        // Check if an OTP was even generated first
        if (existingUser.getVerifyOtp() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No OTP has been requested for this email.");
        }

        if (!existingUser.getVerifyOtp().equals(otp)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid OTP");
        }

        if (existingUser.getVerifyOtpExp() < System.currentTimeMillis()) {
            throw new ResponseStatusException(HttpStatus.GONE, "OTP Expired");
        }
        existingUser.setVerified(true);
        existingUser.setVerifyOtp(null); // Clear it
        existingUser.setVerifyOtpExp(0L); // Reset expiry
        userRepository.save(existingUser);

    }


}