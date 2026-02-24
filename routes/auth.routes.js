const express = require("express");
const router = express.Router();

const { 
  register, 
  login, 
  getUserProfile,
  updateProfile,
  updateProfileImage,
  deleteProfileImage,
  forgotPassword,
  verifyResetOtp,
  resetPassword
} = require("../controllers/auth.controller");
const { verifyToken } = require("../middleware/auth.middleware");

router.post("/register", register);
router.post("/login", login);
router.get("/profile", verifyToken, getUserProfile);
router.put("/profile", verifyToken, updateProfile);
router.put("/profile/image", verifyToken, updateProfileImage);
router.delete("/profile/image", verifyToken, deleteProfileImage);

// Forgot Password Routes
router.post("/forgot-password", forgotPassword);
router.post("/verify-reset-otp", verifyResetOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
