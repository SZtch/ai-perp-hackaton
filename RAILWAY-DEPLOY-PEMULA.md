# 🚂 PANDUAN DEPLOY BACKEND KE RAILWAY (UNTUK PEMULA)

Panduan super detail step-by-step untuk deploy backend pertama kali.

---

## 📋 APA YANG KITA AKAN LAKUKAN?

```
Langkah 1: Daftar/Login Railway
Langkah 2: Connect GitHub
Langkah 3: Import Project
Langkah 4: Setup Database
Langkah 5: Configure Settings
Langkah 6: Deploy!
Langkah 7: Test Backend
```

**Total waktu: 15-20 menit**

---

## 🎯 LANGKAH 1: DAFTAR / LOGIN RAILWAY (3 Menit)

### **Apa itu Railway?**
Railway adalah platform untuk deploy aplikasi backend. Seperti hosting, tapi khusus untuk aplikasi/API.

### **Step 1.1: Buka Railway**

1. **Buka browser** (Chrome/Safari/Firefox)
2. **Ketik di address bar:**
   ```
   railway.app
   ```
3. **Tekan Enter**

**Anda akan lihat:**
- Halaman Railway dengan gambar kereta api
- Tombol "Login" atau "Start a New Project"

### **Step 1.2: Login dengan GitHub**

**JANGAN buat account baru!** Pakai GitHub langsung lebih mudah.

1. **Klik tombol "Login"** (pojok kanan atas)

   ATAU

   **Klik "Start a New Project"** → akan auto redirect ke login

2. **Akan muncul pilihan login:**
   ```
   ☐ Continue with GitHub  ← KLIK INI!
   ☐ Continue with Email
   ```

3. **Klik "Continue with GitHub"**

4. **GitHub akan minta izin:**
   ```
   Railway wants to access your repositories
   [Authorize Railway] ← KLIK INI
   ```

5. **Masukkan password GitHub** (kalau diminta)

✅ **Anda sekarang sudah login Railway!**

**Anda akan lihat:**
- Dashboard Railway
- Tulisan "New Project" atau "+ New"
- Mungkin ada tutorial pop-up (klik "Skip" aja)

---

## 🔗 LANGKAH 2: IMPORT PROJECT DARI GITHUB (2 Menit)

### **Step 2.1: Buat Project Baru**

Di halaman Dashboard Railway:

1. **Cari tombol "+ New"**
   - Biasanya di **pojok kanan atas**
   - Atau **tengah layar** (kalau belum ada project)

2. **Klik "+ New"**

3. **Akan muncul menu dropdown:**
   ```
   ☐ Empty Project
   ☐ Deploy from GitHub repo  ← KLIK INI!
   ☐ Deploy from template
   ```

4. **Klik "Deploy from GitHub repo"**

### **Step 2.2: Pilih Repository**

**Akan muncul daftar repository GitHub Anda:**

1. **Cari repository:** `ai-perp-hackaton` atau `ai-perp`

   **Tips:** Gunakan search box kalau banyak repo

2. **Klik repository tersebut**

3. **Railway akan langsung mulai analyze project**

**Anda akan lihat:**
- Loading spinner
- Tulisan "Analyzing repository..."
- Tunggu **30 detik**

✅ **Project sudah di-import!**

---

## ⚙️ LANGKAH 3: CONFIGURE PROJECT (5 Menit)

### **Step 3.1: Set Root Directory**

**INI PENTING!** Railway harus tahu folder backend ada di mana.

**Setelah import, Anda akan lihat:**
- Card/kotak project dengan nama repo
- Tab-tab: Deployments, Settings, Variables, dll

**Lakukan ini:**

1. **Klik tab "Settings"** (di bagian atas)

2. **Scroll ke bawah** sampai ketemu bagian **"Build & Deploy"** atau **"Root Directory"**

3. **Cari field "Root Directory"** atau "Source"

4. **Klik field tersebut**, ketik:
   ```
   backend
   ```
   (huruf kecil semua, tidak ada spasi)

5. **Klik "Save"** atau tekan **Enter**

**Anda akan lihat:**
- Field berubah dari kosong jadi `backend`
- Mungkin ada tombol "Redeploy" muncul

✅ **Root directory sudah di-set!**

### **Step 3.2: Cek Build Commands (Optional)**

Scroll lagi, cek bagian **"Build Command"** dan **"Start Command"**:

**Seharusnya otomatis terdetect:**
```
Build Command:  npm run build  (atau kosong - OK!)
Start Command:  npm run start
Install Command: npm install
```

**Kalau kosong atau beda, tidak masalah!** Railway biasanya auto-detect.

---

## 🗄️ LANGKAH 4: ADD DATABASE (3 Menit)

