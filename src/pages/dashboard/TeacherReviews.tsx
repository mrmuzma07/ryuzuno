import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Star, Loader2, MessageSquare } from "lucide-react";

const TeacherReviews = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [reviews, setReviews] = useState<any[]>([]);
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
    fetchReviews();
  }, [user, selectedCourse]);

  const fetchReviews = async () => {
    setLoading(true);
    let query = supabase
      .from("reviews")
      .select("*, courses!inner(id, title, teacher_id), profiles:user_id(full_name, avatar_url)")
      .eq("courses.teacher_id", user!.id)
      .order("created_at", { ascending: false });

    if (selectedCourse !== "all") {
      query = query.eq("course_id", selectedCourse);
    }

    const { data } = await query;
    setReviews(data || []);
    setLoading(false);
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0";

  return (
    <DashboardLayout role="teacher">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Reviews & Feedback ⭐</h1>
          <p className="text-muted-foreground">Lihat ulasan siswa untuk kursusmu</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Card className="p-5">
            <Star className="w-6 h-6 text-fun-yellow mb-2" />
            <p className="font-heading text-2xl font-bold">{avgRating}</p>
            <p className="text-xs text-muted-foreground">Rating Rata-rata</p>
          </Card>
          <Card className="p-5">
            <MessageSquare className="w-6 h-6 text-fun-blue mb-2" />
            <p className="font-heading text-2xl font-bold">{reviews.length}</p>
            <p className="text-xs text-muted-foreground">Total Reviews</p>
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

        {/* Reviews list */}
        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
        ) : reviews.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-3xl mb-2">💬</p>
            <p className="font-heading font-bold">Belum ada review</p>
            <p className="text-sm text-muted-foreground mt-1">Review dari siswa akan muncul di sini</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
                        {((review.profiles as any)?.full_name || "?")[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{(review.profiles as any)?.full_name || "Anonim"}</p>
                        <p className="text-xs text-muted-foreground">{(review.courses as any)?.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${i < review.rating ? "text-fun-yellow fill-fun-yellow" : "text-muted"}`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>}
                  <p className="text-xs text-muted-foreground mt-3">
                    {new Date(review.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default TeacherReviews;
