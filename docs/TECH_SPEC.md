# Spesifikasi Teknis (Technical Specification)

**Proyek:** Website Edukasi & Skrining Paliatif
**Tanggal:** 6 November 2025
**Versi:** 1.0
**Audience:** Tim Developer (DuaKode Labs)
**Timeline:** 6 - 16 November 2025
**Status:** Project Active - DP Received

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
| Framework        | Next.js                 | v15+ (App Router)                 |
| Bahasa           | TypeScript              | Strict mode + latest features     |
| Styling          | Tailwind CSS            | v4+ (modern config)               |
| UI Components    | shadcn/ui + Radix       | Custom themed components          |
| Database         | Supabase (Postgres)     | via supabase-js v11+              |
| Autentikasi      | Supabase Auth           | via @supabase/auth-helpers-nextjs |
| Serverless       | Supabase Edge Functions | Deno Runtime                      |
| State Management | Zustand                 | Lightweight state manager         |
| Data Fetching    | TanStack Query          | Server state synchronization      |
| Form Management  | react-hook-form + zod   | Validasi form skrining kompleks   |
| Animations       | Framer Motion           | Smooth micro-interactions         |
| Charts/Viz       | Recharts                | Interactive data visualization    |
| PWA              | Next PWA                | Offline capabilities              |
| Hosting/Platform | Vercel                  |                                   |
| Integrasi Git    | GitHub                  | Repo privat                       |
| PDF Generation   | react-to-print          | Metode cepat & efisien            |
| Testing          | Vitest + Testing Library| Unit & component testing          |
| Documentation    | Storybook               | Component documentation           |
| Observability    | Sentry + Vercel Analytics| Error tracking & performance      |

---

## 4. Modern UI/UX Design System

### Design Philosophy

**Prinsip Desain untuk Healthcare Applications:**
- **Clarity First:** Informasi kritis harus mudah dibaca dan dipahami
- **Accessibility Compliant:** WCAG 2.1 AA compliance minimal
- **Mobile-First:** Optimized untuk tablet dan mobile devices
- **Trust & Professionalism:** Clean, modern, namun tetap medis
- **Error Prevention:** Proactive validation dan clear feedback

### Design System Specification

**Color Palette (Healthcare-Themed):**
```css
/* Primary Colors */
--primary-50: #F7F3E1;  /* This could be a lighter shade of Pale Cream, or Pale Cream itself */
--primary-500: #6280BA; /* Navy Blue */
--primary-600: #88C6E6; /* Sky Blue */
--primary-700: #F7F3E1; /* Pale Cream, if you need another shade or main cream color */

/* Secondary Colors */
--secondary-500: #10b981;  /* Success Green */
--accent-500: #f59e0b;     /* Warning Amber */

/* Semantic Colors */
--error-500: #ef4444;      /* Medical Alert Red */
--warning-500: #f59e0b;    /* Caution Yellow */
--success-500: #10b981;    /* Positive Green */
--info-500: #06b6d4;       /* Information Cyan */

/* Neutral Colors */
--gray-50: #f9fafb;  /* Clean White */
--gray-900: #111827; /* Professional Dark */
```

**Typography System:**
```css
/* Font Stack */
--font-sans: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', monospace;

/* Type Scale */
--text-xs: 0.75rem;   /* Labels, captions */
--text-sm: 0.875rem;  /* Secondary text */
--text-base: 1rem;    /* Body content */
--text-lg: 1.125rem;  /* Important text */
--text-xl: 1.25rem;   /* Section headers */
--text-2xl: 1.5rem;   /* Page titles */
--text-3xl: 1.875rem; /* Hero headers */
```

### Component Library Enhancement

**Enhanced shadcn/ui Components:**
- **Custom Healthcare Icons:** Medical-themed icon set
- **Smart Form Components:** dengan real-time validation
- **Data Tables:** dengan sorting, filtering, pagination
- **Modal Dialogs:** Healthcare-specific patterns
- **Loading States:** Skeleton screens dengan healthcare theme
- **Toast Notifications:** Contextual health alerts

### Interactive Elements

