# FIX FRONTEND ERROR - PANDUAN SIMPLE

## Masalah:
- Error: "Unknown font `Geist`"
- Error: `GET / 500`

## Penyebab:
Anda menjalankan `npm run dev` dari **root folder**, bukan dari folder `frontend/`.

---

## SOLUSI (3 LANGKAH SIMPLE):

### LANGKAH 1: Buka Terminal Baru
- Tekan `Ctrl+C` untuk stop frontend yang error
- Atau buka Terminal baru di VS Code

### LANGKAH 2: Masuk ke Folder Frontend
Copy-paste command ini:
\`\`\`bash
cd frontend
\`\`\`

Verifikasi dengan command:
\`\`\`bash
pwd
\`\`\`

Output yang benar:
\`\`\`
/Users/aris/Documents/projects/v0-super-ai-perp-d-app/frontend
\`\`\`

### LANGKAH 3: Jalankan Frontend
\`\`\`bash
npm run dev
\`\`\`

---

## Output yang Diharapkan:

\`\`\`
> superai-perp-frontend@1.0.0 dev
> next dev

  ▲ Next.js 14.2.33
  - Local:        http://localhost:3000
  
✓ Ready in 2.5s
\`\`\`

---

## Verifikasi:

1. Buka browser: http://localhost:3000
2. Jika berhasil, Anda akan melihat halaman frontend
3. Tidak ada error 500

---

## Jika Masih Error:

Screenshot dan paste ke sini!

---

## CHECKLIST:

- [ ] Tekan Ctrl+C untuk stop frontend yang error
- [ ] Jalankan: `cd frontend`
- [ ] Jalankan: `npm run dev`
- [ ] Buka: http://localhost:3000
- [ ] Tidak ada error 500
