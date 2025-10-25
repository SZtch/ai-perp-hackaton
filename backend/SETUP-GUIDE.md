# 🚀 SuperAI Perp Backend - Complete Setup Guide

## ✅ **STRUKTUR BACKEND SUDAH SELESAI!**

Saya sudah membangun complete backend structure untuk SuperAI Perp dengan semua fitur yang kita diskusikan:

---

## 📦 **What's Been Built**

### **1. Database Schema** (Prisma)
✅ **Wallet** - Balance & margin tracking
✅ **Transaction** - Complete audit trail
✅ **Position** - With leverage & liquidation
✅ **Order** - With leverage support
✅ **TradingPair** - Config per trading pair
✅ **OracleTick** - Price feed data
✅ **User** - TON wallet authentication

### **2. Services**
✅ **TON Testnet Service** - Blockchain integration
  - Monitor deposits
  - Send withdrawals
  - Verify transactions

✅ **Position Calculator** - Trading math
  - Unrealized PnL calculation
  - Liquidation price
  - ROE (Return on Equity)
  - Margin ratio

✅ **Price Feed Service** - Live prices
  - Multi-source (CoinGecko, OKX, Binance)
  - Auto-fallback
  - 2-second updates

### **3. API Endpoints**
✅ **Authentication**
  - `GET /auth/ton-proof/payload`
  - `POST /auth/ton-proof/verify`

✅ **Wallet Management** 🆕
  - `GET /api/wallet`
  - `POST /api/wallet/deposit`
  - `POST /api/wallet/deposit/confirm`
  - `POST /api/wallet/withdraw`
  - `GET /api/wallet/transactions`

✅ **Portfolio** 🆕
  - `GET /api/portfolio` (complete overview)
  - `GET /api/portfolio/stats` (quick stats)

✅ **Trading** 🆕
  - `POST /api/orders` (with leverage 1x-20x)
  - `GET /api/orders`
  - `DELETE /api/orders/:id`

✅ **Positions**
  - `GET /api/positions`

✅ **Price Oracle**
  - `GET /api/oracle/latest/:symbol`

---

## 🎯 **Features Implemented**

### **Core Trading Features:**
✅ Wallet dengan deposit/withdraw
✅ Margin trading dengan leverage 1x-20x
✅ Position tracking dengan real-time PnL
✅ Liquidation price calculation
✅ Trading fees (taker/maker)
✅ Multi-symbol support (TON, BTC, ETH)

### **Risk Management:**
✅ Margin calculation
✅ Liquidation price tracking
✅ Balance checks
✅ Max leverage limits

### **Data & Analytics:**
✅ Portfolio overview
✅ Transaction history
✅ Realized & unrealized PnL
✅ Win rate calculation
✅ ROE tracking

---

## 🏁 **QUICK START (5 Minutes)**

### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

### **Step 2: Setup Database**
```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev
```
*Tekan Enter kalau diminta nama migration*

### **Step 3: Check Environment Variables**
File `.env` sudah ada dengan default values. Anda bisa langsung pakai untuk testing!

Key variables:
```env
DATABASE_URL="file:./prisma/dev.db"  # ✅ Ready
PORT=4000                              # ✅ Ready
JWT_SECRET="dev_secret_key"           # ✅ Ready
FEED_SYMBOLS="TONUSDT,BTCUSDT,ETHUSDT" # ✅ Ready
```

### **Step 4: Start Server**
```bash
npm run dev
```

**Expected output:**
```
===========================================
🚀 SuperAI Perp Backend
📡 Server running on port 4000
🌐 Network: testnet
💰 Symbols: TONUSDT,BTCUSDT,ETHUSDT
===========================================
[price-feed] REST multi symbols: TONUSDT,BTCUSDT,ETHUSDT
```

✅ **Backend is RUNNING!**

---

## 🧪 **TESTING dengan Postman/Thunder Client**

### **Install Thunder Client (Recommended)**
1. Open VS Code
2. Extensions → Search "Thunder Client"
3. Install
4. Click Thunder Client icon di sidebar

---

### **Test 1: Health Check** ✅
```
GET http://localhost:4000/health
```

**Expected Response:**
```json
{
  "ok": true,
  "timestamp": "2025-10-25T...",
  "network": "testnet"
}
```

---

### **Test 2: Get Nonce for Auth** ✅
```
GET http://localhost:4000/auth/ton-proof/payload
```

**Expected Response:**
```json
{
  "payload": "some_random_base64_string",
  "ttlSec": 300
}
```

---

### **Test 3: Authenticate (Simplified for Testing)** ✅

**Note:** Untuk testing, kita bisa skip TON proof verification. Saya akan buatkan endpoint dev login:

**Manual way (buat user di DB dulu):**
```bash
# Open Prisma Studio
npx prisma studio

# Buka browser: http://localhost:5555
# Go to User table
# Click "Add record"
# Set tonAddress: "UQtest123" (anything)
# Save
```

