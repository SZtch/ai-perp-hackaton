# 🚀 PANDUAN LENGKAP: Deploy & Telegram Mini Apps (Untuk Pemula)

Panduan step-by-step dari NOL sampai aplikasi jalan di Telegram.

---

## 📋 OVERVIEW LANGKAH

```
1. ✅ Persiapan Project (10 menit)
2. ✅ Deploy Backend ke Railway (15 menit)
3. ✅ Deploy Frontend ke Vercel (10 menit)
4. ✅ Setup Telegram Bot (10 menit)
5. ✅ Test di Telegram (5 menit)
```

**Total waktu: ~50 menit**

---

## 🎯 BAGIAN 1: PERSIAPAN PROJECT (10 MENIT)

### Step 1.1: Install Telegram SDK

Buka **Terminal**, ketik:

```bash
cd ~/ai-perp-hackaton/frontend
```

Tekan **ENTER**. Lanjut:

```bash
npm install @twa-dev/sdk
```

Tekan **ENTER**. Tunggu sampai selesai install.

### Step 1.2: Create Telegram Provider

Buka **VS Code** atau **Cursor**, buat file baru:

**Lokasi:** `frontend/src/providers/telegram-provider.tsx`

Copy-paste code ini:

```typescript
"use client";

import { createContext, useContext, useEffect, useState } from 'react';

// Type definitions
interface TelegramWebApp {
  initData: string;
  initDataUnsafe: any;
  version: string;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: any;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  BackButton: any;
  MainButton: any;
  HapticFeedback: any;
  ready: () => void;
  expand: () => void;
  close: () => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  setHeaderColor: (color: string) => void;
  setBackgroundColor: (color: string) => void;
  showAlert: (message: string, callback?: () => void) => void;
  showConfirm: (message: string, callback?: (confirmed: boolean) => void) => void;
  sendData: (data: string) => void;
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramContextType {
  webApp: TelegramWebApp | null;
  user: {
    id: number;
    firstName: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    isPremium?: boolean;
  } | null;
  isReady: boolean;
  isTelegramMiniApp: boolean;
}

const TelegramContext = createContext<TelegramContextType>({
  webApp: null,
  user: null,
  isReady: false,
  isTelegramMiniApp: false,
});

export function TelegramProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [user, setUser] = useState<TelegramContextType['user']>(null);
  const [isTelegramMiniApp, setIsTelegramMiniApp] = useState(false);

  useEffect(() => {
    // Check if running in Telegram
    if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
      const WebApp = window.Telegram.WebApp;

      // Configure Telegram WebApp
      WebApp.ready();
      WebApp.expand();

      // Set theme colors (dark mode)
      WebApp.setHeaderColor('#0f172a'); // slate-900
      WebApp.setBackgroundColor('#020617'); // slate-950

      // Enable closing confirmation
      WebApp.enableClosingConfirmation();

      // Get user info if available
      if (WebApp.initDataUnsafe?.user) {
        const tgUser = WebApp.initDataUnsafe.user;
        setUser({
          id: tgUser.id,
          firstName: tgUser.first_name,
          lastName: tgUser.last_name,
          username: tgUser.username,
          languageCode: tgUser.language_code,
          isPremium: tgUser.is_premium,
        });

        setIsTelegramMiniApp(true);

        console.log('[Telegram] Mini App initialized', {
          platform: WebApp.platform,
          version: WebApp.version,
          user: tgUser,
        });
      }

      setIsReady(true);
    } else {
      // Not in Telegram, running as regular web app
      console.log('[Telegram] Running as standalone web app');
      setIsReady(true);
      setIsTelegramMiniApp(false);
    }
  }, []);

  return (
    <TelegramContext.Provider
      value={{
        webApp: typeof window !== 'undefined' && window.Telegram?.WebApp ? window.Telegram.WebApp : null,
        user,
        isReady,
        isTelegramMiniApp,
      }}
    >
      {children}
    </TelegramContext.Provider>
  );
}

export function useTelegram() {
  return useContext(TelegramContext);
}

// Utility functions
export function isTelegramMiniApp(): boolean {
  return typeof window !== 'undefined' && !!window.Telegram?.WebApp?.initData;
}

export function vibrate(style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(style);
  }
}

export function showTelegramAlert(message: string) {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.showAlert(message);
  } else {
    alert(message);
  }
}

export function showTelegramConfirm(message: string, callback: (confirmed: boolean) => void) {
  if (typeof window !== 'undefined' && window.Telegram?.WebApp) {
    window.Telegram.WebApp.showConfirm(message, callback);
  } else {
    const confirmed = confirm(message);
    callback(confirmed);
  }
}
```

**Save** file (Cmd+S atau Ctrl+S).

### Step 1.3: Update Layout

Buka file: `frontend/src/app/layout.tsx`

