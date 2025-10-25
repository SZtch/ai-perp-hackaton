# 🤖 Telegram Mini Apps Integration - SuperAI Perp

Panduan lengkap untuk mengintegrasikan SuperAI Perp DEX dengan Telegram Mini Apps.

---

## 📋 OVERVIEW

**Apa itu Telegram Mini Apps?**
- Web app yang berjalan langsung di dalam Telegram
- Seamless TON wallet integration
- No external browser needed
- Better UX untuk TON ecosystem

**Keuntungan untuk Perpetual DEX:**
- ✅ TON wallet sudah terintegrasi dengan Telegram
- ✅ User tidak perlu install extension
- ✅ Akses langsung dari chat/bot
- ✅ Push notifications untuk liquidation alerts
- ✅ Perfect untuk TON blockchain users

---

## 🎯 ARSITEKTUR

```
┌─────────────────────────────────────────┐
│         Telegram App (iOS/Android)       │
│  ┌───────────────────────────────────┐  │
│  │    Telegram Mini App (WebView)    │  │
│  │  ┌─────────────────────────────┐  │  │
│  │  │   Frontend (Next.js)        │  │  │
│  │  │   - Trading Interface       │  │  │
│  │  │   - Telegram WebApp SDK     │  │  │
│  │  │   - TON Connect UI          │  │  │
│  │  └─────────────────────────────┘  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
                    ↓ API Calls
┌─────────────────────────────────────────┐
│         Backend (Express)                │
│  - Authentication (Telegram + TON)       │
│  - Trading API                           │
│  - Position Management                   │
│  - Price Oracle                          │
└─────────────────────────────────────────┘
```

---

## 🚀 STEP 1: BUAT TELEGRAM BOT

### 1.1. Chat dengan BotFather

1. Buka Telegram, search: **@BotFather**
2. Start conversation: `/start`
3. Buat bot baru: `/newbot`
4. Masukkan nama bot: **SuperAI Perp DEX**
5. Masukkan username: **superai_perp_bot** (harus unik, diakhiri dengan "bot")

✅ **Anda akan dapat:**
- Bot Token: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz` (simpan ini!)
- Bot username: `@superai_perp_bot`

### 1.2. Setup Mini App

Masih di chat dengan BotFather:

```
/newapp
```

1. Pilih bot Anda: `@superai_perp_bot`
2. **Title**: SuperAI Perp
3. **Description**: Perpetual Futures Trading on TON Blockchain. Trade TON, BTC, ETH with up to 20x leverage.
4. **Photo**: Upload logo (512x512 PNG)
5. **GIF/Demo** (optional): Skip dulu
6. **Web App URL**: `https://your-domain.com` (temporary, nanti diganti)
7. **Short name**: `superaiperp` (untuk URL: t.me/superai_perp_bot/superaiperp)

✅ **Mini App berhasil dibuat!**

---

## 🔧 STEP 2: INSTALL TELEGRAM SDK

### 2.1. Install Dependencies

```bash
cd ~/ai-perp-hackaton/frontend
npm install @twa-dev/sdk
npm install @telegram-apps/sdk
```

### 2.2. Create Telegram Provider

Buat file: `frontend/src/providers/telegram-provider.tsx`

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import WebApp from '@twa-dev/sdk';

