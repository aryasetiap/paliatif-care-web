# PAGE DEFINITIONS & SPECIFICATIONS

**Proyek:** Website Edukasi & Skrining Paliatif
**Timeline:** 6 - 16 November 2025
**Status:** DP Received - Project Active
**Versi:** 1.0

---

## 1. Peta Situs (Sitemap)

```
├── /                          # Landing page / redirect ke dashboard
├── /login                     # Halaman login perawat
├── /register                  # Halaman registrasi perawat baru
├── /dashboard                 # Dashboard utama (protected)
├── /pasien                    # Daftar semua pasien (protected)
├── /pasien/[id]               # Detail pasien & riwayat (protected)
├── /screening/new             # Form screening baru (protected)
├── /screening/[id]/result     # Hasil screening (protected)
├── /edukasi                   # Overview 8 penyakit (protected)
├── /edukasi/[slug]            # Detail penyakit (protected)
└── /profile                   # Profil perawat (protected)
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

### 2.4 Screening Flow

#### `/screening/new` - New Screening Form
**Purpose:** Form untuk screening pasien baru atau existing
**Access:** Protected
**Layout:** Form layout dengan progress indicator

**Components:**
- **Form Header:** Title, progress bar
- **Patient Selection:**
  - Option: "Pasien Baru" vs "Pasien Existing"
  - If existing: Search patient dropdown
  - If new: Patient data form
- **Screening Form:**
  - Multi-step form dengan sections
  - Progress indicator (Step 1/5, etc.)
  - Validation per step
  - Auto-save draft functionality
- **Form Sections (placeholder):**
  - Section 1: Demographic Data
  - Section 2: Symptoms Assessment
  - Section 3: Physical Examination
  - Section 4: Psychological Assessment
  - Section 5: Social Support
- **Form Actions:**
  - Previous/Next buttons
  - Save Draft button
  - Submit button (final step)

**Data Required:**
- Screening questions dari client
- Validation rules
- Form state management

#### `/screening/[id]/result` - Screening Result
**Purpose:** Hasil screening dan rekomendasi
**Access:** Protected
**Layout:** Report layout

**Components:**
- **Result Header:** Patient info, screening date, risk score
- **Risk Assessment Summary:**
  - Overall risk level (Low/Medium/High)
  - Score visualization
  - Key findings summary
- **Recommendations Section:**
  - List of interventions
  - Priority levels
  - Next steps
- **Detailed Results:**
  - Breakdown per assessment category
  - Comparison dengan previous screenings
- **Action Buttons:**
  - "Export PDF"
  - "Share Results"
  - "New Screening"
  - "Back to Patient"

**Data Required:**
- Screening result data
- Recommendation logic
- PDF generation functionality

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

#### `/edukasi/[slug]` - Disease Detail
**Purpose:** Detail informasi satu penyakit
**Access:** Protected
**Layout:** Article layout

**Components:**
- **Disease Header:** Name, category, overview
- **Table of Contents:** Sticky navigation
- **Content Sections:**
  - Definisi
  - Gejala
  - Stadium
  - Penanganan Paliatif
  - Prognosis
  - Resources
- **Related Diseases:** Links ke diseases lain
- **Share/Print:** Print-friendly version

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