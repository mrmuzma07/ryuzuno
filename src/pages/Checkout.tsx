import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils-format";
import { Loader2, CheckCircle, QrCode, ShieldCheck, Clock, ArrowLeft } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

type CheckoutStep = "review" | "payment" | "success";

const Checkout = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { cartItems, clearCart } = useCart();
  const [step, setStep] = useState<CheckoutStep>("review");
  const [processing, setProcessing] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(300); // 5 minutes

  useEffect(() => {
    if (step !== "payment") return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  if (!user || cartItems.length === 0) {
    if (step !== "success") {
      return (
        <div className="min-h-screen">
          <Navbar />
          <div className="container mx-auto px-4 py-20 text-center">
            <p className="text-muted-foreground">Keranjang kosong</p>
            <Button className="mt-4 rounded-xl" onClick={() => navigate("/catalog")}>Jelajahi Kursus</Button>
          </div>
          <Footer />
        </div>
      );
    }
  }

  const getItemPrice = (item: any) => {
    const price = Number(item.courses?.price || 0);
    if (!item.coupons) return { original: price, final: price, discount: 0 };
    const c = item.coupons;
    let d = price;
    if (c.discount_percent > 0) d = price * (1 - c.discount_percent / 100);
    else if (Number(c.discount_amount) > 0) d = Math.max(0, price - Number(c.discount_amount));
    return { original: price, final: d, discount: price - d };
  };

  const totals = cartItems.reduce(
    (acc: any, item: any) => {
      const p = getItemPrice(item);
      return { original: acc.original + p.original, final: acc.final + p.final, discount: acc.discount + p.discount };
    },
    { original: 0, final: 0, discount: 0 }
  );

  const handleCreateOrder = async () => {
    if (!user) return;
    setProcessing(true);
    try {
      // Create order
      const { data: order, error: orderErr } = await supabase.from("orders").insert({
        user_id: user.id,
        total_amount: totals.original,
        discount_amount: totals.discount,
        final_amount: totals.final,
        status: "pending",
        payment_method: "qris",
      }).select().single();
      if (orderErr) throw orderErr;

      // Create order items
      const orderItems = cartItems.map((item: any) => {
        const p = getItemPrice(item);
        return {
          order_id: order.id,
          course_id: item.courses?.id || item.course_id,
          price: p.original,
          discount: p.discount,
          coupon_code: item.coupons?.code || null,
        };
      });
      const { error: itemsErr } = await supabase.from("order_items").insert(orderItems);
      if (itemsErr) throw itemsErr;

      setOrderId(order.id);
      setStep("payment");
      setCountdown(300);
    } catch (err: any) {
      toast.error(err.message || "Gagal membuat pesanan");
    } finally {
      setProcessing(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (!orderId || !user) return;
    setProcessing(true);
    try {
      // Update order status
      await supabase.from("orders").update({
        status: "paid",
        paid_at: new Date().toISOString(),
        payment_id: `QRIS-MOCK-${Date.now()}`,
      }).eq("id", orderId);

      // Enroll user in all courses
      const enrollments = cartItems.map((item: any) => ({
        user_id: user.id,
        course_id: item.courses?.id || item.course_id,
      }));
      
      for (const enrollment of enrollments) {
        await supabase.from("enrollments").insert(enrollment).select();
      }

      // Clear cart
      await clearCart.mutateAsync();
      queryClient.invalidateQueries({ queryKey: ["enrollment"] });

      setStep("success");
      toast.success("Pembayaran berhasil! 🎉");
    } catch (err: any) {
      toast.error(err.message || "Gagal konfirmasi pembayaran");
    } finally {
      setProcessing(false);
    }
  };

  const formatCountdown = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">

        {/* Step indicators */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {["Review", "Pembayaran", "Selesai"].map((label, i) => {
            const stepIdx = i;
            const currentIdx = step === "review" ? 0 : step === "payment" ? 1 : 2;
            return (
              <div key={label} className="flex items-center gap-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  stepIdx <= currentIdx ? "gradient-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {stepIdx < currentIdx ? <CheckCircle className="w-4 h-4" /> : stepIdx + 1}
                </div>
                <span className={`text-sm font-medium ${stepIdx <= currentIdx ? "text-foreground" : "text-muted-foreground"}`}>{label}</span>
                {i < 2 && <div className={`w-8 h-0.5 ${stepIdx < currentIdx ? "bg-primary" : "bg-muted"}`} />}
              </div>
            );
          })}
        </div>

        {/* Review Step */}
        {step === "review" && (
          <Card className="p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold">Review Pesanan</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/cart")} className="gap-1">
                <ArrowLeft className="w-4 h-4" /> Kembali
              </Button>
            </div>
            <div className="space-y-3">
              {cartItems.map((item: any) => {
                const p = getItemPrice(item);
                return (
                  <div key={item.id} className="flex items-center justify-between py-3 border-b last:border-0">
                    <div>
                      <p className="font-medium text-sm">{item.courses?.title}</p>
                      {item.coupons && (
                        <Badge className="mt-1 bg-fun-green/10 text-fun-green border-0 text-[10px]">
                          Kupon: {item.coupons.code}
                        </Badge>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">{formatPrice(p.final)}</p>
                      {p.discount > 0 && <p className="text-[10px] text-muted-foreground line-through">{formatPrice(p.original)}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="border-t pt-4 space-y-2">
              <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(totals.original)}</span></div>
              {totals.discount > 0 && <div className="flex justify-between text-sm text-fun-green"><span>Diskon</span><span>-{formatPrice(totals.discount)}</span></div>}
              <div className="flex justify-between font-bold text-lg pt-2 border-t"><span>Total</span><span className="text-primary">{formatPrice(totals.final)}</span></div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted rounded-xl p-3">
              <QrCode className="w-5 h-5 shrink-0" />
              <span>Pembayaran menggunakan <strong>QRIS</strong> — Scan QR code dengan aplikasi e-wallet atau mobile banking</span>
            </div>
            <Button className="w-full h-12 rounded-xl gradient-primary border-0 font-bold text-base" onClick={handleCreateOrder} disabled={processing}>
              {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Memproses...</> : "Bayar Sekarang"}
            </Button>
          </Card>
        )}

        {/* Payment Step - Mock QRIS */}
        {step === "payment" && (
          <Card className="p-6 space-y-6 text-center">
            <div>
              <h2 className="font-heading text-xl font-bold">Scan QRIS untuk Membayar</h2>
              <p className="text-sm text-muted-foreground mt-1">Gunakan aplikasi e-wallet atau mobile banking</p>
            </div>
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-2xl shadow-lg inline-block">
                {/* Mock QR Code using SVG */}
                <svg viewBox="0 0 200 200" className="w-48 h-48">
                  <rect width="200" height="200" fill="white"/>
                  {/* QR-like pattern */}
                  <rect x="10" y="10" width="50" height="50" rx="4" fill="black"/>
                  <rect x="18" y="18" width="34" height="34" rx="2" fill="white"/>
                  <rect x="26" y="26" width="18" height="18" rx="1" fill="black"/>
                  <rect x="140" y="10" width="50" height="50" rx="4" fill="black"/>
                  <rect x="148" y="18" width="34" height="34" rx="2" fill="white"/>
                  <rect x="156" y="26" width="18" height="18" rx="1" fill="black"/>
                  <rect x="10" y="140" width="50" height="50" rx="4" fill="black"/>
                  <rect x="18" y="148" width="34" height="34" rx="2" fill="white"/>
                  <rect x="26" y="156" width="18" height="18" rx="1" fill="black"/>
                  {/* Data modules */}
                  {Array.from({ length: 12 }).map((_, i) =>
                    Array.from({ length: 12 }).map((_, j) => {
                      const show = (i * 7 + j * 13 + i * j) % 3 !== 0;
                      if (!show) return null;
                      const x = 70 + j * 5;
                      const y = 10 + i * 5;
                      if (x > 130 && y < 65) return null;
                      return <rect key={`${i}-${j}`} x={x} y={y} width="4" height="4" fill="black" />;
                    })
                  )}
                  {Array.from({ length: 20 }).map((_, i) =>
                    Array.from({ length: 8 }).map((_, j) => {
                      const show = (i * 11 + j * 7) % 3 !== 0;
                      if (!show) return null;
                      return <rect key={`b${i}-${j}`} x={10 + i * 9} y={70 + j * 8} width="4" height="4" fill="black" />;
                    })
                  )}
                  {/* QRIS label */}
                  <rect x="65" y="85" width="70" height="25" rx="4" fill="white" stroke="black" strokeWidth="1"/>
                  <text x="100" y="102" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#00529C">QRIS</text>
                </svg>
              </div>
            </div>
            <div>
              <p className="font-heading text-2xl font-bold text-primary">{formatPrice(totals.final)}</p>
              <div className="flex items-center justify-center gap-2 mt-2 text-sm">
                <Clock className="w-4 h-4 text-fun-orange" />
                <span className={countdown < 60 ? "text-destructive font-bold" : "text-muted-foreground"}>
                  Berlaku {formatCountdown(countdown)}
                </span>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-4 text-xs text-left space-y-1.5">
              <p className="font-bold text-sm mb-2">Cara Pembayaran:</p>
              <p>1. Buka aplikasi e-wallet (GoPay, OVO, DANA, ShopeePay, dll)</p>
              <p>2. Pilih menu <strong>Scan/Bayar</strong></p>
              <p>3. Arahkan kamera ke QR code di atas</p>
              <p>4. Konfirmasi pembayaran di aplikasi kamu</p>
            </div>
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
              <ShieldCheck className="w-4 h-4" /> Pembayaran dijamin aman
            </div>
            {/* Mock: Simulate payment confirmation */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-xs text-fun-orange font-medium">⚡ Mode Simulasi — klik tombol di bawah untuk konfirmasi pembayaran</p>
              <Button className="w-full h-12 rounded-xl gradient-primary border-0 font-bold" onClick={handleConfirmPayment} disabled={processing}>
                {processing ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Memverifikasi...</> : "✅ Simulasi: Konfirmasi Pembayaran"}
              </Button>
            </div>
          </Card>
        )}

        {/* Success Step */}
        {step === "success" && (
          <Card className="p-8 text-center space-y-6">
            <div className="w-20 h-20 rounded-full gradient-primary flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-primary-foreground" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold">Pembayaran Berhasil! 🎉</h2>
              <p className="text-muted-foreground mt-2">Kamu sudah terdaftar di semua kursus yang dibeli</p>
            </div>
            {orderId && (
              <p className="text-xs text-muted-foreground">Order ID: <code className="bg-muted px-2 py-1 rounded">{orderId.slice(0, 8)}</code></p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button className="rounded-xl gradient-primary border-0 font-bold" onClick={() => navigate("/dashboard/courses")}>
                Mulai Belajar 📖
              </Button>
              <Button variant="outline" className="rounded-xl" onClick={() => navigate("/catalog")}>
                Jelajahi Lagi
              </Button>
            </div>
          </Card>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Checkout;