Then verify (with any payload):
```
POST http://localhost:4000/auth/ton-proof/verify

Body (JSON):
{
  "address": "UQtest123",
  "proof": {
    "payload": "paste_payload_from_step2",
    "timestamp": 1234567890,
    "signature": "test_signature"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "token": "eyJhbGc...",  ← COPY THIS TOKEN!
  "user": {
    "id": "...",
    "address": "UQtest123"
  }
}
```

**IMPORTANT:** Copy the `token` value!

---

### **Test 4: Setup Authorization Header** ✅

Di Thunder Client:
1. Click "Headers" tab
2. Add new header:
   - Key: `Authorization`
   - Value: `Bearer eyJhbGc...` (paste your token)

**Atau di Postman:**
- Go to "Authorization" tab
- Type: "Bearer Token"
- Paste token

---

### **Test 5: Get Wallet** ✅
```
GET http://localhost:4000/api/wallet
Headers: Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "balance": 0,
  "locked": 0,
  "available": 0,
  "equity": 0,
  "unrealizedPnl": 0,
  "totalDeposit": 0,
  "totalWithdraw": 0,
  "depositAddress": "PLATFORM_WALLET_NOT_CONFIGURED"
}
```

---

### **Test 6: Deposit (Manual Confirmation)** ✅
```
POST http://localhost:4000/api/wallet/deposit/confirm
Headers: Authorization: Bearer <your_token>

Body (JSON):
{
  "txHash": "test_deposit_001",
  "amount": 10000
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 10000,
  "amount": 10000,
  "txHash": "test_deposit_001"
}
```

---

### **Test 7: Check Wallet Again** ✅
```
GET http://localhost:4000/api/wallet
```

**Response:**
```json
{
  "balance": 10000,  ← Updated!
  "locked": 0,
  "available": 10000,
  "equity": 10000,
  ...
}
```

---

### **Test 8: Place Order (Open Position)** ✅
```
POST http://localhost:4000/api/orders
Headers: Authorization: Bearer <your_token>

Body (JSON):
{
  "symbol": "TONUSDT",
  "side": "BUY",
  "type": "MARKET",
  "size": 1000,
  "leverage": 10
}
```

**Response:**
```json
{
  "id": "...",
  "symbol": "TONUSDT",
  "side": "BUY",
  "type": "MARKET",
  "size": 1000,
  "leverage": 10,
  "status": "filled",
  "fillPrice": 2.55,  ← Current market price
  "fee": 1,
  "filledAt": "..."
}
```

---

### **Test 9: Check Portfolio** ✅
```
GET http://localhost:4000/api/portfolio
Headers: Authorization: Bearer <your_token>
```

**Response:**
```json
{
  "wallet": {
    "balance": 9899,     ← Reduced by margin + fee
    "locked": 100,       ← Margin locked (1000/10)
    "available": 9799,
    "equity": 9905,      ← balance + unrealizedPnl
    "unrealizedPnl": 6   ← Current PnL
  },
  "positions": [
    {
      "id": "...",
      "symbol": "TONUSDT",
      "side": "LONG",
      "size": 1000,
      "leverage": 10,
      "entryPrice": 2.55,
      "markPrice": 2.565,  ← Current price (updating every 2s)
      "margin": 100,
      "liquidationPrice": 2.295,
      "unrealizedPnl": 5.88,
      "roe": 5.88,         ← 5.88% return on margin
      "marginRatio": 10.59,
      "openedAt": "..."
    }
  ],
  "stats": {
    "totalPnl": 5.88,
    "realizedPnl": 0,
    "unrealizedPnl": 5.88,
    "todayPnl": 5.88,
    "totalTrades": 1,
    "winRate": 0,
    "totalFees": 1,
    "openPositions": 1
  }
}
```

---

### **Test 10: Check Positions** ✅
```
GET http://localhost:4000/api/positions
Headers: Authorization: Bearer <your_token>
```

---

### **Test 11: Close Position (Sell)** ✅
```
POST http://localhost:4000/api/orders

Body:
{
  "symbol": "TONUSDT",
  "side": "SELL",
  "type": "MARKET",
  "size": 1000,
  "leverage": 1
}
```

This will close your LONG position and realize the PnL!

---

## 📊 **Monitor Real-time Price Updates**

Price feeds update setiap 2 detik. Anda bisa lihat di console:

```bash
# Di terminal tempat server running
# Akan muncul log seperti:
[price-feed] tick TONUSDT 2.55
[price-feed] tick BTCUSDT 67890.5
[price-feed] tick ETHUSDT 3456.7
```

---

## 🔍 **View Database (Prisma Studio)**

```bash
# Buka tab terminal baru
npx prisma studio
```

Akan buka browser di `http://localhost:5555`

Di sini Anda bisa:
- ✅ Lihat semua data di database
- ✅ Edit data manual
- ✅ Add test users
- ✅ Check positions, transactions, dll

