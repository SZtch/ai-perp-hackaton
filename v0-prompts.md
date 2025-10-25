# 🎨 V0 Prompts untuk SuperAI Perp DEX

Gunakan prompts ini di https://v0.dev untuk generate UI components yang lebih bagus.

---

## 🏠 1. TRADING DASHBOARD (Main Page)

```
Create a modern perpetual futures trading dashboard with dark mode theme using Next.js 14, TypeScript, and Tailwind CSS.

Requirements:
- Dark background (slate-950/slate-900 gradient)
- Glassmorphism effect for cards (backdrop-blur, semi-transparent borders)
- Responsive layout (mobile-first, tablet, desktop)
- Three main sections:
  1. Header with wallet connection (TON Connect), balance display, network indicator
  2. Main trading area with:
     - Market stats (TON/USDT, BTC/USDT, ETH/USDT) showing price, 24h change with green/red colors
     - Tabs: "Open Position", "Positions", "History"
     - Open Position form with symbol selector, BUY/SELL toggle (green/red), leverage slider (1x-20x), margin input
  3. Sidebar with:
     - PnL summary card (total value, unrealized PnL, margin used)
     - Quick deposit/withdraw buttons
     - Recent activity feed

Design style:
- Futuristic/cyberpunk aesthetic
- Smooth animations (hover effects, transitions)
- Gradient accents (blue-500 to purple-600 for primary actions)
- Card shadows and glows
- Neon-like borders for important elements
- Icons: use lucide-react (TrendingUp, TrendingDown, Wallet, Settings, etc)

Color palette:
- Background: slate-950, slate-900
- Cards: slate-800/90 with backdrop-blur
- Text: slate-100 (primary), slate-400 (secondary)
- Success: green-400/500
- Error: red-400/500
- Accent: blue-500, purple-600
- Borders: slate-700/50

Make it look professional like Binance Futures or dYdX but with TON blockchain branding.
```

---

## 📊 2. POSITIONS LIST (Active Positions)

```
Create a positions list component for a perpetual DEX with dark mode using Next.js, TypeScript, and Tailwind CSS.

Requirements:
- Show list of active trading positions
- Each position card displays:
  - Symbol (e.g., TON/USDT) with icon
  - Side: LONG (green) or SHORT (red) badge with leverage (e.g., "LONG 10x")
  - Entry price vs Current price with arrow indicator
  - Position size and margin used
  - Unrealized PnL with large font (green if profit, red if loss)
  - ROE percentage
  - Liquidation price with warning color (orange/yellow)
  - Margin ratio progress bar (green → yellow → red as it increases)
  - Close position button (red, prominent)
- Empty state: Show friendly message with icon when no positions
- Loading state: Skeleton loaders with shimmer effect
- Responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop

Design:
- Dark theme (slate-800 cards on slate-900 background)
- Glassmorphism cards with backdrop-blur
- Smooth hover effects (lift card, show glow)
- Animated PnL numbers (count-up effect)
- Status indicators with pulse animation
- Icons from lucide-react (TrendingUp, TrendingDown, AlertTriangle, X)

Include confirmation modal when closing position with:
- Position summary
- Final PnL preview
- "Confirm Close" button (red) and "Cancel" button

Make it modern, clean, and easy to scan at a glance.
```

---

## 💰 3. WALLET MANAGEMENT (Deposit/Withdraw)

```
Create a wallet management component with tabs for Deposit and Withdraw using Next.js 14, TypeScript, and Tailwind CSS with dark mode.

Requirements:

Deposit Tab:
- Display available balance prominently
- Amount input field with USDT suffix
- Quick amount buttons: +10, +50, +100, +500, Max
- TON wallet address input (auto-filled if connected)
- Transaction hash input (for test mode)
- Deposit button (gradient blue-purple, large)
- Recent deposits list (time, amount, status with colored badges)

Withdraw Tab:
- Display available balance (excluding locked margin)
- Destination TON address input
- Amount input with withdraw fee calculator (shows: "Amount + Fee = Total")
- Warning message if withdrawing > 50% of balance
- Withdraw button (gradient, disabled if insufficient balance)
- Recent withdrawals list with status tracking

Design:
- Dark theme (slate-800/900 background)
- Glassmorphism cards
- Gradient buttons with hover effects
- Form validation with error messages (red text, shake animation)
- Success animations (checkmark, confetti)
- Balance displays with large, bold fonts
- Icons: Wallet, Send, Download, DollarSign, Info
- Tooltips for fee explanations
- Loading states with spinners

Layout:
- Tabs at top (Deposit | Withdraw)
- Smooth tab transition with slide animation
- Mobile responsive (full width on mobile, max-w-2xl on desktop)

Make it feel secure and professional like a modern crypto exchange.
```