**Micro-interactions:**
- **Button Hovers:** Smooth transitions dengan transform
- **Form Fields:** Floating labels dan focus states
- **Data Cards:** Hover effects untuk additional info
- **Charts:** Interactive tooltips dan animations
- **Navigation:** Breadcrumb dengan smooth transitions

**Animation Principles (Framer Motion):**
- **Page Transitions:** Smooth fade/slide animations
- **Loading States:** Shimmer effects untuk data loading
- **Success States:** Celebration animations untuk completed forms
- **Error States:** Gentle shake animations untuk validation errors

### Responsive Design Strategy

**Breakpoint System:**
```css
/* Mobile-First Approach */
--breakpoint-sm: 640px;   /* Large phones */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large desktops */
```

**Device Optimization:**
- **Mobile (320px-768px):** Single column, touch-optimized
- **Tablet (768px-1024px):** Two columns, moderate spacing
- **Desktop (1024px+):** Multi-column, full features

### Dark Mode Support

**Theme System:**
- **Light Theme:** Default untuk daytime usage
- **Dark Theme:** Reduced eye strain untuk evening usage
- **System Preference:** Auto-detect OS preference
- **Manual Toggle:** User-controlled theme switching

### Accessibility Features

**WCAG 2.1 AA Compliance:**
- **Keyboard Navigation:** Full keyboard accessibility
- **Screen Reader Support:** Proper ARIA labels dan roles
- **Color Contrast:** 4.5:1 ratio minimum
- **Focus Indicators:** Visible focus states
- **Alternative Text:** All images dan charts described

### Performance Metrics

**Core Web Vitals Targets:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **TTI (Time to Interactive):** < 3.8s

**Optimization Strategies:**
- **Image Optimization:** Next.js Image component dengan WebP
- **Code Splitting:** Automatic dan manual splitting
- **Lazy Loading:** Components dan data loading
- **CDN Integration:** Vercel Edge Network

---

## 5. Additional Features (Optional)

### Data Visualization (Basic)

**Simple Charts:**
```tsx
// Basic Analytics Components
- ScreeningSummaryChart: Overview of screening results
- RiskDistributionPie: Basic risk category distribution
```

### Search & Filtering

**Basic Search System:**
- **Patient Search:** Search by patient name
- **Date Filtering:** Filter by screening date
- **Recent Activity:** Quick access to recent screenings

### Patient Management Features

**Patient List Page (`/pasien`):**
- **Table View:** Menampilkan semua pasien yang pernah di-screening
- **Patient Info:** Nama, usia, jenis kelamin, tanggal screening terakhir
- **Search & Filter:** Cari berdasarkan nama, filter berdasarkan tanggal
- **Quick Actions:** Lihat detail, tambah screening baru, export riwayat

**Patient Detail Page (`/pasien/[id]`):**
- **Patient Profile:** Info lengkap pasien
- **Screening History:** Timeline semua screening yang pernah dilakukan
- **Progress Tracking:** Perkembangan kondisi pasien dari waktu ke waktu
- **Export All:** Export semua riwayat screening pasien dalam satu PDF

**Dashboard Analytics (`/dashboard`):**
- **Overview Cards:** Total pasien, total screening, screening bulan ini
- **Recent Patients:** 5 pasien terakhir yang di-screening
- **Quick Actions:** Tombol untuk screening baru, lihat semua pasien
- **Simple Charts:** Distribusi risiko, trend screening

**Patient Data Structure:**
```typescript
interface Patient {
  id: string;
  user_id: string;        // Perawat yang mendaftarkan
  name: string;
  age: number;
  gender: 'L' | 'P';
  facility_name?: string;
  created_at: string;
  updated_at: string;
  screenings: Screening[]; // Relasi ke tabel screenings
}
```

---

## 6. Testing Strategy

### Testing Strategy

**Essential Tests:**
- Component testing untuk critical UI components
- Form validation testing
- Authentication flow testing
- Basic API integration testing
- Manual testing untuk critical user journeys

### Testing Tools Setup

```json
// package.json scripts
{
  "test": "vitest",
  "test:coverage": "vitest --coverage"
}
```

---

## 7. Skema Database (Supabase Postgres)

