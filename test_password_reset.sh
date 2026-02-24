#!/bin/bash
# Password Reset Feature - Quick Test Script
# Run this script to test the forgot password flow

BASE_URL="http://localhost:4000/api/auth"
TEST_EMAIL="testuser@example.com"

echo "🔐 FloorEase Password Reset - Testing Guide"
echo "==========================================="
echo ""

# Step 1: Request OTP
echo "📧 STEP 1: Request OTP"
echo "POST $BASE_URL/forgot-password"
echo ""
curl -X POST "$BASE_URL/forgot-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\"}" \
  -s | jq '.'
echo ""
echo "⏳ Check your email for OTP (valid for 10 minutes)"
echo "⏰ Wait 60 seconds before requesting a new OTP"
echo ""
echo "---"
echo ""

# Step 2: Verify OTP (replace with actual OTP from email)
read -p "Enter OTP from email: " OTP
echo ""
echo "✅ STEP 2: Verify OTP"
echo "POST $BASE_URL/verify-reset-otp"
echo ""
curl -X POST "$BASE_URL/verify-reset-otp" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"otp\":\"$OTP\"}" \
  -s | jq '.'
echo ""
echo "---"
echo ""

# Step 3: Reset Password
read -sp "Enter new password: " NEW_PASSWORD
echo ""
read -sp "Confirm new password: " CONFIRM_PASSWORD
echo ""
echo ""
echo "🔑 STEP 3: Reset Password"
echo "POST $BASE_URL/reset-password"
echo ""
curl -X POST "$BASE_URL/reset-password" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"newPassword\":\"$NEW_PASSWORD\",\"confirmPassword\":\"$CONFIRM_PASSWORD\"}" \
  -s | jq '.'
echo ""
echo "✅ Password reset complete!"
echo "🔑 Try logging in with your new password"
echo ""