interface TelegramContextType {
  webApp: typeof WebApp | null;
  user: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    isPremium?: boolean;
  } | null;
  initDataUnsafe: any;
  isReady: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  initDataUnsafe: null,
  isReady: false,
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramContextType['user']>(null);

  useEffect(() => {
    // Check if running in Telegram
    if (typeof window !== 'undefined' && WebApp.initDataUnsafe?.user) {
      // Configure Telegram WebApp
      WebApp.ready();
      WebApp.expand();

      // Set theme
      WebApp.setHeaderColor('#0f172a'); // slate-900
      WebApp.setBackgroundColor('#020617'); // slate-950

      // Get user info
      const tgUser = WebApp.initDataUnsafe.user;
      setUser({
        id: tgUser.id,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
        username: tgUser.username,
        languageCode: tgUser.language_code,
        isPremium: tgUser.is_premium,
      });

      // Enable closing confirmation
      WebApp.enableClosingConfirmation();

      setIsReady(true);

      console.log('[Telegram] Mini App initialized', {
        platform: WebApp.platform,
        version: WebApp.version,
        user: tgUser,
      });
    } else {
      // Not in Telegram, running as regular web app
      console.log('[Telegram] Running as standalone web app');
      setIsReady(true);
    }
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        webApp: WebApp,
        user,
        initDataUnsafe: WebApp.initDataUnsafe,
        isReady,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}
```

### 2.3. Update Root Layout

Edit: `frontend/src/app/layout.tsx`

```typescript
import { TelegramProvider } from '@/providers/telegram-provider';
import { TonConnectProvider } from '@/providers/ton-connect-provider';
import { AuthProvider } from '@/providers/auth-provider';
import { ToastProvider } from '@/providers/toast-provider';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <TelegramProvider>
          <TonConnectProvider>
            <AuthProvider>
              <ToastProvider>
                {children}
              </ToastProvider>
            </AuthProvider>
          </TonConnectProvider>
        </TelegramProvider>
      </body>
    </html>
  );
}
```

---

## 🎨 STEP 3: OPTIMIZE UI FOR TELEGRAM

### 3.1. Detect Telegram Environment

Create: `frontend/src/lib/telegram.ts`

```typescript
import WebApp from '@twa-dev/sdk';

export function isTelegramMiniApp(): boolean {
  return typeof window !== 'undefined' && !!WebApp.initData;
}

export function getTelegramTheme() {
  if (!isTelegramMiniApp()) return null;

  return {
    bgColor: WebApp.backgroundColor,
    textColor: WebApp.themeParams.text_color,
    hintColor: WebApp.themeParams.hint_color,
    linkColor: WebApp.themeParams.link_color,
    buttonColor: WebApp.themeParams.button_color,
    buttonTextColor: WebApp.themeParams.button_text_color,
  };
}

export function showTelegramAlert(message: string) {
  if (isTelegramMiniApp()) {
    WebApp.showAlert(message);
  } else {
    alert(message);
  }
}

export function showTelegramConfirm(message: string, callback: (confirmed: boolean) => void) {
  if (isTelegramMiniApp()) {
    WebApp.showConfirm(message, callback);
  } else {
    const confirmed = confirm(message);
    callback(confirmed);
  }
}

export function vibrate(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
  if (isTelegramMiniApp()) {
    WebApp.HapticFeedback.impactOccurred(style);
  }
}

export function sendDataToBot(data: any) {
  if (isTelegramMiniApp()) {
    WebApp.sendData(JSON.stringify(data));
  }
}
```

### 3.2. Update Components with Telegram Features

Example: `frontend/src/components/positions-list.tsx`

```typescript
import { useTelegram } from '@/providers/telegram-provider';
import { vibrate, showTelegramConfirm } from '@/lib/telegram';

export function PositionsList({ positions, loading, onClose }: PositionsListProps) {
  const { webApp } = useTelegram();
  const toast = useToast();

  const handleClosePosition = async (positionId: string) => {
    // Haptic feedback
    vibrate('medium');

    // Use Telegram native confirm
    showTelegramConfirm(
      'Are you sure you want to close this position?',
      async (confirmed) => {
        if (!confirmed) return;

        try {
          vibrate('light');
          await tradingService.closePosition(positionId);
          toast.success('Position closed successfully!');
          vibrate('heavy'); // Success vibration
          onClose();
        } catch (error: any) {
          vibrate('heavy'); // Error vibration
          toast.error(error.response?.data?.error || 'Failed to close position');
        }
      }
    );
  };

  // ... rest of component
}
```

---

## 🔐 STEP 4: TELEGRAM AUTHENTICATION (OPTIONAL)

### 4.1. Backend: Add Telegram Auth

Create: `backend/src/routes/auth-telegram.ts`

```typescript
import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../db";
import { signJwt } from "../lib/jwt";

const router = Router();