Backend butuh database untuk simpan data trading, user, dll.

### **Step 4.1: Add PostgreSQL**

**Di halaman project yang sama:**

1. **Klik tombol "+ New"** lagi (pojok kanan atas)

2. **Klik "Database"**

3. **Pilih "Add PostgreSQL"**

4. **Tunggu 30-60 detik**

**Anda akan lihat:**
- Card baru muncul dengan nama "Postgres"
- Loading spinner
- Setelah selesai: status "Active" atau icon hijau

✅ **Database sudah siap!**

### **Step 4.2: Link Database ke Backend (Biasanya Auto)**

Railway biasanya **otomatis menghubungkan** database ke backend service.

**Cara cek:**

1. **Klik card BACKEND** (bukan Postgres!)

2. **Klik tab "Variables"**

3. **Cari variable bernama:** `DATABASE_URL`

**2 Kemungkinan:**

#### **A. DATABASE_URL ADA ✅**
```
DATABASE_URL  |  ${{Postgres.DATABASE_URL}}
```
atau
```
DATABASE_URL  |  postgres://user:pass@host:5432/railway
```

**BERARTI SUDAH AUTO-CONNECT!** ✅ **Lanjut ke Langkah 5**

#### **B. DATABASE_URL TIDAK ADA ❌**

**Kita harus connect manual:**

1. Masih di tab "Variables"
2. **Klik tombol "+ New Variable"** atau "Add Variable"
3. **JANGAN ketik manual!**
4. **Klik dropdown di bagian "Value"**
5. **Pilih:** `Reference` → `Postgres` → `DATABASE_URL`
6. **Variable Name** otomatis jadi: `DATABASE_URL`
7. **Klik "Add"**

✅ **Database sekarang terhubung!**

---

## 🔐 LANGKAH 5: ADD ENVIRONMENT VARIABLES (2 Menit)

Masih di tab **"Variables"** (backend service):

Kita perlu tambah beberapa environment variables penting:

### **Tambah Variable Satu per Satu:**

#### **Variable 1: JWT_SECRET**
1. Klik **"+ New Variable"**
2. **Variable Name:** `JWT_SECRET`
3. **Value:** `super-secret-jwt-key-change-this-in-production`
4. Klik **"Add"**

#### **Variable 2: TON_NETWORK**
1. Klik **"+ New Variable"**
2. **Variable Name:** `TON_NETWORK`
3. **Value:** `testnet`
4. Klik **"Add"**

#### **Variable 3: TEST_MODE**
1. Klik **"+ New Variable"**
2. **Variable Name:** `TEST_MODE`
3. **Value:** `true`
4. Klik **"Add"**

#### **Variable 4: ORIGIN**
1. Klik **"+ New Variable"**
2. **Variable Name:** `ORIGIN`
3. **Value:** `*`
4. Klik **"Add"**

#### **Variable 5: PORT**
1. Klik **"+ New Variable"**
2. **Variable Name:** `PORT`
3. **Value:** `4000`
4. Klik **"Add"**

✅ **Semua environment variables sudah ditambahkan!**

**Anda sekarang punya 6 variables total:**
```
✅ DATABASE_URL (dari Postgres)
✅ JWT_SECRET
✅ TON_NETWORK
✅ TEST_MODE
✅ ORIGIN
✅ PORT
```

---

## 🚀 LANGKAH 6: DEPLOY! (5 Menit)

### **Step 6.1: Trigger Deploy**

Setelah semua setting selesai:

1. **Klik tab "Deployments"** (di atas)

2. **Anda akan lihat deployment list**
   - Mungkin ada deployment yang gagal (merah) - tidak masalah!

3. **Klik titik 3 (...)** di deployment paling atas

4. **Klik "Redeploy"**

**ATAU:**

Railway mungkin sudah auto-deploy setelah Anda ubah settings. Cek status deployment terakhir.

### **Step 6.2: Monitor Progress**

**Anda akan lihat deployment baru dengan status:**

```
⏳ BUILDING  (kuning/orange)
```

**Klik deployment tersebut untuk lihat logs.**

**Proses:**
1. ⏳ **Queued** (antri)
2. ⏳ **Building** (kompilasi code) - **2-3 menit**
3. ⏳ **Deploying** (upload ke server) - **1 menit**
4. ✅ **Active** (jalan!) - **BERHASIL!**

**Scroll logs, cari baris:**
```
✓ Detected Node
✓ Using npm package manager
npm install
npm run build
✓ Build complete
```

### **Step 6.3: Wait for Success**

**Tunggu sampai status berubah jadi:**

```
✅ ACTIVE  (hijau)
```

atau

```
✅ SUCCESS
```

