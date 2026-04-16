import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { Badge } from "@/components/ui/badge";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, hasRole } = useAuth();
  const { itemCount } = useCart();

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
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md shadow-sm">
      <div className="flex justify-between items-center w-full px-8 py-4 max-w-7xl mx-auto">
        {/* Logo + Nav Links */}
        <div className="flex items-center gap-8">
          <Link to="/" className="text-2xl font-extrabold text-[#003d9b] font-headline tracking-tight">
            RyuZuno
          </Link>
          <div className="hidden md:flex gap-6 items-center">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`font-headline font-bold tracking-tight transition-colors ${
                  location.pathname === link.to
                    ? "text-[#003d9b] border-b-2 border-[#003d9b] pb-0.5"
                    : "text-on-surface-variant hover:text-[#003d9b]"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side */}
        <div className="hidden md:flex items-center gap-4">
          {/* Search pill */}
          <div className="flex items-center bg-surface-container-low px-4 py-2 rounded-full gap-2">
            <span className="material-symbols-outlined text-outline text-xl leading-none">search</span>
            <input
              className="bg-transparent border-none focus:ring-0 focus:outline-none text-sm text-on-surface placeholder-outline w-36"
              placeholder="Search knowledge..."
              type="text"
            />
          </div>

          {/* Notifications */}
          <button className="text-on-surface-variant hover:text-[#003d9b] transition-colors p-2 relative">
            <span className="material-symbols-outlined">notifications</span>
          </button>

          {/* Cart */}
          {user && (
            <Link to="/cart" className="relative text-on-surface-variant hover:text-[#003d9b] transition-colors p-2">
              <span className="material-symbols-outlined">shopping_cart</span>
              {itemCount > 0 && (
                <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 p-0 flex items-center justify-center text-[10px] bg-[#003d9b] border-0 text-white">
                  {itemCount}
                </Badge>
              )}
            </Link>
          )}

          {user ? (
            <>
              <Link to={getDashboardLink()}>
                <Button
                  variant="outline"
                  className="font-semibold gap-2 border-[#003d9b]/20 text-[#003d9b] hover:bg-surface-container-high rounded-lg"
                >
                  <User className="w-4 h-4" /> Dashboard
                </Button>
              </Link>
              <button onClick={handleLogout} className="text-on-surface-variant hover:text-[#003d9b] transition-colors p-2">
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link to="/login">
                <Button variant="outline" className="font-semibold border-[#003d9b]/20 text-[#003d9b] hover:bg-surface-container-high rounded-lg">
                  Masuk
                </Button>
              </Link>
              <Link to="/register">
                <Button className="font-semibold signature-gradient border-0 text-white rounded-lg hover:opacity-90 transition-all shadow-md shadow-[#003d9b]/20">
                  Daftar Gratis
                </Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-on-surface-variant" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X /> : <Menu />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-outline-variant/10 p-4 space-y-2">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`block px-4 py-3 rounded-lg text-sm font-headline font-bold transition-colors ${
                location.pathname === link.to
                  ? "bg-surface-container-low text-[#003d9b]"
                  : "text-on-surface-variant hover:bg-surface-container-low"
              }`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="flex gap-2 pt-2">
            {user ? (
              <>
                <Link to={getDashboardLink()} className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-lg font-semibold border-[#003d9b]/20 text-[#003d9b]">Dashboard</Button>
                </Link>
                <Button variant="ghost" className="rounded-lg" onClick={() => { handleLogout(); setMobileOpen(false); }}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full rounded-lg font-semibold border-[#003d9b]/20 text-[#003d9b]">Masuk</Button>
                </Link>
                <Link to="/register" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full rounded-lg font-semibold signature-gradient border-0 text-white">Daftar</Button>
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


