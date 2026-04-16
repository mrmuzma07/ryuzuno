import { Link } from "react-router-dom";

const Footer = () => (
  <footer className="bg-white border-t border-outline-variant/10 py-12 mt-0">
    <div className="flex flex-col md:flex-row justify-between items-center px-8 max-w-7xl mx-auto gap-8">
      {/* Brand */}
      <div className="flex flex-col items-center md:items-start gap-2">
        <span className="text-lg font-black text-[#003d9b] uppercase tracking-widest font-headline">RyuZuno</span>
        <p className="text-on-surface-variant text-[10px] uppercase tracking-widest text-center md:text-left">Editorial Learning Experience</p>
      </div>

      {/* Links */}
      <nav className="flex flex-wrap justify-center gap-8">
        <Link to="/catalog" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-tertiary transition-colors">Kursus</Link>
        <Link to="/learning-paths" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-tertiary transition-colors">Learning Paths</Link>
        <Link to="/leaderboard" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-tertiary transition-colors">Leaderboard</Link>
        <a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-tertiary transition-colors">Privacy</a>
        <a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-tertiary transition-colors">Terms</a>
        <a href="#" className="text-xs uppercase tracking-widest text-on-surface-variant hover:text-tertiary transition-colors">Support</a>
      </nav>

      {/* Copyright */}
      <div className="text-on-surface-variant text-xs uppercase tracking-widest">
        © 2026 RyuZuno.
      </div>
    </div>
  </footer>
);

export default Footer;
