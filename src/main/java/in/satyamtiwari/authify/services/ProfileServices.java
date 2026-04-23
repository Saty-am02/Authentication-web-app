package in.satyamtiwari.authify.services;

import in.satyamtiwari.authify.io.ProfileRequest;
import in.satyamtiwari.authify.io.ProfileResponse;

public interface ProfileServices {
    ProfileResponse createProfile(ProfileRequest request);

    ProfileResponse getProfile(String email);

    void sendResetOtp(String email);

    void resetPassword(String email, String otp, String newPassword);

    void sendOtp(String email);

    void verifyOtp(String email,String otp);
}