Skema database dijaga seminimal mungkin, mengandalkan `jsonb` untuk fleksibilitas.

### Tabel: `profiles`

Terhubung 1-1 dengan `auth.users` (dibuat oleh Supabase Auth) dan menyimpan data publik/metadata pengguna.

| Kolom      | Tipe       | Constraints                        | Catatan                              |
| ---------- | ---------- | ---------------------------------- | ------------------------------------ |
| id         | uuid       | Primary Key, References auth.users | Kunci utama, terhubung ke tabel auth |
| full_name  | text       | NOT NULL                           | Nama lengkap perawat                 |
| created_at | timestampz | default now()                      | Waktu profil dibuat                  |

### Tabel: `patients`

Menyimpan data master pasien yang pernah di-screening.

| Kolom          | Tipe       | Constraints                            | Catatan                                |
| -------------- | ---------- | -------------------------------------- | -------------------------------------- |
| id             | uuid       | Primary Key, default gen_random_uuid() | ID unik untuk setiap pasien            |
| user_id        | uuid       | Foreign Key → auth.users.id            | Perawat yang mendaftarkan pasien       |
| name           | text       | NOT NULL                               | Nama lengkap pasien                    |
| age            | integer    | NOT NULL, CHECK (age > 0)              | Usia pasien                            |
| gender         | varchar(10)| NOT NULL, CHECK (gender IN ('L','P'))  | Jenis kelamin pasien                   |
| facility_name  | text       |                                       | Nama fasilitas kesehatan               |
| created_at     | timestampz | default now()                          | Waktu pasien didaftarkan               |
| updated_at     | timestampz | default now()                          | Waktu terakhir update data pasien      |

### Tabel: `screenings`

Menyimpan setiap data hasil skrining ESAS yang di-submit oleh perawat.

| Kolom            | Tipe       | Constraints                            | Catatan                                |
| ---------------- | ---------- | -------------------------------------- | -------------------------------------- |
| id               | uuid       | Primary Key, default gen_random_uuid() | ID unik untuk setiap skrining          |
| user_id          | uuid       | Foreign Key → auth.users.id            | Perawat yang melakukan skrining        |
| patient_id       | uuid       | Foreign Key → patients.id              | Pasien yang diskrining (relasi)        |
| screening_type   | varchar(20)| NOT NULL, DEFAULT 'initial'           | Tipe: 'initial', 'follow_up'           |
| status           | varchar(20)| NOT NULL, DEFAULT 'completed'         | Status: 'draft', 'completed', 'cancelled' |
| esas_data        | jsonb      | NOT NULL                               | 9 pertanyaan ESAS + jawaban (0-10)     |
| recommendation   | jsonb      | NOT NULL                               | Rule Engine output (diagnosa, intervensi) |
| highest_score    | integer    | NOT NULL, CHECK (highest_score >= 0)  | Skor tertinggi dari 9 pertanyaan        |
| primary_question | integer    | NOT NULL, CHECK (primary_question BETWEEN 1 AND 9) | Nomor pertanyaan dengan skor tertinggi |
| risk_level       | varchar(20)| NOT NULL                               | 'low', 'medium', 'high', 'critical'    |
| created_at       | timestampz | default now()                          | Waktu skrining dilakukan               |
| updated_at       | timestampz | default now()                          | Waktu terakhir update                  |

**Struktur JSON `esas_data` (sesuai PERTANYAAN_SKRINING_ESAS.md):**
```json
{
  "identity": {
    "name": "Nama Pasien",
    "age": 65,
    "gender": "L",
    "facility_name": "Rumah Sakit Umum"
  },
  "questions": {
    "1": {"score": 7, "text": "Nyeri", "description": "Nyeri ringan-sedang-berat"},
    "2": {"score": 5, "text": "Lelah/Kekurangan Tenaga", "description": "Kelelahan/Intoleransi Aktivitas"},
    "3": {"score": 8, "text": "Kantuk/Gangguan Tidur", "description": "Gangguan Pola Tidur"},
    "4": {"score": 3, "text": "Mual/Nausea", "description": "Nausea"},
    "5": {"score": 6, "text": "Nafsu Makan", "description": "Resiko Defisit Nutrisi"},
    "6": {"score": 9, "text": "Sesak/Pola Napas", "description": "Pola Napas Tidak Efektif"},
    "7": {"score": 4, "text": "Sedih/Keputusasaan", "description": "Keputusasaan/Depresi"},
    "8": {"score": 2, "text": "Cemas/Ansietas", "description": "Ansietas"},
    "9": {"score": 5, "text": "Perasaan Keseluruhan", "description": "Koping Keluarga"}
  }
}
```

