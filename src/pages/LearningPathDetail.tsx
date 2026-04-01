import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { learningPaths, courses } from "@/lib/mock-data";
import { ArrowLeft, CheckCircle, Lock, Clock, BookOpen } from "lucide-react";

const LearningPathDetail = () => {
  const { id } = useParams();
  const path = learningPaths.find((p) => p.id === id);

  if (!path) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-4xl mb-4">🗺️</p>
          <h1 className="font-heading font-bold text-2xl">Path tidak ditemukan</h1>
          <Link to="/learning-paths"><Button className="mt-4 rounded-xl">Kembali</Button></Link>
        </div>
      </div>
    );
  }

  const pathCourses = courses.filter((c) => path.courses.includes(c.id));

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className={`py-16 bg-gradient-to-r ${path.color} text-white`}>
        <div className="container mx-auto px-4">
          <Link to="/learning-paths" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Semua Paths
          </Link>
          <div className="max-w-2xl space-y-4">
            <span className="text-5xl">{path.badge.split(" ")[0]}</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold">{path.title}</h1>
            <p className="text-white/80 text-lg">{path.description}</p>
            <div className="flex gap-6 text-sm text-white/70">
              <span>📚 {path.courseCount} kursus</span>
              <span>⏱️ {path.duration}</span>
              <span>👥 {path.studentCount.toLocaleString()} students</span>
            </div>
            <Button className="bg-white text-foreground hover:bg-white/90 rounded-xl font-bold">
              Mulai Learning Path
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-heading text-2xl font-bold mb-8">Kursus dalam Path ini</h2>
          <div className="space-y-4">
            {pathCourses.map((course, i) => (
              <Link key={course.id} to={`/course/${course.id}`}>
                <Card className="p-5 flex items-center gap-4 hover:shadow-lg transition-all group">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold group-hover:text-primary transition-colors">{course.title}</h3>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
                      <span className="flex items-center gap-1"><BookOpen className="w-3 h-3" />{course.lessonCount} lessons</span>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </Card>
              </Link>
            ))}
            {/* Placeholder for remaining courses */}
            {Array.from({ length: Math.max(0, path.courseCount - pathCourses.length) }).map((_, i) => (
              <Card key={`placeholder-${i}`} className="p-5 flex items-center gap-4 opacity-50">
                <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold shrink-0">
                  {pathCourses.length + i + 1}
                </div>
                <div className="flex-1">
                  <div className="h-4 bg-muted rounded w-48" />
                  <div className="h-3 bg-muted rounded w-32 mt-2" />
                </div>
                <Lock className="w-4 h-4 text-muted-foreground" />
              </Card>
            ))}
          </div>

          <Card className="mt-8 p-6 text-center bg-muted/50">
            <p className="text-4xl mb-2">{path.badge.split(" ")[0]}</p>
            <h3 className="font-heading font-bold text-lg">Badge Reward</h3>
            <p className="text-sm text-muted-foreground mt-1">Selesaikan semua kursus untuk mendapatkan badge <strong>{path.badge}</strong></p>
          </Card>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LearningPathDetail;
