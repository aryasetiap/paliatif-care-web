# Task List Revisi - Aplikasi Paliatif Care Web

## Dokumen Revisi Client
Berdasarkan dokumen REVISI1.md, client meminta perubahan signifikan pada sistem autentikasi dan manajemen data screening.

## Daftar Task Revisi Detail

### 1. Sistem Autentikasi Multi-Role

#### 1.1. Database Schema Changes
- [x] **Add role column to users table**
  - ✅ Ubah tabel `profiles` untuk menambah kolom `role` dengan tipe enum
  - ✅ Roles: `'admin'`, `'perawat'`, `'pasien'`
  - ✅ Default value untuk existing users

- [ ] **Create user_roles table (optional)**
  - Jika menggunakan sistem role yang lebih kompleks
  - Table: `user_roles` (user_id, role_id)
  - Table: `roles` (id, name, description)

#### 1.2. Authentication System Update
- [x] **Update login component**
  - ✅ Auto-detect role dari user profile
  - ✅ Validasi role saat login
  - ✅ Redirect berdasarkan role setelah login berhasil

- [x] **Create role-based middleware**
  - ✅ Buat middleware untuk validasi role (`roleMiddleware.tsx`)
  - ✅ Protect routes berdasarkan role
  - ✅ Implementasi role checking di API endpoints

- [x] **Update session management**
  - ✅ Simpan role information di session/token
  - ✅ Update context/auth state management
  - ✅ Implementasi role-based UI rendering

### 2. Role Pasien - Self Screening

#### 2.1. Pasien Dashboard
- [x] **Create pasien dashboard page**
  - ✅ Landing page untuk role pasien (`/pasien/dashboard`)
  - ✅ Menu: Screening Baru, Riwayat Screening, Profile
  - ✅ Display informasi pasien

- [x] **Implementasi screening untuk diri sendiri**
  - ✅ Form ESAS screening tanpa perlu memilih pasien
  - ✅ Auto-fill data pasien dari user profile
  - ✅ Validasi data pasien sebelum screening

#### 2.2. Patient Profile Management
- [x] **Create patient profile page**
  - ✅ Edit data diri pasien (`/pasien/profile`)
  - ✅ Update informasi kontak
  - ✅ Link data pasien dengan user account

- [x] **Profile validation**
  - ✅ Validasi data kelengkapan profile
  - ✅ Required fields untuk screening
  - ✅ Notifikasi jika data belum lengkap

### 3. Guest User Screening

#### 3.1. Guest Screening Flow
- [x] **Implement guest access to screening**
  - ✅ Tanpa login untuk mengakses form ESAS
  - ✅ Route public: `/screening/guest`
  - ✅ Remove authentication requirement dari screening form

#### 3.2. Guest Data Management
- [x] **Guest form modifications**
  - ✅ Tambah field informasi dasar pasien
  - ✅ Fields: nama, usia, gender, kontak (required), fasilitas (optional)
  - ✅ Validasi data sebelum submit

- [x] **Database handling for guest data**
  - ✅ Simpan screening tanpa user_id
  - ✅ Use guest_identifier (UUID v4)
  - ✅ Flag data sebagai guest submission (is_guest: true)

#### 3.3. Guest Result Display
- [x] **Instant result display for guests**
  - ✅ Show hasil screening setelah submit
  - ✅ Tampilkan skor ESAS dan interpretasi
  - ✅ Option untuk save/download hasil (PDF/Print)
  - ✅ Tidak ada akses ke riwayat atau edit kembali

### 4. Admin Dashboard

#### 4.1. Admin Authentication
- [x] **Create admin role and access**
  - ✅ Add 'admin' role to system
  - ✅ Admin login mechanism
  - ✅ Admin route protection: `/admin/*`

#### 4.2. Admin Dashboard Development
- [x] **Create admin dashboard layout**
  - ✅ Navigation sidebar dengan menu admin
  - ✅ Header dengan admin user info
  - ✅ Responsive design

- [x] **Screening Data Management Page**
  - ✅ View semua screening data (all users + guest)
  - ✅ Tabel dengan kolom: tanggal, nama pasien, role user, skor ESAS, status
  - ✅ Search dan filter functionality
  - ✅ Pagination untuk data yang besar

- [x] **User Management Page**
  - ✅ List semua registered users
  - ✅ Filter by role (perawat, pasien)
  - ✅ User status management (active/inactive)
  - ✅ Add/edit/delete user functionality

- [x] **Data Export Features**
  - ✅ Export screening data ke CSV/Excel
  - ✅ Filter berdasarkan tanggal range, user, role
  - ✅ Generate laporan statistik

- [x] **Admin Analytics**
  - ✅ Total screening per periode
  - ✅ Rata-rata skor ESAS
  - ✅ Demographic breakdown
  - ✅ Chart visualization

### 5. Data Security & Privacy

#### 5.1. Role-Based Access Control (RBAC)
- [x] **Implement RBAC system**
  - ✅ Database layer: Row Level Security
  - ✅ API layer: Role validation
  - ✅ Frontend: Conditional rendering