**Struktur JSON `recommendation` (sesuai INTERVENSI.md):**
```json
{
  "diagnosis": "3. Diagnosa: Pola Napas Tidak Efektif",
  "intervention_steps": [
    "Pastikan ruangan bersih, tenang, dan bebas asap/debu.",
    "Duduk setengah tegak dengan dua bantal di belakang punggung.",
    "Pejamkan mata sejenak, rilekskan bahu, dan rasakan posisi nyaman.",
    "Mulai latihan napas dalam: tarik napas perlahan lewat hidung (4 detik), tahan (7 detik), hembuskan pelan lewat mulut (8 detik). Ulangi 3-5 kali.",
    "Lanjutkan dengan pijatan lembut menggunakan ujung jari pada bahu dan punggung atas selama 2 detik, ulangi 5 kali di tiap sisi dengan tekanan ringan.",
    "Perhatikan reaksi tubuh; hentikan jika pusing, batuk, atau sesak.",
    "Setelah selesai, duduk santai selama satu menit dan minum air putih hangat bila diizinkan. Lakukan dua kali sehari atau saat sesak."
  ],
  "references": [
    "Kushariyadi, Ufaidah, F. S., Rondhianto, & Candra, E. Y. S. (2023). Combination Therapy Slow Deep Breathing and Acupressure to Overcome Ineffective Breathing Pattern Nursing Problems: A Case Study. Nursing and Health Sciences Journal, 3(3), 229–236. https://doi.org/10.53713/nhsj.v3i3.289"
  ],
  "action_required": "Segera rujuk ke Fasilitas Kesehatan atau Profesional untuk Penanganan Segera",
  "priority": 1,
  "therapy_type": "Latihan Napas Dalam dan Pijatan Lembut",
  "frequency": "Dua kali sehari atau saat sesak"
}
```

#### Kebijakan RLS (Row Level Security)

Harus diaktifkan untuk semua tabel.

- **profiles:**
  - SELECT: auth.uid() = id
  - INSERT: auth.uid() = id
  - UPDATE: auth.uid() = id
- **patients:**
  - SELECT: auth.uid() = user_id
  - INSERT: auth.uid() = user_id
  - UPDATE: auth.uid() = user_id
  - DELETE: Soft delete (update status)
- **screenings:**
  - SELECT: auth.uid() = user_id
  - INSERT: auth.uid() = user_id
  - UPDATE: auth.uid() = user_id (status changes only)
  - DELETE: Dinonaktifkan (data immutable)

#### Konten Edukasi

Materi 8 Penyakit Terminal **tidak disimpan di database**. Konten statis dari EDUKASI_8_PENYAKIT_TERMINAL.md:
- **Alzheimer Disease**: Definisi, gejala, penyebab, faktor risiko, referensi ilmiah
- **Kanker Payudara**: Definisi, gejala, penyebab, faktor risiko internal/eksternal, referensi
- **Gagal Ginjal Kronik (CKD)**: Definisi, gejala, penyebab, faktor risiko, referensi
- **Diabetes**: Definisi, gejala, penyebab, faktor risiko, referensi
- **Gagal Jantung**: Definisi, gejala (sisi kiri/kanan), penyebab, faktor risiko, referensi
- **HIV dan AIDS**: Definisi, gejala tahapan, penularan, faktor risiko, referensi
- **PPOK**: Definisi, gejala, penyebab, faktor risiko, referensi
- **Stroke**: Definisi, gejala, penyebab, faktor risiko, referensi

Konten akan di-convert ke JSON structure (`/src/data/edukasi-penyakit-terminal.json`) untuk performa terbaik dan kemudahan maintenance.

---

## 5. API & Serverless Logic (Supabase Edge Functions)

