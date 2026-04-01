import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, Upload, FileText, Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Attachment {
  id: string;
  file_name: string;
  file_url: string;
  file_size: number;
}

interface Props {
  lessonId: string;
  isTeacher?: boolean;
}

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(1)} MB`;
};

const LessonAttachments = ({ lessonId, isTeacher = false }: Props) => {
  const { user } = useAuth();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchAttachments();
  }, [lessonId]);

  const fetchAttachments = async () => {
    const { data } = await supabase
      .from("lesson_attachments")
      .select("*")
      .eq("lesson_id", lessonId);
    if (data) setAttachments(data);
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 20MB");
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const filePath = `attachments/${user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("lesson-files").upload(filePath, file);
      if (error) throw error;

      const { data: urlData } = supabase.storage.from("lesson-files").getPublicUrl(filePath);

      await supabase.from("lesson_attachments").insert({
        lesson_id: lessonId,
        file_name: file.name,
        file_url: urlData.publicUrl,
        file_size: file.size,
      });

      toast.success("File berhasil diupload!");
      fetchAttachments();
    } catch (err: any) {
      toast.error(err.message || "Gagal upload file");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    await supabase.from("lesson_attachments").delete().eq("id", id);
    toast.success("File dihapus");
    fetchAttachments();
  };

  if (attachments.length === 0 && !isTeacher) return null;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-bold text-sm flex items-center gap-2">
          <Download className="w-4 h-4" /> Materi Download
        </h3>
        {isTeacher && (
          <label className="cursor-pointer">
            <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border bg-muted hover:bg-muted/80 text-xs font-medium transition-colors">
              {uploading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
              Upload File
            </div>
          </label>
        )}
      </div>
      {attachments.length === 0 ? (
        <p className="text-xs text-muted-foreground">Belum ada materi download.</p>
      ) : (
        <div className="space-y-2">
          {attachments.map((att) => (
            <Card key={att.id} className="p-3 flex items-center gap-3 rounded-xl">
              <FileText className="w-5 h-5 text-primary shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{att.file_name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(att.file_size)}</p>
              </div>
              <a href={att.file_url} target="_blank" rel="noopener noreferrer" download>
                <Button size="sm" variant="outline" className="gap-1 text-xs rounded-lg">
                  <Download className="w-3 h-3" /> Download
                </Button>
              </a>
              {isTeacher && (
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => handleDelete(att.id)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LessonAttachments;
