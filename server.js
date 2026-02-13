const express = require("express");
const cors = require("cors");
require("dotenv").config();

const connectDB = require("./config/db");
const authRoutes = require("./routes/auth.routes");
const uploadRoutes = require("./routes/upload.routes");
const bookingRoutes = require("./routes/booking.routes");

const app = express();

// middlewares
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));


// routes
app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/bookings", bookingRoutes);
// test route
app.get("/", (req, res) => {
  res.json({ message: "FloorEase API running ✅" });
});

const PORT = process.env.PORT || 4000;

// Function to print all registered routes
const printRoutes = () => {
  console.log("\n📍 Available Routes:");
  console.log("==================");
  console.log("POST   /api/auth/register");
  console.log("POST   /api/auth/login");
  console.log("GET    /api/auth/profile (🔒 Protected)");
  console.log("POST   /api/upload");
  console.log("POST   /api/bookings (🔒 Protected)");
  console.log("GET    /api/bookings/my (🔒 Protected)");
  console.log("GET    /api/bookings (🔒 Admin)");
  console.log("PATCH  /api/bookings/:id/status (🔒 Admin)");
  console.log("DELETE /api/bookings/:id (🔒 Admin)");
  console.log("GET    /");
  console.log("==================\n");
};

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
      printRoutes();
      console.log("💡 Frontend should call: GET /api/auth/profile");
      console.log("   With header: Authorization: Bearer <token>\n");
    });
  } catch (error) {
    console.error("Server failed to start ❌", error.message);
  }
};

startServer();
