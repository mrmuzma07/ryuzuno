import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/DashboardLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, XCircle, FileText } from "lucide-react";

const ModeratorLog = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["moderator-log"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("course_reviews")
        .select("*, courses(title, teacher_id, profiles:teacher_id(full_name)), reviewer:profiles!course_reviews_reviewer_id_fkey(full_name)")
        .order("reviewed_at", { ascending: false });
      if (error) {
        // Fallback without the reviewer join if FK doesn't exist
        const { data: fallback, error: err2 } = await supabase
          .from("course_reviews")
          .select("*, courses(title, teacher_id, profiles:teacher_id(full_name))")
          .order("reviewed_at", { ascending: false });
        if (err2) throw err2;
        return fallback || [];
      }
      return data || [];
    },
  });

  const statusConfig: Record<string, { label: string; icon: any; className: string }> = {
    published: { label: "Approved", icon: CheckCircle, className: "bg-fun-green/10 text-fun-green" },
    rejected: { label: "Rejected", icon: XCircle, className: "bg-destructive/10 text-destructive" },
    pending: { label: "Pending", icon: FileText, className: "bg-fun-orange/10 text-fun-orange" },
  };

  return (
    <DashboardLayout role="moderator">
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl md:text-3xl font-bold">Moderation Log 📜</h1>
          <p className="text-muted-foreground">Riwayat semua review kursus</p>
        </div>

        {isLoading ? (
          <Card className="animate-pulse h-64" />
        ) : logs.length === 0 ? (
          <Card className="p-12 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="font-heading font-bold">Belum ada riwayat moderasi</p>
          </Card>
        ) : (
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kursus</TableHead>
                  <TableHead>Pengajar</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Feedback</TableHead>
                  <TableHead>Tanggal Review</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log: any) => {
                  const config = statusConfig[log.status] || statusConfig.pending;
                  const Icon = config.icon;
                  return (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.courses?.title || "—"}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {(log.courses?.profiles as any)?.full_name || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge className={`${config.className} gap-1`}>
                          <Icon className="w-3 h-3" />
                          {config.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                        {log.feedback || <span className="italic">Tidak ada feedback</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.reviewed_at ? new Date(log.reviewed_at).toLocaleDateString("id-ID", {
                          day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
                        }) : "—"}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ModeratorLog;
