import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, XCircle, Brain, RotateCcw } from "lucide-react";
import { toast } from "sonner";

interface QuizOption {
  text: string;
  is_correct: boolean;
}

interface Question {
  id: string;
  question: string;
  options: QuizOption[];
  sort_order: number;
}

interface Quiz {
  id: string;
  title: string;
  passing_score: number;
}

interface Props {
  lessonId: string;
}

const LessonQuiz = ({ lessonId }: Props) => {
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [previousAttempt, setPreviousAttempt] = useState<{ score: number } | null>(null);

  useEffect(() => {
    fetchQuiz();
  }, [lessonId]);

  const fetchQuiz = async () => {
    const { data: quizData } = await supabase
      .from("quizzes")
      .select("*")
      .eq("lesson_id", lessonId)
      .limit(1)
      .maybeSingle();

    if (!quizData) return;
    setQuiz(quizData);

    const { data: qData } = await supabase
      .from("quiz_questions")
      .select("*")
      .eq("quiz_id", quizData.id)
      .order("sort_order");

    if (qData) {
      setQuestions(qData.map((q: any) => ({
        ...q,
        options: (typeof q.options === "string" ? JSON.parse(q.options) : q.options) as QuizOption[],
      })));
    }

    // Check previous attempts
    if (user) {
      const { data: attempts } = await supabase
        .from("quiz_attempts")
        .select("score")
        .eq("quiz_id", quizData.id)
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false })
        .limit(1);

      if (attempts && attempts.length > 0) {
        setPreviousAttempt(attempts[0]);
      }
    }
  };

  const handleSubmit = async () => {
    if (!quiz || !user || Object.keys(answers).length < questions.length) {
      toast.error("Jawab semua pertanyaan terlebih dahulu");
      return;
    }

    let correct = 0;
    questions.forEach((q) => {
      const selectedIdx = answers[q.id];
      if (q.options[selectedIdx]?.is_correct) correct++;
    });

    const scorePercent = Math.round((correct / questions.length) * 100);
    setScore(scorePercent);
    setSubmitted(true);

    await supabase.from("quiz_attempts").insert({
      quiz_id: quiz.id,
      user_id: user.id,
      score: scorePercent,
      answers: Object.entries(answers).map(([qId, aIdx]) => ({ question_id: qId, selected: aIdx })),
    });

    if (scorePercent >= quiz.passing_score) {
      toast.success(`Lulus! Skor: ${scorePercent}% 🎉`);
    } else {
      toast.error(`Belum lulus. Skor: ${scorePercent}%. Minimum: ${quiz.passing_score}%`);
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setSubmitted(false);
    setScore(0);
  };

  if (!quiz || questions.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm flex items-center gap-2">
          <Brain className="w-4 h-4" /> {quiz.title}
        </h3>
        {previousAttempt && !submitted && (
          <span className="text-xs text-muted-foreground">Skor terakhir: {previousAttempt.score}%</span>
        )}
      </div>

      {submitted ? (
        <Card className="p-6 rounded-xl space-y-4">
          <div className="text-center">
            <p className="text-4xl mb-2">{score >= quiz.passing_score ? "🎉" : "😔"}</p>
            <h4 className="font-heading font-bold text-lg">Skor: {score}%</h4>
            <p className="text-sm text-muted-foreground">
              {score >= quiz.passing_score ? "Selamat, Anda lulus!" : `Minimum lulus: ${quiz.passing_score}%`}
            </p>
            <Progress value={score} className="h-2 mt-3" />
          </div>

          <div className="space-y-3">
            {questions.map((q, qi) => {
              const selectedIdx = answers[q.id];
              const isCorrect = q.options[selectedIdx]?.is_correct;
              return (
                <div key={q.id} className="p-3 rounded-lg bg-muted/30 space-y-2">
                  <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`flex items-center gap-2 text-xs px-2 py-1 rounded ${
                      opt.is_correct ? "text-green-600 font-bold" : oi === selectedIdx && !isCorrect ? "text-red-500 line-through" : "text-muted-foreground"
                    }`}>
                      {opt.is_correct ? <CheckCircle className="w-3 h-3" /> : oi === selectedIdx ? <XCircle className="w-3 h-3" /> : <span className="w-3 h-3" />}
                      {opt.text}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>

          <Button onClick={resetQuiz} variant="outline" className="gap-2 rounded-xl">
            <RotateCcw className="w-4 h-4" /> Coba Lagi
          </Button>
        </Card>
      ) : (
        <Card className="p-4 rounded-xl space-y-4">
          {questions.map((q, qi) => (
            <div key={q.id} className="space-y-2">
              <p className="text-sm font-medium">{qi + 1}. {q.question}</p>
              <div className="space-y-1.5">
                {q.options.map((opt, oi) => (
                  <button
                    key={oi}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm border transition-colors ${
                      answers[q.id] === oi ? "border-primary bg-primary/10 text-primary font-medium" : "border-border hover:bg-muted/50"
                    }`}
                    onClick={() => setAnswers({ ...answers, [q.id]: oi })}
                  >
                    {String.fromCharCode(65 + oi)}. {opt.text}
                  </button>
                ))}
              </div>
            </div>
          ))}
          <Button onClick={handleSubmit} className="rounded-xl gap-2 w-full">
            <CheckCircle className="w-4 h-4" /> Submit Jawaban
          </Button>
        </Card>
      )}
    </div>
  );
};

export default LessonQuiz;