Cari bagian import, tambahkan:

```typescript
import { TelegramProvider } from '@/providers/telegram-provider';
```

Lalu wrap children dengan TelegramProvider (paling luar):

```typescript
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

**Save** file.

### Step 1.4: Add Telegram Script

Buka file: `frontend/src/app/layout.tsx`

Di bagian `<head>`, tambahkan script Telegram:

```typescript
import Script from 'next/script';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
      </head>
      <body>
        {/* ... */}
      </body>
    </html>
  );
}
```

**Save** semua file.

### Step 1.5: Commit Changes

Buka Terminal:

```bash
cd ~/ai-perp-hackaton
git add .
git commit -m "feat: add Telegram Mini Apps support"
git push
```

✅ **Persiapan selesai!**

---

## 🚂 BAGIAN 2: DEPLOY BACKEND KE RAILWAY (15 MENIT)

### Step 2.1: Daftar Railway

1. Buka browser: **https://railway.app**
2. Klik **"Start a New Project"** atau **"Login with GitHub"**
3. Pilih **"Login with GitHub"**
4. Authorize Railway
5. ✅ Masuk ke Dashboard Railway

### Step 2.2: Create New Project

1. Klik **"New Project"**
2. Pilih **"Deploy from GitHub repo"**
3. Pilih repository: **ai-perp-hackaton** (atau nama repo Anda)
4. Klik **"Deploy Now"**

### Step 2.3: Configure Backend Service

1. Klik project yang baru dibuat
2. Klik **"Settings"** tab
3. Scroll ke **"Root Directory"**
4. Set ke: **`backend`**
5. Klik **"Save"**

### Step 2.4: Add Environment Variables

1. Klik tab **"Variables"**
2. Klik **"+ New Variable"**
3. Tambahkan satu per satu:

```
DATABASE_URL=your_postgres_url_from_railway
JWT_SECRET=your-super-secret-jwt-key-here-change-this
TON_NETWORK=testnet
TEST_MODE=true
ORIGIN=*
PORT=4000
```

**Untuk DATABASE_URL:**
1. Kembali ke Dashboard
2. Klik **"+ New"** → **"Database"** → **"PostgreSQL"**
3. Tunggu database provisioned
4. Klik database → tab **"Connect"**
5. Copy **"Postgres Connection URL"**
6. Paste ke `DATABASE_URL`

4. Klik **"Save"**

### Step 2.5: Deploy

1. Klik tab **"Deployments"**
2. Railway akan auto-deploy
3. Tunggu sampai status jadi **"Success"** (hijau) - sekitar 3-5 menit
4. Klik **"Settings"** → scroll ke **"Domains"**
5. Klik **"Generate Domain"**
6. Copy URL yang muncul, contoh: `https://ai-perp-backend-production.up.railway.app`

✅ **Backend URL:** `https://your-backend.up.railway.app` (simpan ini!)

### Step 2.6: Test Backend

Buka browser, akses:

```
https://your-backend.up.railway.app/health
```

Harus muncul:

```json
{
  "ok": true,
  "timestamp": "2025-...",
  "network": "testnet"
}
```

✅ **Backend LIVE!**

---

## ☁️ BAGIAN 3: DEPLOY FRONTEND KE VERCEL (10 MENIT)

### Step 3.1: Daftar Vercel

1. Buka browser: **https://vercel.com**
2. Klik **"Sign Up"** atau **"Login"**
3. Pilih **"Continue with GitHub"**
4. Authorize Vercel
5. ✅ Masuk ke Dashboard Vercel

### Step 3.2: Import Project

1. Klik **"Add New..."** → **"Project"**
2. Cari repository: **ai-perp-hackaton**
3. Klik **"Import"**

### Step 3.3: Configure Project

Di halaman konfigurasi:

1. **Framework Preset:** Next.js (auto-detect)
2. **Root Directory:** Klik **"Edit"** → pilih **`frontend`**
3. **Build and Output Settings:** (biarkan default)

### Step 3.4: Add Environment Variables

Klik **"Environment Variables"**, tambahkan:

**Key:** `NEXT_PUBLIC_API_URL`
**Value:** `https://your-backend.up.railway.app` (dari Railway tadi)

**Key:** `NEXT_PUBLIC_MANIFEST_URL`
**Value:** `https://your-frontend-url.vercel.app/tonconnect-manifest.json` (nanti kita update)

Klik **"Add"**

### Step 3.5: Deploy

1. Klik **"Deploy"** (tombol biru besar)
2. Tunggu proses build - sekitar 2-5 menit
3. Kalau ada error, cek build logs
4. Kalau sukses, akan muncul **"Congratulations! 🎉"**

### Step 3.6: Get Vercel URL

1. Setelah deploy sukses, klik **"Go to Dashboard"**
2. Klik project Anda
3. Di bagian atas, ada **"Domains"**
4. Copy URL, contoh: `https://ai-perp-hackaton.vercel.app`

