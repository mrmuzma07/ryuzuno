import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Lock, Clock, BookOpen, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const pathColors = ["from-fun-purple to-fun-blue", "from-fun-green to-fun-blue", "from-fun-pink to-fun-orange"];

const LearningPathDetail = () => {
  const { id } = useParams();

  const { data: path, isLoading } = useQuery({
    queryKey: ["learning-path", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("learning_paths")
        .select("*, badges(name, icon)")
        .eq("id", id!)
        .single();
      return data;
    },
    enabled: !!id,
  });

  const { data: pathCourses = [] } = useQuery({
    queryKey: ["learning-path-courses", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("learning_path_courses")
        .select("*, courses(id, title, level, total_students)")
        .eq("learning_path_id", id!)
        .order("sort_order");
      return data || [];
    },
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen"><Navbar /><div className="container mx-auto px-4 py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div></div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen"><Navbar /><div className="container mx-auto px-4 py-20 text-center"><p className="text-4xl mb-4">🗺️</p><h1 className="font-heading font-bold text-2xl">Path tidak ditemukan</h1><Link to="/learning-paths"><Button className="mt-4 rounded-xl">Kembali</Button></Link></div></div>
    );
  }

  const color = pathColors[0];

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className={`py-16 bg-gradient-to-r ${color} text-white`}>
        <div className="container mx-auto px-4">
          <Link to="/learning-paths" className="inline-flex items-center gap-1 text-sm text-white/60 hover:text-white mb-6">
            <ArrowLeft className="w-4 h-4" /> Semua Paths
          </Link>
          <div className="max-w-2xl space-y-4">
            <span className="text-5xl">{(path as any).badges?.icon || "🎯"}</span>
            <h1 className="font-heading text-3xl md:text-4xl font-bold">{path.title}</h1>
            <p className="text-white/80 text-lg">{path.description}</p>
            <div className="flex gap-6 text-sm text-white/70">
              <span>📚 {pathCourses.length} kursus</span>
              <span>⏱️ {path.estimated_hours || 0} jam</span>
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
            {pathCourses.map((pc: any, i: number) => (
              <Link key={pc.id} to={`/course/${pc.courses?.id}`}>
                <Card className="p-5 flex items-center gap-4 hover:shadow-lg transition-all group">
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold group-hover:text-primary transition-colors">{pc.courses?.title}</h3>
                    <div className="flex gap-3 text-xs text-muted-foreground mt-1 capitalize">
                      <span>{pc.courses?.level}</span>
                    </div>
                  </div>
                  <Lock className="w-4 h-4 text-muted-foreground" />
                </Card>
              </Link>
            ))}
          </div>

          {(path as any).badges && (
            <Card className="mt-8 p-6 text-center bg-muted/50">
              <p className="text-4xl mb-2">{(path as any).badges.icon}</p>
              <h3 className="font-heading font-bold text-lg">Badge Reward</h3>
              <p className="text-sm text-muted-foreground mt-1">Selesaikan semua kursus untuk mendapatkan badge <strong>{(path as any).badges.name}</strong></p>
            </Card>
          )}
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default LearningPathDetail;
