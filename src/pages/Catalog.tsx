import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courses, categories } from "@/lib/mock-data";
import { Search, SlidersHorizontal } from "lucide-react";

const levels = ["Beginner", "Intermediate", "Advanced"];

const Catalog = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);

  const filtered = courses.filter((c) => {
    if (search && !c.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (selectedCategory && c.category !== selectedCategory) return false;
    if (selectedLevel && c.level !== selectedLevel) return false;
    return true;
  });

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-10">
        <h1 className="font-heading text-3xl md:text-4xl font-bold mb-2">Explore Kursus 🎓</h1>
        <p className="text-muted-foreground mb-8">Temukan kursus yang sesuai dengan minat dan tujuanmu</p>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Cari kursus..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-sm font-semibold text-muted-foreground mr-2">Kategori:</span>
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer rounded-xl"
            onClick={() => setSelectedCategory(null)}
          >
            Semua
          </Badge>
          {categories.map((cat) => (
            <Badge
              key={cat.id}
              variant={selectedCategory === cat.name ? "default" : "outline"}
              className="cursor-pointer rounded-xl"
              onClick={() => setSelectedCategory(cat.name === selectedCategory ? null : cat.name)}
            >
              {cat.icon} {cat.name}
            </Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          <span className="text-sm font-semibold text-muted-foreground mr-2">Level:</span>
          {levels.map((lvl) => (
            <Badge
              key={lvl}
              variant={selectedLevel === lvl ? "default" : "outline"}
              className="cursor-pointer rounded-xl"
              onClick={() => setSelectedLevel(lvl === selectedLevel ? null : lvl)}
            >
              {lvl}
            </Badge>
          ))}
        </div>

        <p className="text-sm text-muted-foreground mb-6">{filtered.length} kursus ditemukan</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="font-heading font-bold text-xl">Tidak ada kursus ditemukan</p>
            <p className="text-muted-foreground mt-2">Coba ubah filter atau kata kunci pencarian</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Catalog;