### Edge Function: `process-esas-screening`

- **Function:** `process-esas-screening`
- **Endpoint:** `/functions/v1/process-esas-screening`
- **Metode:** POST
- **Auth:** Wajib (verifikasi JWT dari header Authorization)

**Input (Body):**

```json
{
  "patient_name": "Nama Pasien",
  "patient_age": 65,
  "patient_gender": "L",
  "facility_name": "Rumah Sakit Umum",
  "screening_type": "initial",
  "esas_data": {
    "questions": {
      "1": 7,
      "2": 5,
      "3": 8,
      "4": 3,
      "5": 6,
      "6": 9,
      "7": 4,
      "8": 2,
      "9": 5
    }
  }
}
```

**Logika Internal (ESAS Rule Engine sesuai RULES_SKRINING.md & PERTANYAAN_SKRINING_ESAS.md):**

1. **Validasi Input:**
   - Validasi semua 9 questions (nilai 0-10) sesuai PERTANYAAN_SKRINING_ESAS.md
   - Validasi patient data required fields (Nama, Umur, Jenis Kelamin)
   - Validasi score descriptions untuk setiap range (1-3: ringan, 4-6: sedang, 7-10: berat)

2. **Tentukan Skor Tertinggi:**
   - Cari nilai maksimum dari 9 pertanyaan ESAS
   - Catat nomor pertanyaan dengan skor tertinggi
   - Map pertanyaan ke diagnosa keperawatan:
     - Q1 → Nyeri Kronis
     - Q2 → Intoleransi Aktivitas
     - Q3 → Gangguan Pola Tidur
     - Q4 → Nausea
     - Q5 → Resiko Defisit Nutrisi
     - Q6 → Pola Napas Tidak Efektif
     - Q7 → Keputusasaan
     - Q8 → Ansietas
     - Q9 → Peningkatan Koping Keluarga

3. **Handle Ties (Skor Sama):**
   - Gunakan prioritas dari RULES_SKRINING.md:
     - Prioritas 1: Q6 (Pola Napas Tidak Efektif)
     - Prioritas 2: Q1 (Nyeri Kronis)
     - Prioritas 3: Q4 (Nausea)
     - Prioritas 4: Q5 (Resiko Defisit Nutrisi)
     - Prioritas 5: Q3 (Gangguan Pola Tidur)
     - Prioritas 6: Q2 (Intoleransi Aktivitas)
     - Prioritas 7: Q8 (Ansietas)
     - Prioritas 8: Q7 (Keputusasaan)
     - Prioritas 9: Q9 (Koping Keluarga)

4. **Tentukan Risk Level & Action Required:**
   - Skor 1-3: Low (observasi rutin)
   - Skor 4-6: Medium (dukungan nonfarmakologis)
   - Skor 7-10: High (tindakan segera)
   - Generate action recommendations:
     - Q4-Q6 skor tinggi: "Hubungi/Temukan fasilitas kesehatan terdekat"
     - Q7-Q10 skor tinggi: "Segera rujuk ke Fasilitas Kesehatan"

5. **Map ke Intervensi (INTERVENSI.md):**
   - Load data dari INTERVENSI.md sesuai diagnosa
   - Pilih terapi komplementer spesifik:
     - Nyeri Kronis → Akupresur
     - Gangguan Pola Tidur → Aromaterapi Lavender
     - Pola Napas Tidak Efektif → Latihan Napas Dalam
     - Ansietas → Terapi Murottal
     - Nausea → Aromaterapi (Mawar, Jahe, Peppermint)
     - Intoleransi Aktivitas → Slow Deep Breathing (SDB)
     - Resiko Defisit Nutrisi → Pijat Ringan/Sentuhan Terapeutik
     - Keputusasaan → Terapi HOPE
     - Koping Keluarga → Family Empowerment Session
   - Generate rekomendasi lengkap dengan langkah-langkah terapi
   - Include referensi ilmiah untuk setiap intervensi

6. **Simpan ke Database:**
   - Ambil user_id dari JWT
   - Simpan complete screening data dengan JSONB structure
   - Return screening ID dan results dengan recommendation lengkap

**Output (Sukses - 200):**

