import { Link } from "react-router-dom";
import { BookOpen } from "lucide-react";

const Footer = () => (
  <footer className="bg-foreground text-background/80 py-12 mt-20">
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link to="/" className="flex items-center gap-2 font-heading font-bold text-xl text-background mb-4">
            <BookOpen className="w-5 h-5" />
            EduQuest
          </Link>
          <p className="text-sm opacity-70">Platform e-learning gamified terbaik untuk meningkatkan skill kamu! 🚀</p>
        </div>
        <div>
          <h4 className="font-heading font-bold text-background mb-3">Explore</h4>
          <div className="space-y-2 text-sm">
            <Link to="/catalog" className="block hover:text-background transition-colors">Semua Kursus</Link>
            <Link to="/learning-paths" className="block hover:text-background transition-colors">Learning Paths</Link>
            <Link to="/leaderboard" className="block hover:text-background transition-colors">Leaderboard</Link>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-bold text-background mb-3">Perusahaan</h4>
          <div className="space-y-2 text-sm">
            <a href="#" className="block hover:text-background transition-colors">Tentang Kami</a>
            <a href="#" className="block hover:text-background transition-colors">Karir</a>
            <a href="#" className="block hover:text-background transition-colors">Blog</a>
          </div>
        </div>
        <div>
          <h4 className="font-heading font-bold text-background mb-3">Support</h4>
          <div className="space-y-2 text-sm">
            <a href="#" className="block hover:text-background transition-colors">FAQ</a>
            <a href="#" className="block hover:text-background transition-colors">Kontak</a>
            <a href="#" className="block hover:text-background transition-colors">Privacy Policy</a>
          </div>
        </div>
      </div>
      <div className="border-t border-background/10 mt-8 pt-8 text-center text-sm opacity-60">
        © 2026 EduQuest. All rights reserved. Made with ❤️
      </div>
    </div>
  </footer>
);

export default Footer;