// Verify Telegram WebApp data
function verifyTelegramWebAppData(initData: string, botToken: string): any {
  const urlParams = new URLSearchParams(initData);
  const hash = urlParams.get('hash');
  urlParams.delete('hash');

  // Sort params and create data-check-string
  const dataCheckString = Array.from(urlParams.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  // Create secret key
  const secretKey = crypto
    .createHmac('sha256', 'WebAppData')
    .update(botToken)
    .digest();

  // Calculate hash
  const calculatedHash = crypto
    .createHmac('sha256', secretKey)
    .update(dataCheckString)
    .digest('hex');

  if (calculatedHash !== hash) {
    throw new Error('Invalid Telegram data');
  }

  // Parse user data
  const userJson = urlParams.get('user');
  if (!userJson) throw new Error('No user data');

  return JSON.parse(userJson);
}

// POST /auth/telegram - Login with Telegram
router.post("/telegram", async (req, res) => {
  try {
    const { initData } = req.body;

    if (!initData) {
      return res.status(400).json({ error: "Missing initData" });
    }

    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    if (!botToken) {
      return res.status(500).json({ error: "Bot token not configured" });
    }

    // Verify Telegram data
    const tgUser = verifyTelegramWebAppData(initData, botToken);

    // Find or create user
    let user = await prisma.user.findUnique({
      where: { telegramId: String(tgUser.id) },
    });

    if (!user) {
      // Create new user
      user = await prisma.user.create({
        data: {
          telegramId: String(tgUser.id),
          username: tgUser.username || `user_${tgUser.id}`,
          address: '', // Will be set when wallet connected
        },
      });

      // Create wallet
      await prisma.wallet.create({
        data: {
          userId: user.id,
          usdtBalance: 1000, // Initial demo balance
          lockedMargin: 0,
        },
      });
    }

    // Generate JWT
    const token = signJwt({
      userId: user.id,
      telegramId: tgUser.id,
      username: tgUser.username,
    });

    res.json({
      ok: true,
      token,
      user: {
        id: user.id,
        telegramId: tgUser.id,
        username: tgUser.username || tgUser.first_name,
        firstName: tgUser.first_name,
        lastName: tgUser.last_name,
      },
    });
  } catch (error: any) {
    console.error('[Auth] Telegram auth error:', error);
    res.status(401).json({ error: error.message });
  }
});

export default router;
```

### 4.2. Update Prisma Schema

Add to `backend/prisma/schema.prisma`:

```prisma
model User {
  id           String   @id @default(cuid())
  address      String   @unique
  telegramId   String?  @unique  // NEW: Telegram user ID
  username     String?             // NEW: Telegram username
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  wallet       Wallet?
  positions    Position[]
  orders       Order[]
  transactions Transaction[]

  @@index([telegramId])
}
```

Run migration:
```bash
cd backend
npx prisma migrate dev --name add_telegram_fields
```

### 4.3. Register Route

Edit: `backend/src/index.ts`

```typescript
import authTelegram from "./routes/auth-telegram";

// Add route
app.use("/auth/telegram", authLimiter, authTelegram);
```

### 4.4. Frontend: Telegram Login

Update: `frontend/src/providers/auth-provider.tsx`

```typescript
import { useTelegram } from './telegram-provider';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { webApp, user: tgUser, isReady } = useTelegram();

  useEffect(() => {
    if (isReady && tgUser && webApp) {
      // Auto-login with Telegram
      loginWithTelegram();
    }
  }, [isReady, tgUser]);

  const loginWithTelegram = async () => {
    try {
      const response = await apiClient.post('/auth/telegram', {
        initData: webApp.initData,
      });

      setToken(response.data.token);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Telegram auth failed:', error);
    }
  };

  // ... rest of provider
}
```

---

## 🌐 STEP 5: DEPLOY & CONFIGURE

### 5.1. Deploy Frontend

**Option A: Vercel (Recommended)**

```bash
cd ~/ai-perp-hackaton/frontend
npm install -g vercel
vercel
```

Follow prompts, get URL: `https://your-app.vercel.app`

**Option B: Netlify**

```bash
npm run build
# Upload dist folder to Netlify
```

### 5.2. Deploy Backend