```json
{
  "new_screening_id": "uuid-baru-dari-db",
  "highest_score": 9,
  "primary_question": 6,
  "risk_level": "high",
  "recommendation": {
    "diagnosis": "3. Diagnosa: Pola Napas Tidak Efektif",
    "intervention_steps": [
      "Pastikan ruangan bersih, tenang, dan bebas asap/debu.",
      "Duduk setengah tegak dengan dua bantal di belakang punggung.",
      "Mulai latihan napas dalam: tarik napas perlahan lewat hidung (4 detik), tahan (7 detik), hembuskan pelan lewat mulut (8 detik)."
    ],
    "references": [
      "Kushariyadi, Ufaidah, F. S., Rondhianto, & Candra, E. Y. S. (2023). Combination Therapy Slow Deep Breathing and Acupressure to Overcome Ineffective Breathing Pattern Nursing Problems: A Case Study."
    ],
    "action_required": "Segera rujuk ke Fasilitas Kesehatan atau Profesional untuk Penanganan Segera",
    "priority": 1
  },
  "all_scores": {
    "1": {"score": 7, "text": "Nyeri"},
    "2": {"score": 5, "text": "Lelah/Kekurangan Tenaga"},
    "3": {"score": 8, "text": "Kantuk/Gangguan Tidur"},
    "4": {"score": 3, "text": "Mual"},
    "5": {"score": 6, "text": "Nafsu Makan"},
    "6": {"score": 9, "text": "Sesak"},
    "7": {"score": 4, "text": "Sedih"},
    "8": {"score": 2, "text": "Cemas"},
    "9": {"score": 5, "text": "Perasaan Keseluruhan"}
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
- **Spesifikasi PDF:**
  - Ukuran kertas: A4 portrait
  - Margin: 20mm (top, bottom, left, right)
  - Header: Logo institusi + judul "LAPORAN HASIL SKRINING PALIATIF"
  - Footer: Halaman {pageNumber} dari {totalPages} + timestamp cetak
  - Font: Arial 12pt untuk body, 14pt untuk heading

- **Struktur PDF:**
  1. **Header Section**
     - Informasi pasien (nama, usia, jenis kelamin)
     - Informasi fasilitas kesehatan
     - Tanggal dan nomor skrining

  2. **Hasil Screening**
     - Total skor
     - Kategori risiko (rendah/sedang/tinggi)
     - Summary findings

  3. **Rekomendasi**
     - Daftar intervensi yang direkomendasikan
     - Timeline tindak lanjut
     - Rujukan jika diperlukan

  4. **Signature**
     - Nama perawat pelaksana
     - Tempat untuk tanda tangan digital

- **Implementasi:**
  - Komponen `<ScreeningPrintableReport reportData={...} />` (layout HTML murni untuk cetak)
  - Render di dalam div tersembunyi (`display: none`)
  - Gunakan `useRef` untuk referensi komponen
  - Gunakan hook `useReactToPrint`
  - Tombol "Ekspor PDF" memanggil trigger dari `useReactToPrint`
  - Tambahkan CSS `@media print` untuk tampilan cetak
  - Waterlight dengan teks "CONFIDENTIAL" di background (opacity 0.1)

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

**Required (.env.local & Vercel):**
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

**Optional (Vercel Production):**
- `NEXT_PUBLIC_APP_ENV` - Environment (development/staging/production)
- `NEXT_PUBLIC_APP_VERSION` - Version number untuk tracking
- `SENTRY_DSN` - Sentry error tracking
- `SUPABASE_SERVICE_ROLE_KEY` - Admin operations (hanya production)

**Development (.env.local):**
```.env.local
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_local_anon_key
NEXT_PUBLIC_APP_ENV=development
```

**Variabel di-set di:**
- **Vercel Project Settings** → Environment Variables
- **Local development** → `.env.local` (jangan commit ke Git)
- **Supabase CLI** → `.env` untuk local development

**Supabase Migrations:**

- Gunakan Supabase CLI
- Setiap perubahan skema → file migrasi: `supabase migration new <nama_migrasi>`
- Terapkan migrasi lokal: `supabase db push`
- Terapkan migrasi ke production: Hubungkan Supabase CLI ke remote DB dan jalankan `db push` (atau gunakan Supabase GitHub Action)

**Database Management:**
- **Backup Strategy:** Daily automatic backup via Supabase Dashboard
- **Local Development:** `supabase start` untuk memulai local instance
- **Seed Data:** `supabase db seed` untuk data testing
- **Reset Local:** `supabase db reset` untuk reset ke state awal

**Performance Optimization:**
- **Static Assets:** Optimized via Vercel Edge Network
- **Database Indexing:** Index pada `user_id`, `created_at`, dan `patient_name`
- **Caching:** Next.js ISR untuk halaman statis
- **Bundle Size:** Code splitting dan lazy loading

---

## 8. Development Best Practices

### Code Quality Standards
- **ESLint:** Standard TypeScript rules
- **Prettier:** Consistent code formatting
- **TypeScript:** Strict mode enabled
- **Git Hooks:** Basic pre-commit checks

### Performance Monitoring
- **Vercel Analytics:** Basic performance tracking
- **Bundle Size:** Monitor untuk optimal loading

---

## 9. Compliance, Security & Data Privacy

### Healthcare Data Compliance

**Standar yang Diterapkan:**
- **Data Privacy:** Sesuai peraturan perlindungan data kesehatan Indonesia
- **Access Control:** Role-based access control (RBAC)
- **Audit Trail:** Log semua akses dan modifikasi data pasien
- **Data Retention:** Kebijakan penyimpanan data sesuai regulasi

### Security Implementation

**Authentication & Authorization:**
- **Strong Password:** Minimum 8 karakter, kombinasi huruf, angka, simbol
- **Session Management:** JWT token dengan expiration 24 jam
- **Two-Factor Authentication:** Opsional untuk admin users
- **Account Lockout:** 5 percobaan gagal → lock 15 menit

**Data Protection:**
- **Encryption at Rest:** Supabase provides default encryption
- **Encryption in Transit:** HTTPS mandatory (SSL/TLS)
- **Data Masking:** Sensitive data di-mask di logs
- **PII Redaction:** Nama pasien sebagian di-hide di UI non-privat

**Application Security:**
- **Input Validation:** Zod schema validation di client & server
- **SQL Injection Prevention:** Parameterized queries via Supabase client
- **XSS Protection:** Content Security Policy (CSP) headers
- **CSRF Protection:** SameSite cookies dan CSRF tokens

### Monitoring & Logging

**Security Monitoring:**
- **Failed Login Attempts:** Alert setelah 3 failed attempts
- **Suspicious Activity:** Unusual access patterns detection
- **Data Export Logs:** All PDF downloads tracked
- **User Activity:** Last login timestamp, session duration

**Error Handling & Logging:**
- **Structured Logging:** JSON format dengan correlation IDs
- **Error Classification:** Public vs Internal error messages
- **Sentry Integration:** Real-time error tracking
- **Log Retention:** 90 days untuk application logs

### Access Control Matrix

| Role | View Screenings | Create Screening | Export PDF | Delete Data | Admin Access |
|------|----------------|------------------|------------|-------------|--------------|
| Perawat | ✓ (own) | ✓ | ✓ (own) | ✗ | ✗ |
| Supervisor | ✓ (all) | ✓ | ✓ (all) | ✗ | ✗ |
| Admin | ✓ (all) | ✓ | ✓ (all) | ✓ (soft) | ✓ |

---

## 10. Error Handling & Response Standards

### API Response Format

**Success Response (200):**
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-06T10:30:00Z"
}
```

