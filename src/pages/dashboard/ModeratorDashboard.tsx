import { Card } from "@/components/ui/card";
import DashboardLayout from "@/components/DashboardLayout";
import { FileCheck, Shield, Clock } from "lucide-react";

const ModeratorDashboard = () => (
  <DashboardLayout role="moderator">
    <div className="space-y-8">
      <div>
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Moderator Dashboard 🔍</h1>
        <p className="text-muted-foreground">Review dan moderasi kursus</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Menunggu Review", value: "12", icon: Clock, color: "text-fun-orange" },
          { label: "Approved Bulan Ini", value: "34", icon: FileCheck, color: "text-fun-green" },
          { label: "Rejected Bulan Ini", value: "5", icon: Shield, color: "text-fun-pink" },
        ].map((stat) => (
          <Card key={stat.label} className="p-5">
            <stat.icon className={`w-6 h-6 ${stat.color} mb-2`} />
            <p className="font-heading text-2xl font-bold">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-8 text-center text-muted-foreground">
        <p className="text-4xl mb-3">🚧</p>
        <p className="font-heading font-bold">Review queue akan segera hadir!</p>
        <p className="text-sm mt-1">Preview, feedback, approve/reject kursus.</p>
      </Card>
    </div>
  </DashboardLayout>
);

export default ModeratorDashboard;
