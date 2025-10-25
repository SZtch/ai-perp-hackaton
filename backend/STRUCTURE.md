# 📁 Backend Structure Overview

## **Complete File Structure**

```
backend/
│
├── 📄 package.json                    # Dependencies & scripts
├── 📄 tsconfig.json                   # TypeScript config
├── 📄 .env                            # Environment variables (gitignored)
├── 📄 .env.example                    # Environment template
├── 📄 README.md                       # Setup & API documentation
├── 📄 STRUCTURE.md                    # This file
│
├── 📂 prisma/
│   ├── schema.prisma                  # ✅ UPDATED - Database schema with Wallet, Transaction models
│   ├── dev.db                         # SQLite database
│   └── migrations/                    # Database migrations
│
└── 📂 src/
    │
    ├── 📄 index.ts                    # ✅ UPDATED - Main server with new routes
    ├── 📄 db.ts                       # Prisma client instance
    │
    ├── 📂 middleware/
    │   ├── auth.ts                    # JWT authentication middleware
    │   ├── limits.ts                  # Rate limiting config
    │   └── rate-limit.ts              # Rate limit middleware
    │
    ├── 📂 lib/
    │   └── jwt.ts                     # JWT sign/verify utilities
    │
    ├── 📂 services/
    │   ├── priceFeed.ts               # ✅ EXISTS - Multi-source price feeds
    │   ├── ton-testnet-service.ts     # 🆕 NEW - TON blockchain integration
    │   ├── position-calculator.ts     # 🆕 NEW - PnL & liquidation calculations
    │   ├── oracle-service.ts          # Oracle data aggregation
    │   └── position-service.ts        # Position management helpers
    │
    ├── 📂 routes/
    │   ├── auth-ton.ts                # ✅ EXISTS - TON wallet auth
    │   ├── wallet.ts                  # 🆕 NEW - Wallet management (deposit/withdraw/balance)
    │   ├── portfolio.ts               # 🆕 NEW - Portfolio overview endpoint
    │   ├── orders-new.ts              # 🆕 NEW - Orders with leverage & margin
    │   ├── orders.ts                  # ⚠️ OLD - Keep for reference, not used
    │   ├── positions.ts               # ✅ EXISTS - Position endpoints
    │   ├── pairs.ts                   # ✅ EXISTS - Trading pairs
    │   ├── oracle.ts                  # ✅ EXISTS - Price oracle data
    │   ├── ai.ts                      # AI integration (optional)
    │   ├── keeper.ts                  # Liquidation keeper
    │   └── trading.ts                 # Trading helpers
    │
    ├── 📂 types/
    │   └── express.d.ts               # TypeScript type augmentation
    │
    └── 📂 db/
        └── init.ts                    # Database initialization
```

---

## **🆕 New Files Created**

### **1. Environment Configuration**
- ✅ `.env` - Actual environment variables (ready to use)
- ✅ `.env.example` - Template with all options documented

### **2. Database Schema**
- ✅ `prisma/schema.prisma` - **UPDATED** with:
  - `Wallet` model (balance, locked margin)
  - `Transaction` model (deposit, withdraw, fees)
  - Updated `Position` model (leverage, liquidation price)
  - Updated `Order` model (leverage, fill price)
  - `TradingPair` model (config for each pair)

### **3. Services**
- ✅ `services/ton-testnet-service.ts` - TON blockchain integration
  - Get balance
  - Verify transactions
  - Monitor deposits
  - Send withdrawals
  - Validate addresses

- ✅ `services/position-calculator.ts` - Trading calculations
  - Calculate unrealized PnL
  - Calculate liquidation price
  - Calculate ROE (Return on Equity)
  - Calculate margin ratio
  - Check if position should be liquidated

### **4. Routes/Endpoints**
- ✅ `routes/wallet.ts` - Wallet management
  - `GET /api/wallet` - Get balance & info
  - `POST /api/wallet/deposit` - Get deposit info
  - `POST /api/wallet/deposit/confirm` - Confirm deposit
  - `POST /api/wallet/withdraw` - Withdraw funds
  - `GET /api/wallet/transactions` - Transaction history

- ✅ `routes/portfolio.ts` - Portfolio overview
  - `GET /api/portfolio` - Complete portfolio data
  - `GET /api/portfolio/stats` - Quick stats

