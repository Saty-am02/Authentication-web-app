package in.satyamtiwari.authify.services;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.nio.charset.StandardCharsets;

/**
 * Service to handle all email communications for Authify.
 * Configured to work with Brevo SMTP and Thymeleaf templates.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;

    // Direct mapping to the verified sender address required by Brevo
    @Value("${spring.mail.properties.mail.smtp.from}")
    private String fromEmail;

    // ✅ EMAIL VERIFICATION (With Name)
    public void sendOtpEmail(String toEmail, String otp, String name) {
        try {
            Context context = new Context();
            context.setVariable("otp", otp);
            context.setVariable("name", name);

            String htmlContent = templateEngine.process("verify-email", context);
            sendHtmlEmail(toEmail, "Verify Your Email - Authify", htmlContent);
        } catch (Exception e) {
            log.error("Failed to process verification email for {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email template processing failed", e);
        }
    }

    // ✅ EMAIL VERIFICATION (Fallback)
    public void sendOtpEmail(String toEmail, String otp) {
        sendOtpEmail(toEmail, otp, "User");
    }

    // ✅ RESET PASSWORD OTP
    public void sendResetOtp(String toEmail, String otp) {
        try {
            Context context = new Context();
            context.setVariable("otp", otp);

            // Ensure src/main/resources/templates/reset-password.html exists
            String htmlContent = templateEngine.process("pawssowrd-reset-mail", context);
            sendHtmlEmail(toEmail, "Reset Your Password - Authify", htmlContent);
        } catch (Exception e) {
            log.error("Failed to process reset email for {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email template processing failed", e);
        }
    }

    // ✅ WELCOME EMAIL
    public void sendWelcomeEmail(String toEmail, String name) {
        try {
            Context context = new Context();
            context.setVariable("name", name);

            String htmlContent = templateEngine.process("welcome-email", context);
            sendHtmlEmail(toEmail, "Welcome to Authify 🎉", htmlContent);
        } catch (Exception e) {
            log.error("Failed to process welcome email for {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("Email template processing failed", e);
        }
    }

    /**
     * Core method to send HTML emails.
     * Uses UTF-8 encoding to support emojis and special characters.
     */
    private void sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();

            // Setup Helper with UTF-8 and Multipart mode
            MimeMessageHelper helper = new MimeMessageHelper(
                    message,
                    MimeMessageHelper.MULTIPART_MODE_MIXED_RELATED,
                    StandardCharsets.UTF_8.name()
            );

            if (fromEmail == null || fromEmail.isEmpty()) {
                log.error("Configuration Error: spring.mail.properties.mail.smtp.from is empty!");
                throw new IllegalStateException("Sender email not configured.");
            }

            helper.setFrom(fromEmail);
            helper.setTo(toEmail);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // true indicates HTML content

            mailSender.send(message);
            log.info("Successfully sent '{}' email to {}", subject, toEmail);

        } catch (MessagingException e) {
            log.error("SMTP error (Check Brevo Credentials/Sender Verification) for {}: {}", toEmail, e.getMessage());
            throw new RuntimeException("SMTP delivery failed", e);
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", toEmail, e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Email delivery failed: " + e.getMessage());
        }
    }
}