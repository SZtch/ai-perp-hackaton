# 🎨 V0.dev Prompt Templates for Trading Dashboard
## Complete Guide untuk Generate UI Design yang Perfect

---

## 📋 Table of Contents
1. [Basic Prompt Structure](#basic-prompt-structure)
2. [Complete Trading Dashboard Prompt](#complete-trading-dashboard-prompt)
3. [Component-by-Component Prompts](#component-by-component-prompts)
4. [Design Specifications](#design-specifications)
5. [Integration Requirements](#integration-requirements)
6. [Tips & Best Practices](#tips--best-practices)

---

## 1. Basic Prompt Structure

### Template Dasar
```
[WHAT] - Apa yang ingin dibuat
[TECH STACK] - Technology yang digunakan
[FEATURES] - Fitur-fitur yang dibutuhkan
[DESIGN] - Style dan appearance
[LAYOUT] - Structure dan organization
[INTERACTIONS] - Behavior dan animations
[DATA] - Data structure dan API
```

---

## 2. Complete Trading Dashboard Prompt

### 🔥 MASTER PROMPT - Copy & Paste Ready

```markdown
Create a professional cryptocurrency perpetual futures trading dashboard using React, TypeScript, and Tailwind CSS. Dark mode optimized with glassmorphism effects.

## Core Features Required:

### 1. Main Layout
- Left sidebar navigation (64px width) with icons for:
  - Trading (active)
  - Pools
  - Staking
  - More options
  - Dark/Light mode toggle
  - Logout button
- Top header bar with:
  - Symbol selector (ETH/USD, BTC/USD, TON/USD) with cryptocurrency icons
  - Leverage indicator (5x, 10x, 20x, 50x, 100x selectable)
  - Live price display with green/red price change
  - Balance, Equity, and Total PnL stats in card format
  - "Connect TON Wallet" button (purple gradient)
  - User avatar
- Main content area split into:
  - Left: Price chart with candlesticks and controls
  - Right: Trading panel (384px width)
  - Bottom: Positions table

### 2. Trading Panel (Right Sidebar)
- Market/Limit order tabs
- Long/Short toggle buttons (green for Long, red for Short)
- Leverage selector dropdown (5x, 10x, 20x, 50x, 100x)
- Available balance display
- Testnet faucet button ("Claim $1000 USDT") with cooldown timer
- Order size input field with USD denomination
- Percentage slider (0%, 25%, 50%, 75%, 100%)
- "Add Take Profit / Stop Loss" button
- Large "Buy / Long" or "Sell / Short" CTA button (gradient, shimmer effect)
- Order details section showing:
  - Required margin
  - Trading fee (0.1%)
  - Estimated liquidation price

### 3. Price Chart Area
- Timeframe selector (5m, 15m, 1h, 4h, 1D, 1W)
- Chart type selector
- Indicators button
- Settings and fullscreen controls
- Live price ticker with symbol and timestamp
- Interactive candlestick chart with:
  - Volume bars
  - Grid lines
  - Current price indicator on right axis
  - Time labels on bottom axis

### 4. Positions Table (Bottom)
- Tabs: Positions, Orders, History
- Badge showing number of open positions
- Table columns:
  - Market (symbol)
  - Side (Long/Short badge)
  - Leverage
  - Entry Price
  - Mark Price
  - Size (USD)
  - Margin (USD)
  - PnL (green/red with %)
  - ROE (Return on Equity %)
  - Liquidation Price
  - Close button
- "Close All Positions" button in header
- Empty state: Icon + "No active position" message

### 5. Wallet Integration
- TON Connect integration UI
- Unique deposit address display
- QR code for deposits
- Transaction history
- Withdraw form with address input

## Design Specifications:

### Color Palette (Dark Mode):
```css
Background: Linear gradient from #0a0b0f via #0d0e13 to #0a0b0f
Cards: Gradient from #16171e/90 to #1a1b23/80 with backdrop-blur
Borders: #1f2029/80 with subtle purple glow (#8b5cf6/20)
Text Primary: #f9fafb (gray-50)
Text Secondary: #9ca3af (gray-400)
Text Tertiary: #6b7280 (gray-500)

Accent Colors:
- Purple (Primary): #8b5cf6 → #7c3aed
- Green (Long/Profit): #10b981 → #059669
- Red (Short/Loss): #ef4444 → #dc2626
- Blue (Info): #3b82f6 → #2563eb
```

### Typography:
- Font Family: Inter, system-ui, sans-serif
- Headers: Bold (700), 16-20px
- Body: Medium (500), 14px
- Small Text: Normal (400), 12px
- Numbers: Tabular nums, monospace for prices

### Spacing:
- Component padding: 24px (lg)
- Card padding: 16-20px
- Gap between elements: 12-16px
- Border radius: 12px (xl) for cards, 8px (lg) for buttons

### Effects:
- Glassmorphism: backdrop-blur-xl with gradient overlays
- Shadows: Subtle purple/600 shadows on cards (shadow-lg shadow-purple-500/5)
- Hover states: Scale 1.02, brightness increase, shadow enhancement
- Transitions: 300ms ease-in-out for all interactions
- Shimmer effect on CTA buttons (gradient sweep animation)

## Interactive Elements:

### Buttons:
- Primary CTA: Large gradient button with shimmer animation on hover
- Long button: Green gradient (from-green-600 to-emerald-600)
- Short button: Red gradient (from-red-600 to-rose-600)
- Ghost buttons: Transparent with border, hover to fill
- All buttons: rounded-xl, font-bold, shadow effects

### Inputs:
- Background: Card gradient with subtle border
- Focus: Purple border glow with ring effect
- Placeholder: Gray-700 (dark mode)
- Large inputs for order size: 20px font, bold

### Cards:
- All stat cards: Individual glassmorphic cards with glow borders
- Hover: Enhanced shadow, subtle scale
- Padding: Generous (16-24px)
- Border radius: 12px

## Data Structure Example:

```typescript
interface Position {
  id: string;
  symbol: 'ETHUSDT' | 'BTCUSDT' | 'TONUSDT';
  side: 'LONG' | 'SHORT';
  size: number;
  entryPrice: number;
  markPrice: number;
  leverage: number;
  margin: number;
  unrealizedPnl: number;
  roe: number;
  liquidationPrice: number;
}

interface Portfolio {
  wallet: {
    balance: number;
    locked: number;
    available: number;
    equity: number;
    unrealizedPnl: number;
    depositAddress: string;
  };
  positions: Position[];
  stats: {
    totalPositions: number;
    totalVolume: number;
    totalPnl: number;
  };
}
```

## Required Components:

1. TradingDashboard (main layout)
2. Sidebar (navigation)
3. HeaderBar (top stats and controls)
4. TradingPanel (order form)
5. PriceChart (candlestick chart)
6. PositionsTable (bottom table)
7. StatCard (reusable stat display)
8. Button (reusable button component)
9. Input (reusable input component)

## Responsive Behavior:

- Desktop (1024px+): Full layout as described
- Tablet (768-1023px): Collapsible trading panel
- Mobile (<768px):
  - Stack vertically
  - Bottom tab navigation
  - Chart takes full width
  - Trading panel as bottom sheet

## Animations:

- Page load: Fade in with stagger
- Position updates: Highlight flash (green/red)
- Price changes: Number tick animation
- Button hover: Shimmer sweep effect
- Modal open: Slide up + fade
- Toast notifications: Slide in from top-right

## Accessibility:

- All buttons have aria-labels
- Keyboard navigation support
- Focus indicators on all interactive elements
- Screen reader friendly table structure
- Color contrast WCAG AA compliant

## Integration Points:

- TON Connect wallet integration
- WebSocket for real-time prices
- REST API for orders and positions
- Local storage for user preferences
- Error boundaries for graceful failures

Generate the complete dashboard with all components, proper TypeScript types, and Tailwind CSS classes. Make it production-ready with proper state management, error handling, and loading states.
```

---

## 3. Component-by-Component Prompts

Jika Anda ingin generate per component:

### 3.1 Sidebar Navigation

```markdown
Create a vertical sidebar navigation component for a trading dashboard using React, TypeScript, and Tailwind CSS (dark mode).

Requirements:
- Width: 64px
- Dark background with gradient overlay
- Premium purple gradient logo at top (48px x 48px rounded-xl)
- Navigation icons in the middle:
  * TrendingUp (Trading - active with purple-600 bg)
  * Layers (Pools - disabled)
  * Target (Staking - disabled)
  * MoreHorizontal (More - disabled)
- Bottom section:
  * Sun/Moon icon (theme toggle)
  * Activity icon (purple gradient circle)
  * Logout button (⎋ symbol)
- Tooltips on hover showing icon labels
- Smooth hover states with scale and glow effects
- Active state: Purple gradient with shadow
- Disabled state: Gray and reduced opacity

Use lucide-react for icons. Include TypeScript types for props.
```

### 3.2 Trading Panel

```markdown
Create a trading order panel component for perpetual futures using React, TypeScript, and Tailwind CSS (dark mode).

Requirements:
- Width: 384px, fixed right sidebar
- Tabs: Market / Limit (bold font, purple underline on active)
- Long/Short toggle:
  * Long: Green gradient (from-green-600 to-emerald-600)
  * Short: Red gradient (from-red-600 to-rose-600)
  * Shimmer animation on active button
- Leverage selector: Dropdown with 5x, 10x, 20x, 50x, 100x
- Available balance card (glassmorphic design)
- Faucet button: "Claim $1000 USDT" or cooldown timer
- Order size input:
  * Large bold text (20px)
  * USD suffix on right
  * Purple focus ring
  * Glassmorphic background
- Percentage slider: 0-100% with purple fill
- Checkbox options:
  * Reduce Only
  * Protected Order
- "Add TP/SL" button (ghost style)
- Large CTA button:
  * "Buy / Long" (green gradient) or "Sell / Short" (red gradient)
  * Shimmer effect on hover
  * Loading spinner when processing
  * Display leverage (e.g., "20x") when amount is entered
- Order details card showing:
  * Required margin
  * Trading fee (0.1%)
  * Liquidation price

Include proper TypeScript interfaces for order data. Handle validation and loading states.
```

### 3.3 Positions Table

```markdown
Create a positions table component for trading dashboard using React, TypeScript, and Tailwind CSS (dark mode).

Requirements:
- Tabs: Positions (with count badge), Orders, History
- Table columns:
  * Market: Symbol with icon (ETH/USD, BTC/USD, TON/USD)
  * Side: Badge (green for LONG, red for SHORT)
  * Leverage: Number with "x" suffix
  * Entry Price: $ format with 2 decimals
  * Mark Price: $ format with 2 decimals
  * Size: $ format (position notional)
  * Margin: $ format (locked margin)
  * PnL: Green/red with +/- and $ format
  * ROE: Green/red percentage
  * Liq. Price: Orange color, $ format
  * Action: "Close" button (red on hover)
- Header features:
  * Tab selector with active underline
  * "Close All Positions" button (right side, red text)
- Empty state:
  * Centered icon (search/magnifying glass)
  * "No active position" text
  * "Open a new position to see it here" subtext
- Row hover: Subtle background highlight
- Responsive: Horizontal scroll on mobile

Include TypeScript interface for Position type. Use react-icons for cryptocurrency logos.
```

### 3.4 Price Chart

```markdown
Create a candlestick price chart component using React, TypeScript, and Tailwind CSS (dark mode).

Requirements:
- Full width, flexible height
- Top controls bar:
  * Timeframe selector: 5m, 15m, 1h, 4h, 1D, 1W (purple on active)
  * Chart type button (BarChart2 icon)
  * Indicators button with "ƒₓ" symbol
  * Settings icon (right side)
  * Fullscreen icon (right side)
- Price ticker bar below controls:
  * Symbol name with icon
  * Live indicator (green pulsing dot)
  * Current price (green/red based on change)
  * Last update timestamp
- SVG candlestick chart:
  * Green candles for up, red for down
  * Wicks showing high/low
  * Grid lines (8 horizontal)
  * Price labels on right axis
  * Time labels on bottom axis
  * Current price box on right (green bg, white text)
  * Price indicator line extending to box
- Responsive: Adjusts to container size
- Smooth rendering with proper scaling

Use native SVG for chart rendering. Include TypeScript types for candle data:
```typescript
interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  timestamp: number;
}
```
```

### 3.5 Wallet Connect Button

```markdown
Create a TON wallet connection component using React, TypeScript, and Tailwind CSS (dark mode).

Requirements:
- Disconnected state:
  * Button text: "Connect TON Wallet"
  * Icon: Wallet icon (lucide-react)
  * Gradient: from-purple-600 via-purple-500 to-blue-600
  * Shimmer animation on hover (gradient sweep)
  * Large shadow: shadow-lg shadow-purple-600/40
  * Bold font, rounded-xl
- Connected state:
  * Available balance card:
    - Green amount in bold
    - "Available" label
    - Glassmorphic background
  * Address button:
    - Shows truncated address (0x1234...5678)
    - Green pulsing dot indicator
    - ChevronDown icon
    - Dropdown on click showing:
      • Full address (copy button)
      • Disconnect option
      • View transactions link
- Avatar circle on far right:
  * Gradient background (purple to blue)
  * 36px diameter
  * Smooth shadow

Include @tonconnect/ui-react integration examples. Handle loading and error states.
```

### 3.6 Stat Cards (Header)

```markdown
Create reusable statistic card components for trading dashboard header using React, TypeScript, and Tailwind CSS (dark mode).

Requirements:
- Individual cards with:
  * Glassmorphic background (backdrop-blur-xl)
  * Gradient border with subtle purple glow
  * Padding: 16px
  * Rounded: 12px
  * Soft shadow
- Content structure:
  * Label (small, gray-400, 10px font)
  * Value (bold, 14px font, colored)
- Color coding:
  * Last Price: Green-400
  * Balance: Blue-400
  * Equity: Cyan-400
  * Total PnL: Green-400 (positive) / Red-400 (negative)
- Hover effect:
  * Subtle scale (1.02)
  * Enhanced shadow
  * Smooth transition (300ms)
- Loading state: Skeleton pulse animation
- Error state: Red border with warning icon

Props interface:
```typescript
interface StatCardProps {
  label: string;
  value: string | number | React.ReactNode;
  valueColor?: string;
  icon?: React.ReactNode;
  loading?: boolean;
  error?: boolean;
}
```

Make it reusable and flexible for different data types.
```

---

## 4. Design Specifications

### 4.1 Design System Prompt

```markdown
Create a design system configuration file for a dark mode trading dashboard using Tailwind CSS.

Include:

1. Color Palette:
```javascript
colors: {
  background: {
    primary: '#0a0b0f',
    secondary: '#13141a',
    tertiary: '#1a1b23',
  },
  card: {
    base: 'linear-gradient(135deg, #16171e 0%, #1a1b23 100%)',
    hover: '#1f212a',
  },
  border: {
    default: '#1f2029',
    glow: '#8b5cf6',
  },
  text: {
    primary: '#f9fafb',
    secondary: '#9ca3af',
    tertiary: '#6b7280',
  },
  accent: {
    purple: { from: '#8b5cf6', to: '#7c3aed' },
    green: { from: '#10b981', to: '#059669' },
    red: { from: '#ef4444', to: '#dc2626' },
    blue: { from: '#3b82f6', to: '#2563eb' },
  }
}
```

2. Typography Scale:
- xs: 12px (small labels)
- sm: 14px (body text)
- base: 16px (default)
- lg: 18px (headings)
- xl: 20px (large headings)

3. Spacing System:
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

4. Border Radius:
- sm: 6px
- md: 8px
- lg: 12px
- xl: 16px
- full: 9999px

5. Shadow System:
- glow-sm: 0 0 10px rgba(139, 92, 246, 0.05)
- glow-md: 0 0 20px rgba(139, 92, 246, 0.1)
- glow-lg: 0 0 30px rgba(139, 92, 246, 0.15)

6. Animation Timings:
- fast: 150ms
- normal: 300ms
- slow: 500ms

Include Tailwind config with all custom values. Add CSS custom properties for runtime theming.
```

---

## 5. Integration Requirements

### 5.1 Full Stack Integration Prompt

```markdown
Create integration layer for trading dashboard connecting React frontend with Node.js backend.

Frontend Requirements:

1. API Client Setup:
```typescript
// Axios instance with interceptors
// Base URL configuration
// JWT token management
// Request/response logging
// Error handling middleware
```

2. Service Layer:
```typescript
// TradingService (orders, positions)
// WalletService (balance, deposits, withdrawals)
// PortfolioService (stats, history)
// PriceService (real-time prices via WebSocket)
// FaucetService (testnet funding)
```

3. State Management:
- AuthContext (user, login, logout)
- PortfolioContext (balance, positions, stats)
- PriceContext (real-time market data)
- ToastContext (notifications)
- ThemeContext (dark/light mode)

4. Custom Hooks:
```typescript
useAuth() // Authentication state and methods
usePortfolio() // Portfolio data with auto-refresh
usePrices() // Real-time price updates
useWebSocket() // WebSocket connection manager
useFaucet() // Faucet claim logic
```

5. TypeScript Interfaces:
- Match backend API response types
- Proper error types
- Loading state types
- Success response types

Backend API Endpoints Needed:

```
POST /api/auth/login
POST /api/auth/logout
GET /api/wallet
POST /api/wallet/deposit
POST /api/wallet/withdraw
GET /api/portfolio
POST /api/trading/order
GET /api/trading/positions
POST /api/trading/positions/:id/close
GET /api/trading/prices
WS /ws/prices
POST /api/faucet/claim
GET /api/faucet/info
```

Include:
- Error boundary components
- Loading skeletons
- Toast notification system
- Retry logic for failed requests
- Optimistic UI updates
- Real-time data synchronization

Generate complete integration code with proper TypeScript types and error handling.
```

---

## 6. Tips & Best Practices

### 6.1 How to Get Better Results from v0.dev

**DO's ✅**

```markdown
✅ Be specific about tech stack: "React 18, TypeScript, Tailwind CSS 3.x"
✅ Mention design style: "Dark mode, glassmorphism, modern, professional"
✅ List exact features needed: "Order form, positions table, price chart"
✅ Provide color codes: "#8b5cf6 for purple, #10b981 for green"
✅ Include data structures: Show TypeScript interfaces
✅ Specify interactions: "Hover shows tooltip, click opens modal"
✅ Request responsive behavior: "Mobile: bottom sheet, Desktop: sidebar"
✅ Ask for accessibility: "ARIA labels, keyboard navigation"
```

**DON'Ts ❌**

```markdown
❌ Vague requests: "Make it look nice"
❌ Too many features at once: Break into components
❌ No context: Explain what the app does
❌ Missing tech details: Always specify React + Tailwind
❌ Forget about states: Mention loading, error, empty states
❌ Ignore mobile: Always ask for responsive design
```

### 6.2 Iterative Refinement Strategy

**Round 1: Base Structure**
```
"Create the main layout with sidebar, header, and content areas"
```

**Round 2: Add Components**
```
"Now add the trading panel with order form to the right side"
```

**Round 3: Enhance Design**
```
"Add glassmorphism effects and gradient backgrounds to all cards"
```

**Round 4: Interactions**
```
"Add hover animations and shimmer effects to buttons"
```

**Round 5: Integration**
```
"Connect to API and add loading/error states"
```

### 6.3 Component Library Approach

Generate components separately, then combine:

```markdown
Day 1: Generate and refine Sidebar
Day 2: Generate and refine Header
Day 3: Generate and refine Trading Panel
Day 4: Generate and refine Chart
Day 5: Generate and refine Positions Table
Day 6: Integrate everything
Day 7: Polish and add animations
```

---

## 7. Real Example Prompts

### 7.1 For Complete Dashboard (Simple Version)

```markdown
Create a cryptocurrency trading dashboard with:
- React + TypeScript + Tailwind CSS (dark mode)
- Left sidebar (64px) with navigation icons
- Top bar with crypto prices and wallet connection
- Main area: candlestick chart on left, trading panel on right (384px)
- Bottom: positions table
- Design: Dark background with purple accents, glassmorphism, gradients
- Features: Long/Short buttons, leverage selector, order form, live positions
- Make it look like Binance/Bybit but more modern
```

### 7.2 For Specific Feature

```markdown
Create just the trading order form panel for the right side of a trading dashboard:
- React + TypeScript + Tailwind
- Dark mode with glassmorphism
- 384px width
- Market/Limit tabs
- Green "Long" and Red "Short" toggle buttons with gradients
- Leverage dropdown (5x-100x)
- Balance display card
- Large order size input
- Percentage slider
- Big "Buy / Long" button with shimmer effect
- Order details: margin, fee, liq price
```

### 7.3 For Refinement

```markdown
Improve the existing button component:
- Add shimmer animation on hover (gradient sweep from left to right)
- Increase border radius to rounded-xl
- Add shadow: shadow-lg shadow-{color}-600/40
- Make the font bolder (font-bold)
- Add smooth transition (duration-300)
- Include loading state with spinner
- Add disabled state (opacity-40, cursor-not-allowed)
```

---

## 8. Post-Generation Checklist

After v0 generates code, check for:

- [ ] All TypeScript types are properly defined
- [ ] Dark mode colors are consistent
- [ ] Responsive breakpoints are included
- [ ] Loading states are handled
- [ ] Error states are handled
- [ ] Empty states are designed
- [ ] Hover effects are smooth
- [ ] Transitions are 300ms
- [ ] Buttons have proper disabled states
- [ ] Icons are from lucide-react or react-icons
- [ ] Gradients use proper Tailwind classes
- [ ] Shadows have proper opacity
- [ ] Component is accessible (ARIA labels)
- [ ] Code is production-ready
- [ ] No console.logs left in code

---

## 🎯 Quick Start Template

**Copy this and customize for your needs:**

```markdown
Create a [FEATURE_NAME] for a cryptocurrency trading dashboard.

Tech Stack:
- React 18 with TypeScript
- Tailwind CSS for styling
- Dark mode optimized
- Lucide React for icons

Features:
1. [Feature 1 description]
2. [Feature 2 description]
3. [Feature 3 description]

Design:
- Background: Dark gradient (#0a0b0f to #0d0e13)
- Cards: Glassmorphic with backdrop-blur
- Accent: Purple (#8b5cf6)
- Text: White (#f9fafb) primary, Gray-400 secondary
- Borders: Subtle with purple glow
- Shadows: Soft purple shadows
- Radius: 12px for cards, 8px for buttons

Layout:
[Describe structure]

Interactions:
- Hover: [describe hover effects]
- Click: [describe click behavior]
- Loading: [describe loading state]
- Error: [describe error handling]

Data Structure:
```typescript
interface YourDataType {
  // Your interface here
}
```

Make it production-ready with proper TypeScript types and all states handled.
```

---

## 💡 Pro Tips

1. **Start with Layout First**
   - Get the structure right before styling

2. **One Component at a Time**
   - Don't overwhelm v0 with too many features

3. **Be Visual**
   - Describe colors, sizes, positions clearly

4. **Reference Real Apps**
   - "Make it look like Binance" helps a lot

5. **Iterate Quickly**
   - Generate → Test → Refine → Repeat

6. **Save Good Prompts**
   - Reuse successful prompts for similar needs

7. **Combine Results**
   - Generate multiple variations, pick the best parts

---

## 📚 Additional Resources

- v0.dev Documentation: https://v0.dev
- Tailwind CSS Docs: https://tailwindcss.com
- Shadcn/ui Components: https://ui.shadcn.com
- Lucide Icons: https://lucide.dev
- React TypeScript: https://react-typescript-cheatsheet.netlify.app

---

**Happy Designing! 🎨✨**

Remember: The key to great v0 results is being specific about what you want while staying flexible about how it's achieved!
