import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, BookOpen, Search, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, hasRole } = useAuth();

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/catalog", label: "Explore" },
    { to: "/learning-paths", label: "Learning Paths" },
    { to: "/leaderboard", label: "Leaderboard" },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const getDashboardLink = () => {
    if (hasRole("admin")) return "/admin";
    if (hasRole("moderator")) return "/moderator";
    if (hasRole("teacher")) return "/teacher";
    return "/dashboard";
  };

  return (
    <nav className="sticky top-0 z-50 bg-card/80 backdrop-blur-lg border-b">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl">
          <span className="gradient-primary text-primary-foreground w-9 h-9 rounded-xl flex items-center justify-center text-lg">
            <BookOpen className="w-5 h-5" />
          </span>
          <span className="text-gradient-primary">EduQuest</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                location.pathname === link.to
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="icon" className="rounded-xl">
            <Search className="w-4 h-4" />
          </Button>
          {user ? (
            <>
              <Link to={getDashboardLink()}>
                <Button variant="outline" className="rounded-xl font-semibold gap-2">
                  <User className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={handleLogout}>
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="rounded-xl font-semibold">Masuk</Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-xl font-semibold gradient-primary border-0">Daftar Gratis</Button>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden p-2" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t bg-card p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="block px-4 py-3 rounded-xl text-sm font-semibold hover:bg-muted"
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">Dashboard</Button>
                </Link>
                <Button variant="ghost" className="rounded-xl" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-xl">Masuk</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-xl gradient-primary border-0">Daftar</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