**Error Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "patient_age",
      "reason": "Age must be between 0 and 150"
    }
  },
  "timestamp": "2025-01-06T10:30:00Z"
}
```

### Error Codes & Messages

| Error Code | HTTP Status | Description | User Message |
|------------|-------------|-------------|--------------|
| VALIDATION_ERROR | 400 | Input validation failed | "Data yang dimasukkan tidak valid" |
| UNAUTHORIZED | 401 | No authentication | "Silakan login terlebih dahulu" |
| FORBIDDEN | 403 | Insufficient permissions | "Anda tidak memiliki akses" |
| NOT_FOUND | 404 | Resource not found | "Data tidak ditemukan" |
| RATE_LIMIT | 429 | Too many requests | "Terlalu banyak permintaan, coba lagi nanti" |
| INTERNAL_ERROR | 500 | Server error | "Terjadi kesalahan sistem" |
| DATABASE_ERROR | 503 | Database unavailable | "Sedang dalam maintenance" |

### Client-Side Error Handling

**Form Validation:**
- Real-time validation dengan react-hook-form
- Error messages di bawah field input
- Visual feedback dengan border merah
- Disabled submit button saat invalid

**Network Error Handling:**
- Retry mechanism untuk failed requests (3x)
- Offline detection dengan service worker
- Graceful degradation saat network issues
- User notifications dengan toast/shadcn/ui alerts

---

## 11. Ketergantungan Kritis & Blocker

**BLOCKER KLIEN:**
Proyek tidak dapat melanjutkan bagian skrining tanpa 3 hal dari Klien:

- Daftar Pertanyaan Final (untuk ScreeningForm)
- Logika Aturan / Rules (untuk process-screening Edge Function)
- Konten 8 Penyakit (untuk halaman statis edukasi/[slug])

**CATATAN:**
- Form screening, rule engine, dan alur scoring akan diimplementasikan setelah data dari client diterima
- Infrastructure setup, authentication, dan basic UI components dapat dimulai sekarang
- Template halaman edukasi akan disiapkan sebagai placeholder
- Authentication system untuk perawat sudah termasuk dalam scope proposal
- Export PDF functionality sudah termasuk dalam scope proposal

**BLOCKER TEKNIS:**
Keterbatasan Supabase Free Tier (misal: timeout Edge Function) perlu dipantau, meskipun untuk proyek skala ini seharusnya sangat aman.

**INFORMASI PROYEK:**
- **Start Date:** 6 November 2025 (Hari Ini)
- **Deadline:** 16 November 2025
- **Status Pembayaran:** ✅ DP Rp 500.000,- diterima
- **Sisa Pembayaran:** Rp 1.200.000,- (paid on completion)

---

## 🚀 QUICK START GUIDE

### Environment Setup
```bash
# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Isi dengan Supabase credentials

