import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { learningPaths } from "@/lib/mock-data";
import { ArrowRight } from "lucide-react";

const LearningPaths = () => (
  <div className="min-h-screen">
    <Navbar />
    <div className="container mx-auto px-4 py-10">
      <div className="text-center mb-12">
        <h1 className="font-heading text-3xl md:text-4xl font-bold">Learning Paths 🗺️</h1>
        <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
          Ikuti jalur belajar terstruktur yang dirancang oleh ahli untuk membantumu mencapai tujuan karir
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {learningPaths.map((path) => (
          <Link key={path.id} to={`/learning-path/${path.id}`}>
            <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group h-full">
              <div className={`h-32 bg-gradient-to-r ${path.color} flex items-center justify-center`}>
                <span className="text-5xl">{path.badge.split(" ")[0]}</span>
              </div>
              <div className="p-6 space-y-4">
                <h3 className="font-heading font-bold text-xl group-hover:text-primary transition-colors">{path.title}</h3>
                <p className="text-sm text-muted-foreground">{path.description}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span>📚 {path.courseCount} kursus</span>
                  <span>⏱️ {path.duration}</span>
                  <span>👥 {path.studentCount.toLocaleString()}</span>
                </div>
                <div className="bg-muted rounded-xl px-4 py-2.5 text-sm font-semibold text-center">
                  🏅 {path.badge}
                </div>
                <Button className="w-full rounded-xl gradient-primary border-0 font-bold">
                  Mulai Path <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default LearningPaths;
