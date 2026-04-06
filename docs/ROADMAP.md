# 🗺️ Roadmap Pengembangan
# RyuZuno — Platform E-Learning dengan Gamifikasi

**Versi:** 1.0  
**Tanggal:** 6 April 2026  
**Total Estimasi:** 24 Minggu (6 Bulan)

---

## Overview Fase

| Fase | Nama | Durasi | Status |
|------|------|--------|--------|
| 1 | Fondasi & Setup | Minggu 1-4 | ✅ Selesai |
| 2 | Pengalaman Student | Minggu 5-8 | ✅ Selesai |
| 3 | Tools Teacher & Moderator | Minggu 9-12 | ✅ Selesai |
| 4 | Gamifikasi & Learning Paths | Minggu 13-16 | ✅ Selesai |
| 5 | E-Commerce & Admin | Minggu 17-20 | 🔄 In Progress |
| 6 | Optimasi & Peluncuran | Minggu 21-24 | ⏳ Planned |

---

## Fase 1: Fondasi & Setup (Minggu 1-4) ✅

### Tujuan
Membangun fondasi teknis, database schema, autentikasi, dan halaman publik utama.

### Deliverables

#### Minggu 1-2: Setup & Database
- [x] Inisialisasi project (React + Vite + TypeScript + Tailwind)
- [x] Setup Lovable Cloud (Supabase)
- [x] Desain dan implementasi database schema (27+ tabel)
- [x] Setup Row Level Security (RLS) policies
- [x] Implementasi enum types (app_role, course_status, difficulty_level)
- [x] Fungsi `has_role()` untuk authorization

#### Minggu 3-4: Auth & Halaman Publik
- [x] Sistem autentikasi (Login/Register)
- [x] Landing page dengan hero section
- [x] Halaman Catalog/Explore dengan filter & search
- [x] Halaman Course Detail
- [x] Halaman Learning Path Detail
- [x] Navbar & Footer responsive
- [x] Design system & theming (CSS variables, dark mode)

### Milestone
> ✅ Platform dapat diakses publik, user bisa register/login dan browse kursus.

---

## Fase 2: Pengalaman Student (Minggu 5-8) ✅

### Tujuan
Membangun dashboard student lengkap dengan course player dan tracking progress.

### Deliverables

#### Minggu 5-6: Dashboard & Enrollment
- [x] Student Dashboard (overview, stats, kursus aktif)
- [x] My Courses page dengan progress bars
- [x] Enrollment system
- [x] Profile page (edit profil, statistik)

#### Minggu 7-8: Course Player
- [x] Course Player dengan navigasi lesson
- [x] Video player integration
- [x] Rich text content viewer (TipTap)
- [x] Quiz system (pertanyaan, opsi, scoring)
- [x] Assignment submission
- [x] Coding exercise interface
- [x] Lesson progress tracking ("Complete Lesson" button)
- [x] Lesson attachments viewer

### Milestone
> ✅ Student bisa enroll, belajar melalui course player, mengerjakan quiz/assignment, dan melihat progress.

---

## Fase 3: Tools Teacher & Moderator (Minggu 9-12) ✅

### Tujuan
Memberikan tools lengkap untuk teacher membuat kursus dan moderator me-review konten.

### Deliverables

#### Minggu 9-10: Teacher Dashboard
- [x] Teacher Dashboard (overview stats)
- [x] Course Management (CRUD kursus)
- [x] Curriculum Builder (sections, lessons)
- [x] Rich text editor untuk konten lesson (TipTap)
- [x] Lesson features form (quiz, assignment, coding exercise, attachments)

#### Minggu 11-12: Moderator & Teacher Analytics
- [x] Student Analytics per kursus
- [x] Teacher Reviews page
- [x] Moderator Review Queue
- [x] Course Review interface (preview, feedback, approve/reject)
- [x] Moderation Log (history keputusan)

### Milestone
> ✅ Teacher bisa membuat kursus lengkap, moderator bisa me-review dan approve/reject.

---

## Fase 4: Gamifikasi & Learning Paths (Minggu 13-16) ✅

### Tujuan
Implementasi sistem gamifikasi dan learning paths untuk meningkatkan engagement.

### Deliverables

#### Minggu 13-14: Badge System
- [x] Badge Management (admin CRUD)
- [x] User Badges collection page
- [x] Badge earning logic (otomatis saat criteria tercapai)
- [x] XP Points system
- [x] Badge notification

