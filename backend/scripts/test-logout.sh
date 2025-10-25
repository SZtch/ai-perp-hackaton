#!/bin/bash

# Test script for authentication and logout
# Usage: ./scripts/test-logout.sh

BASE_URL="http://localhost:4000"

echo "======================================"
echo "🧪 Testing Logout Feature"
echo "======================================"
echo ""

# Step 1: Get nonce/payload
echo "📡 Step 1: Getting nonce..."
PAYLOAD_RESPONSE=$(curl -s $BASE_URL/auth/ton-proof/payload)
PAYLOAD=$(echo $PAYLOAD_RESPONSE | grep -o '"payload":"[^"]*"' | cut -d'"' -f4)

echo "✅ Got payload: $PAYLOAD"
echo ""

# Step 2: Verify with test TON proof (dev mode accepts any signature)
echo "📡 Step 2: Logging in with TON proof..."
TEST_ADDRESS="UQtest_user_$(date +%s)"

LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/ton-proof/verify \
  -H "Content-Type: application/json" \
  -d "{
    \"address\": \"$TEST_ADDRESS\",
    \"proof\": {
      \"payload\": \"$PAYLOAD\",
      \"timestamp\": $(date +%s),
      \"signature\": \"test_signature_base64_encoded_string\"
    }
  }")

# Extract token from response
TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Login failed!"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Login successful!"
echo "Token: ${TOKEN:0:50}..."
echo ""

# Step 3: Test authenticated endpoint
echo "📡 Step 3: Testing authenticated endpoint..."
WALLET_RESPONSE=$(curl -s $BASE_URL/api/wallet \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Wallet response:"
echo "$WALLET_RESPONSE" | jq '.' 2>/dev/null || echo "$WALLET_RESPONSE"
echo ""

# Step 4: Logout
echo "📡 Step 4: Logging out..."
LOGOUT_RESPONSE=$(curl -s -X POST $BASE_URL/auth/logout \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "✅ Logout response:"
echo "$LOGOUT_RESPONSE" | jq '.' 2>/dev/null || echo "$LOGOUT_RESPONSE"
echo ""

# Step 5: Try to use token again (should fail)
echo "📡 Step 5: Testing revoked token..."
REVOKED_RESPONSE=$(curl -s $BASE_URL/api/wallet \
  -H "Authorization: Bearer $TOKEN")

echo "✅ Response with revoked token:"
echo "$REVOKED_RESPONSE" | jq '.' 2>/dev/null || echo "$REVOKED_RESPONSE"
echo ""

# Check if token was properly revoked
if echo "$REVOKED_RESPONSE" | grep -q "token revoked"; then
  echo "======================================"
  echo "✅ LOGOUT TEST PASSED!"
  echo "======================================"
else
  echo "======================================"
  echo "❌ LOGOUT TEST FAILED!"
  echo "Token should be revoked but still works"
  echo "======================================"
fi
