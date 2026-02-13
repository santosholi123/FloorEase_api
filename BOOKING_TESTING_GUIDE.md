# Booking Backend - Testing Guide 🧪

Your FloorEase API now has a complete Booking module! Server is running at http://localhost:4000

## 📍 Available Booking Endpoints

### 1️⃣ Create Booking (User - Protected)
```bash
POST http://localhost:4000/api/bookings
Headers: Authorization: Bearer <USER_TOKEN>
```

**Request Body:**
```json
{
  "fullName": "Ram Sharma",
  "phone": "9812345678",
  "email": "ram@example.com",
  "cityAddress": "Kathmandu, Thamel",
  "serviceType": "Installation",
  "flooringType": "Homogeneous",
  "areaSize": 250,
  "preferredDate": "2026-02-15",
  "preferredTime": "Morning 8-12",
  "notes": "Please call before arriving"
}
```

**Response:** `201 Created`
```json
{
  "message": "Booking created successfully",
  "booking": { ... }
}
```

---

### 2️⃣ Get My Bookings (User - Protected)
```bash
GET http://localhost:4000/api/bookings/my
Headers: Authorization: Bearer <USER_TOKEN>
```

**Response:** `200 OK`
```json
{
  "total": 5,
  "bookings": [...]
}
```

---

### 3️⃣ Get All Bookings (Admin Only)
```bash
GET http://localhost:4000/api/bookings?status=pending&search=ram&page=1&limit=10
Headers: Authorization: Bearer <ADMIN_TOKEN>
```

**Query Parameters:**
- `status` (optional): `pending` or `completed`
- `search` (optional): Search by phone/email/fullName
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

**Response:** `200 OK`
```json
{
  "total": 25,
  "page": 1,
  "limit": 10,
  "bookings": [...]
}
```

---

### 4️⃣ Update Booking Status (Admin Only)
```bash
PATCH http://localhost:4000/api/bookings/<BOOKING_ID>/status
Headers: Authorization: Bearer <ADMIN_TOKEN>
```

**Request Body:**
```json
{
  "status": "completed"
}
```

**Response:** `200 OK`
```json
{
  "message": "Booking status updated successfully",
  "booking": { ... }
}
```

---

### 5️⃣ Delete Booking (Admin Only)
```bash
DELETE http://localhost:4000/api/bookings/<BOOKING_ID>
Headers: Authorization: Bearer <ADMIN_TOKEN>
```

**Response:** `200 OK`
```json
{
  "message": "Booking deleted successfully"
}
```

---

## 🔐 Getting Tokens

### Register a User:
```bash
POST http://localhost:4000/api/auth/register
Content-Type: application/json

{
  "fullName": "Test User",
  "email": "user@test.com",
  "phone": "9812345678",
  "password": "password123"
}
```

### Login:
```bash
POST http://localhost:4000/api/auth/login
Content-Type: application/json

{
  "email": "user@test.com",
  "password": "password123"
}
```

Response will include a `token` field - use this as `Bearer <token>` in Authorization header.

---

## 🔧 Admin User Setup

To create an admin user, update a user's role directly in MongoDB:

```bash
# Connect to MongoDB
mongosh

# Use your database
use floorease

# Update user role to admin
db.users.updateOne(
  { email: "admin@test.com" },
  { $set: { role: "admin" } }
)
```

---

## ✅ Validation Rules

### Phone Format:
- ✅ `9812345678` (10 digits starting with 98)
- ✅ `+97798XXXXXXXX` (Nepal international format)

### Service Types:
- `Installation`, `Repair`, `Polish`, `Inspection`

### Flooring Types:
- `Homogeneous`, `Heterogeneous`, `SPC`, `Vinyl`, `Carpet`, `Wooden`

### Preferred Times:
- `Morning 8-12`, `Afternoon 12-4`, `Evening 4-8`

### Area Size:
- Must be a number > 0

### Status:
- `pending` (default), `completed`

---

## 🐛 Error Codes

- `400` - Bad Request (validation error)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (admin access required)
- `404` - Not Found
- `500` - Server Error

---

## 📱 Flutter Integration

Your Flutter app can now:
1. ✅ Create bookings with user auth token
2. ✅ Fetch user's own bookings
3. ✅ Admin can view/filter/search all bookings
4. ✅ Admin can update booking status
5. ✅ Admin can delete bookings

All endpoints are protected with JWT authentication and admin routes require `role: "admin"` in the user document.

---

**Server Status:** ✅ Running at http://localhost:4000
