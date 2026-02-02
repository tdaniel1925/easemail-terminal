'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, X, File, Loader2, Image as ImageIcon, FileText } from 'lucide-react';
import { toast } from 'sonner';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  file: File;
}

interface AttachmentUploaderProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  maxSize?: number; // in MB
  maxFiles?: number;
}

export function AttachmentUploader({
  attachments,
  onAttachmentsChange,
  maxSize = 25, // 25MB default (Nylas limit)
  maxFiles = 10,
}: AttachmentUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const validateFile = (file: File): boolean => {
    // Check file size
    const maxSizeBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      toast.error(`File ${file.name} is too large. Max size: ${maxSize}MB`);
      return false;
    }

    // Check max files
    if (attachments.length >= maxFiles) {
      toast.error(`Maximum ${maxFiles} files allowed`);
      return false;
    }

    return true;
  };

  const addFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: Attachment[] = [];

    fileArray.forEach((file) => {
      if (validateFile(file)) {
        validFiles.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: file.name,
          size: file.size,
          type: file.type,
          file,
        });
      }
    });

    if (validFiles.length > 0) {
      onAttachmentsChange([...attachments, ...validFiles]);
      toast.success(`${validFiles.length} file(s) added`);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = ''; // Reset input
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }, [attachments]);

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
    toast.success('Attachment removed');
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4" />;
    } else if (type.includes('pdf') || type.includes('document') || type.includes('text')) {
      return <FileText className="h-4 w-4" />;
    }
    return <File className="h-4 w-4" />;
  };

  return (
    <div className="space-y-3">
      {/* Upload Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-4 transition-colors ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <input
            type="file"
            id="file-upload"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <label htmlFor="file-upload">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => document.getElementById('file-upload')?.click()}
              asChild
            >
              <span>
                <Paperclip className="mr-2 h-4 w-4" />
                Attach Files
              </span>
            </Button>
          </label>
          <span className="text-xs text-muted-foreground">
            or drag and drop files here (max {maxSize}MB per file)
          </span>
        </div>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">
            Attachments ({attachments.length})
          </p>
          <div className="space-y-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-2 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="text-muted-foreground">
                  {getFileIcon(attachment.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.size)}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeAttachment(attachment.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
