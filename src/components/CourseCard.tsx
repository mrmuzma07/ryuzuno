import { Link } from "react-router-dom";
import { Users, Clock, BookOpen } from "lucide-react";
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
  beginner: "text-[#003d9b]",
  intermediate: "text-[#4c5d8d]",
  advanced: "text-[#693600]",
  Beginner: "text-[#003d9b]",
  Intermediate: "text-[#4c5d8d]",
  Advanced: "text-[#693600]",
};

const CourseCard = ({
  id, title, instructor, price, rating, reviewCount,
  studentCount, total_students, level, category, category_name,
  duration, lessonCount, badges = [], thumbnail_url,
}: CourseCardProps) => {
  const students = studentCount || total_students || 0;
  const cat = category || category_name || "";

  return (
    <Link
      to={`/course/${id}`}
      className="bg-surface-container-lowest rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group border border-outline-variant/5 block"
    >
      {/* Thumbnail */}
      <div className="h-48 overflow-hidden relative">
        {thumbnail_url ? (
          <img
            src={thumbnail_url}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-surface-container-high flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-on-surface-variant/30 group-hover:scale-110 transition-transform" />
          </div>
        )}
        {/* Category + badges overlay */}
        <div className="absolute top-4 left-4 flex gap-2">
          {cat && (
            <span className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-[#003d9b]">
              {cat.toUpperCase()}
            </span>
          )}
          {badges.map((b) => (
            <span key={b} className="bg-tertiary text-white px-2 py-0.5 rounded-full text-[10px] font-bold">
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Meta row */}
        <div className="flex justify-between items-center mb-3">
          <span className={`text-xs font-bold uppercase tracking-widest ${levelColors[level] || "text-on-surface-variant"}`}>
            {lessonCount != null ? `${lessonCount} Lessons` : level}
          </span>
          {rating != null && (
            <div className="flex items-center gap-1">
              <span
                className="material-symbols-outlined text-tertiary text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              <span className="text-xs font-bold text-on-surface">{rating}</span>
              {reviewCount != null && (
                <span className="text-xs text-on-surface-variant">({reviewCount})</span>
              )}
            </div>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold mb-2 group-hover:text-[#003d9b] transition-colors leading-snug line-clamp-2 font-headline text-on-surface">
          {title}
        </h3>

        {instructor && <p className="text-sm text-on-surface-variant mb-4">{instructor}</p>}

        {/* Stats */}
        {(duration || students > 0) && (
          <div className="flex items-center gap-4 text-xs text-on-surface-variant mb-4">
            {duration && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {duration}
              </span>
            )}
            {students > 0 && (
              <span className="flex items-center gap-1">
                <Users className="w-3 h-3" />
                {students.toLocaleString()}
              </span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
          <span className="font-headline font-bold text-lg text-[#003d9b]">{formatPrice(price)}</span>
          <span className="text-[#003d9b] font-bold text-sm">Enroll Now</span>
        </div>
      </div>
    </Link>
  );
};

export default CourseCard;