**Option A: Railway**

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your repo
4. Add environment variables
5. Get URL: `https://your-backend.railway.app`

**Option B: Heroku/Render**

Similar process.

### 5.3. Update Environment Variables

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
NEXT_PUBLIC_TELEGRAM_BOT_USERNAME=superai_perp_bot
```

**Backend (.env):**
```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
ORIGIN=https://your-app.vercel.app
```

### 5.4. Update Mini App URL

Chat dengan @BotFather:

```
/myapps
```

1. Select your bot: `@superai_perp_bot`
2. Select app: `SuperAI Perp`
3. Edit → Web App URL
4. Enter: `https://your-app.vercel.app`

✅ **SELESAI!**

---

## 🧪 STEP 6: TESTING

### 6.1. Test di Telegram

1. Buka Telegram
2. Search bot Anda: `@superai_perp_bot`
3. Klik **Menu** button (bawah kiri)
4. Pilih **SuperAI Perp**
5. Mini App akan terbuka!

### 6.2. Test Features

- ✅ Auto-login dengan Telegram
- ✅ Connect TON wallet
- ✅ Open position
- ✅ Close position
- ✅ Haptic feedback saat klik button
- ✅ Native Telegram alerts

---

## 🎯 FITUR TAMBAHAN (OPTIONAL)

### 7.1. Bot Commands

Chat dengan @BotFather:

```
/mybots
```

Select bot → Edit Commands

```
start - Launch SuperAI Perp DEX
balance - Check wallet balance
positions - View open positions
help - Get help
```

### 7.2. Inline Keyboard

Create bot handler untuk respond ke commands:

```python
# Contoh dengan python-telegram-bot
from telegram import InlineKeyboardButton, InlineKeyboardMarkup

keyboard = [
    [InlineKeyboardButton("🚀 Trade Now", web_app={"url": "https://your-app.vercel.app"})]
]
reply_markup = InlineKeyboardMarkup(keyboard)
```

### 7.3. Push Notifications

Untuk liquidation alerts:

```typescript
// Backend: Send notification when position near liquidation
const axios = require('axios');

async function sendTelegramNotification(telegramId: string, message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    chat_id: telegramId,
    text: message,
    parse_mode: 'Markdown',
  });
}

// Example usage
await sendTelegramNotification(
  user.telegramId,
  '⚠️ *Liquidation Warning*\n\nYour TON/USDT LONG 10x position is close to liquidation!\n\nLiq Price: $2.10\nCurrent: $2.15'
);
```

---

## 📋 CHECKLIST INTEGRASI

- [ ] 1. Buat Telegram Bot dengan BotFather
- [ ] 2. Setup Mini App di BotFather
- [ ] 3. Install `@twa-dev/sdk`
- [ ] 4. Create TelegramProvider
- [ ] 5. Add Telegram utilities (vibrate, alerts)
- [ ] 6. Update components dengan Telegram features
- [ ] 7. (Optional) Add Telegram authentication
- [ ] 8. Deploy frontend (Vercel/Netlify)
- [ ] 9. Deploy backend (Railway/Heroku)
- [ ] 10. Update Mini App URL di BotFather
- [ ] 11. Test di Telegram app
- [ ] 12. Configure bot commands

---

## 🆘 TROUBLESHOOTING

**Problem: "WebApp is not defined"**
- Make sure running inside Telegram
- Check `@twa-dev/sdk` installed
- Wrap in `typeof window !== 'undefined'` check

**Problem: TON Connect tidak muncul**
- Update TON Connect UI ke versi terbaru
- Check `manifestUrl` di TonConnectProvider
- Pastikan domain di whitelist

**Problem: Authentication gagal**
- Verify `TELEGRAM_BOT_TOKEN` di backend
- Check initData valid
- Test dengan `/auth/telegram` endpoint

---

## 🎉 SELESAI!

Sekarang Anda punya Perpetual DEX yang bisa diakses langsung dari Telegram! 🚀

**Next Steps:**
- Polish UI untuk mobile
- Add push notifications
- Implement bot commands
- Add sharing features
- Create marketing materials
