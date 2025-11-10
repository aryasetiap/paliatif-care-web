# PAGE DEFINITIONS & SPECIFICATIONS

**Proyek:** Website Edukasi & Skrining Paliatif
**Timeline:** 6 - 16 November 2025
**Status:** DP Received - Project Active
**Versi:** 1.0

---

## 1. Peta Situs (Sitemap)

```
├── /                          # Landing page - redirect ke /login atau /dashboard
├── /login                     # Halaman login perawat
├── /register                  # Halaman registrasi perawat baru
├── /dashboard                 # Dashboard overview screening & pasien (protected)
├── /pasien                    # Daftar semua pasien yang pernah di-screening (protected)
├── /pasien/[id]               # Detail pasien & riwayat screening lengkap (protected)
├── /screening/new             # Form screening ESAS 9 pertanyaan (protected)
├── /screening/[id]/result     # Hasil screening dengan rekomendasi intervensi (protected)
├── /edukasi                   # Overview 8 penyakit terminal (protected)
├── /edukasi/[slug]            # Detail penyakit (Alzheimer, Kanker Payudara, dll) (protected)
└── /profile                   # Profil perawat & statistik (protected)
```

---

## 2. Spesifikasi Halaman

### 2.1 Authentication Pages

#### `/login` - Login Page
**Purpose:** Login untuk perawat yang sudah terdaftar
**Access:** Public
**Layout:** Auth layout (minimal branding)

**Components:**
- Login form (email, password)
- Remember me checkbox
- Forgot password link
- Link ke register page
- Error handling untuk invalid credentials

**Validations:**
- Email format validation
- Required field validation
- Show error message untuk failed login

#### `/register` - Register Page
**Purpose:** Registrasi perawat baru
**Access:** Public
**Layout:** Auth layout (minimal branding)

**Components:**
- Registration form (nama, email, password, confirm password)
- Password strength indicator
- Terms & conditions checkbox
- Link ke login page
- Success message & redirect

**Validations:**
- Email format & uniqueness
- Password minimum 8 characters
- Password match confirmation
- Required fields validation

---

### 2.2 Dashboard & Overview

#### `/dashboard` - Main Dashboard
**Purpose:** Overview analytics & quick access
**Access:** Protected (login required)
**Layout:** Main layout dengan sidebar navigation

**Components:**
- **Header:** User info, notifications, logout
- **Sidebar:** Navigation menu
- **Stats Cards:**
  - Total Pasien (count)
  - Total Screening (count)
  - Screening Bulan Ini (count)
  - Rata-rata Skor Risiko (average)
- **Recent Patients Table:** 5 pasien terakhir
- **Quick Actions:**
  - Tombol "Screening Baru"
  - Tombol "Lihat Semua Pasien"
- **Simple Charts:**
  - Risk Distribution (pie chart)
  - Monthly Screening Trend (line chart)

**Data Required:**
- Patient count dari tabel patients
- Screening count dari tabel screenings
- Recent patients data
- Basic aggregations untuk charts

---

### 2.3 Patient Management

#### `/pasien` - Patient List
**Purpose:** Daftar semua pasien yang pernah di-screening
**Access:** Protected
**Layout:** Main layout dengan content area lebar

**Components:**
- **Page Header:** Title, "Tambah Pasien Baru" button
- **Search & Filter Bar:**
  - Search input (nama pasien)
  - Date range filter
  - Filter berdasarkan risiko (setelah ada data)
- **Patients Table:**
  - Kolom: Nama, Usia, Jenis Kelamin, Screening Terakhir, Status Risiko, Actions
  - Sorting capabilities
  - Pagination (10 items per page)
- **Table Actions per Row:**
  - "Lihat Detail" button
  - "Screening Baru" button
  - "Export Riwayat" button

**Data Required:**
- List of patients dengan latest screening info
- Search functionality
- Filter capabilities
- Pagination logic

#### `/pasien/[id]` - Patient Detail
**Purpose:** Detail pasien dan riwayat screening lengkap
**Access:** Protected
**Layout:** Main layout dengan breadcrumbs

**Components:**
- **Breadcrumbs:** Dashboard → Patients → Patient Name
- **Patient Info Card:**
  - Nama, usia, jenis kelamin, fasilitas
  - Tanggal pendaftaran, total screening
