import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2 } from "lucide-react";

const AdminBadges = () => {
  const qc = useQueryClient();
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("🏆");
  const [xpReward, setXpReward] = useState("0");
  const [criteria, setCriteria] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: badges = [], isLoading } = useQuery({
    queryKey: ["admin-badges"],
    queryFn: async () => {
      const { data, error } = await supabase.from("badges").select("*").order("name");
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!name.trim() || !icon.trim()) throw new Error("Nama dan icon wajib diisi");
      const payload = { name, description: description || null, icon, xp_reward: parseInt(xpReward) || 0, criteria: criteria || null };
      if (editId) {
        const { error } = await supabase.from("badges").update(payload).eq("id", editId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("badges").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-badges"] });
      toast.success(editId ? "Badge diperbarui!" : "Badge ditambahkan!");
      resetForm();
    },
    onError: (e: any) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("badges").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-badges"] });
      toast.success("Badge dihapus!");
    },
    onError: (e: any) => toast.error(e.message),
  });

  const resetForm = () => { setEditId(null); setName(""); setDescription(""); setIcon("🏆"); setXpReward("0"); setCriteria(""); setDialogOpen(false); };

  const openEdit = (b: any) => {
    setEditId(b.id); setName(b.name); setDescription(b.description || ""); setIcon(b.icon); setXpReward(String(b.xp_reward)); setCriteria(b.criteria || ""); setDialogOpen(true);
  };

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-heading text-2xl font-bold">Badges 🏅</h1>
            <p className="text-muted-foreground text-sm">Kelola badge dan reward XP</p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(o) => { if (!o) resetForm(); setDialogOpen(o); }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl"><Plus className="w-4 h-4 mr-1" />Tambah</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{editId ? "Edit Badge" : "Tambah Badge"}</DialogTitle></DialogHeader>
              <div className="space-y-3">
                <Input placeholder="Nama badge" value={name} onChange={(e) => setName(e.target.value)} />
                <Input placeholder="Icon (emoji)" value={icon} onChange={(e) => setIcon(e.target.value)} />
                <Textarea placeholder="Deskripsi" value={description} onChange={(e) => setDescription(e.target.value)} />
                <Input placeholder="XP Reward" type="number" value={xpReward} onChange={(e) => setXpReward(e.target.value)} />
                <Input placeholder="Kriteria (opsional)" value={criteria} onChange={(e) => setCriteria(e.target.value)} />
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
            {badges.map((b) => (
              <Card key={b.id} className="p-4">
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{b.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-heading font-bold">{b.name}</p>
                    {b.description && <p className="text-xs text-muted-foreground line-clamp-2">{b.description}</p>}
                    <p className="text-xs text-fun-orange font-bold mt-1">+{b.xp_reward} XP</p>
                    {b.criteria && <p className="text-xs text-muted-foreground mt-0.5">📋 {b.criteria}</p>}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => { if (confirm("Hapus badge ini?")) deleteMutation.mutate(b.id); }}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {badges.length === 0 && <p className="col-span-full text-center text-muted-foreground py-8">Belum ada badge.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminBadges;
