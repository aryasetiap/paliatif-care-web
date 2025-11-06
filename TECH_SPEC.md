# Spesifikasi Teknis (Technical Specification)

**Proyek:** Website Edukasi & Skrining Paliatif  
**Tanggal:** 6 November 2025  
**Versi:** 1.0  
**Audience:** Tim Developer (DuaKode Labs)  
**Tech Lead:** (Isi nama tech lead)

---

## 1. Pendahuluan

Dokumen ini merinci arsitektur teknis, skema data, alur kerja, dan implementasi detail untuk proyek "Website Edukasi 8 Penyakit Terminal & Skrining Paliatif Berbasis Keperawatan". Ini adalah dokumen "hidup" yang akan memandu pengembangan dari awal hingga deploy.

---

## 2. Arsitektur Sistem (High-Level)

Kita akan menggunakan arsitektur Jamstack/Serverless modern yang sangat terintegrasi.

- **Frontend (Client):** Next.js 14+ (App Router) di-host di Vercel. Menangani rendering UI, routing sisi klien, dan halaman statis (edukasi).
- **Backend (BaaS):** Supabase menyediakan layanan backend:
  - **Auth:** Register, login, dan sesi pengguna (Perawat).
  - **Database (Postgres):** Menyimpan data pengguna dan hasil skrining.
  - **Edge Functions (Deno):** Logika bisnis Rule Engine secara serverless untuk memproses hasil skrining.

**Alur Data Utama:**

1. Pengguna (Perawat) membuka proyek.vercel.app.
2. Vercel menyajikan aplikasi Next.js.
3. Pengguna mendaftar/login → Next.js berkomunikasi dengan Supabase Auth.
4. Pengguna mengakses halaman statis (Edukasi) → Disajikan langsung oleh Next.js.
5. Pengguna mengisi form skrining → Next.js (client) mengirim data form ke Supabase Edge Function.
6. Edge Function memproses data (Rule Engine), menyimpan hasil ke Database (Postgres), dan mengembalikan hasil rekomendasi ke klien Next.js.
7. Next.js menampilkan halaman hasil.

---

## 3. Tumpukan Teknologi (Tech Stack)

| Kategori         | Teknologi               | Versi/Catatan                     |
| ---------------- | ----------------------- | --------------------------------- |
| Framework        | Next.js                 | v14+ (App Router)                 |
| Bahasa           | TypeScript              | Strict mode                       |
| Styling          | Tailwind CSS            | v3+                               |
| UI Components    | shadcn/ui               | Form, button, card, dll           |
| Database         | Supabase (Postgres)     | via supabase-js v11+              |
| Autentikasi      | Supabase Auth           | via @supabase/auth-helpers-nextjs |
| Serverless       | Supabase Edge Functions | Deno Runtime                      |
| Form Management  | react-hook-form + zod   | Validasi form skrining kompleks   |
| Hosting/Platform | Vercel                  |                                   |
| Integrasi Git    | GitHub                  | Repo privat                       |
| PDF Generation   | react-to-print          | Metode cepat & efisien            |
| Observability    | Sentry                  | Integrasi Vercel Sentry           |

---

## 4. Skema Database (Supabase Postgres)

Skema database dijaga seminimal mungkin, mengandalkan `jsonb` untuk fleksibilitas.

### Tabel: `profiles`

Terhubung 1-1 dengan `auth.users` (dibuat oleh Supabase Auth) dan menyimpan data publik/metadata pengguna.

| Kolom      | Tipe       | Constraints                        | Catatan                              |
| ---------- | ---------- | ---------------------------------- | ------------------------------------ |
| id         | uuid       | Primary Key, References auth.users | Kunci utama, terhubung ke tabel auth |
| full_name  | text       | NOT NULL                           | Nama lengkap perawat                 |
| created_at | timestampz | default now()                      | Waktu profil dibuat                  |

### Tabel: `screenings`

Menyimpan setiap data hasil skrining yang di-submit oleh perawat.

| Kolom          | Tipe       | Constraints                            | Catatan                                |
| -------------- | ---------- | -------------------------------------- | -------------------------------------- |
| id             | uuid       | Primary Key, default gen_random_uuid() | ID unik untuk setiap skrining          |
| user_id        | uuid       | Foreign Key → auth.users.id            | Perawat yang melakukan skrining        |
| patient_name   | text       | NOT NULL                               | Nama pasien yang diskrining            |
| screening_data | jsonb      | NOT NULL                               | Input form (pertanyaan & jawaban)      |
| recommendation | jsonb      | NOT NULL                               | Output Rule Engine (rekomendasi, skor) |
| created_at     | timestampz | default now()                          | Waktu skrining dilakukan               |

#### Kebijakan RLS (Row Level Security)

Harus diaktifkan untuk semua tabel.

- **profiles:**
  - SELECT: auth.uid() = id
  - INSERT: auth.uid() = id
  - UPDATE: auth.uid() = id
- **screenings:**
  - SELECT: auth.uid() = user_id
  - INSERT: auth.uid() = user_id
  - UPDATE/DELETE: Dinonaktifkan (data immutable)

#### Konten Edukasi

Materi 8 Penyakit Terminal **tidak disimpan di database**. Konten statis (.mdx/.tsx) di repositori Next.js (`/app/edukasi/...`) untuk performa SSG terbaik.

---

## 5. API & Serverless Logic (Supabase Edge Functions)

Hanya satu Edge Function utama.