---

## 📈 4. MARKET STATS & PRICE CARDS

```
Create a market statistics component showing real-time crypto prices for a perpetual DEX with dark mode.

Requirements:
- Display 3 trading pairs: TON/USDT, BTC/USDT, ETH/USDT
- Each price card shows:
  - Crypto logo/icon
  - Symbol name
  - Current price (large, bold)
  - 24h price change (percentage and USD amount)
  - Green for positive, red for negative with up/down arrows
  - Sparkline chart (mini line chart showing 24h trend)
  - "Live" indicator badge with pulse animation
  - Volume and market cap (optional, smaller text)
- Horizontal scrollable on mobile, grid on desktop
- Auto-refresh animation every 2-3 seconds (subtle highlight pulse)

Design:
- Dark theme (slate-800 cards with gradient borders)
- Glassmorphism effect
- Animated numbers (smooth transitions when price updates)
- Hover effects: lift card, glow border
- Gradient backgrounds based on trend (green tint for up, red tint for down)
- Typography: Price in 2xl font, symbols in lg font
- Icons: TrendingUp, TrendingDown, Activity for sparkline
- Responsive: horizontal scroll on mobile, grid (3 columns) on desktop

Additional features:
- Click card to select trading pair
- Selected state: highlighted border, brighter glow
- Loading skeleton while fetching prices
- Error state: show "Connection lost" with retry button

Make it dynamic and exciting, like watching live market data on Bloomberg Terminal.
```

---

## 🎯 5. OPEN POSITION FORM (Order Entry)

```
Create a trading order form for opening positions in a perpetual DEX with dark mode.

Requirements:
- Symbol selector dropdown (TON/USDT, BTC/USDT, ETH/USDT)
  - Show current price next to each symbol
  - Search functionality
- Side selector: BUY (green) / SELL (red)
  - Large toggle button with smooth transition
  - Icon changes: TrendingUp for BUY, TrendingDown for SELL
- Leverage slider (1x to 20x)
  - Visual slider with gradient fill
  - Current leverage display in large text
  - Warning badges: "Medium Risk" (5-10x), "High Risk" (>10x)
- Margin amount input
  - USDT currency suffix
  - Shows available balance below
  - Quick percentage buttons: 25%, 50%, 75%, 100%
- Position size calculator (auto-calculated)
  - Shows: Position Size = Margin × Leverage
  - Display in large, highlighted text
- Estimated liquidation price
  - Warning color (orange/red)
  - Explanation tooltip
- Submit button:
  - Green for LONG, Red for SHORT
  - Shows "Open LONG Position" or "Open SHORT Position"
  - Disabled state if insufficient balance
  - Loading state with spinner

Design:
- Dark theme (slate-800 card on slate-900 background)
- Form fields with focus states (blue glow)
- Smooth animations and transitions
- Error messages below inputs (red text with icon)
- Tooltips with question mark icons for explanations
- Icons: Search, TrendingUp/Down, DollarSign, AlertTriangle, Info
- Responsive: single column, full width on mobile

Validation:
- Minimum order size check
- Maximum leverage per symbol
- Insufficient balance warning
- Real-time calculation updates

Make it intuitive and safe-feeling, preventing user errors with clear feedback.
```

---

## 🎨 6. COMPLETE THEME TOKENS

```
Create a complete design system configuration for a perpetual DEX trading platform with dark mode.

Requirements:
- Full Tailwind CSS color palette extension
- Color tokens:
  - Background layers: bg-primary, bg-secondary, bg-tertiary
  - Surface colors: card, elevated-card, modal-backdrop
  - Text colors: text-primary, text-secondary, text-tertiary, text-disabled
  - Trading colors: long-green, short-red, neutral
  - Status colors: success, error, warning, info
  - Accent colors: primary-gradient, secondary-gradient
- Spacing scale (consistent padding/margin)
- Border radius tokens (rounded-sm to rounded-2xl)
- Shadow tokens (elevation-1 to elevation-5)
- Animation presets:
  - Fade in/out
  - Slide up/down/left/right
  - Pulse (for live indicators)
  - Shimmer (for loading states)
  - Glow (for hover states)
- Typography scale:
  - Headings: h1-h6
  - Body: body-lg, body-md, body-sm
  - Display: display-lg, display-md (for large numbers like prices)
  - Monospace: code-lg, code-md (for addresses, hashes)

Export as:
1. tailwind.config.ts with extended theme
2. globals.css with CSS custom properties
3. TypeScript constants file for programmatic access

Base color palette:
- Primary: Slate (950, 900, 800, 700, 600, 500, 400, 300, 200, 100)
- Accent: Blue (600, 500, 400) and Purple (600, 500, 400)
- Success: Green (500, 400)
- Error: Red (500, 400)
- Warning: Orange (500, 400)
- Info: Cyan (500, 400)

Include glass morphism utilities:
- Backdrop blur values
- Semi-transparent backgrounds
- Border opacities

Make it consistent, scalable, and modern for a professional trading platform.
```

