# 📋 Project Requirements Document (PRD)
# RyuZuno — Platform E-Learning dengan Gamifikasi

**Versi:** 1.0  
**Tanggal:** 6 April 2026  
**Status:** In Development

---

## 1. Ringkasan Produk

RyuZuno adalah platform e-learning modern yang menggabungkan pembelajaran online dengan elemen gamifikasi. Platform ini dirancang untuk membuat proses belajar lebih menyenangkan dan engaging melalui sistem badges, leaderboard, XP points, dan learning paths terstruktur.

### Visi
Menjadi platform e-learning terdepan yang membuat belajar terasa seperti bermain game — menyenangkan, kompetitif, dan rewarding.

### Target Pengguna
- **Student**: Pelajar yang ingin mengembangkan skill baru
- **Teacher/Creator**: Instruktur yang ingin membuat dan menjual kursus
- **Moderator**: Reviewer yang memastikan kualitas konten
- **Admin**: Pengelola platform

---

## 2. Problem Statement

| Masalah | Solusi RyuZuno |
|---------|----------------|
| Platform e-learning membosankan | Gamifikasi dengan badges, XP, leaderboard |
| Kurang motivasi menyelesaikan kursus | Learning paths terstruktur + reward system |
| Sulit menemukan kursus berkualitas | Sistem review & moderasi konten |
| Tidak ada jalur belajar yang jelas | Learning paths dengan urutan kursus |

---

## 3. Tech Stack

| Layer | Teknologi |
|-------|-----------|
| Frontend | React 18, TypeScript 5, Vite 5 |
| Styling | Tailwind CSS v3, shadcn/ui |
| State Management | TanStack React Query |
| Backend & Auth | Lovable Cloud (Supabase) |
| Database | PostgreSQL |
| Rich Text Editor | TipTap |
| Charts | Recharts |
| Routing | React Router v6 |

---

## 4. Arsitektur Database

### 4.1 Tabel Utama (27+ tabel)

#### User & Auth
| Tabel | Deskripsi |
|-------|-----------|
| `profiles` | Data profil pengguna (nama, bio, avatar, xp_points) |
| `user_roles` | Role pengguna (admin, moderator, teacher, student) |

#### Kursus & Konten
| Tabel | Deskripsi |
|-------|-----------|
| `courses` | Data kursus (judul, deskripsi, harga, level, status) |
| `categories` | Kategori kursus |
| `sections` | Bagian/modul dalam kursus |
| `lessons` | Pelajaran dalam section (video, text content) |
| `lesson_attachments` | File lampiran per lesson |

#### Fitur Pembelajaran
| Tabel | Deskripsi |
|-------|-----------|
| `quizzes` | Quiz per lesson |
| `quiz_questions` | Pertanyaan quiz dengan opsi jawaban |
| `quiz_attempts` | Percobaan quiz oleh student |
| `assignments` | Tugas per lesson |
| `assignment_submissions` | Pengumpulan tugas |
| `coding_exercises` | Latihan coding per lesson |
| `coding_submissions` | Pengumpulan kode |

#### Enrollment & Progress
| Tabel | Deskripsi |
|-------|-----------|
| `enrollments` | Pendaftaran student ke kursus |
| `lesson_progress` | Progress per lesson per student |

#### Learning Paths
| Tabel | Deskripsi |
|-------|-----------|
| `learning_paths` | Jalur belajar terstruktur |
| `learning_path_courses` | Kursus dalam learning path (berurutan) |
| `learning_path_enrollments` | Pendaftaran ke learning path |

#### Gamifikasi
| Tabel | Deskripsi |
|-------|-----------|
| `badges` | Definisi badge (nama, icon, criteria, xp_reward) |
| `user_badges` | Badge yang diperoleh pengguna |

#### E-Commerce
| Tabel | Deskripsi |
|-------|-----------|
| `cart_items` | Keranjang belanja |
| `orders` | Header transaksi |
| `order_items` | Detail item per order |
| `coupons` | Kupon diskon |

#### Review & Moderasi
| Tabel | Deskripsi |
|-------|-----------|
| `reviews` | Review/rating dari student |
| `course_reviews` | Review moderator (approve/reject) |

### 4.2 Enums
- `app_role`: admin, moderator, teacher, student
- `course_status`: draft, pending_review, published, rejected
- `difficulty_level`: beginner, intermediate, advanced

