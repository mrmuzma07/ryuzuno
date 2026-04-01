import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { CheckCircle, XCircle, Eye, Clock, User, BookOpen } from "lucide-react";

const ModeratorQueue = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  const { data: pendingCourses = [], isLoading } = useQuery({
    queryKey: ["moderator-pending-courses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*, categories(name), profiles:teacher_id(full_name)")
        .eq("status", "pending_review")
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const { data: courseSections = [] } = useQuery({
    queryKey: ["course-sections-preview", selectedCourse?.id],
    enabled: !!selectedCourse,
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("*, lessons(*)")
        .eq("course_id", selectedCourse.id)
        .order("sort_order");
      return data || [];
    },
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ courseId, status, feedback }: { courseId: string; status: string; feedback: string }) => {
      // Update course status
      const { error: courseError } = await supabase
        .from("courses")
        .update({ status: status as "published" | "rejected" })
        .eq("id", courseId);
      if (courseError) throw courseError;

      // Insert review record
      const { error: reviewError } = await supabase
        .from("course_reviews")
        .insert({
          course_id: courseId,
          reviewer_id: user!.id,
          status,
          feedback,
          reviewed_at: new Date().toISOString(),
        });
      if (reviewError) throw reviewError;
    },
    onSuccess: (_, variables) => {
      const action = variables.status === "published" ? "disetujui" : "ditolak";
      toast.success(`Kursus berhasil ${action}!`);
      queryClient.invalidateQueries({ queryKey: ["moderator-pending-courses"] });
      queryClient.invalidateQueries({ queryKey: ["moderator-log"] });
      setSelectedCourse(null);
      setFeedback("");
      setActionType(null);
    },
    onError: () => toast.error("Gagal memproses review"),
  });

  const handleAction = (course: any, type: "approve" | "reject") => {
    setSelectedCourse(course);
    setActionType(type);
    setFeedback("");
  };

  const handleSubmitReview = () => {
    if (!selectedCourse || !actionType) return;
    reviewMutation.mutate({
      courseId: selectedCourse.id,
      status: actionType === "approve" ? "published" : "rejected",
      feedback,
    });
  };

  const levelColors: Record<string, string> = {
    beginner: "bg-fun-green/10 text-fun-green",
    intermediate: "bg-fun-orange/10 text-fun-orange",
    advanced: "bg-fun-pink/10 text-fun-pink",
  };

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Review Queue 📋</h1>
          <p className="text-muted-foreground">Kursus yang menunggu persetujuan moderator</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse h-40" />
            ))}
          </div>
        ) : pendingCourses.length === 0 ? (
          <Card className="p-12 text-center">
            <CheckCircle className="w-12 h-12 text-fun-green mx-auto mb-3" />
            <p className="font-heading font-bold text-lg">Semua bersih! 🎉</p>
            <p className="text-muted-foreground text-sm mt-1">Tidak ada kursus yang menunggu review.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {pendingCourses.map((course: any) => (
              <Card key={course.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  {course.thumbnail_url && (
                    <div className="md:w-48 h-32 md:h-auto">
                      <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="flex-1 p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="w-3 h-3 mr-1" /> Pending Review
                          </Badge>
                          <Badge className={`text-xs ${levelColors[course.level] || ""}`}>
                            {course.level}
                          </Badge>
                          {course.categories?.name && (
                            <Badge variant="secondary" className="text-xs">{course.categories.name}</Badge>
                          )}
                        </div>
                        <h3 className="font-heading font-bold text-lg">{course.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{course.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {(course.profiles as any)?.full_name || "Unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {new Date(course.created_at).toLocaleDateString("id-ID")}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button size="sm" variant="outline" onClick={() => { setSelectedCourse(course); setActionType(null); }}>
                          <Eye className="w-4 h-4 mr-1" /> Preview
                        </Button>
                        <Button size="sm" className="bg-fun-green hover:bg-fun-green/90 text-white" onClick={() => handleAction(course, "approve")}>
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleAction(course, "reject")}>
                          <XCircle className="w-4 h-4 mr-1" /> Reject
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Preview / Review Dialog */}
        <Dialog open={!!selectedCourse} onOpenChange={(open) => { if (!open) { setSelectedCourse(null); setActionType(null); } }}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-heading">
                {actionType === "approve" ? "✅ Approve Kursus" : actionType === "reject" ? "❌ Reject Kursus" : "👁️ Preview Kursus"}
              </DialogTitle>
            </DialogHeader>

            {selectedCourse && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-lg">{selectedCourse.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{selectedCourse.description}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge>{selectedCourse.level}</Badge>
                    {selectedCourse.categories?.name && <Badge variant="secondary">{selectedCourse.categories.name}</Badge>}
                  </div>
                </div>

                {/* Curriculum preview */}
                <div>
                  <h4 className="font-heading font-bold text-sm mb-2">Kurikulum</h4>
                  {courseSections.length === 0 ? (
                    <p className="text-sm text-muted-foreground italic">Belum ada kurikulum</p>
                  ) : (
                    <div className="space-y-2">
                      {courseSections.map((section: any, i: number) => (
                        <div key={section.id} className="border rounded-lg p-3">
                          <p className="font-medium text-sm">Section {i + 1}: {section.title}</p>
                          <ul className="mt-1 space-y-0.5">
                            {(section.lessons || []).map((lesson: any) => (
                              <li key={lesson.id} className="text-xs text-muted-foreground flex items-center gap-1">
                                <BookOpen className="w-3 h-3" /> {lesson.title}
                                {lesson.duration_minutes ? ` (${lesson.duration_minutes} min)` : ""}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback area */}
                {actionType && (
                  <div>
                    <label className="text-sm font-medium">Feedback {actionType === "reject" ? "(wajib)" : "(opsional)"}</label>
                    <Textarea
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      placeholder={actionType === "approve" ? "Catatan untuk pengajar..." : "Jelaskan alasan penolakan..."}
                      className="mt-1"
                      rows={3}
                    />
                  </div>
                )}
              </div>
            )}

            {actionType && (
              <DialogFooter>
                <Button variant="outline" onClick={() => { setSelectedCourse(null); setActionType(null); }}>Batal</Button>
                <Button
                  onClick={handleSubmitReview}
                  disabled={reviewMutation.isPending || (actionType === "reject" && !feedback.trim())}
                  className={actionType === "approve" ? "bg-fun-green hover:bg-fun-green/90 text-white" : ""}
                  variant={actionType === "reject" ? "destructive" : "default"}
                >
                  {reviewMutation.isPending ? "Memproses..." : actionType === "approve" ? "Approve" : "Reject"}
                </Button>
              </DialogFooter>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default ModeratorQueue;
