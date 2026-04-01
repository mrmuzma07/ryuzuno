

## EduQuest - Platform E-Learning dengan Gamifikasi 🎓🎮

### Konsep Desain
Desain **Colorful & Fun** dengan warna-warna cerah (ungu, oranye, hijau, biru) yang playful dan modern. Rounded corners besar, ilustrasi/icon yang menyenangkan, dan animasi micro-interaction.

---

### Halaman Publik

1. **Landing Page** — Hero section menarik, featured courses, learning paths populer, leaderboard preview, dan testimonial
2. **Catalog/Explore** — Browse & search kursus dengan filter (kategori, level, rating, harga), grid cards dengan badge dan rating
3. **Course Detail** — Deskripsi, curriculum/syllabus, instructor info, reviews, harga, tombol enroll
4. **Learning Path Detail** — Urutan kursus dalam path, progress tracker, estimasi waktu, badge yang akan didapat
5. **Login/Register** — Auth dengan email & password via Supabase

---

### Dashboard Student

1. **My Dashboard** — Overview progress, XP/poin, badges terbaru, kursus aktif, streak info
2. **My Courses** — Daftar kursus yang diikuti dengan progress bar
3. **My Learning Paths** — Progress di setiap learning path
4. **Course Player** — Video player, materi text, quiz, tombol "Complete Lesson"
5. **Badges Collection** — Semua badges yang sudah didapat dan yang belum (locked)
6. **Leaderboard** — Ranking global dan per-kursus berdasarkan poin/badges
7. **Profile** — Edit profil, statistik belajar

---

### Dashboard Teacher/Creator

1. **Teacher Dashboard** — Overview: jumlah siswa, pendapatan, rating rata-rata, kursus aktif
2. **Course Management** — CRUD kursus: judul, deskripsi, kategori, harga, thumbnail
3. **Curriculum Builder** — Tambah sections & lessons (video URL, text content, quiz)
4. **Student Analytics** — Lihat progress dan engagement siswa per kursus
5. **Reviews** — Lihat dan respond review dari siswa

---

### Dashboard Reviewer/Moderator

1. **Review Queue** — Daftar kursus yang menunggu approval
2. **Course Review** — Preview kursus lengkap, beri feedback, approve/reject
3. **Moderation Log** — History keputusan review

---

### Dashboard Admin

1. **Admin Dashboard** — Statistik platform: total users, kursus, revenue, growth chart
2. **User Management** — CRUD users, assign roles, ban/unban
3. **Course Management** — Lihat semua kursus, featured/unfeatured, hapus
4. **Learning Path Builder** — Buat dan kelola learning paths (pilih urutan kursus, set badge reward)
5. **Badge Management** — CRUD badges: nama, icon, criteria (misal: selesaikan 5 kursus)
6. **Category Management** — Kelola kategori kursus
7. **Reports** — Revenue reports, user engagement

---

### Fitur Gamifikasi

- **Badges/Lencana** — Otomatis diberikan saat criteria tercapai (first course completed, 5 courses done, perfect quiz score, learning path completed, dll)
- **Leaderboard** — Ranking berdasarkan jumlah badges dan kursus yang diselesaikan, filter per minggu/bulan/all-time

---

### Fitur Learning Path

- Admin membuat learning path dari beberapa kursus berurutan
- Student bisa enroll ke learning path
- Progress visual step-by-step
- Badge khusus saat menyelesaikan satu learning path

---

### Database (Supabase)

Tabel utama: profiles, user_roles, courses, sections, lessons, enrollments, lesson_progress, learning_paths, learning_path_courses, learning_path_enrollments, badges, user_badges, reviews, categories, course_reviews (moderator)

### Tahap Implementasi

Karena ini project besar, akan dibangun secara bertahap:
1. **Fase 1**: Setup database, auth, landing page, catalog, course detail
2. **Fase 2**: Student dashboard, course player, enrollment
3. **Fase 3**: Teacher dashboard, course builder
4. **Fase 4**: Learning paths, gamifikasi (badges & leaderboard)
5. **Fase 5**: Admin & reviewer/moderator dashboards

