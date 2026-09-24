"use client";

import { X } from "lucide-react";

/**
 * A single pending attachment with preview info.
 *
 * @property file - The raw File object
 * @property previewUrl - Blob URL for image preview (empty string for non-images)
 * @property isImage - Whether the file is an image type
 * @property isSensitive - Whether the image was flagged as NSFW by classification
 */
export interface PendingAttachment {
  file: File;
  previewUrl: string;
  isImage: boolean;
  isSensitive?: boolean;
}

/**
 * Thumbnails for files waiting in the composer, each with a remove button.
 *
 * @param attachments - Pending files
 * @param onRemove - Removes the attachment at an index
 */
export default function ChatAttachmentPreview({
  attachments,
  onRemove,
}: {
  attachments: PendingAttachment[];
  onRemove: (index: number) => void;
}) {
  if (attachments.length === 0) return null;
  return (
    <ul className="flex gap-3 mb-3 flex-wrap px-1 list-none" aria-label="Attachments to send">
      {attachments.map((att, i) => (
        <li key={`${att.file.name}-${i}`} className="relative">
          {att.isImage ? (
            <div className="rounded-2xl overflow-hidden border border-border bg-card shadow-sm relative">
              <img
                src={att.previewUrl}
                alt={att.file.name}
                className={`max-w-[200px] max-h-[160px] object-cover ${att.isSensitive ? "blur-lg" : ""}`}
              />
              {att.isSensitive && (
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-red-500 text-white text-[9px] font-medium">
                  Sensitive
                </div>
              )}
              <div className="px-2.5 py-1.5 text-[10px] text-muted-foreground truncate">{att.file.name}</div>
            </div>
          ) : (
            <div className="w-[140px] rounded-2xl border border-border shadow-sm bg-card p-3 flex flex-col items-center gap-1.5">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                <span className="text-[10px] font-bold text-muted-foreground">{att.file.name.split(".").pop()?.toUpperCase()}</span>
              </div>
              <span className="text-[10px] text-muted-foreground truncate w-full text-center">{att.file.name}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => onRemove(i)}
            aria-label={`Remove ${att.file.name}`}
            className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-gray-900 text-white dark:bg-white dark:text-gray-900 flex items-center justify-center shadow-sm cursor-pointer hover:opacity-90 transition-opacity"
          >
            <X size={14} aria-hidden="true" />
          </button>
        </li>
      ))}
    </ul>
  );
}
