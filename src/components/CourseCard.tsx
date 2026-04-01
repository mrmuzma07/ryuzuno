import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Clock, BookOpen } from "lucide-react";
import { formatPrice } from "@/lib/utils-format";

interface CourseCardProps {
  id: string;
  title: string;
  instructor?: string;
  price: number;
  rating?: number | null;
  reviewCount?: number;
  studentCount?: number;
  total_students?: number;
  level: string;
  category?: string;
  category_name?: string;
  duration?: string;
  lessonCount?: number;
  badges?: string[];
  thumbnail_url?: string | null;
}

const levelColors: Record<string, string> = {
  beginner: "bg-fun-green/10 text-fun-green",
  intermediate: "bg-fun-blue/10 text-fun-blue",
  advanced: "bg-fun-pink/10 text-fun-pink",
  Beginner: "bg-fun-green/10 text-fun-green",
  Intermediate: "bg-fun-blue/10 text-fun-blue",
  Advanced: "bg-fun-pink/10 text-fun-pink",
};

const badgeColors: Record<string, string> = {
  "Best Seller": "bg-fun-orange text-white",
  "Top Rated": "bg-fun-yellow text-foreground",
  "Hot": "bg-destructive text-destructive-foreground",
  "New": "bg-fun-green text-white",
};

const CourseCard = ({ id, title, instructor, price, rating, reviewCount, studentCount, total_students, level, category, category_name, duration, lessonCount, badges = [] }: CourseCardProps) => {
  const students = studentCount || total_students || 0;
  const cat = category || category_name || "";
  
  return (
    <Link to={`/course/${id}`}>
      <Card className="group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-2 border-transparent hover:border-primary/20">
        <div className="aspect-video bg-gradient-to-br from-primary/20 via-fun-blue/20 to-fun-pink/20 relative overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-primary/40 group-hover:scale-110 transition-transform" />
          </div>
          {badges.length > 0 && (
            <div className="absolute top-3 left-3 flex gap-1.5">
              {badges.map((b) => (
                <span key={b} className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${badgeColors[b] || "bg-muted text-foreground"}`}>{b}</span>
              ))}
            </div>
          )}
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`text-[10px] font-bold ${levelColors[level] || ""}`}>{level}</Badge>
            <span className="text-[11px] text-muted-foreground">{cat}</span>
          </div>
          <h3 className="font-heading font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
          {instructor && <p className="text-xs text-muted-foreground">{instructor}</p>}
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {rating != null && (
              <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-fun-yellow text-fun-yellow" /><strong className="text-foreground">{rating}</strong>{reviewCount != null && ` (${reviewCount})`}</span>
            )}
            <span className="flex items-center gap-1"><Users className="w-3 h-3" />{students.toLocaleString()}</span>
          </div>
          {(duration || lessonCount) && (
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              {duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{duration}</span>}
              {lessonCount != null && <span>{lessonCount} lessons</span>}
            </div>
          )}
          <div className="pt-1 border-t">
            <span className="font-heading font-bold text-lg text-primary">{formatPrice(price)}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
};

export default CourseCard;