# Start development server
npm run dev
```

### Project Structure
```
/app
├── (auth)                  # Login/Register pages
│   ├── login/page.tsx      # Login page
│   └── register/page.tsx   # Register page
├── (protected)             # Protected routes
│   ├── dashboard/page.tsx  # Main dashboard with analytics
│   ├── pasien/             # Patient management
│   │   ├── page.tsx        # List of all patients
│   │   └── [id]/           # Patient detail & history
│   ├── screening/          # Screening flow
│   │   ├── new/page.tsx    # New screening form
│   │   └── [id]/result/    # Screening result
│   └── edukasi/            # Educational content
│       ├── page.tsx        # Overview of diseases
│       └── [slug]/page.tsx # Disease detail page
└── layout.tsx              # Root layout

/lib
├── supabase.ts             # Supabase client
├── utils.ts                # Utility functions
├── types.ts                # TypeScript types
└── validations.ts          # Form validations

/components
├── ui/                     # shadcn/ui components
├── auth/                   # Authentication components
├── screening/              # Screening form components
├── charts/                 # Data visualization
├── pasien/                 # Patient management components
└── layout/                 # Layout components
```

### Development Priority Order
1. **Authentication System** (Days 1-2)
2. **Basic UI Layout & Navigation** (Day 3)
3. **Educational Content Pages** (Days 4-5)
4. **Screening Form & Logic** (Days 6-8)
5. **Results Page & PDF Export** (Day 9)
6. **Testing & Bug Fixes** (Day 10)

### Key Features to Implement
- ✅ Login/Register untuk Perawat
- ✅ Halaman Edukasi 8 Penyakit
- ✅ Form Screening Interaktif
- ✅ Hasil Screening & Rekomendasi
- ✅ Export PDF untuk Laporan Pasien
- ✅ **Riwayat Screening per Pasien**
- ✅ **Rekap Seluruh Pasien per Perawat**
- ✅ **Dashboard Analytics**
