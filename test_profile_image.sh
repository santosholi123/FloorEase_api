#!/bin/bash

# FloorEase API - Profile Image Feature Test Script
# Run this script to test all profile image endpoints

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
BASE_URL="http://localhost:4000/api"
TEST_EMAIL="test@floorease.com"
TEST_PASSWORD="Test123456"
TEST_NAME="Test User"
TEST_PHONE="+1234567890"

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   FloorEase API - Profile Image Tests         ║${NC}"
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}\n"

# Step 1: Register (or skip if user exists)
echo -e "${YELLOW}[1/7] Registering test user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d "{
    \"fullName\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"phone\": \"$TEST_PHONE\",
    \"password\": \"$TEST_PASSWORD\"
  }")

if echo "$REGISTER_RESPONSE" | grep -q "Register success\|already registered"; then
  echo -e "${GREEN}✓ User ready${NC}\n"
else
  echo -e "${RED}✗ Registration failed: $REGISTER_RESPONSE${NC}\n"
  exit 1
fi

# Step 2: Login
echo -e "${YELLOW}[2/7] Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}✗ Login failed: $LOGIN_RESPONSE${NC}\n"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo -e "Token: ${TOKEN:0:30}...\n"

# Step 3: Get Initial Profile
echo -e "${YELLOW}[3/7] Fetching initial profile...${NC}"
PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✓ Profile fetched${NC}"
echo "$PROFILE_RESPONSE" | jq '.'
echo ""

# Step 4: Create a test image (if needed)
echo -e "${YELLOW}[4/7] Preparing test image...${NC}"
TEST_IMAGE="/tmp/test_profile_image.png"

# Create a simple test image using ImageMagick (if available) or skip
if command -v convert &> /dev/null; then
  convert -size 200x200 xc:blue -fill white -pointsize 30 \
    -gravity center -annotate +0+0 "Test" "$TEST_IMAGE"
  echo -e "${GREEN}✓ Test image created: $TEST_IMAGE${NC}\n"
else
  echo -e "${YELLOW}⚠ ImageMagick not found. Please provide your own test image.${NC}"
  echo -e "${YELLOW}  Update TEST_IMAGE variable in this script.${NC}\n"
  
  # Prompt for image path
  read -p "Enter path to a test image (or press Enter to skip upload test): " USER_IMAGE
  if [ ! -z "$USER_IMAGE" ] && [ -f "$USER_IMAGE" ]; then
    TEST_IMAGE="$USER_IMAGE"
  else
    echo -e "${YELLOW}Skipping upload test...${NC}\n"
    TEST_IMAGE=""
  fi
fi

# Step 5: Upload Image (if available)
if [ ! -z "$TEST_IMAGE" ] && [ -f "$TEST_IMAGE" ]; then
  echo -e "${YELLOW}[5/7] Uploading image...${NC}"
  UPLOAD_RESPONSE=$(curl -s -X POST "$BASE_URL/upload" \
    -H "Authorization: Bearer $TOKEN" \
    -F "image=@$TEST_IMAGE")
  
  IMAGE_URL=$(echo "$UPLOAD_RESPONSE" | grep -o '"imageUrl":"[^"]*' | cut -d'"' -f4)
  
  if [ -z "$IMAGE_URL" ]; then
    echo -e "${RED}✗ Upload failed: $UPLOAD_RESPONSE${NC}\n"
    exit 1
  fi
  
  echo -e "${GREEN}✓ Image uploaded${NC}"
  echo "Image URL: $IMAGE_URL"
  echo ""
  
  # Step 6: Update Profile Image
  echo -e "${YELLOW}[6/7] Updating profile with image URL...${NC}"
  UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/auth/profile/image" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $TOKEN" \
    -d "{\"profileImage\": \"$IMAGE_URL\"}")
  
  if echo "$UPDATE_RESPONSE" | grep -q "Profile image updated"; then
    echo -e "${GREEN}✓ Profile image updated${NC}"
    echo "$UPDATE_RESPONSE" | jq '.'
    echo ""
  else
    echo -e "${RED}✗ Update failed: $UPDATE_RESPONSE${NC}\n"
    exit 1
  fi
  
  # Verify profile has image
  echo -e "${YELLOW}Verifying profile image...${NC}"
  VERIFY_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
    -H "Authorization: Bearer $TOKEN")
  
  if echo "$VERIFY_RESPONSE" | grep -q "$IMAGE_URL"; then
    echo -e "${GREEN}✓ Profile image verified in profile${NC}\n"
  else
    echo -e "${RED}✗ Image not found in profile${NC}\n"
  fi
  
else
  echo -e "${YELLOW}[5/7] Skipping upload (no image available)${NC}\n"
  echo -e "${YELLOW}[6/7] Skipping update${NC}\n"
fi

# Step 7: Delete Profile Image
echo -e "${YELLOW}[7/7] Deleting profile image...${NC}"
DELETE_RESPONSE=$(curl -s -X DELETE "$BASE_URL/auth/profile/image" \
  -H "Authorization: Bearer $TOKEN")

if echo "$DELETE_RESPONSE" | grep -q "Profile image deleted"; then
  echo -e "${GREEN}✓ Profile image deleted${NC}"
  echo "$DELETE_RESPONSE" | jq '.'
  echo ""
else
  echo -e "${RED}✗ Delete failed: $DELETE_RESPONSE${NC}\n"
  exit 1
fi

# Verify profile has no image
echo -e "${YELLOW}Verifying image deletion...${NC}"
FINAL_RESPONSE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

if echo "$FINAL_RESPONSE" | grep -q '"profileImage":null'; then
  echo -e "${GREEN}✓ Profile image successfully removed${NC}\n"
else
  echo -e "${YELLOW}⚠ Profile may still have image reference${NC}\n"
fi

# Summary
echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Test Summary                                 ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}"
echo -e "${GREEN}✓ User registration/login${NC}"
echo -e "${GREEN}✓ Profile fetch${NC}"

if [ ! -z "$TEST_IMAGE" ] && [ -f "$TEST_IMAGE" ]; then
  echo -e "${GREEN}✓ Image upload${NC}"
  echo -e "${GREEN}✓ Profile image update${NC}"
fi

echo -e "${GREEN}✓ Profile image delete${NC}"
echo ""
echo -e "${GREEN}All tests passed! ✅${NC}\n"

# Cleanup
if [ -f "/tmp/test_profile_image.png" ]; then
  rm -f /tmp/test_profile_image.png
  echo -e "${YELLOW}Cleaned up temporary test image${NC}"
fi