- **Action Buttons:**
  - "Screening Baru"
  - "Edit Data Pasien"
  - "Export Semua Riwayat"
- **Screening History Timeline:**
  - Chronological list dari semua screening
  - Each item shows: tanggal, skor risiko, status
  - Expandable untuk melihat detail & rekomendasi
  - Link ke halaman result masing-masing screening
- **Progress Chart:** Visualisasi perkembangan pasien

**Data Required:**
- Patient detail data
- All screening history untuk patient
- Progress calculations

---

### 2.4 Screening Flow ESAS

#### `/screening/new` - Form Screening ESAS
**Purpose:** Form screening 9 pertanyaan ESAS untuk pasien
**Access:** Protected
**Layout:** Single-page form dengan patient data + ESAS questions

**Components:**
- **Form Header:** Title "Screening ESAS", step indicator
- **Patient Data Section:**
  - Option: "Pasien Baru" vs "Pasien Existing"
  - If existing: Search patient dropdown dari database
  - If new: Form (Nama, Usia, Jenis Kelamin, Fasilitas Kesehatan)
- **Identity Questions:**
  - Nama, Umur, Jenis Kelamin (wajib diisi)
- **ESAS Questions (9 Pertanyaan sesuai PERTANYAAN_SKRINING_ESAS.md):**
  1. Nyeri (Skor 0-10 + deskripsi lengkap sesuai dokumen)
  2. Lelah/Kekurangan Tenaga (Skor 0-10 + deskripsi lengkap sesuai dokumen)
  3. Kantuk/Gangguan Tidur (Skor 0-10 + deskripsi lengkap sesuai dokumen)
  4. Mual/Nausea (Skor 0-10 + deskripsi lengkap sesuai dokumen)
  5. Nafsu Makan (Skor 0-10 + deskripsi lengkap sesuai dokumen)
  6. Sesak/Pola Napas (Skor 0-10 + deskripsi lengkap sesuai dokumen)
  7. Sedih/Keputusasaan (Skor 0-10 + deskripsi lengkap sesuai dokumen)
  8. Cemas/Ansietas (Skor 0-10 + deskripsi lengkap sesuai dokumen)
  9. Perasaan Keseluruhan (Skor 0-10 + deskripsi lengkap sesuai dokumen)
- **Form Actions:**
  - Save Draft button
  - Submit Screening button
  - Cancel button

**Validation Rules:**
- All identity fields required
- All 9 ESAS questions required (0-10 only)
- Score descriptions shown for reference

#### `/screening/[id]/result` - Hasil Screening & Rekomendasi
**Purpose:** Hasil screening ESAS dengan rekomendasi intervensi
**Access:** Protected
**Layout:** Results dashboard dengan action buttons

**Components:**
- **Result Header:** Patient info, screening date, timestamp
- **ESAS Scores Summary:**
  - Visual representation dari 9 skor (bar chart/radar)
  - Highlight skor tertinggi
  - Overall risk assessment
- **Rule Engine Results:**
  - Diagnosa keperawatan berdasarkan skor tertinggi sesuai RULES_SKRINING.md
  - Prioritas jika ada skor sama (Prioritas 1: Q6, Prioritas 2: Q1, dst)
  - Recommendation level (Low/Medium/High)
  - Action required based on score range:
    - Q4-Q6 skor tinggi: "Hubungi/Temukan fasilitas kesehatan terdekat"
    - Q7-Q10 skor tinggi: "Segera rujuk ke Fasilitas Kesehatan"
- **Intervensi Recommendations:**
  - Link ke intervensi spesifik dari dokumen INTERVENSI.md (9 diagnosa lengkap)
  - Step-by-step terapi instructions detail
  - Referensi ilmiah untuk setiap intervensi
- **Action Buttons:**
  - "Export PDF" (cetak hasil lengkap)
  - "Screening Baru" (untuk pasien yang sama)
  - "Kembali ke Pasien"
  - "Lihat Riwayat Pasien"