**Kalau berhasil, di logs paling bawah akan muncul:**
```
🚀 SuperAI Perp Backend
📡 Server running on port 4000
🌐 Network: testnet
💰 Symbols: TONUSDT,BTCUSDT,ETHUSDT
```

✅✅✅ **BACKEND SUDAH JALAN!** 🎉

---

## 🌐 LANGKAH 7: GET DOMAIN & TEST (2 Menit)

### **Step 7.1: Generate Public URL**

Backend sudah jalan, tapi belum punya URL publik.

1. **Klik tab "Settings"**

2. **Scroll ke bagian "Networking"** atau **"Domains"**

3. **Klik tombol "Generate Domain"**

4. **Railway akan buat URL otomatis:**
   ```
   https://superai-perp-production.up.railway.app
   ```
   (Nama bisa beda-beda)

5. **COPY URL INI!** Simpan di notepad.

### **Step 7.2: Test Health Endpoint**

Sekarang kita test apakah backend beneran jalan:

1. **Buka tab browser baru**

2. **Paste URL Railway + `/health`:**
   ```
   https://superai-perp-production.up.railway.app/health
   ```

3. **Tekan Enter**

**Harus muncul:**
```json
{
  "ok": true,
  "timestamp": "2025-10-25T10:50:00.000Z",
  "network": "testnet"
}
```

✅✅✅ **BACKEND BERHASIL DEPLOY!** 🎉🎉🎉

---

## 🎉 SELESAI! CHECKLIST AKHIR

- [x] ✅ Login Railway dengan GitHub
- [x] ✅ Import repository ai-perp-hackaton
- [x] ✅ Set root directory = `backend`
- [x] ✅ Add PostgreSQL database
- [x] ✅ DATABASE_URL terhubung
- [x] ✅ Add environment variables (JWT_SECRET, dll)
- [x] ✅ Deploy berhasil (status Active)
- [x] ✅ Generate domain
- [x] ✅ Test /health endpoint → OK!

---

## 🔗 NEXT STEPS: CONNECT KE FRONTEND

Sekarang Anda punya:
```
Backend URL: https://xxx.up.railway.app ✅
```

**Untuk hubungkan ke frontend Vercel:**

1. Buka **Vercel Dashboard**
2. Klik project frontend
3. **Settings** → **Environment Variables**
4. Edit `NEXT_PUBLIC_API_URL`:
   ```
   https://superai-perp-production.up.railway.app
   ```
5. **Save** → **Redeploy**

✅ **Frontend dan Backend terhubung!**

---

## 🆘 TROUBLESHOOTING

### **Deploy Failed (Status: Failed/Crashed)**

**Cek logs untuk error message:**
1. Klik deployment yang failed
2. Scroll logs, cari baris merah
3. **Common errors:**
   - `DATABASE_URL not found` → Cek Variable DATABASE_URL ada
   - `npm install failed` → Issue dengan dependencies
   - `Port already in use` → Ubah PORT di variables

**Solusi umum:**
- Redeploy lagi (klik ... → Redeploy)
- Cek semua environment variables lengkap
- Pastikan root directory = `backend`

### **/health endpoint 404 Not Found**

**Penyebab:**
- Backend belum jalan
- Deploy masih progress
- Root directory salah

**Solusi:**
- Tunggu deployment selesai (status Active)
- Cek logs ada "Server running on port 4000"
- Cek Settings → Root Directory = `backend`

### **Database connection error**

**Cek:**
1. PostgreSQL status Active (hijau)
2. DATABASE_URL ada di Variables backend
3. Format DATABASE_URL benar (postgres://...)

---

## 💡 TIPS

1. **Deployment pertama biasanya 5-10 menit** (download dependencies)
2. **Deployment berikutnya lebih cepat** (2-3 menit)
3. **Railway free tier:** 500 jam/bulan (**cukup banget!**)
4. **Logs adalah teman terbaik Anda** - selalu cek kalau ada error

---

## 🎓 ISTILAH YANG PERLU ANDA TAHU

- **Deploy**: Upload code ke server online
- **Backend**: Server yang handle logic (API, database)
- **Frontend**: Tampilan website (yang user lihat)
- **Environment Variables**: Setting rahasia (password, keys)
- **Database**: Tempat simpan data (users, transaksi)
- **PostgreSQL**: Jenis database (kayak Excel tapi lebih canggih)
- **Root Directory**: Folder utama project
- **Domain**: URL website (misal: https://xxx.up.railway.app)
- **Endpoint**: URL specific untuk ambil data (misal: /health, /api/users)

---

**SELAMAT! Anda sudah berhasil deploy backend pertama kali!** 🎉🚀

Lanjut deploy frontend ke Vercel? Atau mau istirahat dulu? 😊
