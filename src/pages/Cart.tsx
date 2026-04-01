import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils-format";
import { Trash2, ShoppingCart, Tag, Loader2, CheckCircle, ArrowRight } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Cart = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { cartItems, isLoading, removeFromCart, updateCoupon } = useCart();
  const [couponInputs, setCouponInputs] = useState<Record<string, string>>({});
  const [checkingCoupon, setCheckingCoupon] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingCart className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="font-heading text-2xl font-bold mb-2">Keranjang Belanja</h1>
          <p className="text-muted-foreground mb-4">Silakan login untuk melihat keranjang</p>
          <Link to="/login"><Button className="rounded-xl">Login</Button></Link>
        </div>
        <Footer />
      </div>
    );
  }

  const getItemPrice = (item: any) => {
    const price = Number(item.courses?.price || 0);
    if (!item.coupons) return { original: price, final: price, discount: 0 };
    const coupon = item.coupons;
    let discounted = price;
    if (coupon.discount_percent > 0) discounted = price * (1 - coupon.discount_percent / 100);
    else if (Number(coupon.discount_amount) > 0) discounted = Math.max(0, price - Number(coupon.discount_amount));
    return { original: price, final: discounted, discount: price - discounted };
  };

  const totals = cartItems.reduce(
    (acc: any, item: any) => {
      const p = getItemPrice(item);
      return { original: acc.original + p.original, final: acc.final + p.final, discount: acc.discount + p.discount };
    },
    { original: 0, final: 0, discount: 0 }
  );

  const handleApplyCoupon = async (cartItemId: string, courseId: string) => {
    const code = couponInputs[cartItemId]?.trim().toUpperCase();
    if (!code) return;
    setCheckingCoupon(cartItemId);
    try {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", code)
        .eq("course_id", courseId)
        .eq("is_active", true)
        .maybeSingle();
      if (!coupon) { toast.error("Kupon tidak valid"); return; }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) { toast.error("Kupon kedaluwarsa"); return; }
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) { toast.error("Kupon habis"); return; }
      updateCoupon.mutate({ cartItemId, couponId: coupon.id });
      toast.success("Kupon diterapkan! 🎉");
    } catch { toast.error("Gagal validasi kupon"); }
    finally { setCheckingCoupon(null); }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="font-heading text-3xl font-bold mb-8 flex items-center gap-3">
          <ShoppingCart className="w-8 h-8" /> Keranjang Belanja
          {cartItems.length > 0 && <Badge variant="secondary" className="text-sm">{cartItems.length} item</Badge>}
        </h1>

        {isLoading ? (
          <div className="text-center py-20"><Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" /></div>
        ) : cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingCart className="w-20 h-20 mx-auto text-muted-foreground/30 mb-4" />
            <h2 className="font-heading text-xl font-bold mb-2">Keranjang kosong</h2>
            <p className="text-muted-foreground mb-6">Cari kursus yang kamu suka!</p>
            <Link to="/catalog"><Button className="rounded-xl gradient-primary border-0">Jelajahi Kursus</Button></Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item: any) => {
                const p = getItemPrice(item);
                const course = item.courses;
                return (
                  <Card key={item.id} className="p-4 flex gap-4">
                    <div className="w-32 h-20 rounded-lg overflow-hidden shrink-0 bg-muted">
                      {course?.thumbnail_url ? (
                        <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-fun-blue/20" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link to={`/course/${course?.id}`} className="font-heading font-bold text-sm hover:text-primary line-clamp-2">{course?.title}</Link>
                      <p className="text-xs text-muted-foreground mt-1 capitalize">{course?.level}</p>
                      <div className="flex items-center gap-2 mt-2">
                        {item.coupons ? (
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-primary">{formatPrice(p.final)}</span>
                            <span className="text-xs text-muted-foreground line-through">{formatPrice(p.original)}</span>
                            <Badge className="bg-fun-green/10 text-fun-green border-0 text-[10px]">
                              <CheckCircle className="w-3 h-3 mr-1" />{item.coupons.code}
                            </Badge>
                            <Button size="sm" variant="ghost" className="text-[10px] h-6 px-2" onClick={() => updateCoupon.mutate({ cartItemId: item.id, couponId: null })}>
                              Hapus kupon
                            </Button>
                          </div>
                        ) : (
                          <>
                            <span className="font-bold text-primary">{formatPrice(p.original)}</span>
                            <div className="flex items-center gap-1 ml-2">
                              <Input
                                placeholder="Kupon"
                                className="h-7 w-24 text-[10px] uppercase"
                                value={couponInputs[item.id] || ""}
                                onChange={(e) => setCouponInputs({ ...couponInputs, [item.id]: e.target.value.toUpperCase() })}
                              />
                              <Button
                                size="sm" className="h-7 text-[10px] px-2"
                                disabled={!couponInputs[item.id]?.trim() || checkingCoupon === item.id}
                                onClick={() => handleApplyCoupon(item.id, course?.id)}
                              >
                                {checkingCoupon === item.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <Tag className="w-3 h-3" />}
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="shrink-0 text-destructive hover:text-destructive" onClick={() => removeFromCart.mutate(item.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </Card>
                );
              })}
            </div>

            {/* Summary */}
            <div>
              <Card className="p-6 space-y-4 sticky top-20">
                <h2 className="font-heading text-lg font-bold">Ringkasan</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span>{formatPrice(totals.original)}</span></div>
                  {totals.discount > 0 && (
                    <div className="flex justify-between text-fun-green"><span>Diskon kupon</span><span>-{formatPrice(totals.discount)}</span></div>
                  )}
                  <div className="border-t pt-2 flex justify-between font-bold text-lg">
                    <span>Total</span><span className="text-primary">{formatPrice(totals.final)}</span>
                  </div>
                </div>
                <Button
                  className="w-full rounded-xl gradient-primary border-0 font-bold h-12 text-base"
                  onClick={() => navigate("/checkout")}
                >
                  Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <p className="text-[10px] text-muted-foreground text-center">Pembayaran aman via QRIS</p>
              </Card>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Cart;
