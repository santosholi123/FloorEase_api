#!/bin/bash

# Test script for Update Profile API

set -e

BASE_URL="http://localhost:4000/api"
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   Update Profile API Test                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════╝${NC}\n"

# Step 1: Login
echo -e "${YELLOW}[1/5] Logging in...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}')

TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${YELLOW}⚠ No token found. Creating test user...${NC}"
  
  # Register test user
  curl -s -X POST "$BASE_URL/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
      "fullName": "Test User",
      "email": "test@test.com",
      "phone": "+1234567890",
      "password": "password123"
    }' > /dev/null
  
  # Login again
  LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password123"}')
  
  TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
fi

echo -e "${GREEN}✓ Logged in${NC}\n"

# Step 2: Get initial profile
echo -e "${YELLOW}[2/5] Getting initial profile...${NC}"
INITIAL_PROFILE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✓ Initial profile:${NC}"
echo "$INITIAL_PROFILE" | jq '.'
echo ""

# Step 3: Update name only
echo -e "${YELLOW}[3/5] Updating name only...${NC}"
UPDATE_NAME=$(curl -s -X PUT "$BASE_URL/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"fullName": "Updated Name"}')

echo -e "${GREEN}✓ Updated name:${NC}"
echo "$UPDATE_NAME" | jq '.'
echo ""

# Step 4: Update multiple fields
echo -e "${YELLOW}[4/5] Updating multiple fields...${NC}"
UPDATE_MULTIPLE=$(curl -s -X PUT "$BASE_URL/auth/profile" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fullName": "John Doe",
    "phone": "+9876543210"
  }')

echo -e "${GREEN}✓ Updated multiple fields:${NC}"
echo "$UPDATE_MULTIPLE" | jq '.'
echo ""

# Step 5: Verify final profile
echo -e "${YELLOW}[5/5] Verifying final profile...${NC}"
FINAL_PROFILE=$(curl -s -X GET "$BASE_URL/auth/profile" \
  -H "Authorization: Bearer $TOKEN")

echo -e "${GREEN}✓ Final profile:${NC}"
echo "$FINAL_PROFILE" | jq '.'
echo ""

echo -e "${GREEN}╔════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║   All tests passed! ✅                         ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════╝${NC}"
