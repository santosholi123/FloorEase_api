const nodemailer = require("nodemailer");

// Initialize nodemailer transporter (Gmail SMTP)
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = process.env.SMTP_SECURE
  ? process.env.SMTP_SECURE === "true"
  : smtpPort === 465;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: smtpPort,
  secure: smtpSecure,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Function to send reset OTP email
exports.sendResetOtpEmail = async (toEmail, otp) => {
  try {
    const mailOptions = {
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: toEmail,
      subject: "Password Reset OTP - FloorEase",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f4f4f4;">
          <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h2 style="color: #333; margin-bottom: 20px; text-align: center;">Password Reset Request</h2>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              We received a request to reset your password. Use the OTP below to proceed with your password reset.
            </p>
            
            <div style="background-color: #f9f9f9; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0 0 10px 0;">Your One-Time Password (OTP):</p>
              <p style="color: #333; font-size: 28px; font-weight: bold; letter-spacing: 5px; margin: 0;">${otp}</p>
              <p style="color: #999; font-size: 12px; margin: 10px 0 0 0;">This OTP is valid for 10 minutes.</p>
            </div>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              <strong>Important:</strong> Never share this OTP with anyone. FloorEase staff will never ask for your OTP.
            </p>
            
            <p style="color: #666; font-size: 14px; line-height: 1.6;">
              If you didn't request a password reset, please ignore this email. Your password will remain unchanged.
            </p>
            
            <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
            
            <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
              &copy; ${new Date().getFullYear()} FloorEase. All rights reserved.
            </p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: "OTP sent successfully" };
  } catch (error) {
    console.error("EMAIL SENDING ERROR:", error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};
