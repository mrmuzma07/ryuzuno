import { useEffect, useState } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { User, Mail, Award, Star, Save, Loader2 } from "lucide-react";

const StudentProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user!.id)
        .single();
      return data;
    },
    enabled: !!user,
  });

  const { data: badges = [] } = useQuery({
    queryKey: ["my-badges", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_badges")
        .select("*, badges(*)")
        .eq("user_id", user!.id);
      return data || [];
    },
    enabled: !!user,
  });

  const { data: enrollmentCount = 0 } = useQuery({
    queryKey: ["my-enrollment-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id);
      return count || 0;
    },
    enabled: !!user,
  });

  const { data: completedCount = 0 } = useQuery({
    queryKey: ["my-completed-count", user?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("enrollments")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user!.id)
        .not("completed_at", "is", null);
      return count || 0;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || "");
      setBio(profile.bio || "");
    }
  }, [profile]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("profiles")
        .update({ full_name: fullName, bio, updated_at: new Date().toISOString() })
        .eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      toast.success("Profil berhasil diperbarui! 🎉");
    },
    onError: () => toast.error("Gagal memperbarui profil"),
  });

  if (isLoading) {
    return (
      <DashboardLayout role="student">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3" />
          <div className="h-48 bg-muted rounded-xl" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="student">
      <div className="space-y-6 max-w-3xl">
        <div>
          <h1 className="font-heading text-2xl font-bold">Profil Saya</h1>
          <p className="text-muted-foreground text-sm mt-1">Kelola informasi profil dan lihat statistikmu</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "XP Points", value: (profile?.xp_points || 0).toLocaleString(), icon: Star, color: "text-yellow-500" },
            { label: "Badges", value: badges.length, icon: Award, color: "text-primary" },
            { label: "Kursus Diikuti", value: enrollmentCount, icon: User, color: "text-blue-500" },
            { label: "Kursus Selesai", value: completedCount, icon: Mail, color: "text-green-500" },
          ].map((stat) => (
            <Card key={stat.label} className="p-4 rounded-2xl text-center">
              <stat.icon className={`w-5 h-5 mx-auto mb-1 ${stat.color}`} />
              <p className="font-heading text-xl font-bold">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Edit form */}
        <Card className="p-6 rounded-2xl space-y-5">
          <h2 className="font-heading font-bold text-lg">Informasi Profil</h2>

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-2xl">
              {(fullName || "U").charAt(0)}
            </div>
            <div>
              <p className="font-semibold">{fullName || "User"}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="fullName">Nama Lengkap</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Masukkan nama lengkap"
                className="rounded-xl mt-1"
              />
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Ceritakan tentang dirimu..."
                className="rounded-xl mt-1"
                rows={3}
              />
            </div>
          </div>

          <Button
            onClick={() => updateMutation.mutate()}
            disabled={updateMutation.isPending}
            className="rounded-xl gap-2"
          >
            {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Simpan Perubahan
          </Button>
        </Card>

        {/* Badges */}
        {badges.length > 0 && (
          <Card className="p-6 rounded-2xl space-y-4">
            <h2 className="font-heading font-bold text-lg">Lencana Saya</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {badges.map((ub: any) => (
                <div key={ub.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
                  <span className="text-2xl">{ub.badges?.icon || "🏅"}</span>
                  <div>
                    <p className="font-semibold text-sm">{ub.badges?.name}</p>
                    <p className="text-[10px] text-muted-foreground">+{ub.badges?.xp_reward} XP</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default StudentProfile;
