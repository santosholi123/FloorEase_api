const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");
const { sendResetOtpEmail } = require("../utils/mailer");

// Register
exports.register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;
    
    console.log("REGISTER BODY:", req.body);

    // Validate required fields
    if (!fullName || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if email already exists
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: fullName,
      email: email.toLowerCase(),
      phone,
      password: hashedPassword,
    });

    return res.status(201).json({
      message: "Register success",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("REGISTER ERROR:", err);
    return res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    return res.status(200).json({
      message: "Login success",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Get User Profile
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      id: user._id,
      fullName: user.name,
      email: user.email,
      phone: user.phone || null,
      profileImage: user.profileImage || null,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Update Profile Image
exports.updateProfileImage = async (req, res) => {
  const isDev = process.env.NODE_ENV !== "production";

  try {
    console.log("UPDATE PROFILE IMAGE ROUTE HIT: /profile/image");
    console.log("UPDATE PROFILE IMAGE CONTENT-TYPE:", req.headers["content-type"]);
    console.log("UPDATE PROFILE IMAGE REQ.FILE EXISTS:", !!req.file);

    if (req.file) {
      console.log("UPDATE PROFILE IMAGE FILE originalname:", req.file.originalname);
      console.log("UPDATE PROFILE IMAGE FILE mimetype:", req.file.mimetype);
      console.log("UPDATE PROFILE IMAGE FILE size:", req.file.size);
      console.log("UPDATE PROFILE IMAGE FILE filename:", req.file.filename);
      console.log("UPDATE PROFILE IMAGE FILE path:", req.file.path);
    }

    console.log("UPDATE PROFILE IMAGE REQ.BODY KEYS:", Object.keys(req.body || {}));

    const userId = req.user.id;
    const { profileImage: profileImageFromBody } = req.body;

    let profileImage = profileImageFromBody;

    if (req.file) {
      profileImage = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    }

    if (!profileImage) {
      return res.status(400).json({ message: "profileImage is required" });
    }

    console.log("SAVED PROFILE IMAGE:", profileImage);

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("UPDATED PROFILE IMAGE IN DB:", user.profileImage);

    return res.status(200).json({
      message: "Profile image updated",
      user: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE IMAGE ERROR:", error);
    return res.status(500).json({
      message: "Server error",
      error: error.message,
      stack: isDev ? error.stack : undefined,
    });
  }
};

// Delete Profile Image
exports.deleteProfileImage = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Optional: Delete the file from disk if it exists in /uploads
    if (user.profileImage) {
      try {
        const urlPath = new URL(user.profileImage).pathname;
        if (urlPath.includes("/uploads/")) {
          const filename = path.basename(urlPath);
          const filePath = path.join(__dirname, "..", "uploads", filename);
          
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log("Deleted file:", filePath);
          }
        }
      } catch (err) {
        console.error("Error deleting file:", err);
        // Continue even if file deletion fails
      }
    }

    user.profileImage = null;
    await user.save();

    return res.status(200).json({
      message: "Profile image deleted",
      user: {
        id: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone,
        profileImage: user.profileImage,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, email, phone, password } = req.body;

    // Get current user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Build update object with only provided fields
    const updates = {};

    if (fullName !== undefined && fullName.trim() !== "") {
      updates.name = fullName.trim();
    }

    if (email !== undefined && email.trim() !== "") {
      const emailLower = email.toLowerCase().trim();
      
      // Check if email is being changed
      if (emailLower !== user.email) {
        // Check if another user already has this email
        const existingUser = await User.findOne({ email: emailLower });
        if (existingUser && existingUser._id.toString() !== userId) {
          return res.status(409).json({ message: "Email already in use" });
        }
        updates.email = emailLower;
      }
    }

    if (phone !== undefined && phone.trim() !== "") {
      updates.phone = phone.trim();
    }

    // If password is provided, hash it
    if (password !== undefined && password.trim() !== "") {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No valid fields to update" });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-password");

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        fullName: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        profileImage: updatedUser.profileImage,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("UPDATE PROFILE ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Forgot Password - Request OTP
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email || email.trim() === "") {
      return res.status(400).json({ message: "Email is required" });
    }

    const emailLower = email.toLowerCase().trim();

    // Check if user exists
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      // Don't reveal whether email exists (security best practice)
      return res.status(200).json({ message: "If email exists, OTP has been sent" });
    }

    // Check rate limiting (allow resend only after 60 seconds)
    if (user.resetOtpLastSentAt) {
      const timeSinceLastSent = Date.now() - new Date(user.resetOtpLastSentAt).getTime();
      if (timeSinceLastSent < 60000) {
        // 60 seconds in milliseconds
        const waitTime = Math.ceil((60000 - timeSinceLastSent) / 1000);
        return res.status(429).json({
          message: `Please wait ${waitTime} seconds before requesting a new OTP`,
        });
      }
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("FORGOT PASSWORD OTP GENERATED FOR:", emailLower, "OTP:", otp);

    // Hash OTP and store in DB
    const hashedOtp = await bcrypt.hash(otp, 10);

    // Update user with OTP details
    user.resetOtpHash = hashedOtp;
    user.resetOtpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    user.resetOtpVerified = false;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = new Date();

    await user.save();

    // Send OTP via email
    try {
      await sendResetOtpEmail(emailLower, otp);
    } catch (emailError) {
      console.error("FORGOT PASSWORD EMAIL ERROR:", emailError);
      return res.status(500).json({
        message: "Failed to send OTP email",
        error: emailError.message,
      });
    }

    return res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Verify Reset OTP
exports.verifyResetOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({ message: "Email and OTP are required" });
    }

    const emailLower = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or OTP" });
    }

    // Check if OTP is expired
    if (!user.resetOtpExpires || new Date() > new Date(user.resetOtpExpires)) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one" });
    }

    // Check attempt limit
    if (user.resetOtpAttempts >= 5) {
      return res.status(429).json({
        message: "Too many attempts. Please request a new OTP",
      });
    }

    // Verify OTP
    const isOtpValid = await bcrypt.compare(otp, user.resetOtpHash);
    if (!isOtpValid) {
      // Increment attempts
      user.resetOtpAttempts += 1;
      await user.save();
      return res.status(400).json({
        message: "Invalid OTP",
        attemptsRemaining: 5 - user.resetOtpAttempts,
      });
    }

    // OTP is valid, set resetOtpVerified to true
    user.resetOtpVerified = true;
    await user.save();

    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("VERIFY RESET OTP ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!email || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "Email, password, and confirm password are required" });
    }

    // Check passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    // Check password strength (minimum 6 characters)
    if (newPassword.trim().length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const emailLower = email.toLowerCase().trim();

    // Find user
    const user = await User.findOne({ email: emailLower });
    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    // Check if OTP is verified
    if (!user.resetOtpVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    // Check if OTP is still within expiry time
    if (!user.resetOtpExpires || new Date() > new Date(user.resetOtpExpires)) {
      return res.status(400).json({ message: "OTP has expired. Please request a new one" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password and clear reset fields
    user.password = hashedPassword;
    user.resetOtpHash = null;
    user.resetOtpExpires = null;
    user.resetOtpVerified = false;
    user.resetOtpAttempts = 0;
    user.resetOtpLastSentAt = null;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully. Please login with your new password" });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};