### 4.3 Security
- Row Level Security (RLS) aktif di semua tabel
- Fungsi `has_role()` sebagai SECURITY DEFINER untuk cek role tanpa rekursi
- Setiap tabel memiliki policy spesifik per operasi (SELECT, INSERT, UPDATE, DELETE)

---

## 5. Fitur Detail

### 5.1 Halaman Publik

#### Landing Page
- Hero section dengan CTA
- Featured courses carousel
- Learning paths populer
- Leaderboard preview
- Statistik platform

#### Catalog/Explore
- Browse & search kursus
- Filter: kategori, level, rating, harga
- Grid cards dengan badge dan rating
- Sorting options

#### Course Detail
- Deskripsi lengkap & learning objectives
- Curriculum/syllabus (sections & lessons)
- Instructor info
- Reviews & ratings
- Harga & tombol enroll/add to cart

#### Learning Path Detail
- Urutan kursus dalam path
- Progress tracker visual
- Estimasi waktu
- Badge reward

#### Auth
- Login & Register dengan email/password
- Email verification

### 5.2 Dashboard Student

| Fitur | Deskripsi |
|-------|-----------|
| My Dashboard | Overview progress, XP, badges terbaru, kursus aktif, streak |
| My Courses | Daftar kursus dengan progress bar |
| My Learning Paths | Progress per learning path |
| Course Player | Video player, materi text, quiz, coding exercise, assignment |
| Badges Collection | Badge earned & locked |
| Leaderboard | Ranking global & per-kursus |
| Profile | Edit profil & statistik belajar |

### 5.3 Dashboard Teacher

| Fitur | Deskripsi |
|-------|-----------|
| Teacher Dashboard | Overview: siswa, pendapatan, rating, kursus aktif |
| Course Management | CRUD kursus lengkap |
| Curriculum Builder | Tambah sections, lessons, quiz, assignment, coding exercise |
| Student Analytics | Progress & engagement per kursus |
| Reviews | Lihat & respond review |

### 5.4 Dashboard Moderator

| Fitur | Deskripsi |
|-------|-----------|
| Review Queue | Kursus menunggu approval |
| Course Review | Preview & beri feedback, approve/reject |
| Moderation Log | History keputusan |

### 5.5 Dashboard Admin

| Fitur | Deskripsi |
|-------|-----------|
| Admin Dashboard | Statistik platform, growth charts |
| User Management | CRUD users, assign roles |
| Course Management | Featured/unfeatured, hapus |
| Learning Path Builder | Buat & kelola learning paths |
| Badge Management | CRUD badges dengan criteria |
| Category Management | Kelola kategori |

### 5.6 E-Commerce

| Fitur | Deskripsi |
|-------|-----------|
| Shopping Cart | Multi-item cart dengan kupon |
| Checkout | Review → Payment → Success |
| QRIS Payment | Simulasi pembayaran QRIS (mock) |
| Order History | Riwayat transaksi |

### 5.7 Gamifikasi

| Fitur | Deskripsi |
|-------|-----------|
| Badges | Otomatis diberikan saat criteria tercapai |
| XP Points | Poin pengalaman dari aktivitas belajar |
| Leaderboard | Ranking berdasarkan badges & XP |
| Streak | Tracking konsistensi belajar harian |

---

## 6. Success Metrics (KPI)

| Metrik | Target |
|--------|--------|
| Course Completion Rate | > 60% |
| Daily Active Users (DAU) | Growth 10% MoM |
| Average Session Duration | > 15 menit |
| Student Satisfaction (NPS) | > 50 |
| Course Creation Rate | > 5 kursus baru/minggu |
| Badge Earning Rate | > 3 badges/student/bulan |

---

## 7. Non-Functional Requirements

| Aspek | Requirement |
|-------|-------------|
| Performance | First Contentful Paint < 2s |
| Responsiveness | Mobile-first, support 320px - 1920px |
| Accessibility | WCAG 2.1 Level AA |
| Security | RLS di semua tabel, JWT auth, HTTPS |
| Scalability | Support 10,000+ concurrent users |
| Browser Support | Chrome, Firefox, Safari, Edge (latest 2 versions) |

---

## 8. Desain

### Konsep
**Colorful & Fun** — Warna-warna cerah (ungu, oranye, hijau, biru) yang playful dan modern.

### Karakteristik
- Rounded corners besar
- Ilustrasi/icon yang menyenangkan
- Micro-interaction animations
- Dark mode support
- Consistent design tokens via CSS variables
