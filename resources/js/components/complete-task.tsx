import type React from "react";
import { useState, useEffect } from "react";
import { useForm, router } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, File as FileIcon } from "lucide-react";

interface Task {
  id: number;
  name: string;
  description: string;
  number_of_uploads: number;
  user_task_id: number | null;
  permissions: { can_complete: boolean };
}

interface CompleteTaskModalProps {
  task?: Task;
  trigger?: React.ReactNode;
}

export function CompleteTaskModal({ task, trigger }: CompleteTaskModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const { data, setData, post, processing, errors, reset } = useForm({
    files: [] as File[],
  });

  useEffect(() => {
    if (open) {
      setSelectedFiles([]);
      reset();
    }
  }, [open]);

  useEffect(() => {
    // Update form data whenever selectedFiles changes
    setData('files', selectedFiles);
  }, [selectedFiles, setData]);

  if (!task || !task.permissions.can_complete || !task.user_task_id) return null;
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (selectedFiles.length + files.length > task.number_of_uploads) {
      alert(`You can only upload up to ${task.number_of_uploads} file(s).`);
      return;
    }
    setSelectedFiles(prev => [...prev, ...files]);
    e.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFiles.length !== task.number_of_uploads) {
      alert(`You must upload exactly ${task.number_of_uploads} file(s).`);
      return;
    }

    // Use post with the current data (files are already set via useEffect)
    post(route("tasks.complete", { userTask: task.user_task_id }), {
      onSuccess: () => {
        setOpen(false);
        setSelectedFiles([]);
        reset();
      },
      onError: (errors) => {
        console.log('Upload errors:', errors);
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || <Button>Complete</Button>}</DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task.name}</DialogTitle>
          <DialogDescription>{task.description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file-upload">
              Upload Files ({selectedFiles.length}/{task.number_of_uploads})
            </Label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                <p className="text-sm text-gray-500">
                  <span className="font-semibold">Click to upload</span> or drag and drop
                </p>
              </div>
              <Input
                id="file-upload"
                type="file"
                multiple={task.number_of_uploads > 1}
                onChange={handleFileChange}
                className="hidden"
                accept="*/*"
              />
            </label>
            {errors.files && <span className="text-red-600 text-sm">{errors.files}</span>}
          </div>

          {selectedFiles.length > 0 && (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {selectedFiles.map((file, i) => (
                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <FileIcon className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm truncate">{file.name}</p>
                      <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(i)}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button type="submit" disabled={selectedFiles.length === 0 || processing}>
              {processing ? "Submitting..." : "Submit Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}