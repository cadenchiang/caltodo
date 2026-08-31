import { Tag, AlignLeft, BookOpen, Repeat, FileText } from "lucide-react";
import { parseLinks, looksLikeDocument } from "@/lib/link-text";

/** Default icon size matching the ICON_SIZE constant in detail views. */
const DEFAULT_ICON_SIZE = 20;

/* ─── Date + Time Label ─── */

interface TaskDateTimeLabelProps {
  /** Formatted date string (e.g. "EEE, MMM d, yyyy"). */
  dateLabel: string | null;
  /**
   * Calendar date shown after a relative dateLabel (e.g. "In 3 days"), so the
   * pill says both how soon it is and which day that is. Omit when dateLabel
   * is already the date.
   */
  exactDate?: string | null;
  /** Formatted time string (e.g. "h:mm a"). */
  timeLabel: string | null;
  /**
   * Tailwind text-color class for the urgency tint (e.g. "text-red-400").
   * Defaults to muted text when not provided. The pill bg is derived
   * from this color via color-mix so the tint always matches.
   */
  urgencyClassName?: string;
}

/**
 * Renders the date and/or time line under the task title.
 *
 * @param dateLabel - Formatted date, or null to omit
 * @param exactDate - Calendar date to show after a relative dateLabel
 * @param timeLabel - Formatted time, or null to omit
 * @param urgencyClassName - Tailwind text colour for the urgency tint
 */
export function TaskDateTimeLabel({ dateLabel, exactDate, timeLabel, urgencyClassName }: TaskDateTimeLabelProps) {
  if (!dateLabel && !timeLabel) return null;
  const colorClass = urgencyClassName ?? "text-muted-foreground";
  return (
    <div className="pl-9 mt-1.5">
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[12px] font-semibold ${colorClass}`}
        style={{ backgroundColor: "color-mix(in srgb, currentColor 14%, transparent)" }}
      >
        {timeLabel && <span className="opacity-60 mr-1">{timeLabel}</span>}
        {dateLabel}
        {exactDate && <span className="opacity-60 ml-1.5">{exactDate}</span>}
      </span>
    </div>
  );
}

/* ─── Repeat Label ─── */

interface TaskRepeatLabelProps {
  /** Human-readable repeat label (e.g. "Every week"). */
  repeatLabel: string | null;
}

/**
 * Renders the repeat interval label under the date line.
 *
 * @param repeatLabel - Repeat description, or null to render nothing
 */
export function TaskRepeatLabel({ repeatLabel }: TaskRepeatLabelProps) {
  if (!repeatLabel) return null;
  return (
    <div className="pl-9 mt-1.5">
      <span
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[12px] font-semibold text-purple-400"
        style={{ backgroundColor: "color-mix(in srgb, currentColor 14%, transparent)" }}
      >
        <Repeat size={11} strokeWidth={2.5} />
        {repeatLabel}
      </span>
    </div>
  );
}

/* ─── Course Name Row ─── */

interface TaskCourseRowProps {
  /** Course name to display. */
  courseName: string | null;
  /** Icon size in px. Defaults to 20. */
  iconSize?: number;
}

/**
 * Renders the course name row with a BookOpen icon.
 *
 * @param courseName - Course name, or null to render nothing
 * @param iconSize - Icon size in pixels
 */
export function TaskCourseRow({ courseName, iconSize = DEFAULT_ICON_SIZE }: TaskCourseRowProps) {
  if (!courseName) return null;
  return (
    <div className="flex items-center gap-4 py-3 min-w-0">
      <div className="shrink-0 w-5 flex items-center justify-center">
        <BookOpen size={iconSize} className="text-secondary-foreground" />
      </div>
      <span className="text-sm text-foreground truncate">{courseName}</span>
    </div>
  );
}

/* ─── Tags Row ─── */

interface TaskTagsRowProps {
  /** Array of tag strings. */
  tags: string[];
  /** Optional source badges (e.g. "bCourses", "Submitted"). */
  sourceBadges?: { label: string; className: string }[];
  /** Icon size in px. Defaults to 20. */
  iconSize?: number;
}

/**
 * Renders the tags row with a Tag icon, optional source badges, and tag pills.
 *
 * @param tags - User-defined tags
 * @param sourceBadges - Source/status badges to display before tags
 * @param iconSize - Icon size in pixels
 */
export function TaskTagsRow({ tags, sourceBadges, iconSize = DEFAULT_ICON_SIZE }: TaskTagsRowProps) {
  const hasContent = (sourceBadges && sourceBadges.length > 0) || tags.length > 0;
  if (!hasContent) return null;

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="shrink-0 w-5 flex items-center justify-center mt-0.5">
        <Tag size={iconSize} className="text-secondary-foreground" />
      </div>
      <div className="flex flex-wrap gap-1.5 min-w-0">
        {sourceBadges?.map((b) => (
          <span
            key={b.label}
            className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${b.className}`}
          >
            {b.label}
          </span>
        ))}
        {tags.map((tag) => (
          <span
            key={tag}
            className="px-2.5 py-0.5 text-xs rounded-full bg-accent text-foreground max-w-[200px] truncate"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Description Row ─── */

interface TaskDescriptionRowProps {
  /** Task description text. */
  description: string | null;
  /** Optional line clamp (e.g. 3 for popover). Omit for no clamping. */
  lineClamp?: number;
  /** Icon size in px. Defaults to 20. */
  iconSize?: number;
}

/**
 * Renders the description row with an AlignLeft icon.
 *
 * @param description - Description text, or null to render nothing
 * @param lineClamp - Max visible lines (CSS line-clamp). Omit for full text.
 * @param iconSize - Icon size in pixels
 */
export function TaskDescriptionRow({ description, lineClamp, iconSize = DEFAULT_ICON_SIZE }: TaskDescriptionRowProps) {
  if (!description) return null;

  const clampClass = lineClamp ? `line-clamp-${lineClamp}` : "whitespace-pre-wrap";

  return (
    <div className="flex items-start gap-4 py-3">
      <div className="shrink-0 w-5 flex items-center justify-center mt-0.5">
        <AlignLeft size={iconSize} className="text-secondary-foreground" />
      </div>
      <p className={`text-sm text-foreground ${clampClass} break-words min-w-0`}>
        {parseLinks(description).map((seg, i) =>
          seg.kind === "text" ? (
            <span key={i}>{seg.value}</span>
          ) : (
            <a
              key={i}
              href={seg.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[#0e89d6] hover:underline break-all"
            >
              {looksLikeDocument(seg.href, seg.label) && (
                <FileText size={13} className="shrink-0" />
              )}
              {seg.label}
            </a>
          )
        )}
      </p>
    </div>
  );
}
