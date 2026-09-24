"use client";

import { useId, useState, type ChangeEvent, type DragEvent } from "react";
import { FileText, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

/** Maximum syllabus size in bytes (10 MB). */
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
/** MIME types the extractor accepts. */
export const ACCEPTED_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/webp"];
/** Matching `accept` attribute for the file input. */
export const ACCEPT_ATTR = ".pdf,.png,.jpg,.jpeg,.webp";

/**
 * Checks a file against the accepted types and size limit.
 *
 * @param file - Candidate file
 * @returns An error message, or null when the file is acceptable
 */
export function validateSyllabusFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) return "Unsupported file type. Please upload a PDF, PNG, JPG, or WebP file.";
  if (file.size > MAX_FILE_SIZE) return "File too large. Maximum size is 10 MB.";
  return null;
}

export interface SyllabusDropzoneProps {
  /** Currently chosen file, if any. */
  file: File | null;
  /** Blob URL for the thumbnail, when a file is chosen. */
  previewUrl: string | null;
  /** Receives a chosen or dropped file. Validation happens in the caller. */
  onFile: (file: File) => void;
}

/**
 * Keyboard-accessible syllabus dropzone. The visible area is a label for a
 * real file input (focusable, Enter and Space open the picker), and it also
 * accepts drag and drop.
 *
 * @param file - The chosen file, shown as a thumbnail with its size
 * @param previewUrl - Blob URL rendered as the thumbnail
 * @param onFile - Called with the file from the picker or the drop
 * @remarks The input is visually hidden with sr-only rather than display:none
 *          so it stays in the tab order; the label paints the focus ring via
 *          focus-within.
 */
export default function SyllabusDropzone({ file, previewUrl, onFile }: SyllabusDropzoneProps) {
  const inputId = useId();
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped) onFile(dropped);
  }

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    const chosen = e.target.files?.[0];
    if (chosen) onFile(chosen);
    // Reset so choosing the same file again still fires onChange.
    e.target.value = "";
  }

  return (
    <label
      htmlFor={inputId}
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={cn(
        "block border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors",
        "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
        dragOver ? "border-blue-500 bg-blue-500/5" : file ? "border-blue-500/60" : "border-input-border hover:border-blue-500/40"
      )}
    >
      <input
        id={inputId}
        type="file"
        accept={ACCEPT_ATTR}
        onChange={handleChange}
        className="sr-only"
        aria-describedby={`${inputId}-hint`}
      />
      {file ? (
        <span className="flex flex-col items-center gap-2">
          {previewUrl ? (
            <span className="block w-28 h-36 rounded-lg border border-border bg-card overflow-hidden shadow-sm dark:shadow-none pointer-events-none">
              {file.type === "application/pdf" ? (
                <embed src={`${previewUrl}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`} type="application/pdf" className="w-full h-full" />
              ) : (
                <img src={previewUrl} alt="" className="w-full h-full object-cover" />
              )}
            </span>
          ) : (
            <FileText size={32} className="text-blue-500" aria-hidden="true" />
          )}
          <span className="text-sm font-semibold text-foreground max-w-full truncate px-2">{file.name}</span>
          <span className="text-xs text-muted-foreground">{(file.size / 1024 / 1024).toFixed(1)} MB</span>
          <span id={`${inputId}-hint`} className="text-xs font-medium text-blue-500">Choose a different file</span>
        </span>
      ) : (
        <span className="flex flex-col items-center gap-2">
          <Upload size={32} className="text-foreground" aria-hidden="true" />
          <span className="text-sm font-semibold text-foreground">Choose a syllabus file or drag it here</span>
          <span id={`${inputId}-hint`} className="text-xs text-muted-foreground">PDF, PNG, JPG, or WebP (max 10 MB)</span>
        </span>
      )}
    </label>
  );
}
