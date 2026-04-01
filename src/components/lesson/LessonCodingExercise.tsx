import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Code2, Play, Save, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface Exercise {
  id: string;
  title: string;
  description: string | null;
  starter_code: string | null;
  language: string;
}

interface Props {
  lessonId: string;
}

const LessonCodingExercise = ({ lessonId }: Props) => {
  const { user } = useAuth();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [running, setRunning] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    fetchExercise();
  }, [lessonId]);

  const fetchExercise = async () => {
    const { data } = await supabase
      .from("coding_exercises")
      .select("*")
      .eq("lesson_id", lessonId)
      .limit(1)
      .maybeSingle();

    if (!data) return;
    setExercise(data);
    setCode(data.starter_code || "");

    // Load previous submission
    if (user) {
      const { data: sub } = await supabase
        .from("coding_submissions")
        .select("code")
        .eq("exercise_id", data.id)
        .eq("user_id", user.id)
        .order("submitted_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (sub) setCode(sub.code);
    }
  };

  const runCode = () => {
    setRunning(true);
    setOutput("");
    try {
      const logs: string[] = [];
      const fakeConsole = { log: (...args: any[]) => logs.push(args.map(String).join(" ")), error: (...args: any[]) => logs.push("Error: " + args.map(String).join(" ")) };
      // eslint-disable-next-line no-new-func
      const fn = new Function("console", code);
      fn(fakeConsole);
      setOutput(logs.join("\n") || "(No output)");
    } catch (err: any) {
      setOutput(`Error: ${err.message}`);
    } finally {
      setRunning(false);
    }
  };

  const saveSubmission = async () => {
    if (!exercise || !user) return;
    await supabase.from("coding_submissions").insert({
      exercise_id: exercise.id,
      user_id: user.id,
      code,
    });
    toast.success("Kode berhasil disimpan!");
  };

  const resetCode = () => {
    setCode(exercise?.starter_code || "");
    setOutput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Tab") {
      e.preventDefault();
      const ta = textareaRef.current;
      if (!ta) return;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      setCode(code.substring(0, start) + "  " + code.substring(end));
      setTimeout(() => { ta.selectionStart = ta.selectionEnd = start + 2; }, 0);
    }
  };

  if (!exercise) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-heading font-bold text-sm flex items-center gap-2">
        <Code2 className="w-4 h-4" /> {exercise.title}
      </h3>
      {exercise.description && (
        <p className="text-sm text-muted-foreground">{exercise.description}</p>
      )}

      <Card className="rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-3 py-2 bg-muted/50 border-b">
          <span className="text-xs font-mono text-muted-foreground">{exercise.language}</span>
          <div className="flex gap-1.5">
            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={resetCode}>
              <RotateCcw className="w-3 h-3" /> Reset
            </Button>
            <Button size="sm" variant="ghost" className="h-7 gap-1 text-xs" onClick={saveSubmission}>
              <Save className="w-3 h-3" /> Simpan
            </Button>
            <Button size="sm" className="h-7 gap-1 text-xs" onClick={runCode} disabled={running}>
              <Play className="w-3 h-3" /> Run
            </Button>
          </div>
        </div>
        <textarea
          ref={textareaRef}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full min-h-[200px] p-3 font-mono text-sm bg-background resize-y focus:outline-none"
          spellCheck={false}
        />
        {output && (
          <div className="border-t">
            <div className="px-3 py-1.5 bg-muted/30 text-xs font-medium text-muted-foreground">Output</div>
            <pre className="p-3 text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-auto bg-muted/10">{output}</pre>
          </div>
        )}
      </Card>
    </div>
  );
};

export default LessonCodingExercise;