**Data Processing:**
- Apply RULES_SKRINING.md logic (pemetaan 9 pertanyaan ke 9 diagnosa intervensi)
- Map highest score to specific intervention sesuai INTERVENSI.md
- Handle ties dengan priority system (Q6 > Q1 > Q4 > Q5 > Q3 > Q2 > Q8 > Q7 > Q9)
- Store complete results in database
- Generate action recommendations berdasarkan skor dan pertanyaan

---

### 2.5 Educational Content

#### `/edukasi` - Education Overview
**Purpose:** Overview dari 8 penyakit terminal
**Access:** Protected
**Layout:** Grid layout dengan cards

**Components:**
- **Page Header:** Title, description
- **Disease Grid:** 8 cards in responsive grid
  - Each card: Disease name, brief description, image
  - Hover effects dan click navigation
- **Search Bar:** Search diseases
- **Category Filter:** Filter berdasarkan kategori (jika ada)

#### `/edukasi/[slug]` - Detail Penyakit Terminal
**Purpose:** Detail informasi lengkap satu penyakit terminal dari EDUKASI_8_PENYAKIT_TERMINAL.md
**Access:** Protected
**Layout:** Article layout dengan medical design

**Available Diseases (8):**
- `/edukasi/alzheimer` - Alzheimer Disease
- `/edukasi/kanker-payudara` - Kanker Payudara
- `/edukasi/gagal-ginjal-kronik` - Gagal Ginjal Kronik (CKD)
- `/edukasi/diabetes` - Diabetes Melitus
- `/edukasi/gagal-jantung` - Gagal Jantung
- `/edukasi/hiv-aids` - HIV dan AIDS
- `/edukasi/ppok` - Penyakit Paru Obstruktif Kronik (PPOK)
- `/edukasi/stroke` - Stroke

**Components:**
- **Disease Header:** Name, category, brief overview
- **Table of Contents:** Sticky navigation (desktop)
- **Content Sections:**
  - Definisi (penjelasan medis)
  - Tanda dan Gejala (detailed symptoms)
  - Penyebab (etiology)
  - Faktor Risiko (risk factors - internal/external)
  - Referensi Ilmiah (scientific references)
- **Navigation:**
  - Previous/Next disease buttons
  - Back to overview
- **Print Friendly:** Clean layout untuk PDF export
- **Search:** Quick search dalam content

**Data Source:** Static content dari JSON `/src/data/edukasi-penyakit-terminal.json`

---

### 2.6 Profile Management

#### `/profile` - Nurse Profile
**Purpose:** Profil dan settings perawat
**Access:** Protected
**Layout:** Settings layout

**Components:**
- **Profile Info:** Name, email, registration date
- **Statistics:** Total screenings, total patients
- **Settings:**
  - Change password
  - Email notifications
  - Theme preference (future)
- **Account Actions:**
  - Export my data
  - Delete account (confirm)

---

## 3. Responsive Design Requirements

### Breakpoints:
- **Mobile:** 320px - 768px (single column)
- **Tablet:** 768px - 1024px (two columns)
- **Desktop:** 1024px+ (full layout)

### Mobile Adaptations:
- **Navigation:** Hamburger menu untuk mobile
- **Tables:** Horizontal scroll atau card layout
- **Forms:** Full width, larger touch targets
- **Charts:** Simplified versions untuk mobile

---

## 4. Loading & Error States

### Loading States:
- **Skeleton screens** untuk data loading
- **Loading spinners** untuk actions
- **Progress bars** untuk multi-step processes

### Error States:
- **404 pages** untuk not found
- **Error boundaries** untuk component errors
- **Network error handling** dengan retry options
- **Empty states** untuk no data

---

## 5. Accessibility Requirements

### WCAG 2.1 AA Compliance:
- **Keyboard navigation** untuk semua interactive elements
- **Screen reader support** dengan proper labels
- **Color contrast** minimum 4.5:1
- **Focus indicators** yang visible
- **Alternative text** untuk semua images

---

## 6. Performance Requirements

### Core Web Vitals:
- **LCP:** < 2.5s (largest contentful paint)
- **FID:** < 100ms (first input delay)
- **CLS:** < 0.1 (cumulative layout shift)

### Optimization:
- **Image optimization** dengan Next.js Image
- **Code splitting** untuk route-based chunks
- **Lazy loading** untuk non-critical components
- **Caching strategy** untuk static content