- ✅ `routes/orders-new.ts` - Trading with leverage
  - `POST /api/orders` - Place order with leverage
  - `GET /api/orders` - Get user orders
  - `DELETE /api/orders/:id` - Cancel order
  - Includes position opening/closing logic
  - Margin locking/unlocking
  - PnL realization

### **5. Main Server**
- ✅ `src/index.ts` - **UPDATED** with:
  - All new routes registered
  - Better organized route structure
  - Enhanced logging

### **6. Documentation**
- ✅ `README.md` - Complete setup & API guide
- ✅ `STRUCTURE.md` - This file

---

## **📊 Database Models Explanation**

### **User**
```typescript
{
  id: string           // User ID
  tonAddress: string   // TON wallet address (unique)
  createdAt: DateTime
  updatedAt: DateTime
}
```
**Relations:** wallet, orders, positions, transactions

---

### **Wallet** 🆕
```typescript
{
  id: string
  userId: string           // Foreign key to User
  usdtBalance: number      // Available USDT balance
  lockedMargin: number     // Margin locked in open positions
  totalDeposit: number     // Total deposited (lifetime)
  totalWithdraw: number    // Total withdrawn (lifetime)
  createdAt: DateTime
  updatedAt: DateTime
}
```
**Purpose:** Track user's trading balance

**Key Fields:**
- `usdtBalance` - Free balance available for trading
- `lockedMargin` - Margin currently used in open positions
- Available balance = `usdtBalance - lockedMargin`

---

### **Transaction** 🆕
```typescript
{
  id: string
  userId: string
  type: string             // DEPOSIT | WITHDRAW | TRADE_FEE | REALIZED_PNL | LIQUIDATION
  amount: number           // Positive = credit, Negative = debit
  balanceAfter: number     // Balance after this transaction
  relatedId: string?       // Order/Position ID (if applicable)
  txHash: string?          // TON blockchain tx hash
  fromAddress: string?     // Source address (deposits)
  toAddress: string?       // Destination address (withdrawals)
  status: string           // pending | confirmed | failed
  metadata: string?        // JSON for additional data
  createdAt: DateTime
  confirmedAt: DateTime?
}
```
**Purpose:** Complete audit trail of all balance changes

**Transaction Types:**
- `DEPOSIT` - User deposits USDT
- `WITHDRAW` - User withdraws USDT
- `TRADE_FEE` - Trading fee deducted
- `REALIZED_PNL` - Profit/loss when position closes
- `LIQUIDATION` - Liquidation event

---

### **Position** (Updated)
```typescript
{
  id: string
  userId: string
  symbol: string           // TONUSDT, BTCUSDT, ETHUSDT
  side: string             // LONG | SHORT
  size: number             // Position size in USDT
  leverage: number         // 1x - 20x
  entryPrice: number       // Average entry price
  margin: number           // Initial margin locked
  liquidationPrice: number // Price at which liquidated
  realizedPnl: number      // Realized P&L when closed
  status: string           // open | closed | liquidated
  openedAt: DateTime
  closedAt: DateTime?
  updatedAt: DateTime
}
```
**Purpose:** Track open positions with leverage

**Key Fields:**
- `size` - Position size in quote currency (USDT)
- `leverage` - Leverage multiplier
- `margin` - Actual USDT locked (size / leverage)
- `liquidationPrice` - Auto-liquidation trigger price

**Example:**
```
User opens LONG 1000 USDT TONUSDT @ 2.50 with 10x leverage
- size: 1000
- leverage: 10
- margin: 100 (locked from wallet)
- entryPrice: 2.50
- liquidationPrice: 2.25 (calculated)
```

---

### **Order** (Updated)
```typescript
{
  id: string
  userId: string
  symbol: string
  side: string             // BUY | SELL
  type: string             // MARKET | LIMIT
  price: number?           // Limit price (null for MARKET)
  qty: number              // Order size in USDT
  leverage: number         // 1x - 20x
  status: string           // open | filled | cancelled | rejected
  fillPrice: number?       // Actual execution price
  fee: number              // Trading fee paid
  createdAt: DateTime
  filledAt: DateTime?
  cancelledAt: DateTime?
}
```
**Purpose:** Track order history

**New Fields:**
- `leverage` - Leverage for this order
- `fillPrice` - Actual price order was filled
- `fee` - Trading fee paid

---

