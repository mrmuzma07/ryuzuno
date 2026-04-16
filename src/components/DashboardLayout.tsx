import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BookOpen, Menu, X,
} from "lucide-react";

type Role = "student" | "teacher" | "admin" | "moderator";

const navItems: Record<Role, { to: string; label: string; icon: string }[]> = {
  student: [
    { to: "/dashboard", label: "Dashboard", icon: "dashboard" },
    { to: "/dashboard/courses", label: "Kursus Saya", icon: "school" },
    { to: "/dashboard/paths", label: "Learning Paths", icon: "route" },
    { to: "/dashboard/badges", label: "Badges", icon: "military_tech" },
    { to: "/dashboard/leaderboard", label: "Leaderboard", icon: "leaderboard" },
    { to: "/dashboard/profile", label: "Profile", icon: "person" },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", icon: "dashboard" },
    { to: "/teacher/courses", label: "Kursus Saya", icon: "school" },
    { to: "/teacher/create", label: "Buat Kursus", icon: "add_circle" },
    { to: "/teacher/students", label: "Students", icon: "groups" },
    { to: "/teacher/reviews", label: "Reviews", icon: "rate_review" },
  ],
  admin: [
    { to: "/admin", label: "Dashboard", icon: "dashboard" },
    { to: "/admin/users", label: "Users", icon: "groups" },
    { to: "/admin/courses", label: "Courses", icon: "school" },
    { to: "/admin/paths", label: "Learning Paths", icon: "route" },
    { to: "/admin/badges", label: "Badges", icon: "military_tech" },
    { to: "/admin/categories", label: "Kategori", icon: "label" },
  ],
  moderator: [
    { to: "/moderator", label: "Dashboard", icon: "dashboard" },
    { to: "/moderator/queue", label: "Review Queue", icon: "assignment" },
    { to: "/moderator/log", label: "Moderation Log", icon: "shield" },
  ],
};

const roleLabels: Record<Role, string> = {
  student: "Student",
  teacher: "Teacher",
  admin: "Admin",
  moderator: "Moderator",
};

const DashboardLayout = ({ children, role }: { children: ReactNode; role: Role }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const items = navItems[role];

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      {/* ===== Fixed Top Header ===== */}
      <header className="fixed top-0 w-full z-50 bg-slate-50/80 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,61,155,0.04)]">
        <nav className="flex justify-between items-center h-16 px-6 lg:px-8 w-full">
          {/* Left: Logo + Role Badge + Nav Links */}
          <div className="flex items-center gap-4 lg:gap-6">
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <BookOpen className="w-5 h-5 text-[#003d9b]" />
              <span className="text-xl font-extrabold tracking-tighter text-[#003d9b] font-headline">RyuZuno</span>
            </Link>

            {/* Role badge */}
            <span className="hidden md:inline-flex px-2.5 py-0.5 bg-[#003d9b]/10 text-[#003d9b] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
              {roleLabels[role]}
            </span>

            {/* Desktop nav links */}
            <div className="hidden lg:flex gap-1 items-center font-headline text-sm tracking-wide">
              {items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`px-3 py-1.5 rounded-lg transition-colors ${
                      isActive
                        ? "text-[#003d9b] font-bold bg-[#003d9b]/5"
                        : "text-slate-500 hover:text-[#003d9b] hover:bg-slate-100/50"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Icons + Avatar */}
          <div className="flex items-center gap-3">
            {/* Mobile menu toggle */}
            <button
              className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button className="hidden md:flex p-2 text-slate-500 hover:bg-[#003d9b]/5 rounded-lg transition-all">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="hidden md:flex p-2 text-slate-500 hover:bg-[#003d9b]/5 rounded-lg transition-all">
              <span className="material-symbols-outlined">settings</span>
            </button>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold ring-2 ring-[#003d9b]/10">
              U
            </div>
          </div>
        </nav>

        {/* Mobile Nav Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 shadow-lg">
            <div className="px-4 py-3 space-y-1">
              {/* Role badge on mobile */}
              <div className="px-3 py-2 mb-2">
                <span className="px-2.5 py-0.5 bg-[#003d9b]/10 text-[#003d9b] text-[10px] font-extrabold uppercase tracking-widest rounded-full">
                  {roleLabels[role]}
                </span>
              </div>
              {items.map((item) => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "text-[#003d9b] bg-[#003d9b]/5 font-bold"
                        : "text-slate-500 hover:text-[#003d9b] hover:bg-slate-50"
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}

              {/* Logout on mobile */}
              <div className="border-t border-slate-100 mt-2 pt-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:text-red-500 hover:bg-red-50/50 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">logout</span>
                  Keluar
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===== Main Content ===== */}
      <main className="pt-16 min-h-screen">
        <div className="p-4 lg:p-8">{children}</div>
      </main>
    </div>
  );
};

export default DashboardLayout;
