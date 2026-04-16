import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BookOpen, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      // Fetch roles to determine redirect
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: rolesData } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);
        const userRoles = rolesData?.map((r: any) => r.role) || [];
        if (userRoles.includes("admin")) {
          navigate("/admin");
        } else if (userRoles.includes("moderator")) {
          navigate("/moderator");
        } else if (userRoles.includes("teacher")) {
          navigate("/teacher");
        } else {
          navigate("/dashboard");
        }
      } else {
        navigate("/dashboard");
      }
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error(error.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4 relative">
      {/* Ambient glows */}
      <div className="absolute top-20 right-20 w-72 h-72 bg-[#003d9b]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-20 left-20 w-56 h-56 bg-[#693600]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md">
        {/* Header strip */}
        <div className="signature-gradient rounded-t-2xl p-8 text-center">
          <Link to="/" className="text-2xl font-extrabold text-white font-headline tracking-tight">
            RyuZuno
          </Link>
          <p className="text-on-primary-container text-sm mt-2">Selamat datang kembali</p>
        </div>

        {/* Form card */}
        <div className="bg-surface-container-lowest rounded-b-2xl p-8 shadow-xl shadow-[#003d9b]/5 border border-outline-variant/10">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <Input
                placeholder="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 rounded-lg h-12 bg-surface-container-lowest border-outline-variant/30 focus:border-[#003d9b] focus:ring-0"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
              <Input
                placeholder="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 rounded-lg h-12 bg-surface-container-lowest border-outline-variant/30 focus:border-[#003d9b] focus:ring-0"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-lg signature-gradient text-white font-bold text-base hover:opacity-90 transition-all shadow-md shadow-[#003d9b]/20 disabled:opacity-60 flex items-center justify-center"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk"}
            </button>
          </form>

          <p className="text-center text-sm text-on-surface-variant mt-6">
            Belum punya akun?{" "}
            <Link to="/register" className="text-[#003d9b] font-bold hover:underline">Daftar Gratis</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
