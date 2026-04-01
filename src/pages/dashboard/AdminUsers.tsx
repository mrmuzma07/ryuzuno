import { useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Search, Shield, UserPlus, Trash2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type AppRole = Database["public"]["Enums"]["app_role"];
const ALL_ROLES: AppRole[] = ["admin", "moderator", "teacher", "student"];

const roleBadgeColor: Record<AppRole, string> = {
  admin: "bg-destructive/10 text-destructive",
  moderator: "bg-fun-orange/10 text-fun-orange",
  teacher: "bg-fun-blue/10 text-fun-blue",
  student: "bg-fun-green/10 text-fun-green",
};

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");

  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ["admin-profiles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: allRoles = [] } = useQuery({
    queryKey: ["admin-user-roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("*");
      if (error) throw error;
      return data;
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role berhasil ditambahkan!");
    },
    onError: (err: any) => {
      if (err.code === "23505") toast.info("User sudah memiliki role ini.");
      else toast.error(err.message);
    },
  });

  const removeRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: AppRole }) => {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", role);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user-roles"] });
      toast.success("Role berhasil dihapus!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const getRolesForUser = (userId: string) => allRoles.filter((r) => r.user_id === userId);

  const filtered = profiles.filter((p) => {
    const matchSearch = !search || (p.full_name || "").toLowerCase().includes(search.toLowerCase()) || p.id.includes(search);
    const userRoles = getRolesForUser(p.id);
    const matchRole = roleFilter === "all" || userRoles.some((r) => r.role === roleFilter);
    return matchSearch && matchRole;
  });

  return (
    <DashboardLayout role="admin">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl font-bold">User Management 👥</h1>
          <p className="text-muted-foreground text-sm">Kelola pengguna dan role mereka</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Cari nama atau ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              {ALL_ROLES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <p className="text-muted-foreground text-center py-12">Memuat data...</p>
        ) : (
          <div className="space-y-3">
            {filtered.map((profile) => {
              const userRoles = getRolesForUser(profile.id);
              const missingRoles = ALL_ROLES.filter((r) => !userRoles.some((ur) => ur.role === r));
              return (
                <Card key={profile.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center font-bold text-sm shrink-0">
                      {(profile.full_name || "?")[0].toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading font-bold truncate">{profile.full_name || "Unnamed"}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.id}</p>
                      <p className="text-xs text-muted-foreground">XP: {profile.xp_points}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {userRoles.map((r) => (
                      <Badge key={r.id} className={`${roleBadgeColor[r.role]} border-0 gap-1 pr-1`}>
                        {r.role}
                        <button onClick={() => removeRoleMutation.mutate({ userId: profile.id, role: r.role })} className="ml-0.5 hover:text-destructive">
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {missingRoles.length > 0 && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs"><UserPlus className="w-3 h-3 mr-1" />Role</Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-xs">
                          <DialogHeader><DialogTitle>Tambah Role</DialogTitle></DialogHeader>
                          <div className="space-y-2">
                            {missingRoles.map((role) => (
                              <Button key={role} variant="outline" className="w-full justify-start" onClick={() => addRoleMutation.mutate({ userId: profile.id, role })}>
                                <Shield className="w-4 h-4 mr-2" />{role}
                              </Button>
                            ))}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </Card>
              );
            })}
            {filtered.length === 0 && <p className="text-center text-muted-foreground py-8">Tidak ada user ditemukan.</p>}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;