- **Function:** `process-screening`
- **Endpoint:** `/functions/v1/process-screening`
- **Metode:** POST
- **Auth:** Wajib (verifikasi JWT dari header Authorization)

**Input (Body):**

```json
{
  "patient_name": "Nama Pasien",
  "screening_data": {
    "question_1": "answer_a",
    "question_2": ["choice_b", "choice_c"],
    "question_3": 5
  }
}
```

**Logika Internal (Rule Engine):**

- Validasi input body (zod jika memungkinkan di Deno)
- Ambil user_id dari JWT
- Muat logika/aturan (rules) dari klien (hard-code TypeScript)
- Proses `screening_data` → hasilkan `recommendation` (JSON)
- Buat objek skrining baru
- Simpan ke database: `supabase.from('screenings').insert(...)`
- Tangani error dengan try...catch

**Output (Sukses - 200):**

```json
{
  "new_screening_id": "uuid-baru-dari-db",
  "recommendation": {
    "score": 85,
    "summary": "Pasien berisiko tinggi...",
    "interventions": ["Intervensi A...", "Intervensi B..."]
  }
}
```

**Output (Error - 400/401/500):**

```json
{ "error": "Pesan error yang jelas" }
```

---

## 6. Arsitektur Frontend (Next.js 14 App Router)

**Struktur Direktori (`/app`):**

```
/app
├── (auth)
│   ├── login/page.tsx
│   └── register/page.tsx
├── (protected)
│   ├── dashboard/page.tsx
│   ├── edukasi/
│   │   ├── [slug]/page.tsx
│   │   └── layout.tsx
│   ├── screening/
│   │   ├── new/page.tsx
│   │   └── [id]/result/page.tsx
│   └── layout.tsx
├── api/auth/callback/route.ts
├── layout.tsx
└── page.tsx
/components
├── ui/
├── icons.tsx
├── ...
/lib
├── supabase.ts
├── utils.ts
└── types.ts
/middleware.ts
```

---

### Implementasi Fitur Kunci

#### a. Autentikasi (Auth)

- Gunakan `@supabase/auth-helpers-nextjs`
- Gunakan `createClientComponentClient` & `createServerComponentClient`
- Buat `middleware.ts` untuk proteksi route (redirect ke `/login` jika tidak ada sesi)
- Halaman `/login` & `/register` menggunakan `supabase.auth.signInWithPassword()` dan `supabase.auth.signUp()`
- Listener `onAuthStateChange` di root layout untuk refresh halaman saat status auth berubah

#### b. Alur Skrining (Form → Hasil)

- **Halaman `/screening/new`:**

  - Komponen `<ScreeningForm>` sebagai Client Component
  - Gunakan `react-hook-form` untuk state form
  - Gunakan `zod` untuk validasi
  - Input menggunakan komponen shadcn/ui
  - Submit: panggil Supabase Edge Function `supabase.functions.invoke('process-screening', { body: ... })`
  - Tampilkan loading pada tombol submit
  - Jika sukses: redirect ke `/screening/{new_screening_id}/result`
  - Jika gagal: tampilkan error dengan Toast

- **Halaman Hasil `/screening/[id]/result`:**
  - Server Component, fetch data dari tabel `screenings` where `id = params.id`
  - Tampilkan data `recommendation` dengan komponen shadcn/ui Card

#### c. Ekspor PDF

- **Lokasi:** Halaman `/screening/[id]/result`
- **Library:** `react-to-print`
- **Implementasi:**
  - Komponen `<ScreeningPrintableReport reportData={...} />` (layout HTML murni untuk cetak)
  - Render di dalam div tersembunyi (`display: none`)
  - Gunakan `useRef` untuk referensi komponen
  - Gunakan hook `useReactToPrint`
  - Tombol "Ekspor PDF" memanggil trigger dari `useReactToPrint`
  - Tambahkan CSS `@media print` untuk tampilan cetak

---

## 7. Deployment & CI/CD

- **Repository:** GitHub
- **Hosting:** Vercel
- **Integrasi:** Hubungkan Vercel Project ke GitHub Repository

**Alur Git:**

- `main`: Produksi, setiap push → deploy ke production URL
- `develop`: Staging, setiap push → deploy ke preview URL
- `feature/*`: Cabang fitur, merge ke `develop` via PR

**Environment Variables:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (jika diperlukan oleh Edge Function, sebaiknya dihindari dan gunakan `auth.uid()` jika bisa)

Variabel di-set di Vercel Project Settings dan `.env.local` untuk pengembangan lokal.

**Supabase Migrations:**

- Gunakan Supabase CLI
- Setiap perubahan skema → file migrasi: `supabase migration new <nama_migrasi>`
- Terapkan migrasi lokal: `supabase db push`
- Terapkan migrasi ke production: Hubungkan Supabase CLI ke remote DB dan jalankan `db push` (atau gunakan Supabase GitHub Action)

---

## 8. Ketergantungan Kritis & Blocker

**BLOCKER KLIEN:**  
Proyek tidak dapat melanjutkan bagian skrining tanpa 3 hal dari Klien:

- Daftar Pertanyaan Final (untuk ScreeningForm)
- Logika Aturan / Rules (untuk process-screening Edge Function)
- Konten 8 Penyakit (untuk halaman statis edukasi/[slug])

**BLOCKER TEKNIS:**  
Keterbatasan Supabase Free Tier (misal: timeout Edge Function) perlu dipantau, meskipun untuk proyek skala ini seharusnya sangat aman.
