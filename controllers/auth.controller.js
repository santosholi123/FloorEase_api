const User = require("../models/user.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const fs = require("fs");
const path = require("path");

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
  try {
    const userId = req.user.id;
    const { profileImage } = req.body;

    if (!profileImage) {
      return res.status(400).json({ message: "profileImage is required" });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { profileImage },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

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
    return res.status(500).json({ message: "Server error", error: error.message });
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
