import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminCategories = () => {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [icon, setIcon] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const { data, error } = await supabase.from("categories").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !slug.trim()) throw new Error("Nama dan slug wajib diisi");
      if (editId) {
        const { error } = await supabase.from("categories").update({ name, slug, icon: icon || null }).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert({ name, slug, icon: icon || null });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success(editId ? "Kategori diperbarui!" : "Kategori ditambahkan!");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-categories"] });
      toast.success("Kategori dihapus!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => { setEditId(null); setName(""); setSlug(""); setIcon(""); setDialogOpen(false); };

  const openEdit = (cat: any) => {
    setEditId(cat.id); setName(cat.name); setSlug(cat.slug); setIcon(cat.icon || ""); setDialogOpen(true);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Kategori 🏷️</h1>
            <p className="text-muted-foreground text-sm">Kelola kategori kursus</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><Plus className="w-4 h-4 mr-1" />Tambah</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Edit Kategori" : "Tambah Kategori"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nama kategori" value={name} onChange={(e) => { setName(e.target.value); if (!editId) setSlug(e.target.value.toLowerCase().replace(/\s+/g, "-")); }} />
                <Input placeholder="Slug (url-friendly)" value={slug} onChange={(e) => setSlug(e.target.value)} />
                <Input placeholder="Icon (emoji)" value={icon} onChange={(e) => setIcon(e.target.value)} />
                <Button className="w-full rounded-xl" onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <p className="text-center text-muted-foreground py-12">Memuat...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categories.map((cat) => (
              <Card key={cat.id} className="p-4 flex items-center gap-3">
                <span className="text-2xl">{cat.icon || "📁"}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-heading font-bold truncate">{cat.name}</p>
                  <p className="text-xs text-muted-foreground">/{cat.slug}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("Hapus kategori ini?")) deleteMutation.mutate(cat.id); }}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </Card>
            ))}
            {categories.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">Belum ada kategori.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminCategories;
