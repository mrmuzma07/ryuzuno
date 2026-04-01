import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ClipboardList, Upload, Send, CheckCircle, Loader2, FileText } from "lucide-react";
import { toast } from "sonner";

interface Assignment {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
}

interface Submission {
  id: string;
  text_content: string | null;
  file_url: string | null;
  file_name: string | null;
  submitted_at: string;
  grade: number | null;
  feedback: string | null;
}

interface Props {
  lessonId: string;
}

const LessonAssignment = ({ lessonId }: Props) => {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [textContent, setTextContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchAssignment();
  }, [lessonId]);

  const fetchAssignment = async () => {
    const { data: aData } = await supabase
      .from("assignments")
      .select("*")
      .eq("lesson_id", lessonId)
      .limit(1)
      .maybeSingle();

    if (!aData) return;
    setAssignment(aData);

    if (user) {
      const { data: sub } = await supabase
        .from("assignment_submissions")
        .select("*")
        .eq("assignment_id", aData.id)
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) setSubmission(sub);
    }
  };

  const handleSubmit = async () => {
    if (!assignment || !user) return;
    if (!textContent.trim() && !file) {
      toast.error("Isi jawaban teks atau upload file");
      return;
    }

    setSubmitting(true);
    try {
      let fileUrl = null;
      let fileName = null;

      if (file) {
        const ext = file.name.split(".").pop();
        const filePath = `assignments/${user.id}/${Date.now()}.${ext}`;
        const { error } = await supabase.storage.from("lesson-files").upload(filePath, file);
        if (error) throw error;
        const { data: urlData } = supabase.storage.from("lesson-files").getPublicUrl(filePath);
        fileUrl = urlData.publicUrl;
        fileName = file.name;
      }

      await supabase.from("assignment_submissions").insert({
        assignment_id: assignment.id,
        user_id: user.id,
        text_content: textContent.trim() || null,
        file_url: fileUrl,
        file_name: fileName,
      });

      toast.success("Tugas berhasil dikumpulkan!");
      fetchAssignment();
    } catch (err: any) {
      toast.error(err.message || "Gagal mengumpulkan tugas");
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-bold text-sm flex items-center gap-2">
        <ClipboardList className="w-4 h-4" /> {assignment.title}
      </h3>
      {assignment.description && (
        <p className="text-sm text-muted-foreground">{assignment.description}</p>
      )}
      {assignment.due_date && (
        <p className="text-xs text-muted-foreground">Tenggat: {new Date(assignment.due_date).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
      )}

      {submission ? (
        <Card className="p-4 rounded-xl space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-600">
            <CheckCircle className="w-4 h-4" /> Tugas sudah dikumpulkan
          </div>
          <p className="text-xs text-muted-foreground">Dikumpulkan: {new Date(submission.submitted_at).toLocaleString("id-ID")}</p>
          {submission.text_content && (
            <div className="text-sm bg-muted/30 p-3 rounded-lg">{submission.text_content}</div>
          )}
          {submission.file_name && (
            <a href={submission.file_url!} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-xs text-primary hover:underline">
              <FileText className="w-3 h-3" /> {submission.file_name}
            </a>
          )}
          {submission.grade !== null && (
            <div className="p-3 bg-primary/10 rounded-lg">
              <p className="text-sm font-bold">Nilai: {submission.grade}/100</p>
              {submission.feedback && <p className="text-xs text-muted-foreground mt-1">{submission.feedback}</p>}
            </div>
          )}
        </Card>
      ) : (
        <Card className="p-4 rounded-xl space-y-3">
          <Textarea
            value={textContent}
            onChange={(e) => setTextContent(e.target.value)}
            placeholder="Tulis jawaban tugas di sini..."
            rows={4}
          />
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              <input type="file" className="hidden" onChange={(e) => setFile(e.target.files?.[0] || null)} />
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted hover:bg-muted/80 text-xs font-medium transition-colors">
                <Upload className="w-3 h-3" /> {file ? file.name : "Upload File"}
              </div>
            </label>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2 rounded-xl ml-auto">
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Kumpulkan
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default LessonAssignment;
