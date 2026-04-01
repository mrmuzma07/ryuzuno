import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, Trash2, Eye } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type CourseStatus = Database["public"]["Enums"]["course_status"];

const statusBadge: Record<CourseStatus, { label: string; cls: string }> = {
  draft: { label: "Draft", cls: "bg-muted text-muted-foreground" },
  pending_review: { label: "Pending", cls: "bg-fun-yellow/10 text-fun-yellow" },
  published: { label: "Published", cls: "bg-fun-green/10 text-fun-green" },
  rejected: { label: "Rejected", cls: "bg-destructive/10 text-destructive" },
};

const AdminCourses = () => {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["admin-courses"],
    queryFn: async () => {
      const { data, error } = await supabase.from("courses").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: profiles = [] } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("id, full_name");
      return data || [];
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CourseStatus }) => {
      const { error } = await supabase.from("courses").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Status kursus diperbarui!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-courses"] });
      toast.success("Kursus dihapus!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const getTeacherName = (tid: string) => profiles.find((p) => p.id === tid)?.full_name || "Unknown";

  const filtered = courses.filter((c) => {
    const ms = !search || c.title.toLowerCase().includes(search.toLowerCase());
    const mf = statusFilter === "all" || c.status === statusFilter;
    return ms && mf;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">Course Management 📚</h1>
          <p className="text-muted-foreground text-sm">Approve, reject, atau hapus kursus</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari kursus..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="pending_review">Pending</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Memuat...</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((c) => {
              const sb = statusBadge[c.status];
              return (
                <Card key={c.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">oleh {getTeacherName(c.teacher_id)} · {c.level} · {c.total_students} students · Rp {Number(c.price).toLocaleString("id-ID")}</p>
                  </div>
                  <Badge className={`${sb.cls} border-0 shrink-0`}>{sb.label}</Badge>
                  <div className="flex gap-1.5 shrink-0">
                    {c.status !== "published" && (
                      <Button size="sm" variant="outline" className="text-fun-green" onClick={() => updateStatus.mutate({ id: c.id, status: "published" })}>
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />Publish
                      </Button>
                    )}
                    {c.status !== "rejected" && c.status !== "draft" && (
                      <Button size="sm" variant="outline" className="text-destructive" onClick={() => updateStatus.mutate({ id: c.id, status: "rejected" })}>
                        <XCircle className="w-3.5 h-3.5 mr-1" />Reject
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => { if (confirm("Hapus kursus ini?")) deleteCourse.mutate(c.id); }}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Tidak ada kursus.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCourses;
