# 🎨 Panduan Prompt V0.dev dalam Bahasa Indonesia
## Template Lengkap untuk Trading Dashboard

---

## 📋 Daftar Isi
1. [Prompt Master - Copy Langsung](#1-prompt-master---copy-langsung)
2. [Prompt Per Komponen](#2-prompt-per-komponen)
3. [Template Cepat](#3-template-cepat)
4. [Tips & Trik](#4-tips--trik)

---

## 1. PROMPT MASTER - Copy Langsung

### 🔥 PROMPT LENGKAP SIAP PAKAI

**Copy seluruh text di bawah ini dan paste ke v0.dev:**

```markdown
Buatkan dashboard trading cryptocurrency perpetual futures yang profesional menggunakan React, TypeScript, dan Tailwind CSS. Optimized untuk dark mode dengan efek glassmorphism.

## Fitur-Fitur yang Dibutuhkan:

### 1. Layout Utama
- Sidebar kiri (lebar 64px) dengan ikon navigasi untuk:
  - Trading (aktif)
  - Pools
  - Staking
  - More (lainnya)
  - Toggle dark/light mode
  - Tombol logout
- Header bar atas dengan:
  - Selector simbol crypto (ETH/USD, BTC/USD, TON/USD) dengan ikon cryptocurrency
  - Indikator leverage yang bisa dipilih (5x, 10x, 20x, 50x, 100x)
  - Tampilan harga live dengan perubahan warna hijau/merah
  - Kartu statistik untuk Balance, Equity, dan Total PnL
  - Tombol "Connect TON Wallet" dengan gradient ungu
  - Avatar user
- Area konten utama dibagi menjadi:
  - Kiri: Chart harga dengan candlestick dan kontrol
  - Kanan: Panel trading (lebar 384px)
  - Bawah: Tabel posisi

### 2. Panel Trading (Sidebar Kanan)
- Tab Market/Limit order
- Tombol toggle Long/Short (hijau untuk Long, merah untuk Short)
- Dropdown selector leverage (5x, 10x, 20x, 50x, 100x)
- Tampilan balance yang tersedia
- Tombol faucet testnet ("Claim $1000 USDT") dengan timer cooldown
- Input field untuk ukuran order dengan denominasi USD
- Slider persentase (0%, 25%, 50%, 75%, 100%)
- Tombol "Tambah Take Profit / Stop Loss"
- Tombol CTA besar "Buy / Long" atau "Sell / Short" (gradient, efek shimmer)
- Bagian detail order yang menampilkan:
  - Margin yang diperlukan
  - Trading fee (0.1%)
  - Estimasi harga liquidation

### 3. Area Chart Harga
- Selector timeframe (5m, 15m, 1h, 4h, 1D, 1W)
- Selector tipe chart
- Tombol indicators
- Kontrol settings dan fullscreen
- Ticker harga live dengan simbol dan timestamp
- Chart candlestick interaktif dengan:
  - Volume bars
  - Grid lines
  - Indikator harga saat ini di sumbu kanan
  - Label waktu di sumbu bawah

### 4. Tabel Posisi (Bawah)
- Tab: Positions, Orders, History
- Badge menunjukkan jumlah posisi terbuka
- Kolom tabel:
  - Market (simbol)
  - Side (badge Long/Short)
  - Leverage
  - Entry Price (harga masuk)
  - Mark Price (harga pasar)
  - Size (USD)
  - Margin (USD)
  - PnL (hijau/merah dengan %)
  - ROE (Return on Equity %)
  - Liquidation Price (harga liquidasi)
  - Tombol Close
- Tombol "Close All Positions" di header
- Empty state: Ikon + pesan "Tidak ada posisi aktif"

### 5. Integrasi Wallet
- UI TON Connect integration
- Tampilan alamat deposit unik
- QR code untuk deposit
- Riwayat transaksi
- Form withdraw dengan input alamat

## Spesifikasi Desain:

### Palet Warna (Dark Mode):
```css
Background: Linear gradient dari #0a0b0f via #0d0e13 ke #0a0b0f
Kartu: Gradient dari #16171e/90 ke #1a1b23/80 dengan backdrop-blur
Border: #1f2029/80 dengan glow ungu subtle (#8b5cf6/20)
Text Primary: #f9fafb (gray-50)
Text Secondary: #9ca3af (gray-400)
Text Tertiary: #6b7280 (gray-500)

Warna Aksen:
- Ungu (Primary): #8b5cf6 → #7c3aed
- Hijau (Long/Profit): #10b981 → #059669
- Merah (Short/Loss): #ef4444 → #dc2626
- Biru (Info): #3b82f6 → #2563eb
```

### Tipografi:
- Font Family: Inter, system-ui, sans-serif
- Headers: Bold (700), 16-20px
- Body: Medium (500), 14px
- Text kecil: Normal (400), 12px
- Angka: Tabular nums, monospace untuk harga

### Spacing (Jarak):
- Padding komponen: 24px (lg)
- Padding kartu: 16-20px
- Gap antar elemen: 12-16px
- Border radius: 12px (xl) untuk kartu, 8px (lg) untuk tombol

### Efek Visual:
- Glassmorphism: backdrop-blur-xl dengan gradient overlay
- Shadow: Shadow ungu subtle pada kartu (shadow-lg shadow-purple-500/5)
- Hover states: Scale 1.02, peningkatan brightness, shadow enhancement
- Transitions: 300ms ease-in-out untuk semua interaksi
- Efek shimmer pada tombol CTA (animasi gradient sweep)

## Elemen Interaktif:

### Tombol:
- CTA Primary: Tombol gradient besar dengan animasi shimmer saat hover
- Tombol Long: Gradient hijau (from-green-600 to-emerald-600)
- Tombol Short: Gradient merah (from-red-600 to-rose-600)
- Tombol Ghost: Transparan dengan border, hover untuk fill
- Semua tombol: rounded-xl, font-bold, efek shadow

### Input:
- Background: Gradient kartu dengan border subtle
- Focus: Border ungu glow dengan efek ring
- Placeholder: Gray-700 (dark mode)
- Input besar untuk ukuran order: font 20px, bold

### Kartu:
- Semua kartu statistik: Kartu glassmorphic individual dengan border glow
- Hover: Shadow enhanced, subtle scale
- Padding: Generous (16-24px)
- Border radius: 12px

## Struktur Data Contoh:

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

## Komponen yang Diperlukan:

1. TradingDashboard (layout utama)
2. Sidebar (navigasi)
3. HeaderBar (stats dan kontrol atas)
4. TradingPanel (form order)
5. PriceChart (chart candlestick)
6. PositionsTable (tabel bawah)
7. StatCard (tampilan stat yang reusable)
8. Button (komponen tombol reusable)
9. Input (komponen input reusable)

## Perilaku Responsive:

- Desktop (1024px+): Layout penuh seperti yang dijelaskan
- Tablet (768-1023px): Panel trading yang bisa di-collapse
- Mobile (<768px):
  - Stack secara vertikal
  - Navigasi tab di bawah
  - Chart mengambil lebar penuh
  - Panel trading sebagai bottom sheet

## Animasi:

- Page load: Fade in dengan stagger
- Update posisi: Highlight flash (hijau/merah)
- Perubahan harga: Animasi tick angka
- Hover tombol: Efek shimmer sweep
- Buka modal: Slide up + fade
- Toast notifications: Slide in dari kanan atas

## Aksesibilitas:

- Semua tombol memiliki aria-labels
- Support navigasi keyboard
- Indikator focus pada semua elemen interaktif
- Struktur tabel yang screen reader friendly
- Kontras warna compliant dengan WCAG AA

## Titik Integrasi:

- Integrasi TON Connect wallet
- WebSocket untuk harga real-time
- REST API untuk orders dan positions
- Local storage untuk preferensi user
- Error boundaries untuk graceful failures

Generate dashboard lengkap dengan semua komponen, proper TypeScript types, dan Tailwind CSS classes. Buat production-ready dengan state management, error handling, dan loading states yang proper.
```

---

## 2. PROMPT PER KOMPONEN

Jika Anda ingin generate satu per satu:

### 2.1 Sidebar Navigasi

```markdown
Buatkan komponen sidebar navigasi vertikal untuk dashboard trading menggunakan React, TypeScript, dan Tailwind CSS (dark mode).

Kebutuhan:
- Lebar: 64px
- Background gelap dengan gradient overlay
- Logo gradient ungu premium di atas (48px x 48px rounded-xl)
- Ikon navigasi di tengah:
  * TrendingUp (Trading - aktif dengan bg purple-600)
  * Layers (Pools - disabled)
  * Target (Staking - disabled)
  * MoreHorizontal (More - disabled)
- Bagian bawah:
  * Ikon Sun/Moon (toggle tema)
  * Ikon Activity (lingkaran gradient ungu)
  * Tombol logout (simbol ⎋)
- Tooltip saat hover menampilkan label ikon
- Hover state yang smooth dengan scale dan efek glow
- Active state: Gradient ungu dengan shadow
- Disabled state: Abu-abu dan opacity berkurang

Gunakan lucide-react untuk ikon. Sertakan TypeScript types untuk props.
```

### 2.2 Panel Trading

```markdown
Buatkan komponen panel order trading untuk perpetual futures menggunakan React, TypeScript, dan Tailwind CSS (dark mode).

Kebutuhan:
- Lebar: 384px, sidebar kanan fixed
- Tab: Market / Limit (font bold, garis bawah ungu untuk yang aktif)
- Toggle Long/Short:
  * Long: Gradient hijau (from-green-600 to-emerald-600)
  * Short: Gradient merah (from-red-600 to-rose-600)
  * Animasi shimmer pada tombol aktif
- Selector leverage: Dropdown dengan 5x, 10x, 20x, 50x, 100x
- Kartu balance yang tersedia (desain glassmorphic)
- Tombol faucet: "Claim $1000 USDT" atau timer cooldown
- Input ukuran order:
  * Text bold besar (20px)
  * Suffix USD di kanan
  * Ring ungu saat focus
  * Background glassmorphic
- Slider persentase: 0-100% dengan fill ungu
- Opsi checkbox:
  * Reduce Only
  * Protected Order
- Tombol "Tambah TP/SL" (style ghost)
- Tombol CTA besar:
  * "Buy / Long" (gradient hijau) atau "Sell / Short" (gradient merah)
  * Efek shimmer saat hover
  * Spinner loading saat processing
  * Tampilkan leverage (misal "20x") saat amount diisi
- Kartu detail order menampilkan:
  * Margin yang diperlukan
  * Trading fee (0.1%)
  * Harga liquidation

Sertakan TypeScript interfaces untuk data order. Handle validasi dan loading states.
```

### 2.3 Tabel Posisi

```markdown
Buatkan komponen tabel posisi untuk dashboard trading menggunakan React, TypeScript, dan Tailwind CSS (dark mode).

Kebutuhan:
- Tab: Positions (dengan badge count), Orders, History
- Kolom tabel:
  * Market: Simbol dengan ikon (ETH/USD, BTC/USD, TON/USD)
  * Side: Badge (hijau untuk LONG, merah untuk SHORT)
  * Leverage: Angka dengan suffix "x"
  * Entry Price: Format $ dengan 2 desimal
  * Mark Price: Format $ dengan 2 desimal
  * Size: Format $ (notional posisi)
  * Margin: Format $ (margin terkunci)
  * PnL: Hijau/merah dengan +/- dan format $
  * ROE: Persentase hijau/merah
  * Liq. Price: Warna orange, format $
  * Action: Tombol "Close" (merah saat hover)
- Fitur header:
  * Selector tab dengan garis bawah aktif
  * Tombol "Close All Positions" (sisi kanan, text merah)
- Empty state:
  * Ikon tengah (search/magnifying glass)
  * Text "Tidak ada posisi aktif"
  * Subtext "Buka posisi baru untuk melihatnya di sini"
- Hover baris: Highlight background subtle
- Responsive: Scroll horizontal di mobile

Sertakan TypeScript interface untuk tipe Position. Gunakan react-icons untuk logo cryptocurrency.
```

### 2.4 Chart Harga

```markdown
Buatkan komponen chart candlestick harga menggunakan React, TypeScript, dan Tailwind CSS (dark mode).

Kebutuhan:
- Lebar penuh, tinggi fleksibel
- Bar kontrol atas:
  * Selector timeframe: 5m, 15m, 1h, 4h, 1D, 1W (ungu saat aktif)
  * Tombol tipe chart (ikon BarChart2)
  * Tombol indicators dengan simbol "ƒₓ"
  * Ikon settings (sisi kanan)
  * Ikon fullscreen (sisi kanan)
- Bar ticker harga di bawah kontrol:
  * Nama simbol dengan ikon
  * Indikator live (titik hijau berkedip)
  * Harga saat ini (hijau/merah berdasarkan perubahan)
  * Timestamp update terakhir
- Chart candlestick SVG:
  * Candle hijau untuk naik, merah untuk turun
  * Wick menunjukkan high/low
  * Grid lines (8 horizontal)
  * Label harga di sumbu kanan
  * Label waktu di sumbu bawah
  * Box harga saat ini di kanan (bg hijau, text putih)
  * Garis indikator harga ke box
- Responsive: Menyesuaikan ukuran container
- Rendering smooth dengan scaling yang proper

Gunakan SVG native untuk rendering chart. Sertakan TypeScript types untuk data candle:
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

### 2.5 Tombol Connect Wallet

```markdown
Buatkan komponen koneksi wallet TON menggunakan React, TypeScript, dan Tailwind CSS (dark mode).

Kebutuhan:
- State disconnected:
  * Text tombol: "Connect TON Wallet"
  * Ikon: Wallet icon (lucide-react)
  * Gradient: from-purple-600 via-purple-500 to-blue-600
  * Animasi shimmer saat hover (gradient sweep)
  * Shadow besar: shadow-lg shadow-purple-600/40
  * Font bold, rounded-xl
- State connected:
  * Kartu balance tersedia:
    - Jumlah hijau dalam bold
    - Label "Available"
    - Background glassmorphic
  * Tombol alamat:
    - Tampilkan alamat terpotong (0x1234...5678)
    - Titik indikator hijau berkedip
    - Ikon ChevronDown
    - Dropdown saat klik menampilkan:
      • Alamat lengkap (tombol copy)
      • Opsi disconnect
      • Link lihat transaksi
- Lingkaran avatar di ujung kanan:
  * Background gradient (ungu ke biru)
  * Diameter 36px
  * Shadow smooth

Sertakan contoh integrasi @tonconnect/ui-react. Handle loading dan error states.
```

### 2.6 Kartu Statistik (Header)

```markdown
Buatkan komponen kartu statistik reusable untuk header dashboard trading menggunakan React, TypeScript, dan Tailwind CSS (dark mode).

Kebutuhan:
- Kartu individual dengan:
  * Background glassmorphic (backdrop-blur-xl)
  * Border gradient dengan glow ungu subtle
  * Padding: 16px
  * Rounded: 12px
  * Shadow soft
- Struktur konten:
  * Label (kecil, gray-400, font 10px)
  * Value (bold, font 14px, berwarna)
- Kode warna:
  * Last Price: Green-400
  * Balance: Blue-400
  * Equity: Cyan-400
  * Total PnL: Green-400 (positif) / Red-400 (negatif)
- Efek hover:
  * Scale subtle (1.02)
  * Shadow enhanced
  * Transition smooth (300ms)
- Loading state: Animasi skeleton pulse
- Error state: Border merah dengan ikon warning

Interface props:
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

Buat reusable dan fleksibel untuk berbagai tipe data.
```

---

## 3. TEMPLATE CEPAT

### Template Serba Guna (Edit Bagian [TANDA_KURUNG])

```markdown
Buatkan [NAMA_KOMPONEN] untuk dashboard trading cryptocurrency.

Tech Stack:
- React 18 dengan TypeScript
- Tailwind CSS untuk styling
- Optimized untuk dark mode
- Lucide React untuk ikon

Fitur:
1. [Fitur 1 - jelaskan detail]
2. [Fitur 2 - jelaskan detail]
3. [Fitur 3 - jelaskan detail]

Desain:
- Background: Gradient gelap (#0a0b0f ke #0d0e13)
- Kartu: Glassmorphic dengan backdrop-blur
- Aksen: Ungu (#8b5cf6)
- Text: Putih (#f9fafb) primary, Gray-400 secondary
- Border: Subtle dengan glow ungu
- Shadow: Shadow ungu soft
- Radius: 12px untuk kartu, 8px untuk tombol

Layout:
[Jelaskan struktur layout]

Interaksi:
- Hover: [jelaskan efek hover]
- Click: [jelaskan perilaku click]
- Loading: [jelaskan loading state]
- Error: [jelaskan error handling]

Struktur Data:
```typescript
interface TipeData {
  // Interface Anda di sini
}
```

Buat production-ready dengan proper TypeScript types dan semua state ter-handle.
```

---

## 4. TIPS & TRIK

### ✅ LAKUKAN INI:

```markdown
✅ Spesifik tentang tech stack: "React 18, TypeScript, Tailwind CSS 3.x"
✅ Sebutkan style desain: "Dark mode, glassmorphism, modern, profesional"
✅ List fitur dengan jelas: "Form order, tabel posisi, chart harga"
✅ Berikan kode warna: "#8b5cf6 untuk ungu, #10b981 untuk hijau"
✅ Sertakan struktur data: Tampilkan TypeScript interfaces
✅ Spesifik interaksi: "Hover tampilkan tooltip, click buka modal"
✅ Minta responsive: "Mobile: bottom sheet, Desktop: sidebar"
✅ Minta aksesibilitas: "Label ARIA, navigasi keyboard"
```

### ❌ HINDARI INI:

```markdown
❌ Request vague: "Buat yang bagus"
❌ Terlalu banyak fitur sekaligus: Pecah jadi komponen
❌ Tidak ada konteks: Jelaskan apa fungsi app
❌ Lupa detail teknis: Selalu sebutkan React + Tailwind
❌ Lupa state: Sebutkan loading, error, empty states
❌ Abaikan mobile: Selalu minta responsive design
```

### 🎯 Strategi Bertahap:

**Hari 1: Base Structure**
```
"Buatkan layout utama dengan sidebar, header, dan area konten"
```

**Hari 2: Tambah Komponen**
```
"Sekarang tambahkan panel trading dengan form order di sisi kanan"
```

**Hari 3: Enhance Desain**
```
"Tambahkan efek glassmorphism dan gradient background ke semua kartu"
```

**Hari 4: Interaksi**
```
"Tambahkan animasi hover dan efek shimmer pada tombol"
```

**Hari 5: Integrasi**
```
"Connect ke API dan tambahkan loading/error states"
```

### 💡 Tips Pro:

1. **Mulai dari Layout Dulu**
   - Dapatkan struktur yang benar sebelum styling

2. **Satu Komponen Sekali**
   - Jangan overwhelm v0 dengan terlalu banyak fitur

3. **Jadilah Visual**
   - Jelaskan warna, ukuran, posisi dengan jelas

4. **Referensi App Real**
   - "Buat seperti Binance" sangat membantu

5. **Iterasi Cepat**
   - Generate → Test → Perbaiki → Ulangi

6. **Simpan Prompt Bagus**
   - Reuse prompt sukses untuk kebutuhan serupa

7. **Gabungkan Hasil**
   - Generate multiple variasi, ambil yang terbaik

---

## 📝 Contoh Prompt Praktis

### Contoh 1: Dashboard Lengkap (Sederhana)

```markdown
Buatkan dashboard trading cryptocurrency dengan:
- React + TypeScript + Tailwind CSS (dark mode)
- Sidebar kiri (64px) dengan ikon navigasi
- Header atas dengan harga crypto dan koneksi wallet
- Area utama: chart candlestick di kiri, panel trading di kanan (384px)
- Bawah: tabel posisi
- Desain: Background gelap dengan aksen ungu, glassmorphism, gradient
- Fitur: Tombol Long/Short, selector leverage, form order, posisi live
- Buat seperti Binance/Bybit tapi lebih modern
```

### Contoh 2: Panel Trading Saja

```markdown
Buatkan hanya panel form order trading untuk sisi kanan dashboard:
- React + TypeScript + Tailwind
- Dark mode dengan glassmorphism
- Lebar 384px
- Tab Market/Limit
- Tombol toggle "Long" (hijau) dan "Short" (merah) dengan gradient
- Dropdown leverage (5x-100x)
- Kartu tampilan balance
- Input ukuran order yang besar
- Slider persentase
- Tombol "Buy / Long" besar dengan efek shimmer
- Detail order: margin, fee, harga liquidasi
```

### Contoh 3: Perbaikan Komponen

```markdown
Perbaiki komponen button yang sudah ada:
- Tambahkan animasi shimmer saat hover (gradient sweep dari kiri ke kanan)
- Tingkatkan border radius ke rounded-xl
- Tambahkan shadow: shadow-lg shadow-{color}-600/40
- Buat font lebih bold (font-bold)
- Tambahkan smooth transition (duration-300)
- Sertakan loading state dengan spinner
- Tambahkan disabled state (opacity-40, cursor-not-allowed)
```

---

## 🎬 Flow Penggunaan

### Untuk v0.dev:

1. **Buka** https://v0.dev
2. **Copy** salah satu prompt di atas
3. **Paste** ke v0.dev chat
4. **Tunggu** hasil generate (biasanya 30-60 detik)
5. **Review** hasil yang digenerate
6. **Refine** dengan prompt tambahan jika perlu:
   - "Buat tombolnya lebih besar"
   - "Ubah warna dari biru ke ungu"
   - "Tambahkan animasi saat hover"
7. **Copy** code yang sudah jadi

### Untuk Claude/ChatGPT:

1. **Copy** prompt dari guide ini
2. **Tambahkan**: "Generate kode React component lengkap"
3. **Paste** ke chat
4. **Dapatkan** full implementation code
5. **Test** di project Anda

---

## ✅ Checklist Setelah Generate

Setelah v0 generate code, pastikan:

- [ ] Semua TypeScript types sudah proper
- [ ] Warna dark mode konsisten
- [ ] Responsive breakpoints sudah ada
- [ ] Loading states ter-handle
- [ ] Error states ter-handle
- [ ] Empty states sudah didesain
- [ ] Efek hover smooth
- [ ] Transition 300ms
- [ ] Tombol punya disabled state proper
- [ ] Ikon dari lucide-react atau react-icons
- [ ] Gradient pakai Tailwind classes yang proper
- [ ] Shadow punya opacity yang pas
- [ ] Komponen accessible (ARIA labels)
- [ ] Code production-ready
- [ ] Tidak ada console.log yang tertinggal

---

## 🚀 Mulai Sekarang!

**Langkah Mudah:**

1. **Pilih** komponen yang mau dibuat dulu
2. **Copy** prompt yang sesuai dari guide ini
3. **Edit** bagian yang perlu disesuaikan
4. **Paste** ke v0.dev
5. **Generate** dan lihat hasilnya
6. **Iterate** sampai perfect
7. **Copy code** dan integrate ke project

---

## 💬 Contoh Dialog dengan v0

**Anda:**
```
Buatkan panel trading dengan tombol Long/Short, input order size,
dan tombol besar "Buy / Long" dengan gradient hijau
```

**v0:** *generates trading panel*

**Anda:**
```
Bagus! Sekarang tambahkan efek shimmer pada tombol Buy/Long saat hover
```

**v0:** *adds shimmer effect*

**Anda:**
```
Perfect! Buat tombolnya lebih besar (py-4) dan tambahkan shadow yang
lebih kuat
```

**v0:** *enhances button*

**Anda:**
```
Mantap! Sekarang copy code-nya
```

✅ **DONE!**

---

## 🎁 Bonus: Prompt Bahasa Campur

Jika Anda lebih nyaman pakai Bahasa Indonesia campur English:

```markdown
Buatkan trading panel dengan fitur:
- Long/Short toggle buttons (gradient, shimmer effect)
- Leverage selector dropdown (5x sampai 100x)
- Order size input field (large, bold, USD suffix)
- Percentage slider 0-100%
- Big CTA button "Buy / Long" atau "Sell / Short"
- Order details card (margin, fee, liquidation price)

Design:
- Dark mode dengan glassmorphism
- Purple accent (#8b5cf6)
- Green untuk Long, Red untuk Short
- Smooth animations, 300ms transitions

Buat dengan React, TypeScript, Tailwind CSS. Production ready!
```

---

**Semoga membantu! Selamat berkreasi! 🎨🚀**

Ingat: Kunci mendapat hasil bagus dari v0 adalah **spesifik** tentang apa yang Anda mau, tapi **fleksibel** tentang cara mencapainya!