#### Minggu 15-16: Learning Paths & Leaderboard
- [x] Learning Path Builder (admin)
- [x] Learning Path enrollment
- [x] Progress tracking visual (step-by-step)
- [x] Leaderboard page (global ranking)
- [x] Filter leaderboard (mingguan/bulanan/all-time)
- [x] Student Learning Paths dashboard

### Milestone
> ✅ Sistem gamifikasi aktif — badges otomatis, XP, leaderboard, dan learning paths berfungsi.

---

## Fase 5: E-Commerce & Admin (Minggu 17-20) 🔄

### Tujuan
Implementasi sistem pembayaran dan dashboard admin lengkap.

### Deliverables

#### Minggu 17-18: Shopping & Payment
- [x] Shopping Cart (multi-item)
- [x] Coupon system
- [x] Checkout flow (Review → Payment → Success)
- [x] Mock QRIS payment simulation
- [ ] Integrasi Midtrans QRIS (production)
- [ ] Order History page
- [ ] Invoice/receipt generation

#### Minggu 19-20: Admin Dashboard
- [x] Admin Dashboard (statistik platform)
- [x] User Management (CRUD, assign roles)
- [x] Course Management (featured, hapus)
- [x] Category Management
- [x] Badge Management
- [x] Learning Path Management
- [ ] Revenue Reports
- [ ] User Engagement Reports

### Milestone
> 🔄 Sistem pembayaran dan admin panel berfungsi penuh. Midtrans integration pending.

---

## Fase 6: Optimasi & Peluncuran (Minggu 21-24) ⏳

### Tujuan
Polish, optimasi performa, testing, dan persiapan peluncuran.

### Deliverables

#### Minggu 21-22: Optimasi
- [ ] Performance optimization (lazy loading, code splitting)
- [ ] SEO optimization (meta tags, structured data, sitemap)
- [ ] Image optimization & CDN
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Mobile responsiveness polish
- [ ] Error handling & fallback UI

#### Minggu 23-24: Testing & Launch
- [ ] End-to-end testing (Playwright)
- [ ] Security audit (RLS verification)
- [ ] Load testing
- [ ] Bug fixing & polish
- [ ] Documentation finalisasi
- [ ] Production deployment
- [ ] Monitoring & alerting setup

### Milestone
> ⏳ Platform siap untuk production launch.

---

## Backlog (Post-Launch)

### Fitur Prioritas Tinggi
| Fitur | Deskripsi |
|-------|-----------|
| Sertifikat Otomatis | Generate sertifikat PDF setelah menyelesaikan kursus |
| Midtrans Production | Integrasi pembayaran QRIS production |
| Email Notifications | Notifikasi email untuk enrollment, badge, reminder |
| Discussion Forum | Forum diskusi per kursus/lesson |

### Fitur Prioritas Menengah
| Fitur | Deskripsi |
|-------|-----------|
| Live Session | Video call/webinar terintegrasi |
| Affiliate Program | Sistem referral untuk promosi kursus |
| Multi-language | Dukungan bahasa Inggris |
| Advanced Analytics | Dashboard analytics lebih detail |
| Bulk Upload | Upload konten kursus secara massal |

### Fitur Prioritas Rendah
| Fitur | Deskripsi |
|-------|-----------|
| Mobile App | React Native mobile app |
| AI Tutor | Chatbot AI untuk membantu belajar |
| Social Features | Follow teacher, share progress |
| Subscription Model | Langganan bulanan selain one-time purchase |

---

## Risk Management

| Risiko | Dampak | Mitigasi |
|--------|--------|----------|
| Midtrans integration delay | Pembayaran hanya mock | Mock QRIS sudah tersedia sebagai fallback |
| Performa lambat dengan banyak data | UX buruk | Pagination, lazy loading, query optimization |
| Keamanan data breach | Kehilangan kepercayaan user | RLS policies, security audit rutin |
| Low user adoption | Platform sepi | Gamifikasi untuk retention, SEO untuk acquisition |
| Content quality rendah | Reputasi buruk | Moderator review system |

---

## Dependencies

```
Fase 1 (Fondasi) ──→ Fase 2 (Student) ──→ Fase 4 (Gamifikasi)
                 ──→ Fase 3 (Teacher)  ──→ Fase 5 (E-Commerce)
                                        ──→ Fase 6 (Launch)
```

> **Catatan:** Fase 2 & 3 bisa dikerjakan paralel. Fase 4 & 5 membutuhkan Fase 2 & 3 selesai. Fase 6 membutuhkan semua fase sebelumnya.
