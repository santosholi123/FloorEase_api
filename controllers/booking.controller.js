const Booking = require("../models/booking.model");

// Validate Nepal phone format: "98XXXXXXXX" or "+97798XXXXXXXX"
const validateNepalPhone = (phone) => {
  const cleaned = phone.replace(/\s+/g, "");
  const localFormat = /^98\d{8}$/;
  const internationalFormat = /^\+97798\d{8}$/;
  return localFormat.test(cleaned) || internationalFormat.test(cleaned);
};

// @desc   Create new booking
// @route  POST /api/bookings
// @access Protected
exports.createBooking = async (req, res, next) => {
  try {
    const {
      fullName,
      phone,
      email,
      cityAddress,
      serviceType,
      flooringType,
      areaSize,
      preferredDate,
      preferredTime,
      notes,
    } = req.body;

    // Development logging
    if (process.env.NODE_ENV === "development") {
      console.log("BOOKING BODY:", req.body);
    }

    // Validation
    if (!fullName || !phone || !cityAddress || !preferredDate) {
      return res.status(400).json({
        message: "Missing required fields: fullName, phone, cityAddress, preferredDate",
      });
    }

    // Validate phone format
    if (!validateNepalPhone(phone)) {
      return res.status(400).json({
        message: "Invalid phone format. Use 98XXXXXXXX or +97798XXXXXXXX",
      });
    }

    // Validate areaSize
    if (!areaSize || isNaN(areaSize) || Number(areaSize) <= 0) {
      return res.status(400).json({
        message: "areaSize must be a number greater than 0",
      });
    }

    // Validate serviceType
    const validServiceTypes = ["Installation", "Repair", "Polish", "Inspection"];
    if (serviceType && !validServiceTypes.includes(serviceType)) {
      return res.status(400).json({
        message: `Invalid serviceType. Must be one of: ${validServiceTypes.join(", ")}`,
      });
    }

    // Validate flooringType
    const validFlooringTypes = ["Homogeneous", "Heterogeneous", "SPC", "Vinyl", "Carpet", "Wooden"];
    if (flooringType && !validFlooringTypes.includes(flooringType)) {
      return res.status(400).json({
        message: `Invalid flooringType. Must be one of: ${validFlooringTypes.join(", ")}`,
      });
    }

    // Validate preferredTime
    const validTimes = ["Morning 8-12", "Afternoon 12-4", "Evening 4-8"];
    if (preferredTime && !validTimes.includes(preferredTime)) {
      return res.status(400).json({
        message: `Invalid preferredTime. Must be one of: ${validTimes.join(", ")}`,
      });
    }

    // Create booking
    const booking = new Booking({
      user: req.user.id,
      fullName,
      phone,
      email: email || "",
      cityAddress,
      serviceType: serviceType || "Installation",
      flooringType: flooringType || "Homogeneous",
      areaSize: Number(areaSize),
      preferredDate,
      preferredTime: preferredTime || "Morning 8-12",
      notes: notes || "",
    });

    const savedBooking = await booking.save();

    res.status(201).json({
      message: "Booking created successfully",
      booking: savedBooking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all bookings for logged-in user
// @route  GET /api/bookings/my
// @access Protected
exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate("user", "name email");

    res.status(200).json({
      total: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Get all bookings (Admin only)
// @route  GET /api/bookings
// @access Admin Protected
exports.getAllBookings = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    // Build query
    const query = {};

    // Filter by status
    if (status && ["pending", "completed"].includes(status)) {
      query.status = status;
    }

    // Search by phone, email, or fullName
    if (search) {
      query.$or = [
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { fullName: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    const total = await Booking.countDocuments(query);

    const bookings = await Booking.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate("user", "name email phone");

    res.status(200).json({
      total,
      page: Number(page),
      limit: Number(limit),
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Update booking status (Admin only)
// @route  PATCH /api/bookings/:id/status
// @access Admin Protected
exports.updateBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    // Validate status
    if (!status || !["pending", "completed"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status. Must be 'pending' or 'completed'",
      });
    }

    // Find and update booking
    const booking = await Booking.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    ).populate("user", "name email phone");

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking status updated successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};

// @desc   Delete booking (Admin only)
// @route  DELETE /api/bookings/:id
// @access Admin Protected
exports.deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await Booking.findByIdAndDelete(id);

    if (!booking) {
      return res.status(404).json({
        message: "Booking not found",
      });
    }

    res.status(200).json({
      message: "Booking deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