### **TradingPair** 🆕
```typescript
{
  id: string
  symbol: string           // TONUSDT (unique)
  baseAsset: string        // TON
  quoteAsset: string       // USDT
  minOrderSize: number     // Min order size (default: 1)
  maxOrderSize: number     // Max order size (default: 1000000)
  maxLeverage: number      // Max leverage allowed (default: 20)
  takerFee: number         // Taker fee rate (default: 0.001 = 0.1%)
  makerFee: number         // Maker fee rate (default: 0.0005 = 0.05%)
  maintenanceMargin: number // For liquidation (default: 0.05 = 5%)
  isActive: boolean        // Trading enabled
  createdAt: DateTime
  updatedAt: DateTime
}
```
**Purpose:** Configuration for each trading pair

---

## **🔄 Data Flow Example**

### **Deposit Flow:**
```
1. User: POST /api/wallet/deposit/confirm { txHash, amount: 100 }
2. Backend: Verify tx on TON blockchain
3. Backend: Update Wallet.usdtBalance += 100
4. Backend: Create Transaction (type: DEPOSIT)
5. Response: { success: true, newBalance: 100 }
```

### **Trade Flow (MARKET Order):**
```
1. User: POST /api/orders { symbol: "TONUSDT", side: "BUY", size: 1000, leverage: 10 }
2. Backend: Calculate margin needed = 1000/10 = 100 USDT
3. Backend: Check wallet.usdtBalance - wallet.lockedMargin >= 100 + fee
4. Backend: Create Order (status: filled)
5. Backend: Create Position (margin: 100, liquidationPrice: calculated)
6. Backend: Update Wallet.lockedMargin += 100
7. Backend: Create Transaction (type: TRADE_FEE)
8. Response: { order, position }
```

### **Portfolio Check Flow:**
```
1. User: GET /api/portfolio
2. Backend: Get Wallet
3. Backend: Get all open Positions
4. Backend: For each position:
   - Get current mark price
   - Calculate unrealized PnL
   - Calculate ROE
5. Backend: Calculate equity = balance + unrealizedPnL
6. Backend: Get statistics (realized PnL, win rate, etc)
7. Response: { wallet, positions, stats }
```

---

## **🎯 Key Features Implemented**

✅ **Wallet System**
- Balance tracking
- Deposit/withdraw
- Transaction history
- Auto-detection (TON monitoring)

✅ **Margin Trading**
- Leverage 1x-20x
- Margin calculation
- Liquidation price calculation
- Position opening/closing

✅ **PnL Tracking**
- Unrealized PnL (real-time)
- Realized PnL (on close)
- ROE calculation
- Margin ratio

✅ **Risk Management**
- Max leverage limits per pair
- Liquidation price
- Maintenance margin
- Balance checks

✅ **Multi-Asset Support**
- TONUSDT
- BTCUSDT
- ETHUSDT

✅ **Live Price Feeds**
- Multi-source (CoinGecko, OKX, Binance)
- 2-second updates
- Fallback mechanism

---

## **🚀 What's Next?**

### **Phase 1: Core Completion** (This is done! ✅)
- ✅ Wallet system
- ✅ Margin trading
- ✅ PnL calculation
- ✅ Basic endpoints

### **Phase 2: Enhanced Features** (Optional)
- [ ] WebSocket real-time updates
- [ ] Liquidation engine (background job)
- [ ] Stop-loss / Take-profit orders
- [ ] Order book / Matching engine

### **Phase 3: Production Ready** (Future)
- [ ] AI integration (risk scoring)
- [ ] Funding rate mechanism
- [ ] Advanced charting data
- [ ] Notifications

---

## **📝 Notes for Developer**

### **Testing Priority:**
1. ✅ Health check: `GET /health`
2. ✅ Auth flow: Generate payload → Verify proof
3. ✅ Wallet: Get balance → Deposit → Check balance
4. ✅ Trading: Place order → Check position
5. ✅ Portfolio: View complete data

### **Database Management:**
```bash
# View data
npx prisma studio

# Reset & fresh start
npx prisma migrate reset

# Create new migration
npx prisma migrate dev --name description
```

### **Common Debugging:**
- Check `.env` configuration
- Verify JWT token in headers
- Check database with Prisma Studio
- Monitor console logs
- Use Postman collections

---

**Backend structure is complete and ready for testing! 🎉**
