import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Users, TrendingUp, GraduationCap, Loader2 } from "lucide-react";

const TeacherStudents = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>("all");
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("courses")
      .select("id, title")
      .eq("teacher_id", user.id)
      .then(({ data }) => { if (data) setCourses(data); });
  }, [user]);

  useEffect(() => {
    if (!user) return;
    fetchEnrollments();
  }, [user, selectedCourse]);

  const fetchEnrollments = async () => {
    setLoading(true);
    let query = supabase
      .from("enrollments")
      .select("*, courses!inner(id, title, teacher_id), profiles:user_id(full_name, avatar_url)")
      .eq("courses.teacher_id", user!.id)
      .order("enrolled_at", { ascending: false });

    if (selectedCourse !== "all") {
      query = query.eq("course_id", selectedCourse);
    }

    const { data } = await query;
    setEnrollments(data || []);
    setLoading(false);
  };

  const totalStudents = enrollments.length;
  const avgProgress = totalStudents > 0
    ? Math.round(enrollments.reduce((sum, e) => sum + Number(e.progress), 0) / totalStudents)
    : 0;
  const completedCount = enrollments.filter((e) => e.completed_at).length;

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Student Analytics 📊</h1>
          <p className="text-muted-foreground">Pantau perkembangan siswa di kursusmu</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <Users className="w-6 h-6 text-fun-blue mb-2" />
            <p className="font-heading text-2xl font-bold">{totalStudents}</p>
            <p className="text-xs text-muted-foreground">Total Enrollments</p>
          </Card>
          <Card className="p-5">
            <TrendingUp className="w-6 h-6 text-fun-green mb-2" />
            <p className="font-heading text-2xl font-bold">{avgProgress}%</p>
            <p className="text-xs text-muted-foreground">Rata-rata Progress</p>
          </Card>
          <Card className="p-5">
            <GraduationCap className="w-6 h-6 text-fun-purple mb-2" />
            <p className="font-heading text-2xl font-bold">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Selesai</p>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Filter kursus:</span>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kursus</SelectItem>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
            ) : enrollments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-3xl mb-2">👨‍🎓</p>
                <p className="font-medium">Belum ada siswa terdaftar</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Siswa</TableHead>
                    <TableHead>Kursus</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Terdaftar</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {enrollments.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                            {((e.profiles as any)?.full_name || "?")[0]?.toUpperCase()}
                          </div>
                          <span className="font-medium">{(e.profiles as any)?.full_name || "Unknown"}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{(e.courses as any)?.title}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 min-w-[120px]">
                          <Progress value={Number(e.progress)} className="h-2 flex-1" />
                          <span className="text-xs font-medium">{Math.round(Number(e.progress))}%</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(e.enrolled_at).toLocaleDateString("id-ID")}
                      </TableCell>
                      <TableCell>
                        {e.completed_at ? (
                          <Badge className="bg-fun-green/20 text-fun-green">Selesai</Badge>
                        ) : Number(e.progress) > 0 ? (
                          <Badge className="bg-fun-blue/20 text-fun-blue">Belajar</Badge>
                        ) : (
                          <Badge variant="secondary">Baru</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TeacherStudents;