---

## 🎯 **Testing Scenarios**

### **Scenario 1: Full Trading Flow**
1. ✅ Deposit 10000 USDT
2. ✅ Buy TONUSDT 1000 size @ 10x leverage
3. ✅ Wait for price to change (monitor /api/portfolio)
4. ✅ See unrealized PnL update
5. ✅ Sell to close position
6. ✅ Check realized PnL in transactions

### **Scenario 2: Multiple Positions**
1. ✅ Open LONG TONUSDT
2. ✅ Open LONG BTCUSDT
3. ✅ Open SHORT ETHUSDT
4. ✅ Check /api/portfolio (see all 3)
5. ✅ Close one by one

### **Scenario 3: Insufficient Balance**
1. ✅ Try to open huge position
2. ✅ Should get error: "Insufficient balance"

---

## 📁 **Project Structure**

```
backend/
├── ✅ prisma/schema.prisma (UPDATED)
├── ✅ .env (READY)
├── ✅ .env.example (TEMPLATE)
├── ✅ src/
│   ├── ✅ index.ts (UPDATED)
│   ├── ✅ services/
│   │   ├── ✅ ton-testnet-service.ts (NEW)
│   │   ├── ✅ position-calculator.ts (NEW)
│   │   └── ✅ priceFeed.ts (EXISTS)
│   └── ✅ routes/
│       ├── ✅ wallet.ts (NEW)
│       ├── ✅ portfolio.ts (NEW)
│       ├── ✅ orders-new.ts (NEW)
│       └── ... (existing routes)
├── ✅ README.md (COMPLETE GUIDE)
├── ✅ STRUCTURE.md (ARCHITECTURE DOC)
└── ✅ SETUP-GUIDE.md (THIS FILE)
```

---

## 🐛 **Troubleshooting**

### **Error: "Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

### **Error: "Port 4000 already in use"**
```bash
# Change in .env
PORT=4001
```

### **Error: "Database not found"**
```bash
npx prisma migrate dev
```

### **Price feed not updating**
Check console - should see:
```
[price-feed] REST multi symbols: TONUSDT,BTCUSDT,ETHUSDT
```

If not, check `.env`:
```
FEED_SYMBOLS="TONUSDT,BTCUSDT,ETHUSDT"
```

---

## ✅ **What Works NOW (Ready to Test)**

✅ Authentication (TON proof - dev mode)
✅ Wallet balance tracking
✅ Manual deposit confirmation
✅ Withdraw (simulated)
✅ Place MARKET orders with leverage
✅ Open LONG/SHORT positions
✅ Real-time PnL calculation
✅ Liquidation price calculation
✅ Portfolio overview
✅ Transaction history
✅ Live price feeds (BTC, ETH, TON)
✅ Multi-source price with fallback

---

## 🚧 **What's Missing (For Production)**

⚠️ Real TON blockchain deposit detection (currently manual)
⚠️ Real TON blockchain withdrawal execution
⚠️ Liquidation engine (background job)
⚠️ LIMIT order matching
⚠️ Stop-loss / Take-profit
⚠️ WebSocket for real-time updates
⚠️ AI integration
⚠️ Funding rate mechanism

**But for hackathon DEMO:** Current features are MORE than enough! ✅

---

## 🎓 **Learning Resources**

### **Postman/Thunder Client:**
- Thunder Client: https://www.thunderclient.com/
- Postman: https://www.postman.com/

### **Prisma:**
- Docs: https://www.prisma.io/docs
- Studio: `npx prisma studio`

### **TON Testnet:**
- Faucet: https://testnet.toncoin.org/faucet
- Explorer: https://testnet.tonscan.org/

---

## 🚀 **NEXT STEPS**

### **For Testing (Now):**
1. ✅ Run `npm install`
2. ✅ Run `npx prisma generate`
3. ✅ Run `npx prisma migrate dev`
4. ✅ Run `npm run dev`
5. ✅ Test dengan Thunder Client/Postman
6. ✅ Buat video demo untuk hackathon

### **For Production (Later):**
1. ⚠️ Deploy ke Railway/Render
2. ⚠️ Setup real TON wallet
3. ⚠️ Implement liquidation engine
4. ⚠️ Add WebSocket
5. ⚠️ Connect frontend

---

## 🎉 **CONGRATULATIONS!**

**Backend structure is COMPLETE and READY for testing!**

You now have:
- ✅ Complete wallet system
- ✅ Margin trading with leverage
- ✅ Real-time PnL tracking
- ✅ Live price feeds
- ✅ Portfolio overview
- ✅ Transaction history

**All in testnet mode - perfect for hackathon demo!**

---

## 💬 **Questions?**

Kalau ada yang stuck atau error:
1. Check console logs
2. Check Prisma Studio (`npx prisma studio`)
3. Verify `.env` configuration
4. Make sure server is running
5. Check JWT token in headers

**Happy Testing! 🚀📈**