✅ **Frontend URL:** `https://ai-perp-hackaton.vercel.app` (simpan ini!)

### Step 3.7: Update Manifest URL

1. Kembali ke Vercel Dashboard
2. Klik project → **"Settings"** → **"Environment Variables"**
3. Edit `NEXT_PUBLIC_MANIFEST_URL`
4. Ganti jadi: `https://ai-perp-hackaton.vercel.app/tonconnect-manifest.json`
5. Klik **"Save"**
6. Klik **"Redeploy"** untuk apply changes

### Step 3.8: Test Frontend

Buka browser:

```
https://ai-perp-hackaton.vercel.app
```

Harus bisa buka aplikasi! ✅

---

## 🤖 BAGIAN 4: SETUP TELEGRAM BOT (10 MENIT)

### Step 4.1: Buka Telegram

1. Buka aplikasi **Telegram** di HP atau desktop
2. Di search bar, ketik: **@BotFather**
3. Klik chat @BotFather
4. Klik **"START"** atau ketik `/start`

### Step 4.2: Buat Bot Baru

Ketik command (satu per satu):

**1. Ketik:**
```
/newbot
```

**2. BotFather akan tanya nama bot, ketik:**
```
SuperAI Perp DEX
```

**3. BotFather akan tanya username (harus unik), ketik:**
```
superaiperp_YourName_bot
```

Ganti `YourName` dengan nama Anda, contoh: `superaiperp_aris_bot`

**Username harus:**
- ✅ Diakhiri dengan `bot` atau `_bot`
- ✅ Unik (belum dipakai orang lain)
- ✅ Alfanumerik + underscore

**4. BotFather akan kasih:**
```
Done! Congratulations on your new bot...

Token: 1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

✅ **COPY TOKEN INI!** Simpan di notepad.

### Step 4.3: Setup Mini App

Masih di chat @BotFather, ketik:

**1. Ketik:**
```
/newapp
```

**2. Pilih bot Anda:**
Klik nama bot yang baru dibuat: `@superaiperp_aris_bot`

**3. BotFather tanya "Send me the title":**
```
SuperAI Perp
```

**4. BotFather tanya "Send me a description":**
```
Perpetual Futures Trading on TON Blockchain. Trade TON, BTC, ETH with up to 20x leverage. Powered by TON Connect.
```

**5. BotFather tanya "Send me a photo":**
- Skip dulu, ketik: `/empty`

**6. BotFather tanya "Send me an animation":**
- Skip, ketik: `/empty`

**7. BotFather tanya "Send me the Web App URL":**
```
https://ai-perp-hackaton.vercel.app
```

(Paste URL Vercel Anda dari Step 3.6)

**8. BotFather tanya "Provide a short name":**
```
superaiperp
```

Ini untuk URL: `t.me/superaiperp_aris_bot/superaiperp`

**9. BotFather akan konfirmasi:**
```
Done! Your Web App superaiperp is now available.
```

✅ **Mini App berhasil dibuat!**

### Step 4.4: Setup Bot Commands (Optional)

Masih di @BotFather, ketik:

```
/mybots
```

1. Pilih bot Anda
2. Klik **"Edit Bot"**
3. Klik **"Edit Commands"**
4. Paste ini:

```
start - Launch SuperAI Perp DEX
balance - Check wallet balance
positions - View open positions
help - Get help and documentation
```

5. Send message
6. ✅ Commands tersimpan

### Step 4.5: Set Menu Button

Masih di @BotFather:

```
/mybots
```

1. Pilih bot Anda
2. Klik **"Bot Settings"**
3. Klik **"Menu Button"**
4. Klik **"Configure menu button"**
5. Ketik text untuk button:
```
🚀 Trade Now
```

6. BotFather tanya URL, paste:
```
https://ai-perp-hackaton.vercel.app
```

✅ **Menu button tersimpan!**

---

## 🧪 BAGIAN 5: TEST DI TELEGRAM (5 MENIT)

### Step 5.1: Buka Bot

Di Telegram:

1. Search bot Anda: `@superaiperp_aris_bot`
2. Klik chat
3. Klik **"START"** atau ketik `/start`

### Step 5.2: Launch Mini App

Ada 2 cara:

**Cara 1: Menu Button**
- Klik tombol **"🚀 Trade Now"** di bawah (sebelah input text)

**Cara 2: Command**
- Ketik `/start`
- Atau klik icon **"☰"** (menu) di bawah kiri

### Step 5.3: Test Aplikasi

Mini App akan buka di dalam Telegram! 🎉

**Test ini:**
- ✅ Aplikasi loading dengan benar
- ✅ Dark theme otomatis
- ✅ Connect TON wallet (jika ada)
- ✅ Lihat market stats
- ✅ Coba buka posisi
- ✅ Coba close posisi

**Telegram-specific features:**
- ✅ Swipe down untuk close app
- ✅ Fullscreen (auto-expand)
- ✅ Native feel

---

## 🎉 SELESAI! CHECKLIST

Pastikan semua ini ✅:

- [ ] Frontend deployed ke Vercel → URL: `https://_____.vercel.app`
- [ ] Backend deployed ke Railway → URL: `https://_____.railway.app`
- [ ] Backend `/health` endpoint works
- [ ] Frontend bisa dibuka di browser
- [ ] Telegram bot created → Token saved
- [ ] Mini App configured → Web App URL set
- [ ] Menu button configured
- [ ] Mini App bisa dibuka dari Telegram
- [ ] TON wallet connect works (optional)

