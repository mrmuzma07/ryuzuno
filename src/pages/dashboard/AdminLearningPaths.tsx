import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";

const AdminLearningPaths = () => {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("0");
  const [badgeId, setBadgeId] = useState<string>("none");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [managingId, setManagingId] = useState<string | null>(null);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("none");

  const { data: paths = [], isLoading } = useQuery({
    queryKey: ["admin-learning-paths"],
    queryFn: async () => {
      const { data, error } = await supabase.from("learning_paths").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["admin-badges"],
    queryFn: async () => {
      const { data } = await supabase.from("badges").select("id, name, icon");
      return data || [];
    },
  });

  const { data: courses = [] } = useQuery({
    queryKey: ["admin-published-courses"],
    queryFn: async () => {
      const { data } = await supabase.from("courses").select("id, title").eq("status", "published");
      return data || [];
    },
  });

  const { data: pathCourses = [], refetch: refetchPC } = useQuery({
    queryKey: ["admin-path-courses", managingId],
    queryFn: async () => {
      if (!managingId) return [];
      const { data, error } = await supabase.from("learning_path_courses").select("*").eq("learning_path_id", managingId).order("sort_order");
      if (error) throw error;
      return data;
    },
    enabled: !!managingId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!title.trim()) throw new Error("Judul wajib diisi");
      const payload = {
        title,
        description: description || null,
        estimated_hours: parseInt(estimatedHours) || 0,
        badge_id: badgeId === "none" ? null : badgeId,
      };
      if (editId) {
        const { error } = await supabase.from("learning_paths").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("learning_paths").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-learning-paths"] });
      toast.success(editId ? "Learning Path diperbarui!" : "Learning Path ditambahkan!");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deletePath = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("learning_paths").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-learning-paths"] });
      toast.success("Learning Path dihapus!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const addCourseToPaths = useMutation({
    mutationFn: async () => {
      if (!managingId || selectedCourseId === "none") return;
      const nextOrder = pathCourses.length;
      const { error } = await supabase.from("learning_path_courses").insert({
        learning_path_id: managingId,
        course_id: selectedCourseId,
        sort_order: nextOrder,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      refetchPC();
      setSelectedCourseId("none");
      toast.success("Kursus ditambahkan ke path!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const removeCourseFromPath = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("learning_path_courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { refetchPC(); toast.success("Kursus dihapus dari path!"); },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => { setEditId(null); setTitle(""); setDescription(""); setEstimatedHours("0"); setBadgeId("none"); setDialogOpen(false); };

  const openEdit = (p: any) => {
    setEditId(p.id); setTitle(p.title); setDescription(p.description || ""); setEstimatedHours(String(p.estimated_hours || 0)); setBadgeId(p.badge_id || "none"); setDialogOpen(true);
  };

  const getCourseName = (cid: string) => courses.find((c) => c.id === cid)?.title || "Unknown";
  const existingCourseIds = pathCourses.map((pc) => pc.course_id);
  const availableCourses = courses.filter((c) => !existingCourseIds.includes(c.id));

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Learning Paths 🛤️</h1>
            <p className="text-muted-foreground text-sm">Kelola jalur pembelajaran</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><Plus className="w-4 h-4 mr-1" />Tambah</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Edit Learning Path" : "Tambah Learning Path"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Judul" value={title} onChange={(e) => setTitle(e.target.value)} />
                <Textarea placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input placeholder="Estimasi jam" type="number" value={estimatedHours} onChange={(e) => setEstimatedHours(e.target.value)} />
                <Select value={badgeId} onValueChange={setBadgeId}>
                  <SelectTrigger><SelectValue placeholder="Badge reward (opsional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Badge</SelectItem>
                    {badges.map((b) => <SelectItem key={b.id} value={b.id}>{b.icon} {b.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button className="w-full rounded-xl" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Manage courses in path */}
        {managingId && (
          <Card className="p-5 space-y-4 border-primary/30">
            <div className="flex items-center justify-between">
              <h3 className="font-heading font-bold">Kursus dalam Path: {paths.find((p) => p.id === managingId)?.title}</h3>
              <Button variant="ghost" size="sm" onClick={() => setManagingId(null)}>Tutup</Button>
            </div>
            <div className="space-y-2">
              {pathCourses.map((pc, i) => (
                <div key={pc.id} className="flex items-center gap-2 p-2 bg-muted rounded-lg text-sm">
                  <GripVertical className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold text-muted-foreground w-6">{i + 1}.</span>
                  <span className="flex-1">{getCourseName(pc.course_id)}</span>
                  <Button variant="ghost" size="icon" className="text-destructive h-7 w-7" onClick={() => removeCourseFromPath.mutate(pc.id)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {pathCourses.length === 0 && <p className="text-sm text-muted-foreground">Belum ada kursus ditambahkan.</p>}
            </div>
            {availableCourses.length > 0 && (
              <div className="flex gap-2">
                <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Pilih kursus" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Pilih kursus...</SelectItem>
                    {availableCourses.map((c) => <SelectItem key={c.id} value={c.id}>{c.title}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => addCourseToPaths.mutate()} disabled={selectedCourseId === "none"}>Tambah</Button>
              </div>
            )}
          </Card>
        )}

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Memuat...</p>
        ) : (
          <div className="space-y-3">
            {paths.map((p) => (
              <Card key={p.id} className="p-4 flex flex-col md:flex-row md:items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold">{p.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{p.description || "Tanpa deskripsi"}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">⏱️ {p.estimated_hours || 0} jam</p>
                </div>
                <div className="flex gap-1.5 shrink-0">
                  <Button variant="outline" size="sm" onClick={() => setManagingId(p.id)}>Kelola Kursus</Button>
                  <Button variant="ghost" size="icon" onClick={() => openEdit(p)}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("Hapus learning path ini?")) deletePath.mutate(p.id); }}>
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))}
            {paths.length === 0 && <p className="text-center text-muted-foreground py-8">Belum ada learning path.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminLearningPaths;
