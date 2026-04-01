import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Trash2, ChevronDown, FileText, HelpCircle, Code2, ClipboardList, Upload, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface AttachmentForm {
  id?: string;
  file_name: string;
  file_url: string;
  file_size: number;
}

export interface QuizQuestionForm {
  question: string;
  options: { text: string; is_correct: boolean }[];
}

export interface QuizForm {
  title: string;
  passing_score: number;
  questions: QuizQuestionForm[];
}

export interface CodingExerciseForm {
  title: string;
  description: string;
  starter_code: string;
  language: string;
}

export interface AssignmentForm {
  title: string;
  description: string;
}

interface Props {
  attachments: AttachmentForm[];
  quiz: QuizForm | null;
  codingExercise: CodingExerciseForm | null;
  assignment: AssignmentForm | null;
  onAttachmentsChange: (val: AttachmentForm[]) => void;
  onQuizChange: (val: QuizForm | null) => void;
  onCodingExerciseChange: (val: CodingExerciseForm | null) => void;
  onAssignmentChange: (val: AssignmentForm | null) => void;
}

const LessonFeaturesForm = ({
  attachments, quiz, codingExercise, assignment,
  onAttachmentsChange, onQuizChange, onCodingExerciseChange, onAssignmentChange,
}: Props) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 20 * 1024 * 1024) { toast.error("Maks 20MB"); return; }
    setUploading(true);
    try {
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("lesson-files").upload(filePath, file);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("lesson-files").getPublicUrl(filePath);
      onAttachmentsChange([...attachments, { file_name: file.name, file_url: urlData.publicUrl, file_size: file.size }]);
      toast.success("File berhasil diupload!");
    } catch (err: any) {
      toast.error(err.message || "Gagal upload");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-2 mt-2">
      {/* Attachments */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-xs w-full justify-start">
            <FileText className="w-3.5 h-3.5" /> Lampiran Materi ({attachments.length})
            <ChevronDown className="w-3 h-3 ml-auto" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-2 pt-2">
          {attachments.map((att, i) => (
            <div key={i} className="flex items-center gap-2 text-xs bg-muted/50 rounded-md px-2 py-1.5">
              <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
              <span className="truncate flex-1">{att.file_name}</span>
              <span className="text-muted-foreground">{(att.file_size / 1024).toFixed(0)} KB</span>
              <Button size="icon" variant="ghost" className="h-5 w-5 text-destructive" onClick={() => onAttachmentsChange(attachments.filter((_, j) => j !== i))}>
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          ))}
          <label className="cursor-pointer inline-block">
            <input type="file" className="hidden" onChange={handleFileUpload} disabled={uploading} />
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border bg-background hover:bg-muted text-xs font-medium transition-colors">
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Upload File
            </div>
          </label>
        </CollapsibleContent>
      </Collapsible>

      {/* Quiz */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-xs w-full justify-start">
            <HelpCircle className="w-3.5 h-3.5" /> Kuis {quiz ? "✓" : "(belum ada)"}
            <ChevronDown className="w-3 h-3 ml-auto" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-3 pt-2">
          {!quiz ? (
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => onQuizChange({ title: "", passing_score: 70, questions: [] })}>
              <Plus className="w-3 h-3" /> Tambah Kuis
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input value={quiz.title} onChange={(e) => onQuizChange({ ...quiz, title: e.target.value })} placeholder="Judul Kuis" className="flex-1 text-xs h-8" />
                <Input type="number" value={quiz.passing_score} onChange={(e) => onQuizChange({ ...quiz, passing_score: Number(e.target.value) })} className="w-20 text-xs h-8" placeholder="Passing %" />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onQuizChange(null)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              {quiz.questions.map((q, qIdx) => (
                <div key={qIdx} className="border rounded-lg p-2.5 space-y-2 bg-background">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-muted-foreground">Q{qIdx + 1}</span>
                    <Input value={q.question} onChange={(e) => {
                      const updated = { ...quiz, questions: [...quiz.questions] };
                      updated.questions[qIdx] = { ...q, question: e.target.value };
                      onQuizChange(updated);
                    }} placeholder="Pertanyaan" className="flex-1 text-xs h-7" />
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => {
                      onQuizChange({ ...quiz, questions: quiz.questions.filter((_, i) => i !== qIdx) });
                    }}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2 pl-6">
                      <Checkbox checked={opt.is_correct} onCheckedChange={(checked) => {
                        const updated = { ...quiz, questions: [...quiz.questions] };
                        const newOpts = q.options.map((o, i) => ({ ...o, is_correct: i === oIdx ? !!checked : false }));
                        updated.questions[qIdx] = { ...q, options: newOpts };
                        onQuizChange(updated);
                      }} />
                      <Input value={opt.text} onChange={(e) => {
                        const updated = { ...quiz, questions: [...quiz.questions] };
                        const newOpts = [...q.options];
                        newOpts[oIdx] = { ...opt, text: e.target.value };
                        updated.questions[qIdx] = { ...q, options: newOpts };
                        onQuizChange(updated);
                      }} placeholder={`Opsi ${String.fromCharCode(65 + oIdx)}`} className="flex-1 text-xs h-7" />
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={() => {
                        const updated = { ...quiz, questions: [...quiz.questions] };
                        updated.questions[qIdx] = { ...q, options: q.options.filter((_, i) => i !== oIdx) };
                        onQuizChange(updated);
                      }}>
                        <Trash2 className="w-2.5 h-2.5" />
                      </Button>
                    </div>
                  ))}
                  <Button size="sm" variant="ghost" className="text-[10px] h-6 gap-1 ml-6" onClick={() => {
                    const updated = { ...quiz, questions: [...quiz.questions] };
                    updated.questions[qIdx] = { ...q, options: [...q.options, { text: "", is_correct: false }] };
                    onQuizChange(updated);
                  }}>
                    <Plus className="w-2.5 h-2.5" /> Opsi
                  </Button>
                </div>
              ))}
              <Button size="sm" variant="ghost" className="text-xs gap-1" onClick={() => {
                onQuizChange({ ...quiz, questions: [...quiz.questions, { question: "", options: [{ text: "", is_correct: true }, { text: "", is_correct: false }, { text: "", is_correct: false }, { text: "", is_correct: false }] }] });
              }}>
                <Plus className="w-3 h-3" /> Tambah Pertanyaan
              </Button>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Coding Exercise */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-xs w-full justify-start">
            <Code2 className="w-3.5 h-3.5" /> Latihan Coding {codingExercise ? "✓" : "(belum ada)"}
            <ChevronDown className="w-3 h-3 ml-auto" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-2 pt-2">
          {!codingExercise ? (
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => onCodingExerciseChange({ title: "", description: "", starter_code: "", language: "javascript" })}>
              <Plus className="w-3 h-3" /> Tambah Latihan Coding
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={codingExercise.title} onChange={(e) => onCodingExerciseChange({ ...codingExercise, title: e.target.value })} placeholder="Judul" className="flex-1 text-xs h-8" />
                <Select value={codingExercise.language} onValueChange={(v) => onCodingExerciseChange({ ...codingExercise, language: v })}>
                  <SelectTrigger className="w-32 text-xs h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="javascript">JavaScript</SelectItem>
                    <SelectItem value="python">Python</SelectItem>
                    <SelectItem value="html">HTML</SelectItem>
                  </SelectContent>
                </Select>
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onCodingExerciseChange(null)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <Textarea value={codingExercise.description} onChange={(e) => onCodingExerciseChange({ ...codingExercise, description: e.target.value })} placeholder="Deskripsi latihan..." className="text-xs min-h-[50px]" />
              <div>
                <Label className="text-[10px] text-muted-foreground">Starter Code</Label>
                <Textarea value={codingExercise.starter_code} onChange={(e) => onCodingExerciseChange({ ...codingExercise, starter_code: e.target.value })} placeholder="// kode awal..." className="text-xs font-mono min-h-[80px]" />
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Assignment */}
      <Collapsible>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="gap-2 text-xs w-full justify-start">
            <ClipboardList className="w-3.5 h-3.5" /> Tugas {assignment ? "✓" : "(belum ada)"}
            <ChevronDown className="w-3 h-3 ml-auto" />
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 space-y-2 pt-2">
          {!assignment ? (
            <Button size="sm" variant="outline" className="text-xs gap-1" onClick={() => onAssignmentChange({ title: "", description: "" })}>
              <Plus className="w-3 h-3" /> Tambah Tugas
            </Button>
          ) : (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input value={assignment.title} onChange={(e) => onAssignmentChange({ ...assignment, title: e.target.value })} placeholder="Judul tugas" className="flex-1 text-xs h-8" />
                <Button size="icon" variant="ghost" className="h-8 w-8 text-destructive" onClick={() => onAssignmentChange(null)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
              <Textarea value={assignment.description} onChange={(e) => onAssignmentChange({ ...assignment, description: e.target.value })} placeholder="Deskripsi tugas..." className="text-xs min-h-[60px]" />
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default LessonFeaturesForm;
