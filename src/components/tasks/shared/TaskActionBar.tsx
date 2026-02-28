import { Pencil, Trash2, X, ExternalLink } from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";

/**
 * Props for the shared header action bar used in task detail views.
 */
interface TaskActionBarProps {
  /** Called when the edit (pencil) button is clicked. */
  onEdit: () => void;
  /** Called when the delete (trash) button is clicked. Optional. */
  onDelete?: () => void;
  /** Called when the close (X) button is clicked. */
  onClose: () => void;
  /** If provided, renders an external link button. */
  sourceUrl?: string | null;
}

/**
 * Horizontal row of action buttons for task detail/preview headers.
 * Renders optional ExternalLink, Pencil (edit), Trash2 (delete), and X (close).
 *
 * @param onEdit - Edit button handler
 * @param onDelete - Delete button handler (omit to hide trash button)
 * @param onClose - Close button handler
 * @param sourceUrl - URL for external link button (omit/null to hide)
 */
export default function TaskActionBar({
  onEdit,
  onDelete,
  onClose,
  sourceUrl,
}: TaskActionBarProps) {
  return (
    <div className="flex items-center justify-end gap-1 px-5 pt-4 pb-2">
      {sourceUrl && (
        <Tooltip label="Open in source">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <ExternalLink size={18} />
          </a>
        </Tooltip>
      )}
      <Tooltip label="Edit task">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <Pencil size={18} />
        </button>
      </Tooltip>
      {onDelete && (
        <Tooltip label="Delete task">
          <button
            onClick={onDelete}
            className="p-2 rounded-lg text-secondary-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={18} />
          </button>
        </Tooltip>
      )}
      <Tooltip label="Close">
        <button
          onClick={onClose}
          className="p-2 rounded-lg text-secondary-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <X size={18} />
        </button>
      </Tooltip>
    </div>
  );
}
