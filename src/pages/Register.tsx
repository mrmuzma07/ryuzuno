import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BookOpen, Mail, Lock, User, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      const { toast } = await import("sonner");
      toast.error("Password minimal 6 karakter");
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password, name);
      navigate("/login");
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error(error.message || "Registrasi gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 gradient-fun opacity-5" />
      <div className="absolute top-20 left-20 w-60 h-60 bg-fun-orange/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-fun-green/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md p-8 space-y-6 relative">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-heading font-bold text-2xl mb-2">
            <span className="gradient-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-gradient-primary">RyuZuno</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Mulai petualangan belajarmu! 🚀</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Nama Lengkap" value={name} onChange={(e) => setName(e.target.value)} className="pl-10 rounded-xl h-12" required />
          </div>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl h-12" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Password (min 6 karakter)" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 rounded-xl h-12" required />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl gradient-primary border-0 font-bold text-base" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Daftar Sekarang 🎮"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link to="/login" className="text-primary font-semibold hover:underline">Masuk</Link>
        </p>
      </Card>
    </div>
  );
};

export default Register;
