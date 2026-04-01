import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { BookOpen, Mail, Lock, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

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
      navigate("/dashboard");
    } catch (error: any) {
      const { toast } = await import("sonner");
      toast.error(error.message || "Login gagal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 gradient-fun opacity-5" />
      <div className="absolute top-20 right-20 w-60 h-60 bg-fun-purple/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-48 h-48 bg-fun-pink/10 rounded-full blur-3xl" />

      <Card className="w-full max-w-md p-8 space-y-6 relative">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 font-heading font-bold text-2xl mb-2">
            <span className="gradient-primary text-primary-foreground w-10 h-10 rounded-xl flex items-center justify-center">
              <BookOpen className="w-5 h-5" />
            </span>
            <span className="text-gradient-primary">RyuZuno</span>
          </Link>
          <p className="text-muted-foreground text-sm mt-2">Selamat datang kembali! 👋</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 rounded-xl h-12" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 rounded-xl h-12" required />
          </div>
          <Button type="submit" className="w-full h-12 rounded-xl gradient-primary border-0 font-bold text-base" disabled={loading}>
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Masuk"}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Belum punya akun?{" "}
          <Link to="/register" className="text-primary font-semibold hover:underline">Daftar Gratis</Link>
        </p>
      </Card>
    </div>
  );
};

export default Login;
