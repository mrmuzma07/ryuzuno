
UPDATE courses SET learning_objectives = '["Memahami dasar-dasar Python dan syntax-nya", "Menggunakan library NumPy dan Pandas", "Visualisasi data dengan Matplotlib dan Seaborn", "Membersihkan dan memproses dataset mentah", "Analisis statistik dasar menggunakan Python", "Membuat project data science end-to-end"]'::jsonb WHERE id = 'c1000000-0000-0000-0000-000000000002';

UPDATE courses SET learning_objectives = '["Prinsip-prinsip desain UI/UX modern", "Riset pengguna dan persona", "Wireframing dan prototyping", "Desain visual dan tipografi", "Usability testing", "Tools: Figma, Adobe XD"]'::jsonb WHERE id = 'c1000000-0000-0000-0000-000000000003';

UPDATE courses SET learning_objectives = '["Dart programming language", "Widget dan layout Flutter", "State management", "Navigasi dan routing", "Integrasi REST API", "Publish ke Play Store dan App Store"]'::jsonb WHERE id = 'c1000000-0000-0000-0000-000000000004';

INSERT INTO coupons (code, course_id, discount_percent, max_uses, expires_at) VALUES
  ('BELAJAR50', 'c1000000-0000-0000-0000-000000000002', 50, 100, '2026-12-31'),
  ('DISKON20', 'c1000000-0000-0000-0000-000000000003', 20, 50, '2026-06-30'),
  ('FLUTTER30', 'c1000000-0000-0000-0000-000000000004', 30, NULL, '2026-12-31');
