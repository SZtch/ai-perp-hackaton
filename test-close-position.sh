#!/bin/bash

echo "=========================================="
echo "🧪 TEST CLOSE POSITION ENDPOINT"
echo "=========================================="
echo ""

# 1. Login dan dapatkan token
echo "📝 Step 1: Login untuk mendapatkan token..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:4000/auth/ton-proof/verify \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0QDtFpEwcFAEcRe5mLVh2N6C0x-_hJEM7W61_JLnSF74p4q2",
    "proof": {
      "domain": {
        "value": "localhost"
      },
      "payload": "test_payload_123",
      "timestamp": '$(date +%s)',
      "signature": "dev_signature_test"
    }
  }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Gagal login! Response:"
  echo $LOGIN_RESPONSE | jq '.' 2>/dev/null || echo $LOGIN_RESPONSE
  exit 1
fi

echo "✅ Berhasil login!"
echo "Token: ${TOKEN:0:20}..."
echo ""

# 2. Cek apakah ada posisi yang terbuka
echo "📊 Step 2: Cek posisi yang terbuka..."
POSITIONS=$(curl -s -X GET http://localhost:4000/api/positions \
  -H "Authorization: Bearer $TOKEN")

echo $POSITIONS | jq '.' 2>/dev/null || echo $POSITIONS
echo ""

# Ambil ID posisi pertama (jika ada)
POSITION_ID=$(echo $POSITIONS | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$POSITION_ID" ]; then
  echo "⚠️  Tidak ada posisi terbuka!"
  echo "💡 Silakan buka posisi dulu dari frontend, lalu jalankan script ini lagi."
  exit 0
fi

echo "📌 Ditemukan posisi: $POSITION_ID"
echo ""

# 3. Test close position endpoint
echo "🔄 Step 3: Menutup posisi..."
CLOSE_RESPONSE=$(curl -s -X POST http://localhost:4000/api/positions/$POSITION_ID/close \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo $CLOSE_RESPONSE | jq '.' 2>/dev/null || echo $CLOSE_RESPONSE
echo ""

# 4. Cek hasil
if echo $CLOSE_RESPONSE | grep -q '"success":true'; then
  echo "✅ BERHASIL menutup posisi!"
  echo ""
  echo "📊 Step 4: Cek wallet balance..."
  WALLET=$(curl -s -X GET http://localhost:4000/api/wallet \
    -H "Authorization: Bearer $TOKEN")
  echo $WALLET | jq '.' 2>/dev/null || echo $WALLET
else
  echo "❌ GAGAL menutup posisi!"
  echo "Error: $(echo $CLOSE_RESPONSE | grep -o '"error":"[^"]*' | cut -d'"' -f4)"
fi

echo ""
echo "=========================================="
echo "🏁 Test selesai!"
echo "=========================================="
