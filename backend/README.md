# SuperAI Perp - Backend API

Backend API untuk SuperAI Perp - Perpetual DEX dengan AI Risk Management di TON Testnet.

## 🏗️ **Struktur Proyek**

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (SQLite)
│   ├── dev.db                 # SQLite database
│   └── migrations/            # Database migrations
├── src/
│   ├── index.ts              # Main server entry point
│   ├── db.ts                 # Prisma client
│   ├── middleware/
│   │   ├── auth.ts           # JWT authentication
│   │   └── limits.ts         # Rate limiting
│   ├── lib/
│   │   └── jwt.ts            # JWT utilities
│   ├── services/
│   │   ├── priceFeed.ts      # Multi-source price feeds
│   │   ├── ton-testnet-service.ts  # TON blockchain integration
│   │   └── position-calculator.ts  # PnL & liquidation calculations
│   └── routes/
│       ├── auth-ton.ts       # TON wallet authentication
│       ├── wallet.ts         # Wallet management (NEW)
│       ├── portfolio.ts      # Portfolio overview (NEW)
│       ├── orders-new.ts     # Orders with leverage (NEW)
│       ├── positions.ts      # Position management
│       ├── pairs.ts          # Trading pairs
│       └── oracle.ts         # Price oracle data
├── .env                      # Environment variables
├── .env.example              # Environment template
├── package.json
└── tsconfig.json
```

---

## 🚀 **Quick Start**

### **1. Install Dependencies**

```bash
cd backend
npm install
```

### **2. Setup Environment Variables**

```bash
# Copy template
cp .env.example .env

# Edit .env with your values
# Minimal config untuk testing:
DATABASE_URL="file:./prisma/dev.db"
PORT=4000
JWT_SECRET="dev_secret_key"
FEED_SYMBOLS="TONUSDT,BTCUSDT,ETHUSDT"
```

### **3. Setup Database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed initial data
npx prisma db seed
```

### **4. Start Development Server**

```bash
npm run dev
```

Server akan berjalan di `http://localhost:4000`

---

## 📡 **API Endpoints**

### **Authentication**

#### `GET /auth/ton-proof/payload`
Generate nonce untuk TON Proof authentication.

**Response:**
```json
{
  "payload": "base64_nonce_string",
  "ttlSec": 300
}
```

#### `POST /auth/ton-proof/verify`
Verify TON Proof dan dapatkan JWT token.

**Request:**
```json
{
  "address": "UQ...",
  "proof": {
    "domain": { "value": "superai-perp.com" },
    "payload": "base64_nonce_string",
    "timestamp": 1234567890,
    "signature": "base64_signature"
  }
}
```

**Response:**
```json
{
  "ok": true,
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "address": "UQ..."
  }
}
```

---

### **Wallet Management** 🆕

**Semua endpoint memerlukan JWT token di header:**
```
Authorization: Bearer <your_jwt_token>
```

#### `GET /api/wallet`
Get wallet balance & info.

**Response:**
```json
{
  "balance": 1000.50,
  "locked": 250.00,
  "available": 750.50,
  "equity": 1050.00,
  "unrealizedPnl": 50.00,
  "totalDeposit": 1000.00,
  "totalWithdraw": 0.00,
  "depositAddress": "UQ..."
}
```

#### `POST /api/wallet/deposit`
Get deposit instructions.

**Response:**
```json
{
  "depositAddress": "UQ...",
  "qrCode": "ton://transfer/UQ...",
  "memo": "DEPOSIT-user123",
  "instructions": [
    "1. Open your TON wallet",
    "2. Send TEST USDT to the address above",
    "3. Wait for confirmation",
    "4. Your balance will update automatically"
  ]
}
```

#### `POST /api/wallet/deposit/confirm`
Manual confirm deposit (untuk testing).

**Request:**
```json
{
  "txHash": "ton_tx_hash_here",
  "amount": 100
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 100,
  "amount": 100,
  "txHash": "ton_tx_hash_here"
}
```

#### `POST /api/wallet/withdraw`
Withdraw funds.

**Request:**
```json
{
  "amount": 50,
  "toAddress": "UQ..."
}
```

**Response:**
```json
{
  "success": true,
  "txHash": "withdraw_tx_hash",
  "amount": 50,
  "fee": 0.5,
  "total": 50.5,
  "toAddress": "UQ...",
  "status": "confirmed"
}
```

#### `GET /api/wallet/transactions`
Get transaction history.

**Query Params:**
- `limit` (optional, default: 50)
- `type` (optional, filter by type: DEPOSIT, WITHDRAW, TRADE_FEE, REALIZED_PNL, etc)

**Response:**
```json
[
  {
    "id": "tx_id",
    "type": "DEPOSIT",
    "amount": 100,
    "balanceAfter": 100,
    "txHash": "ton_tx_hash",
    "status": "confirmed",
    "createdAt": "2025-10-25T..."
  }
]
```

---

### **Portfolio** 🆕

#### `GET /api/portfolio`
Complete portfolio overview.

**Response:**
```json
{
  "wallet": {
    "balance": 1000,
    "locked": 250,
    "available": 750,
    "equity": 1050,
    "unrealizedPnl": 50
  },
  "positions": [
    {
      "id": "pos_id",
      "symbol": "TONUSDT",
      "side": "LONG",
      "size": 1000,
      "leverage": 10,
      "entryPrice": 2.50,
      "markPrice": 2.55,
      "margin": 100,
      "liquidationPrice": 2.25,
      "unrealizedPnl": 20,
      "roe": 20,
      "marginRatio": 12,
      "openedAt": "2025-10-25T..."
    }
  ],
  "stats": {
    "totalPnl": 50,
    "realizedPnl": 30,
    "unrealizedPnl": 20,
    "todayPnl": 10,
    "totalTrades": 25,
    "winRate": 65.5,
    "totalFees": 5,
    "openPositions": 1
  },
  "recentActivity": [...]
}
```

