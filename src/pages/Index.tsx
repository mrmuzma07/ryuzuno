import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCard from "@/components/CourseCard";
import { courses, learningPaths, leaderboard, categories } from "@/lib/mock-data";
import { ArrowRight, Trophy, Sparkles, BookOpen, Users, Award, TrendingUp, Star } from "lucide-react";

const Index = () => {
  const featuredCourses = courses.filter((c) => c.featured);

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 lg:py-28">
        <div className="absolute inset-0 gradient-fun opacity-5" />
        <div className="absolute top-20 right-10 w-72 h-72 bg-fun-purple/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 left-10 w-60 h-60 bg-fun-pink/10 rounded-full blur-3xl" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles className="w-4 h-4" /> Platform Belajar Paling Seru!
            </div>
            <h1 className="font-heading text-4xl md:text-6xl font-bold leading-tight">
              Belajar Jadi <span className="text-gradient-primary">Lebih Seru</span> dengan{" "}
              <span className="text-fun-orange">Gamifikasi</span> 🎮
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Kumpulkan badges, naik level, dan bersaing di leaderboard sambil belajar skill baru dari instruktur terbaik!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/catalog">
                <Button size="lg" className="rounded-2xl gradient-primary border-0 text-base font-bold px-8 shadow-lg shadow-primary/25">
                  Mulai Belajar <ArrowRight className="w-5 h-5" />
                </Button>
              </Link>
              <Link to="/learning-paths">
                <Button size="lg" variant="outline" className="rounded-2xl text-base font-bold px-8">
                  Lihat Learning Paths
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-center gap-8 pt-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Users className="w-4 h-4 text-fun-blue" /><strong>50K+</strong> Students</span>
              <span className="flex items-center gap-1.5"><BookOpen className="w-4 h-4 text-fun-green" /><strong>200+</strong> Courses</span>
              <span className="flex items-center gap-1.5"><Award className="w-4 h-4 text-fun-orange" /><strong>50+</strong> Badges</span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-2xl md:text-3xl font-bold text-center mb-10">
            Explore Kategori 🎯
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/catalog?category=${cat.name}`}>
                <Card className="p-5 text-center hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-primary/20 cursor-pointer">
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <h3 className="font-heading font-bold text-sm">{cat.name}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{cat.count} kursus</p>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Kursus Populer 🔥</h2>
            <Link to="/catalog">
              <Button variant="ghost" className="font-semibold">
                Lihat Semua <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>
      </section>

      {/* Learning Paths */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="font-heading text-2xl md:text-3xl font-bold">Learning Paths 🗺️</h2>
            <p className="text-muted-foreground mt-2">Ikuti jalur belajar terstruktur untuk mencapai tujuanmu</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {learningPaths.map((path) => (
              <Link key={path.id} to={`/learning-path/${path.id}`}>
                <Card className="overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                  <div className={`h-3 bg-gradient-to-r ${path.color}`} />
                  <div className="p-6 space-y-4">
                    <div className="text-4xl">{path.badge.split(" ")[0]}</div>
                    <h3 className="font-heading font-bold text-lg group-hover:text-primary transition-colors">{path.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{path.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{path.courseCount} kursus</span>
                      <span>{path.duration}</span>
                      <span>{path.studentCount.toLocaleString()} students</span>
                    </div>
                    <div className="bg-muted rounded-xl px-3 py-2 text-xs font-semibold text-center">
                      🏅 Badge: {path.badge.split(" ").slice(1).join(" ")}
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Leaderboard Preview */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="font-heading text-2xl md:text-3xl font-bold">Leaderboard 🏆</h2>
              <p className="text-muted-foreground mt-2">Top learners minggu ini</p>
            </div>
            <Card className="overflow-hidden">
              {leaderboard.map((user, i) => (
                <div key={user.rank} className={`flex items-center gap-4 p-4 ${i < leaderboard.length - 1 ? "border-b" : ""} ${i === 0 ? "bg-fun-yellow/10" : i === 1 ? "bg-muted/50" : i === 2 ? "bg-fun-orange/5" : ""}`}>
                  <span className={`font-heading font-bold text-lg w-8 text-center ${i === 0 ? "text-fun-yellow" : i === 1 ? "text-muted-foreground" : i === 2 ? "text-fun-orange" : "text-muted-foreground"}`}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${user.rank}`}
                  </span>
                  <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
                    {user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">Level {user.level} · {user.badges} badges</p>
                  </div>
                  <div className="text-right">
                    <p className="font-heading font-bold text-primary">{user.points.toLocaleString()}</p>
                    <p className="text-[10px] text-muted-foreground">points</p>
                  </div>
                </div>
              ))}
            </Card>
            <div className="text-center mt-6">
              <Link to="/leaderboard">
                <Button variant="outline" className="rounded-xl font-semibold">
                  Lihat Leaderboard Lengkap <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Card className="gradient-primary p-10 md:p-16 text-center text-primary-foreground rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2" />
            <div className="relative space-y-6">
              <h2 className="font-heading text-3xl md:text-4xl font-bold">Siap Mulai Petualangan Belajar? 🚀</h2>
              <p className="text-lg opacity-90 max-w-xl mx-auto">Gabung dengan 50,000+ learner dan mulai kumpulkan badges hari ini!</p>
              <Link to="/register">
                <Button size="lg" className="bg-background text-foreground hover:bg-background/90 rounded-2xl font-bold text-base px-8">
                  Daftar Sekarang — Gratis! <Sparkles className="w-5 h-5" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
