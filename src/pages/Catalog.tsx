import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { BookOpen } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const levels = ["beginner", "intermediate", "advanced"];

const Catalog = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*");
      return data || [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["catalog-courses"],
    queryFn: async () => {
      const { data } = await supabase
        .from("courses")
        .select("*, categories(name)")
        .eq("status", "published");
      return (data || []).map((c: any) => ({
        ...c,
        category_name: c.categories?.name || "",
      }));
    },
  });

  const filtered = courses.filter((c: any) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && c.category_name !== selectedCategory) return false;
    if (selectedLevel && c.level !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Page header */}
      <section className="bg-surface-container-low py-16 px-8 border-b border-outline-variant/10">
        <div className="max-w-7xl mx-auto">
          <h1 className="font-headline text-4xl md:text-5xl font-extrabold text-on-background mb-4">Explore Kursus</h1>
          <p className="text-on-surface-variant text-lg mb-8 max-w-xl">Temukan kursus yang sesuai dengan minat dan tujuanmu</p>

          {/* Search bar */}
          <div className="relative max-w-lg">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input
              placeholder="Cari kursus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-surface-container-lowest rounded-full border border-outline-variant/20 focus:border-[#003d9b] focus:ring-0 focus:outline-none text-on-surface placeholder-outline text-sm"
            />
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-8 py-12">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-6">
          <span className="text-sm font-bold text-on-surface-variant mr-2 self-center">Kategori:</span>
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
              selectedCategory === null
                ? "bg-[#003d9b] text-white"
                : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            Semua
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.name === selectedCategory ? null : cat.name)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors ${
                selectedCategory === cat.name
                  ? "bg-[#003d9b] text-white"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        {/* Level filters */}
        <div className="flex flex-wrap gap-2 mb-10">
          <span className="text-sm font-bold text-on-surface-variant mr-2 self-center">Level:</span>
          {levels.map((lvl) => (
            <button
              key={lvl}
              onClick={() => setSelectedLevel(lvl === selectedLevel ? null : lvl)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-colors capitalize ${
                selectedLevel === lvl
                  ? "bg-tertiary text-white"
                  : "bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest"
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>

        <p className="text-sm text-on-surface-variant mb-8">{filtered.length} kursus ditemukan</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((course: any) => (
            <CourseCard
              key={course.id}
              id={course.id}
              title={course.title}
              price={course.price}
              rating={course.rating}
              level={course.level}
              category_name={course.category_name}
              total_students={course.total_students}
              thumbnail_url={course.thumbnail_url}
            />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-on-surface-variant/30" />
            <h2 className="font-headline font-bold text-xl text-on-surface mb-2">Tidak ada kursus ditemukan</h2>
            <p className="text-on-surface-variant">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Catalog;
