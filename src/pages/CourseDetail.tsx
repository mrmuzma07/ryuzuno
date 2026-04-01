import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils-format";
import { Star, Users, Clock, BookOpen, Play, CheckCircle, ArrowLeft, Loader2, Tag, Check } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/hooks/useCart";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null);
  const [checkingCoupon, setCheckingCoupon] = useState(false);
  const { addToCart } = useCart();

  const { data: course, isLoading } = useQuery({
    queryKey: ["course-detail", id],
    queryFn: async () => {
      const { data: course } = await supabase
        .from("courses")
        .select("*, categories(name)")
        .eq("id", id!)
        .single();
      if (!course) return null;
      const { data: teacherProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", course.teacher_id)
        .single();
      return { ...course, teacher_name: teacherProfile?.full_name || "Instructor" };
    },
    enabled: !!id,
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["course-sections", id],
    queryFn: async () => {
      const { data } = await supabase
        .from("sections")
        .select("*, lessons(*)")
        .eq("course_id", id!)
        .order("sort_order");
      return (data || []).map((s: any) => ({
        ...s,
        lessons: (s.lessons || []).sort((a: any, b: any) => a.sort_order - b.sort_order),
      }));
    },
    enabled: !!id,
  });

  const { data: enrollment, refetch: refetchEnrollment } = useQuery({
    queryKey: ["enrollment", id, user?.id],
    queryFn: async () => {
      if (!user || !id) return null;
      const { data } = await supabase.from("enrollments").select("*").eq("user_id", user.id).eq("course_id", id).maybeSingle();
      return data;
    },
    enabled: !!user && !!id,
  });

  const handleApplyCoupon = async () => {
    if (!couponCode.trim() || !id) return;
    setCheckingCoupon(true);
    try {
      const { data: coupon } = await supabase
        .from("coupons")
        .select("*")
        .eq("code", couponCode.trim().toUpperCase())
        .eq("course_id", id)
        .eq("is_active", true)
        .maybeSingle();

      if (!coupon) {
        toast.error("Kupon tidak ditemukan atau tidak berlaku untuk kursus ini");
        setAppliedCoupon(null);
        return;
      }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
        toast.error("Kupon sudah kedaluwarsa");
        setAppliedCoupon(null);
        return;
      }
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
        toast.error("Kupon sudah habis digunakan");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon(coupon);
      toast.success("Kupon berhasil diterapkan! 🎉");
    } catch {
      toast.error("Gagal memvalidasi kupon");
    } finally {
      setCheckingCoupon(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) { toast.error("Silakan login terlebih dahulu!"); navigate("/login"); return; }
    if (!id) return;
    setEnrolling(true);
    try {
      const { error } = await supabase.from("enrollments").insert({ user_id: user.id, course_id: id });
      if (error) {
        if (error.code === "23505") toast.info("Kamu sudah terdaftar di kursus ini!");
        else throw error;
      } else {
        toast.success("Berhasil enroll! Selamat belajar 🎉");
        refetchEnrollment();
      }
    } catch (err: any) {
      toast.error(err.message || "Gagal enroll kursus");
    } finally {
      setEnrolling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <p className="text-4xl mb-4">😅</p>
          <h1 className="font-heading font-bold text-2xl">Kursus tidak ditemukan</h1>
          <Link to="/catalog"><Button className="mt-4 rounded-xl">Kembali ke Catalog</Button></Link>
        </div>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const totalLessons = sections.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0);
  const totalMinutes = sections.reduce((sum: number, s: any) => sum + (s.lessons || []).reduce((ls: number, l: any) => ls + (l.duration_minutes || 0), 0), 0);
  const teacherName = course?.teacher_name || "Instructor";

  const originalPrice = Number(course.price);
  let discountedPrice = originalPrice;
  let discountPercent = 0;
  if (appliedCoupon) {
    if (appliedCoupon.discount_percent > 0) {
      discountPercent = appliedCoupon.discount_percent;
      discountedPrice = originalPrice * (1 - discountPercent / 100);
    } else if (Number(appliedCoupon.discount_amount) > 0) {
      discountedPrice = Math.max(0, originalPrice - Number(appliedCoupon.discount_amount));
      discountPercent = originalPrice > 0 ? Math.round(((originalPrice - discountedPrice) / originalPrice) * 100) : 0;
    }
  }

  const learningObjectives: string[] = Array.isArray(course.learning_objectives) ? course.learning_objectives as string[] : [];

  return (
    <div className="min-h-screen">
      <Navbar />

      <section className="bg-foreground text-background py-12">
        <div className="container mx-auto px-4">
          <Link to="/catalog" className="inline-flex items-center gap-1 text-sm text-background/60 hover:text-background mb-6">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Link>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <div className="flex gap-2">
                {course.is_featured && <Badge className="bg-fun-orange text-white border-0 rounded-xl">Featured</Badge>}
                <Badge variant="outline" className="text-background/80 border-background/30 rounded-xl capitalize">{course.level}</Badge>
              </div>
              <h1 className="font-heading text-3xl md:text-4xl font-bold">{course.title}</h1>
              <p className="text-background/70 text-lg">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-background/70">
                {course.rating != null && (
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 fill-fun-yellow text-fun-yellow" /><strong className="text-background">{course.rating}</strong></span>
                )}
                <span className="flex items-center gap-1"><Users className="w-4 h-4" />{(course.total_students || 0).toLocaleString()} students</span>
                <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{totalMinutes} menit</span>
                <span className="flex items-center gap-1"><BookOpen className="w-4 h-4" />{totalLessons} lessons</span>
              </div>
              <p className="text-sm text-background/60">Dibuat oleh <strong className="text-background">{teacherName}</strong></p>
            </div>

            {/* Sidebar Card */}
            <Card className="p-6 space-y-4 self-start bg-card text-card-foreground">
              {course.thumbnail_url ? (
                <img src={course.thumbnail_url} alt={course.title} className="w-full aspect-video object-cover rounded-xl" />
              ) : (
                <div className="aspect-video bg-gradient-to-br from-primary/20 to-fun-blue/20 rounded-xl flex items-center justify-center">
                  <Play className="w-12 h-12 text-primary" />
                </div>
              )}

              {/* Price with discount */}
              <div className="space-y-1">
                <div className="flex items-baseline gap-2">
                  <p className="font-heading text-3xl font-bold text-primary">
                    {formatPrice(discountedPrice)}
                  </p>
                  {appliedCoupon && (
                    <>
                      <p className="text-lg text-muted-foreground line-through">{formatPrice(originalPrice)}</p>
                      <Badge className="bg-fun-green text-white border-0 text-xs">diskon {discountPercent}%</Badge>
                    </>
                  )}
                </div>
              </div>

              {isEnrolled ? (
                <Button className="w-full rounded-xl gradient-primary border-0 font-bold text-base h-12" onClick={() => navigate(`/dashboard/course-player/${id}`)}>
                  Lanjutkan Belajar 📖
                </Button>
              ) : (
                <Button className="w-full rounded-xl gradient-primary border-0 font-bold text-base h-12" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Mendaftar...</> : "Enroll Sekarang"}
                </Button>
              )}

              <div className="text-xs text-muted-foreground space-y-1">
                <p>✅ Akses selamanya</p>
                <p>✅ Sertifikat kelulusan</p>
                <p>✅ Badge reward</p>
              </div>

              {/* Coupon Section */}
              {!isEnrolled && (
                <div className="border-t pt-4 space-y-3">
                  <p className="text-sm font-medium flex items-center gap-1.5">
                    <Tag className="w-4 h-4" /> Gunakan Kupon
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      placeholder="Masukkan Kupon"
                      className="flex-1 uppercase text-sm"
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button size="sm" variant="outline" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="text-xs shrink-0">
                        Hapus
                      </Button>
                    ) : (
                      <Button size="sm" onClick={handleApplyCoupon} disabled={checkingCoupon || !couponCode.trim()} className="text-xs shrink-0">
                        {checkingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Terapkan"}
                      </Button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-xs text-fun-green flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Kupon "{appliedCoupon.code}" diterapkan!
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* Learning Objectives */}
      {learningObjectives.length > 0 && (
        <section className="py-12">
          <div className="container mx-auto px-4">
            <Card className="max-w-3xl p-6 md:p-8">
              <h2 className="font-heading text-xl md:text-2xl font-bold mb-6">Yang akan Anda pelajari 🎯</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3">
                {learningObjectives.map((obj, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{obj}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {/* Curriculum */}
      <section className={learningObjectives.length > 0 ? "pb-12" : "py-12"}>
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h2 className="font-heading text-2xl font-bold mb-6">Curriculum 📚</h2>
            <div className="space-y-4">
              {sections.map((section: any, si: number) => (
                <Card key={section.id} className="overflow-hidden">
                  <div className="bg-muted px-5 py-3 font-heading font-bold text-sm flex items-center justify-between">
                    <span>Section {si + 1}: {section.title}</span>
                    <span className="text-xs text-muted-foreground font-normal">{section.lessons?.length || 0} lessons</span>
                  </div>
                  {(section.lessons || []).map((lesson: any) => (
                    <div key={lesson.id} className="px-5 py-3 flex items-center gap-3 border-t text-sm">
                      <Play className="w-4 h-4 text-muted-foreground shrink-0" />
                      <span className="flex-1">{lesson.title}</span>
                      <span className="text-xs text-muted-foreground">{lesson.duration_minutes} min</span>
                    </div>
                  ))}
                </Card>
              ))}
              {sections.length === 0 && (
                <p className="text-muted-foreground text-center py-8">Belum ada curriculum</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CourseDetail;
