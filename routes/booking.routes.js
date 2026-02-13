const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth.middleware");
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  updateBookingStatus,
  deleteBooking,
} = require("../controllers/booking.controller");

// Admin middleware - checks if user has admin role
const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      message: "Access denied. Admin only.",
    });
  }
  next();
};

// User routes (Protected)
router.post("/", verifyToken, createBooking);
router.get("/my", verifyToken, getMyBookings);

// Admin routes (Protected + Admin only)
router.get("/", verifyToken, adminOnly, getAllBookings);
router.patch("/:id/status", verifyToken, adminOnly, updateBookingStatus);
router.delete("/:id", verifyToken, adminOnly, deleteBooking);

module.exports = router;
