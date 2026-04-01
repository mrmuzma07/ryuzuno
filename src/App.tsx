import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import CourseDetail from "./pages/CourseDetail";
import LearningPaths from "./pages/LearningPaths";
import LearningPathDetail from "./pages/LearningPathDetail";
import Leaderboard from "./pages/Leaderboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import StudentDashboard from "./pages/dashboard/StudentDashboard";
import StudentBadges from "./pages/dashboard/StudentBadges";
import StudentCourses from "./pages/dashboard/StudentCourses";
import StudentLearningPaths from "./pages/dashboard/StudentLearningPaths";
import CoursePlayer from "./pages/dashboard/CoursePlayer";
import TeacherDashboard from "./pages/dashboard/TeacherDashboard";
import TeacherCourses from "./pages/dashboard/TeacherCourses";
import TeacherCourseForm from "./pages/dashboard/TeacherCourseForm";
import TeacherStudents from "./pages/dashboard/TeacherStudents";
import TeacherReviews from "./pages/dashboard/TeacherReviews";
import AdminDashboard from "./pages/dashboard/AdminDashboard";
import AdminUsers from "./pages/dashboard/AdminUsers";
import AdminCourses from "./pages/dashboard/AdminCourses";
import AdminCategories from "./pages/dashboard/AdminCategories";
import AdminBadges from "./pages/dashboard/AdminBadges";
import AdminLearningPaths from "./pages/dashboard/AdminLearningPaths";
import ModeratorDashboard from "./pages/dashboard/ModeratorDashboard";
import ModeratorQueue from "./pages/dashboard/ModeratorQueue";
import ModeratorLog from "./pages/dashboard/ModeratorLog";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/learning-paths" element={<LearningPaths />} />
            <Route path="/learning-path/:id" element={<LearningPathDetail />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/dashboard/courses" element={<StudentCourses />} />
            <Route path="/dashboard/paths" element={<StudentLearningPaths />} />
            <Route path="/dashboard/course-player/:courseId" element={<CoursePlayer />} />
            <Route path="/dashboard/badges" element={<StudentBadges />} />
            <Route path="/teacher" element={<TeacherDashboard />} />
            <Route path="/teacher/courses" element={<TeacherCourses />} />
            <Route path="/teacher/create" element={<TeacherCourseForm />} />
            <Route path="/teacher/edit/:courseId" element={<TeacherCourseForm />} />
            <Route path="/teacher/students" element={<TeacherStudents />} />
            <Route path="/teacher/reviews" element={<TeacherReviews />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/courses" element={<AdminCourses />} />
            <Route path="/admin/categories" element={<AdminCategories />} />
            <Route path="/admin/badges" element={<AdminBadges />} />
            <Route path="/admin/paths" element={<AdminLearningPaths />} />
            <Route path="/moderator" element={<ModeratorDashboard />} />
            <Route path="/moderator/queue" element={<ModeratorQueue />} />
            <Route path="/moderator/log" element={<ModeratorLog />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
