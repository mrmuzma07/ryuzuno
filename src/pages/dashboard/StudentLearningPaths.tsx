import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Route, BookOpen, ArrowRight, CheckCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

interface PathEnrollment {
  id: string;
  progress: number;
  completed_at: string | null;
  learning_path: {
    id: string;
    title: string;
    description: string | null;
    estimated_hours: number | null;
    thumbnail_url: string | null;
  };
}

interface PathCourseInfo {
  learning_path_id: string;
  course_id: string;
  sort_order: number;
  course: {
    id: string;
    title: string;
  };
}

const StudentLearningPaths = () => {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<PathEnrollment[]>([]);
  const [pathCourses, setPathCourses] = useState<Record<string, PathCourseInfo[]>>({});
  const [userEnrollments, setUserEnrollments] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    // Fetch learning path enrollments
    const { data: lpEnrollments } = await supabase
      .from("learning_path_enrollments")
      .select("id, progress, completed_at, learning_path:learning_paths(id, title, description, estimated_hours, thumbnail_url)")
      .eq("user_id", user!.id)
      .order("enrolled_at", { ascending: false });

    if (lpEnrollments) {
      setEnrollments(lpEnrollments as any);

      const pathIds = lpEnrollments.map((e: any) => e.learning_path?.id).filter(Boolean);

      if (pathIds.length > 0) {
        // Fetch courses for each path
        const { data: lpCourses } = await supabase
          .from("learning_path_courses")
          .select("learning_path_id, course_id, sort_order, course:courses(id, title)")
          .in("learning_path_id", pathIds)
          .order("sort_order");

        if (lpCourses) {
          const grouped: Record<string, PathCourseInfo[]> = {};
          (lpCourses as any[]).forEach((lpc) => {
            if (!grouped[lpc.learning_path_id]) grouped[lpc.learning_path_id] = [];
            grouped[lpc.learning_path_id].push(lpc);
          });
          setPathCourses(grouped);
        }

        // Fetch user's course enrollments for progress
        const { data: courseEnrollments } = await supabase
          .from("enrollments")
          .select("course_id, progress")
          .eq("user_id", user!.id);

        if (courseEnrollments) {
          const map: Record<string, number> = {};
          courseEnrollments.forEach((e) => { map[e.course_id] = e.progress; });
          setUserEnrollments(map);
        }
      }
    }

    setLoading(false);
  };

  return (
    <DashboardLayout role="student">
      <div className="space-y-8">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Learning Paths 🗺️</h1>
          <p className="text-muted-foreground">Ikuti jalur belajar terstruktur untuk menguasai skill.</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <Card key={i} className="p-6 animate-pulse">
                <div className="h-6 bg-muted rounded w-1/3 mb-4" />
                <div className="h-4 bg-muted rounded w-2/3 mb-4" />
                <div className="h-2 bg-muted rounded w-full" />
              </Card>
            ))}
          </div>
        ) : enrollments.length === 0 ? (
          <Card className="p-12 text-center">
            <Route className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2">Belum ada Learning Path</h2>
            <p className="text-muted-foreground mb-4">Jelajahi learning paths yang tersedia dan mulai perjalanan belajarmu!</p>
            <Link to="/learning-paths">
              <Button className="rounded-xl gap-2">
                Jelajahi Paths <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-6">
            {enrollments.map((enrollment) => {
              const lp = enrollment.learning_path;
              const courses = pathCourses[lp.id] || [];
              const isCompleted = !!enrollment.completed_at;

              return (
                <Card key={enrollment.id} className="p-6 rounded-2xl space-y-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h2 className="font-heading text-lg font-bold">{lp.title}</h2>
                      {lp.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">{lp.description}</p>
                      )}
                      <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                        <span className="flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {courses.length} kursus
                        </span>
                        {lp.estimated_hours && <span>⏱️ ~{lp.estimated_hours} jam</span>}
                      </div>
                    </div>
                    {isCompleted && (
                      <span className="bg-fun-green/20 text-fun-green text-xs font-bold px-3 py-1 rounded-full">
                        Selesai ✅
                      </span>
                    )}
                  </div>

                  {/* Overall progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Progress Keseluruhan</span>
                      <span>{Math.round(enrollment.progress)}%</span>
                    </div>
                    <Progress value={enrollment.progress} className="h-2.5" />
                  </div>

                  {/* Course steps */}
                  {courses.length > 0 && (
                    <div className="space-y-2">
                      {courses.map((pc, i) => {
                        const courseProgress = userEnrollments[pc.course_id] ?? 0;
                        const isDone = courseProgress >= 100;

                        return (
                          <div key={pc.course_id} className="flex items-center gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                              isDone ? "bg-fun-green text-white" : "bg-muted text-muted-foreground"
                            }`}>
                              {isDone ? <CheckCircle className="w-4 h-4" /> : i + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm font-medium line-clamp-1 ${isDone ? "line-through text-muted-foreground" : ""}`}>
                                {pc.course?.title || "Kursus"}
                              </p>
                              <Progress value={courseProgress} className="h-1 mt-1" />
                            </div>
                            <span className="text-xs text-muted-foreground shrink-0">{Math.round(courseProgress)}%</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <Link to={`/learning-path/${lp.id}`}>
                    <Button variant="outline" size="sm" className="rounded-xl gap-1">
                      Detail <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentLearningPaths;