---

## 🆘 TROUBLESHOOTING COMMON ISSUES

### ❌ **Error: "Vercel build failed"**

**Solusi:**
1. Klik build logs di Vercel
2. Cari error message
3. Biasanya masalah:
   - Missing environment variables
   - TypeScript errors
   - Package version conflicts

**Fix:**
```bash
cd ~/ai-perp-hackaton/frontend
npm run build
# Fix errors locally first
git add .
git commit -m "fix: build errors"
git push
# Vercel auto-redeploy
```

### ❌ **Error: "Railway deployment failed"**

**Solusi:**
1. Check logs di Railway dashboard
2. Pastikan `DATABASE_URL` sudah set
3. Pastikan Root Directory = `backend`

**Fix:**
```bash
# Test build locally
cd ~/ai-perp-hackaton/backend
npm run build
# Fix errors
git push
```

### ❌ **Error: "Mini App tidak buka di Telegram"**

**Solusi:**
1. Check Web App URL di BotFather correct
2. Pastikan URL HTTPS (bukan HTTP)
3. Test URL di browser dulu
4. Update URL di BotFather:
   ```
   /mybots → Select bot → Edit Bot → Edit Web App → Edit Web App URL
   ```

### ❌ **Error: "TON Connect tidak muncul"**

**Solusi:**
1. Check `NEXT_PUBLIC_MANIFEST_URL` di Vercel
2. Pastikan manifest file accessible:
   ```
   https://your-app.vercel.app/tonconnect-manifest.json
   ```
3. Update manifest dengan domain yang benar

### ❌ **Error: "Backend API tidak konek"**

**Solusi:**
1. Check `NEXT_PUBLIC_API_URL` di Vercel environment variables
2. Test backend health endpoint:
   ```
   https://your-backend.railway.app/health
   ```
3. Check CORS settings di backend
4. Update `ORIGIN` environment variable di Railway:
   ```
   ORIGIN=https://your-frontend.vercel.app
   ```

---

## 📱 NEXT STEPS

Setelah Mini App jalan:

### 1. **Improve UI untuk Mobile**
- Responsive design
- Larger touch targets
- Bottom navigation

### 2. **Add Haptic Feedback**
Update components dengan vibration:

```typescript
import { vibrate } from '@/providers/telegram-provider';

function handleClick() {
  vibrate('medium'); // Vibrate on tap
  // ... rest of logic
}
```

### 3. **Use Native Telegram Alerts**

```typescript
import { showTelegramAlert, showTelegramConfirm } from '@/providers/telegram-provider';

// Replace alert()
showTelegramAlert('Position closed successfully!');

// Replace confirm()
showTelegramConfirm('Close this position?', (confirmed) => {
  if (confirmed) {
    // Do something
  }
});
```

### 4. **Add Sharing Features**

```typescript
const shareUrl = `https://t.me/share/url?url=https://t.me/your_bot&text=Check out SuperAI Perp DEX!`;
```

### 5. **Polish & Test**
- Test di iOS dan Android
- Test dengan real TON wallet
- Get feedback dari users

---

## 🏆 TIPS UNTUK HACKATHON

1. **Demo Video:**
   - Record screen opening dari Telegram
   - Show smooth UX
   - Highlight TON integration

2. **Pitch Points:**
   - ✅ "First Perpetual DEX dalam Telegram Mini Apps"
   - ✅ "Seamless TON wallet integration"
   - ✅ "No browser needed, trade directly from Telegram"
   - ✅ "Perfect UX for TON ecosystem users"

3. **Documentation:**
   - Clear README with screenshots
   - Live demo link
   - Bot username untuk testing

---

## 📞 NEED HELP?

Kalau stuck di step tertentu:

1. Check error logs (Vercel/Railway dashboard)
2. Test locally first: `npm run dev`
3. Ask di Telegram developer community
4. Check official docs:
   - https://core.telegram.org/bots/webapps
   - https://vercel.com/docs
   - https://docs.railway.app

---

**Good luck dengan hackathon! 🚀🏆**