---

## 📱 7. RESPONSIVE MOBILE NAVIGATION

```
Create a mobile-optimized navigation component for a perpetual DEX with dark mode.

Requirements:
- Bottom navigation bar for mobile (< 768px)
  - 4 main tabs: Trade, Positions, Wallet, Profile
  - Icons with labels
  - Active state: filled icon, accent color, small indicator dot
  - Smooth transitions between tabs
- Top header bar:
  - Logo/branding (left)
  - Wallet connection button (right)
  - Balance display (collapsible)
  - Network status indicator
- Hamburger menu for secondary actions:
  - Settings
  - Transaction history
  - Help/Docs
  - Disconnect wallet
  - Dark mode toggle (even though always dark, for future)
- Slide-out drawer animation from right
- Overlay backdrop when menu open

Desktop (>= 768px):
- Sidebar navigation (left)
  - Logo at top
  - Main navigation items (vertical)
  - Secondary items at bottom
  - Collapsed/expanded states
- Top bar:
  - Breadcrumbs
  - Wallet info
  - User menu dropdown

Design:
- Dark theme with glassmorphism
- Smooth animations (slide, fade)
- Icons from lucide-react
- Badge notifications (red dot for alerts)
- Haptic feedback indicators
- Active states with accent colors
- Hover effects on desktop

Make navigation intuitive and accessible on all screen sizes.
```

---

## 🚀 CARA MENGGUNAKAN PROMPTS INI:

### Step 1: Buka V0
Kunjungi: https://v0.dev

### Step 2: Pilih Prompt
Copy salah satu prompt di atas (misalnya "Trading Dashboard")

### Step 3: Paste & Generate
- Paste prompt ke V0
- Klik "Generate"
- Tunggu V0 membuat design + code

### Step 4: Customize
- Preview hasil di V0
- Adjust warna, spacing jika perlu
- Generate ulang jika perlu

### Step 5: Download Code
- Copy code yang di-generate V0
- Paste ke project kita di `frontend/src/components/`

### Step 6: Install Dependencies (jika perlu)
Jika V0 pakai library tambahan:
```bash
cd ~/ai-perp-hackaton/frontend
npm install lucide-react framer-motion recharts
```

---

## 💡 TIPS:

1. **Mulai dari yang kecil**: Generate 1 component dulu (misalnya Market Stats)
2. **Iterasi**: Kalau kurang bagus, edit prompt dan generate lagi
3. **Mix & Match**: Combine hasil dari beberapa generation
4. **Konsisten**: Pastikan semua components pakai color palette yang sama
5. **Test Mobile**: Selalu test responsiveness di mobile view

---

## 🎨 COLOR PALETTE REFERENCE (untuk konsistensi):

```
Background:
- Primary: #020617 (slate-950)
- Secondary: #0f172a (slate-900)
- Card: #1e293b (slate-800)

Text:
- Primary: #f1f5f9 (slate-100)
- Secondary: #94a3b8 (slate-400)

Accent:
- Primary: #3b82f6 (blue-500)
- Secondary: #8b5cf6 (purple-500)

Trading:
- Long/Buy: #22c55e (green-500)
- Short/Sell: #ef4444 (red-500)

Status:
- Warning: #f59e0b (orange-500)
- Info: #06b6d4 (cyan-500)
```

---

## 📝 RECOMMENDED ORDER:

1. ✅ **Market Stats** (paling kecil, test dulu)
2. ✅ **Open Position Form**
3. ✅ **Positions List**
4. ✅ **Trading Dashboard** (main page)
5. ✅ **Wallet Management**
6. ✅ **Navigation** (terakhir)

---

Silakan mulai dari **Market Stats** dulu untuk test! 🚀
