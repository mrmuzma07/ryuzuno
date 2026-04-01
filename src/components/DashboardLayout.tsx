import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  BookOpen, LayoutDashboard, GraduationCap, Trophy, Award, User, LogOut,
  Menu, X, PlusCircle, Users, Settings, FileCheck, Shield, BarChart3, Tag, Route
} from "lucide-react";

type Role = "student" | "teacher" | "admin" | "moderator";

const navItems: Record<Role, { to: string; label: string; icon: any }[]> = {
  student: [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/courses", label: "Kursus Saya", icon: GraduationCap },
    { to: "/dashboard/paths", label: "Learning Paths", icon: Route },
    { to: "/dashboard/badges", label: "Badges", icon: Award },
    { to: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
    { to: "/dashboard/profile", label: "Profile", icon: User },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", icon: LayoutDashboard },
    { to: "/teacher/courses", label: "Kursus Saya", icon: GraduationCap },
    { to: "/teacher/create", label: "Buat Kursus", icon: PlusCircle },
    { to: "/teacher/students", label: "Students", icon: Users },
    { to: "/teacher/reviews", label: "Reviews", icon: FileCheck },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { to: "/admin/users", label: "Users", icon: Users },
    { to: "/admin/courses", label: "Courses", icon: GraduationCap },
    { to: "/admin/paths", label: "Learning Paths", icon: Route },
    { to: "/admin/badges", label: "Badges", icon: Award },
    { to: "/admin/categories", label: "Kategori", icon: Tag },
    { to: "/admin/reports", label: "Reports", icon: BarChart3 },
  ],
  moderator: [
    { to: "/moderator", label: "Dashboard", icon: LayoutDashboard },
    { to: "/moderator/queue", label: "Review Queue", icon: FileCheck },
    { to: "/moderator/log", label: "Moderation Log", icon: Shield },
  ],
};

const roleLabels: Record<Role, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
  moderator: "Moderator",
};

const DashboardLayout = ({ children, role }: { children: ReactNode; role: Role }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const items = navItems[role];

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-sidebar text-sidebar-foreground transform transition-transform lg:translate-x-0 lg:static ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="p-5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-lg text-sidebar-primary-foreground">
            <BookOpen className="w-5 h-5" />
            RyuZuno
          </Link>
          <button className="lg:hidden text-sidebar-foreground" onClick={() => setSidebarOpen(false)}>
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 mb-4">
          <span className="text-[10px] uppercase tracking-widest text-sidebar-foreground/50 font-bold">{roleLabels[role]}</span>
        </div>

        <nav className="px-3 space-y-1">
          {items.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-sidebar-accent text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-4 left-0 right-0 px-3">
          <Link to="/">
            <Button variant="ghost" className="w-full justify-start text-sidebar-foreground/60 hover:text-sidebar-foreground text-sm">
              <LogOut className="w-4 h-4 mr-2" /> Keluar
            </Button>
          </Link>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main */}
      <main className="flex-1 min-h-screen">
        <header className="sticky top-0 z-30 bg-card/80 backdrop-blur-lg border-b px-4 h-14 flex items-center lg:px-8">
          <button className="lg:hidden mr-3" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex-1" />
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-primary-foreground text-xs font-bold">U</div>
        </header>
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
