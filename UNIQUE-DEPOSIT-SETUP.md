# 🔐 Unique Deposit Address System

## Overview

Sistem ini memberikan setiap user **alamat deposit TON yang unik**, sehingga:
- ✅ Setiap user punya alamat sendiri yang tidak digunakan user lain
- ✅ Deposit terdeteksi otomatis dalam 30 detik
- ✅ Tidak perlu manual submit transaction hash
- ✅ Lebih aman dan profesional (standar exchange)

## Architecture

### Backend Components

1. **Wallet Generator Service** (`src/services/wallet-generator.service.ts`)
   - Generate unique TON wallet address per user
   - Store encrypted mnemonic (for advanced features)
   - Monitor all deposit addresses automatically
   - Auto-credit balance when deposit detected

2. **Updated Wallet Routes** (`src/routes/wallet.ts`)
   - `GET /api/wallet` - Returns unique deposit address per user
   - `POST /api/wallet/deposit` - Returns deposit info with unique address
   - `POST /api/wallet/deposit/check` - Manual trigger deposit check

3. **Database Schema** (`prisma/schema.prisma`)
   ```prisma
   model Wallet {
     depositAddress         String?   @unique  // Unique TON address
     depositAddressMnemonic String?            // Encrypted mnemonic
     lastDepositCheck       DateTime?          // Last deposit check
     ...
   }
   ```

### Frontend Components

1. **Updated Wallet Deposit** (`frontend/src/components/wallet-deposit.tsx`)
   - Displays unique deposit address with "EXCLUSIVE" badge
   - Shows auto-detection status
   - Explains security benefits

## Setup Instructions

### 1. Run Database Migration

```bash
cd /path/to/backend
npx prisma migrate deploy
# or if migrate doesn't work:
npx prisma db push
```

### 2. Environment Variables

Add to `.env`:

```bash
# Enable automatic deposit monitoring (recommended)
ENABLE_DEPOSIT_MONITORING=true

# How often to check for deposits (in milliseconds)
DEPOSIT_MONITOR_INTERVAL=30000  # 30 seconds

# TON API configuration
TON_API_ENDPOINT=https://testnet.toncenter.com/api/v2/jsonRPC
TON_API_KEY=your_ton_api_key_here
```

### 3. Start Backend

```bash
npm run dev
```

The wallet generator service will automatically:
- Start monitoring deposits every 30 seconds
- Generate unique addresses for new users
- Auto-credit balances when deposits are detected

## How It Works

### User Flow

1. **User logs in** → System checks if user has deposit address
2. **No address?** → Generate new unique TON wallet address
3. **Address created** → Store in database with encrypted mnemonic
4. **User deposits TON** → Send from any TON wallet to their unique address
5. **Auto-detection** → System detects deposit within 30 seconds
6. **Auto-credit** → Balance automatically updated (1 TON = 5 USDT testnet rate)

### Technical Flow

```
User Deposit (TON Wallet)
    ↓
Unique Address (Generated per user)
    ↓
Background Monitor (Every 30s)
    ↓
Detect New Transaction
    ↓
Verify Amount & Source
    ↓
Auto-Credit USDT Balance
    ↓
Create Transaction Record
```

## Security Features

### 1. Unique Address Per User
- Setiap user mendapat address yang berbeda
- Tidak ada collision atau confusion antar user

### 2. Encrypted Mnemonic Storage
- Mnemonic disimpan dengan enkripsi base64 (hackathon)
- Production: gunakan AES-256 atau KMS

### 3. Transaction Deduplication
- System check apakah transaction sudah di-process
- Prevent double-credit attacks

### 4. Auto-verification
- Verify transaction on-chain
- Check amount dan sender

## API Endpoints

### GET /api/wallet
Returns wallet info including unique deposit address:
```json
{
  "depositAddress": "0QAbc123...",
  "usdtBalance": 1000.00,
  ...
}
```

### POST /api/wallet/deposit
Returns deposit information:
```json
{
  "depositAddress": "0QAbc123...",  // Unique per user
  "isUnique": true,
  "autoDetection": true,
  "currency": "TON",
  "instructions": [...]
}
```

### POST /api/wallet/deposit/check
Manual trigger for deposit check (optional):
```json
{
  "success": true,
  "message": "Deposit check completed...",
  "depositAddress": "0QAbc123..."
}
```

## Monitoring & Logs

The system logs all activities:

```
[WalletGen] ✅ Automatic deposit monitoring enabled
[WalletGen] Generating unique wallet for user: user_123
[WalletGen] Generated address: 0QAbc123...
[WalletGen] Monitoring all deposit addresses...
[WalletGen] Found 5 wallets to monitor
[WalletGen] New deposit detected: 1.5 TON (7.5 USDT) for user user_123
[WalletGen] ✅ Credited 7.5 USDT to user user_123
```

## Testing

### Test Deposit Flow

1. **Get deposit address:**
   ```bash
   curl http://localhost:3001/api/wallet \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

2. **Send TON to address:**
   - Use Tonkeeper or other TON wallet
   - Send to the unique address from response

3. **Wait 30 seconds** (or call manual check):
   ```bash
   curl -X POST http://localhost:3001/api/wallet/deposit/check \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Check balance:**
   ```bash
   curl http://localhost:3001/api/wallet \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

## Conversion Rate

For testnet: **1 TON = 5 USDT**

To change, edit `wallet-generator.service.ts:213`:
```typescript
const usdtAmount = tonAmount * 5; // Change this multiplier
```

In production, integrate with oracle for real-time TON/USDT price.

## Troubleshooting

### Issue: Address not generating
**Solution:** Check logs for errors. Ensure TON_API_ENDPOINT is accessible.

### Issue: Deposits not auto-detected
**Solution:**
1. Check `ENABLE_DEPOSIT_MONITORING=true` in `.env`
2. Restart backend
3. Check logs for monitoring activity

### Issue: Balance not credited
**Solution:**
1. Check transaction on TON testnet explorer
2. Verify you sent to correct unique address
3. Check backend logs for errors
4. Try manual check: `POST /api/wallet/deposit/check`

## Future Enhancements

- [ ] Support USDT Jetton deposits (not just native TON)
- [ ] Implement proper KMS for mnemonic encryption
- [ ] Add webhook notifications for deposits
- [ ] Support multiple cryptocurrencies
- [ ] Add deposit limits and rate limiting
- [ ] Implement withdrawal from deposit addresses to hot wallet

## Migration from Old System

Users on old system (shared platform address):
1. Will automatically get unique address on next login
2. Old test deposits still work (manual confirmation)
3. New deposits: use unique address (auto-detection)

---

**Status:** ✅ Implemented and tested
**Version:** 1.0.0
**Date:** October 27, 2025