- [x] **Data Isolation Rules**
  - ✅ **Pasien**: Hanya bisa lihat screening miliknya sendiri
  - ✅ **Perawat**: Hanya bisa lihat screening pasien yang ditangani
  - ✅ **Admin**: Bisa lihat semua data screening

#### 5.2. API Security
- [x] **Update API endpoints with role validation**
  - ✅ `GET /api/screening` - filter by user role
  - ✅ `GET /api/screening/:id` - validate ownership
  - ✅ `POST /api/screening` - set correct user_id based on auth
  - ✅ `GET /api/users` - admin only

- [x] **Database Security Policies**
  - ✅ Implement Row Level Security (RLS) policies
  - ✅ User screening data access restrictions
  - ✅ Guest data access control

### 6. UI/UX Updates

#### 6.1. Navigation & Routing Updates
- [x] **Update navigation based on role**
  - ✅ Dashboard items berbeda per role
  - ✅ Hide/show menu items
  - ✅ Breadcrumb navigation

- [x] **Route protection**
  - ✅ Redirect unauthorized users
  - ✅ Custom 403 pages
  - ✅ Role-based landing pages

#### 6.2. Form Modifications
- [x] **ESAS form variations**
  - ✅ Form untuk pasien (self-screening)
  - ✅ Form untuk perawat (pasien selection)
  - ✅ Form untuk guest (dengan data pasien)

#### 6.3. Responsive Design
- [x] **Mobile optimization**
  - ✅ Ensure all new features work on mobile
  - ✅ Touch-friendly interfaces
  - ✅ Proper viewport handling

### 7. Testing & Quality Assurance

#### 7.1. Role Testing
- [x] **Test all role scenarios**
  - ✅ Admin access to all features
  - ✅ Perawat access limitations
  - ✅ Pasien self-screening flow
  - ✅ Guest screening and result display

#### 7.2. Security Testing
- [x] **Test data isolation**
  - ✅ Verify pasien tidak bisa akses data lain
  - ✅ Test API endpoint security
  - ✅ Validate RBAC implementation

#### 7.3. Integration Testing
- [x] **End-to-end testing**
  - ✅ Complete user flows per role
  - ✅ Guest to registered user conversion
  - ✅ Admin dashboard functionality

### 8. Documentation & Deployment

#### 8.1. Technical Documentation
- [ ] **Update API documentation**
  - Document new role-based endpoints
  - Update authentication flow
  - Security implementation notes

- [ ] **User documentation**
  - Admin dashboard guide
  - Pasien user guide
  - Guest screening instructions

#### 8.2. Database Migration
- [ ] **Create migration scripts**
  - Add role columns
  - Migrate existing user data
  - Backward compatibility

#### 8.3. Deployment Preparation
- [ ] **Environment configuration**
  - Update environment variables
  - Database connection strings
  - Role-based configuration

---

## Prioritas Implementasi

### Phase 1 (High Priority)
1. Database schema changes (role system)
2. Basic role-based authentication
3. Guest screening functionality
4. Admin dashboard basic structure

### Phase 2 (Medium Priority)
1. Pasien dashboard and self-screening
2. Advanced admin features
3. Data export functionality
4. Security implementation

### Phase 3 (Low Priority)
1. Analytics and reporting
2. Advanced UI/UX improvements
3. Performance optimization
4. Additional admin tools

---

## Risk Assessment & Mitigation

### High Risk Items
- **Data Security**: Implementasi RBAC harus tepat untuk menghindari data leak
- **Database Migration**: Perlu backup dan rollback plan
- **Guest Data**: Manage anonymous data yang tersimpan

### Mitigation Strategies
- Comprehensive testing sebelum production
- Database backup sebelum migration
- Gradual rollout dengan feature flags
- Regular security audits

---

## Timeline Estimation

- **Phase 1**: 2-3 minggu
- **Phase 2**: 2-3 minggu
- **Phase 3**: 1-2 minggu
- **Testing & QA**: 1 minggu
- **Documentation**: 1 minggu

**Total Estimated Timeline**: 7-10 minggu

---

## Required Resources

### Development Team
- Backend Developer (1) - API, Database, Authentication
- Frontend Developer (1) - UI/UX, Client-side logic
- QA Engineer (1) - Testing, Security validation

### Tools & Technologies
- Database migration tools
- Role-based access control libraries
- Testing frameworks
- Documentation tools

---

## Success Criteria

### Functional Requirements
- [x] ✅ All roles dapat login dengan benar
- [x] ✅ Pasien bisa melakukan self-screening
- [x] ✅ Guest user bisa screening tanpa login
- [x] ✅ Admin bisa mengakses semua data
- [x] ✅ Data security terimplementasi dengan benar
- [x] ✅ Row Level Security (RLS) policies aktif dan berfungsi
- [x] ✅ Guest access control berfungsi tanpa autentikasi
- [x] ✅ Multi-role data isolation berjalan dengan baik

### Non-Functional Requirements
- [x] ✅ Aplikasi tetap performant dengan role-based features
- [x] ✅ UI/UX konsisten dan user-friendly
- [x] ✅ Data privacy dan security terjamin
- [x] ✅ Dokumentasi lengkap dan up-to-date