---

### **Trading**

#### `POST /api/orders`
Place order dengan leverage.

**Request:**
```json
{
  "symbol": "TONUSDT",
  "side": "BUY",
  "type": "MARKET",
  "size": 100,
  "leverage": 10
}
```

**Response:**
```json
{
  "id": "order_id",
  "userId": "user_id",
  "symbol": "TONUSDT",
  "side": "BUY",
  "type": "MARKET",
  "size": 100,
  "leverage": 10,
  "status": "filled",
  "fillPrice": 2.50,
  "fee": 0.1,
  "filledAt": "2025-10-25T...",
  "createdAt": "2025-10-25T..."
}
```

#### `GET /api/orders`
Get user orders.

**Query Params:**
- `status` (optional: open, filled, cancelled)
- `limit` (optional, default: 50)

#### `DELETE /api/orders/:id`
Cancel open order.

---

### **Positions**

#### `GET /api/positions`
Get open positions.

**Response:**
```json
[
  {
    "id": "pos_id",
    "symbol": "TONUSDT",
    "side": "LONG",
    "size": 1000,
    "leverage": 10,
    "entryPrice": 2.50,
    "margin": 100,
    "liquidationPrice": 2.25,
    "status": "open",
    "openedAt": "2025-10-25T..."
  }
]
```

---

### **Price Oracle**

#### `GET /api/oracle/latest/:symbol`
Get latest price.

**Example:** `/api/oracle/latest/TONUSDT`

**Response:**
```json
{
  "symbol": "TONUSDT",
  "price": 2.55,
  "timestamp": "2025-10-25T..."
}
```

---

## 🗄️ **Database Models**

### **User**
```
id, tonAddress, createdAt, updatedAt
```

### **Wallet** 🆕
```
id, userId, usdtBalance, lockedMargin, totalDeposit, totalWithdraw
```

### **Transaction** 🆕
```
id, userId, type, amount, balanceAfter, txHash, status
Types: DEPOSIT | WITHDRAW | TRADE_FEE | REALIZED_PNL | LIQUIDATION
```

### **Position** (Updated)
```
id, userId, symbol, side (LONG/SHORT), size, leverage,
entryPrice, margin, liquidationPrice, realizedPnl, status
```

### **Order** (Updated)
```
id, userId, symbol, side, type, price, qty, leverage,
status, fillPrice, fee
```

---

## 🧪 **Testing dengan Postman/Thunder Client**

### **1. Authentication**
```
GET http://localhost:4000/auth/ton-proof/payload
POST http://localhost:4000/auth/ton-proof/verify
→ Dapatkan JWT token
```

### **2. Setup Headers**
Untuk semua request berikutnya, tambahkan:
```
Authorization: Bearer <your_jwt_token>
```

### **3. Get Wallet**
```
GET http://localhost:4000/api/wallet
```

### **4. Simulate Deposit (Manual)**
```
POST http://localhost:4000/api/wallet/deposit/confirm
Body:
{
  "txHash": "test_deposit_123",
  "amount": 1000
}
```

### **5. Place Order**
```
POST http://localhost:4000/api/orders
Body:
{
  "symbol": "TONUSDT",
  "side": "BUY",
  "type": "MARKET",
  "size": 100,
  "leverage": 10
}
```

### **6. Check Portfolio**
```
GET http://localhost:4000/api/portfolio
```

---

## 🔧 **Development**

### **Run Migrations**
```bash
npx prisma migrate dev --name your_migration_name
```

### **Reset Database**
```bash
npx prisma migrate reset
```

### **View Database**
```bash
npx prisma studio
```

### **Generate Prisma Client**
```bash
npx prisma generate
```

---

## 🌐 **TON Testnet Integration**

### **Setup TON Wallet**
1. Install Tonkeeper atau TON Wallet
2. Switch ke Testnet mode
3. Get test TON: https://testnet.toncoin.org/faucet

### **Get TON API Key**
1. Open Telegram: https://t.me/tontestnetapibot
2. Request API key
3. Add ke `.env`: `TON_API_KEY="your_key"`

### **Platform Wallet**
Untuk receive deposits, Anda perlu platform wallet:
```bash
# Generate wallet (coming soon in setup script)
# Atau gunakan existing testnet wallet
```

---

## 📊 **Price Feed Sources**

Backend menggunakan multiple sources dengan fallback:
1. **CoinGecko** (primary)
2. **OKX** (fallback 1)
3. **Binance Mirror** (fallback 2)

Update interval: 2 detik (configurable via `PRICE_FEED_INTERVAL`)

---

## 🚨 **Common Issues**

### **"Cannot find module '@prisma/client'"**
```bash
npx prisma generate
```

### **"Database file not found"**
```bash
npx prisma migrate dev
```

### **"Port 4000 already in use"**
```bash
# Change PORT in .env
PORT=4001
```

---

## 📝 **Next Steps**

- [ ] Deploy TON Testnet USDT Jetton contract
- [ ] Implement automatic deposit detection
- [ ] Add WebSocket for real-time price updates
- [ ] Implement liquidation engine
- [ ] Add stop-loss / take-profit orders
- [ ] Integrate AI risk scoring

---

## 🤝 **Support**

Jika ada pertanyaan atau issues, silakan buat issue di repository atau hubungi tim dev.

**Happy Trading! 🚀📈**
