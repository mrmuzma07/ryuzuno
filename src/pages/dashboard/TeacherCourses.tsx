import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PlusCircle, Edit, Trash2, Eye, Users, Star, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from "@/components/ui/alert-dialog";

const statusColors: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  pending_review: "bg-fun-yellow/20 text-fun-yellow",
  published: "bg-fun-green/20 text-fun-green",
  rejected: "bg-destructive/20 text-destructive",
};

const statusLabels: Record<string, string> = {
  draft: "Draft",
  pending_review: "Menunggu Review",
  published: "Published",
  rejected: "Ditolak",
};

const TeacherCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("courses")
      .select("*, categories(name)")
      .eq("teacher_id", user.id)
      .order("created_at", { ascending: false });
    if (!error && data) setCourses(data);
    setLoading(false);
  };

  useEffect(() => { fetchCourses(); }, [user]);

  const deleteCourse = async (id: string) => {
    // Delete sections/lessons first
    const { data: sections } = await supabase.from("sections").select("id").eq("course_id", id);
    if (sections) {
      for (const s of sections) {
        await supabase.from("lessons").delete().eq("section_id", s.id);
      }
      await supabase.from("sections").delete().eq("course_id", id);
    }
    await supabase.from("enrollments").delete().eq("course_id", id);
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) {
      toast.error("Gagal menghapus kursus");
    } else {
      toast.success("Kursus berhasil dihapus");
      fetchCourses();
    }
  };

  const submitForReview = async (id: string) => {
    const { error } = await supabase
      .from("courses")
      .update({ status: "pending_review" as const })
      .eq("id", id);
    if (!error) {
      toast.success("Kursus dikirim untuk review!");
      fetchCourses();
    }
  };

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl md:text-3xl font-bold">Kursus Saya</h1>
            <p className="text-muted-foreground">Kelola semua kursus yang kamu buat</p>
          </div>
          <Link to="/teacher/create">
            <Button className="gap-2">
              <PlusCircle className="w-4 h-4" /> Buat Kursus
            </Button>
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : courses.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-4xl mb-3">📚</p>
            <p className="font-heading font-bold text-lg">Belum ada kursus</p>
            <p className="text-muted-foreground text-sm mt-1 mb-4">Mulai buat kursus pertamamu!</p>
            <Link to="/teacher/create"><Button>Buat Kursus Baru</Button></Link>
          </Card>
        ) : (
          <div className="grid gap-4">
            {courses.map((course) => (
              <Card key={course.id} className="overflow-hidden">
                <CardContent className="p-5 flex flex-col md:flex-row md:items-center gap-4">
                  <div className="w-full md:w-32 h-20 rounded-lg bg-muted overflow-hidden flex-shrink-0">
                    {course.thumbnail_url ? (
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl">📘</div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-heading font-bold truncate">{course.title}</h3>
                      <Badge className={statusColors[course.status]}>{statusLabels[course.status]}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">{course.description || "Belum ada deskripsi"}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {course.total_students} siswa</span>
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {course.rating || 0}</span>
                      <span>Rp {Number(course.price).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {course.status === "draft" && (
                      <Button size="sm" variant="outline" onClick={() => submitForReview(course.id)}>
                        Kirim Review
                      </Button>
                    )}
                    <Link to={`/teacher/edit/${course.id}`}>
                      <Button size="sm" variant="outline"><Edit className="w-4 h-4" /></Button>
                    </Link>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus kursus ini?</AlertDialogTitle>
                          <AlertDialogDescription>Semua data kursus termasuk sections, lessons, dan enrollments akan dihapus permanen.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteCourse(course.id)}>Hapus</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherCourses;
