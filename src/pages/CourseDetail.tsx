import { useParams, Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/utils-format";
import { Users, Clock, BookOpen, Play, CheckCircle, Loader2, Tag, Check } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("overview");
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

      if (!coupon) { toast.error("Kupon tidak ditemukan atau tidak berlaku"); setAppliedCoupon(null); return; }
      if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) { toast.error("Kupon sudah kedaluwarsa"); setAppliedCoupon(null); return; }
      if (coupon.max_uses && coupon.used_count >= coupon.max_uses) { toast.error("Kupon sudah habis digunakan"); setAppliedCoupon(null); return; }
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
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#003d9b]" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="font-headline font-bold text-2xl text-on-surface mb-4">Kursus tidak ditemukan</h1>
          <Link to="/catalog">
            <Button className="mt-4 rounded-lg signature-gradient text-white border-0">Kembali ke Catalog</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isEnrolled = !!enrollment;
  const totalLessons = sections.reduce((sum: number, s: any) => sum + (s.lessons?.length || 0), 0);
  const totalMinutes = sections.reduce(
    (sum: number, s: any) => sum + (s.lessons || []).reduce((ls: number, l: any) => ls + (l.duration_minutes || 0), 0),
    0
  );
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

  const tabs = [
    { id: "overview", label: "Overview", icon: "info" },
    { id: "curriculum", label: "Curriculum", icon: "menu_book" },
    { id: "instructor", label: "Instructor", icon: "person" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero-gradient text-white pt-16 pb-24 md:pb-32 px-8 overflow-hidden relative">
        {/* Ambient glows */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-[-50px] left-[-20px] w-96 h-96 bg-tertiary rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 mb-6 text-sm text-blue-200">
              <Link to="/catalog" className="hover:text-white transition-colors">Courses</Link>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
              <span className="text-white">{course.categories?.name || "Course"}</span>
            </nav>

            <div className="flex gap-2 mb-4">
              {course.is_featured && (
                <span className="bg-tertiary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Featured</span>
              )}
              <span className="bg-white/10 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider capitalize">{course.level}</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold font-headline mb-6 leading-tight">{course.title}</h1>
            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl leading-relaxed">{course.description}</p>

            {/* Stats row */}
            <div className="flex flex-wrap items-center gap-6 mb-8 text-sm text-blue-100">
              {course.rating != null && (
                <div className="flex items-center gap-2">
                  <span className="text-tertiary-fixed font-bold text-xl">{course.rating}</span>
                  <span className="material-symbols-outlined text-tertiary-fixed" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{(course.total_students || 0).toLocaleString()} students</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>{totalMinutes} min</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4" />
                <span>{totalLessons} lessons</span>
              </div>
            </div>

            <p className="text-sm text-blue-200 mb-8">
              Dibuat oleh <strong className="text-white">{teacherName}</strong>
            </p>

            <div className="flex flex-wrap gap-4">
              {isEnrolled ? (
                <button
                  onClick={() => navigate(`/dashboard/course-player/${id}`)}
                  className="px-8 py-4 bg-tertiary text-white font-bold rounded-lg hover:bg-tertiary-container transition-all flex items-center gap-2 shadow-lg"
                >
                  Lanjutkan Belajar <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={() => {
                      if (!user) { toast.error("Silakan login terlebih dahulu!"); navigate("/login"); return; }
                      addToCart.mutate({ courseId: id!, couponId: appliedCoupon?.id });
                    }}
                    disabled={addToCart.isPending}
                    className="px-8 py-4 bg-tertiary text-white font-bold rounded-lg hover:bg-tertiary-container transition-all flex items-center gap-2 shadow-lg shadow-tertiary/20"
                  >
                    {addToCart.isPending ? <><Loader2 className="w-4 h-4 animate-spin" /> Menambahkan...</> : <>Enroll Now <span className="material-symbols-outlined">arrow_forward</span></>}
                  </button>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling}
                    className="px-8 py-4 bg-white/10 backdrop-blur-md text-white font-bold rounded-lg border border-white/20 hover:bg-white/20 transition-all"
                  >
                    {enrolling ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Mendaftar...</> : "Enroll Gratis"}
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Hero image */}
          <div className="lg:col-span-5 hidden lg:block">
            <div className="rounded-2xl overflow-hidden shadow-2xl relative group">
              {course.thumbnail_url ? (
                <img
                  alt={course.title}
                  className="w-full aspect-video object-cover transition-transform duration-700 group-hover:scale-105"
                  src={course.thumbnail_url}
                />
              ) : (
                <div className="w-full aspect-video bg-white/10 flex items-center justify-center">
                  <Play className="w-16 h-16 text-white/40" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-[#003d9b] cursor-pointer hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>play_arrow</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content Layout ── */}
      <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 -mt-12 md:-mt-16 mb-20">

        {/* Left column */}
        <div className="lg:col-span-8 space-y-10">

          {/* Sticky tabs */}
          <div className="sticky top-20 z-40 bg-white/90 backdrop-blur-md rounded-xl shadow-sm px-2 py-2 flex items-center gap-2 border border-outline-variant/10">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 p-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-surface-container-low text-[#003d9b] shadow-sm"
                    : "text-on-surface-variant hover:bg-surface-container-low"
                }`}
              >
                <span className="material-symbols-outlined text-xl">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview */}
          <section className="bg-surface-container-lowest p-10 rounded-2xl border border-outline-variant/15" id="overview">
            <h2 className="text-3xl font-bold font-headline mb-6 text-[#003d9b]">Course Overview</h2>
            <p className="text-on-surface-variant leading-relaxed mb-8">{course.description}</p>

            {learningObjectives.length > 0 && (
              <>
                <h3 className="text-xl font-bold font-headline mb-6 text-[#003d9b]">Key Learning Outcomes</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {learningObjectives.map((obj, i) => (
                    <div key={i} className="bg-surface-container-low p-5 rounded-xl flex gap-4 transition-transform hover:-translate-y-0.5">
                      <div className="w-10 h-10 bg-[#003d9b]/10 rounded-lg flex items-center justify-center text-[#003d9b] shrink-0">
                        <Check className="w-5 h-5" />
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed">{obj}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          {/* Curriculum */}
          <section className="space-y-4" id="curriculum">
            <div className="flex justify-between items-end mb-4">
              <h2 className="text-3xl font-bold font-headline text-[#003d9b]">Curriculum</h2>
              <span className="text-on-surface-variant text-sm">{sections.length} Sections • {totalLessons} Lessons • {totalMinutes} min</span>
            </div>
            <div className="space-y-3">
              {sections.map((section: any, si: number) => (
                <div key={section.id} className="bg-white rounded-xl border border-outline-variant/15 overflow-hidden">
                  <div className="flex items-center justify-between p-5 hover:bg-surface-container-low transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-xs font-bold text-tertiary uppercase tracking-wider bg-tertiary/5 px-2 py-1 rounded">
                        Section {si + 1}
                      </span>
                      <span className="text-base font-bold text-[#003d9b] font-headline">{section.title}</span>
                    </div>
                    <span className="text-sm text-on-surface-variant">{section.lessons?.length || 0} lessons</span>
                  </div>
                  <div className="divide-y divide-outline-variant/10 px-5 pb-4">
                    {(section.lessons || []).map((lesson: any) => (
                      <div key={lesson.id} className="py-3 flex items-center gap-3 text-sm group">
                        <span className="material-symbols-outlined text-on-surface-variant/50">play_circle</span>
                        <span className="flex-1 text-on-surface-variant">{lesson.title}</span>
                        <span className="text-xs text-on-surface-variant">{lesson.duration_minutes} min</span>
                      </div>
                    ))}
                    {(!section.lessons || section.lessons.length === 0) && (
                      <p className="py-4 text-sm text-on-surface-variant text-center">No lessons yet</p>
                    )}
                  </div>
                </div>
              ))}
              {sections.length === 0 && (
                <p className="text-on-surface-variant text-center py-8">Belum ada curriculum</p>
              )}
            </div>
          </section>

          {/* Instructor */}
          <section className="bg-surface-container-low p-10 rounded-2xl" id="instructor">
            <h2 className="text-3xl font-bold font-headline mb-6 text-[#003d9b]">Your Instructor</h2>
            <div className="flex gap-6 items-start">
              <div className="w-20 h-20 rounded-2xl signature-gradient flex items-center justify-center text-white text-2xl font-bold font-headline shrink-0">
                {teacherName.charAt(0)}
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#003d9b] mb-1 font-headline">{teacherName}</h3>
                <p className="text-tertiary font-semibold text-sm mb-3">Course Instructor</p>
                <div className="flex gap-4 text-sm text-on-surface-variant">
                  <span className="flex items-center gap-1"><Users className="w-4 h-4 text-[#003d9b]" />{(course.total_students || 0).toLocaleString()} Students</span>
                  <span className="flex items-center gap-1"><BookOpen className="w-4 h-4 text-[#003d9b]" />{totalLessons} Lessons</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-4 relative">
          <div className="sticky top-28 space-y-6">
            {/* Purchase card */}
            <div className="bg-surface-container-lowest rounded-2xl shadow-xl shadow-[#003d9b]/5 border border-outline-variant/20 overflow-hidden">
              <div className="p-8">
                {/* Price */}
                <div className="flex items-baseline gap-2 mb-6">
                  <span className="text-4xl font-extrabold text-[#003d9b] font-headline">{formatPrice(discountedPrice)}</span>
                  {appliedCoupon && (
                    <>
                      <span className="text-on-surface-variant line-through">{formatPrice(originalPrice)}</span>
                      <span className="text-tertiary font-bold text-sm">{discountPercent}% OFF</span>
                    </>
                  )}
                </div>

                {/* CTA */}
                {isEnrolled ? (
                  <button
                    onClick={() => navigate(`/dashboard/course-player/${id}`)}
                    className="block w-full py-4 signature-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all mb-4 shadow-lg shadow-[#003d9b]/20 text-center"
                  >
                    Lanjutkan Belajar
                  </button>
                ) : (
                  <div className="space-y-3 mb-6">
                    <button
                      onClick={() => {
                        if (!user) { toast.error("Silakan login terlebih dahulu!"); navigate("/login"); return; }
                        addToCart.mutate({ courseId: id!, couponId: appliedCoupon?.id });
                      }}
                      disabled={addToCart.isPending}
                      className="block w-full py-4 signature-gradient text-white font-bold rounded-lg hover:opacity-90 transition-all shadow-lg shadow-[#003d9b]/20 text-center"
                    >
                      {addToCart.isPending ? "Menambahkan..." : "Tambah ke Keranjang"}
                    </button>
                    <button
                      onClick={handleEnroll}
                      disabled={enrolling}
                      className="w-full py-4 bg-surface-container-high text-on-primary-fixed-variant font-bold rounded-lg hover:bg-surface-container-highest transition-all text-center"
                    >
                      {enrolling ? "Mendaftar..." : "Enroll Gratis"}
                    </button>
                  </div>
                )}

                {/* What's included */}
                <div className="space-y-3">
                  <h4 className="font-bold text-on-surface font-headline">What's Included</h4>
                  <ul className="space-y-2">
                    {[
                      { icon: "all_inclusive", text: "Lifetime access to course materials" },
                      { icon: "workspace_premium", text: "Verified Certificate of Completion" },
                      { icon: "terminal", text: `${totalLessons} lessons` },
                      { icon: "groups", text: "Access to exclusive Discord community" },
                      { icon: "phone_iphone", text: "Available on iOS and Android" },
                    ].map(({ icon, text }) => (
                      <li key={icon} className="flex items-center gap-3 text-sm text-on-surface-variant">
                        <span className="material-symbols-outlined text-[#003d9b]">{icon}</span>
                        {text}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Coupon */}
                {!isEnrolled && (
                  <div className="border-t border-outline-variant/10 mt-6 pt-6 space-y-3">
                    <p className="text-sm font-medium text-on-surface flex items-center gap-2">
                      <Tag className="w-4 h-4" /> Gunakan Kupon
                    </p>
                    <div className="flex gap-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Masukkan Kupon"
                        className="flex-1 uppercase text-sm bg-surface-container-lowest border-outline-variant/30 focus:border-[#003d9b] rounded-lg"
                        disabled={!!appliedCoupon}
                      />
                      {appliedCoupon ? (
                        <Button size="sm" variant="outline" onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} className="text-xs shrink-0 rounded-lg">
                          Hapus
                        </Button>
                      ) : (
                        <Button size="sm" onClick={handleApplyCoupon} disabled={checkingCoupon || !couponCode.trim()} className="text-xs shrink-0 rounded-lg signature-gradient border-0 text-white">
                          {checkingCoupon ? <Loader2 className="w-3 h-3 animate-spin" /> : "Terapkan"}
                        </Button>
                      )}
                    </div>
                    {appliedCoupon && (
                      <p className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Kupon "{appliedCoupon.code}" diterapkan!
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      <Footer />
    </div>
  );
};

export default CourseDetail;
