"use client";

/**
 * Quote of the Day widget — displays a rotating motivational quote.
 * Supports custom quotes: users can edit the text and author in edit mode.
 * Falls back to daily-rotating curated quotes when no custom quote is set.
 *
 * @module QuoteWidget
 */

import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import { WidgetShell } from "./WidgetPrimitives";

interface QuoteWidgetProps {
  config?: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

interface QuoteEntry {
  text: string;
  author: string;
  category: string;
}

/** Curated collection of motivational and study-related quotes. */
const QUOTES: QuoteEntry[] = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "motivation" },
  { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
  { text: "Education is the most powerful weapon which you can use to change the world.", author: "Nelson Mandela", category: "study" },
  { text: "The beautiful thing about learning is that no one can take it away from you.", author: "B.B. King", category: "study" },
  { text: "Live as if you were to die tomorrow. Learn as if you were to live forever.", author: "Mahatma Gandhi", category: "study" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "motivation" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein", category: "motivation" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson", category: "productivity" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar", category: "motivation" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss", category: "productivity" },
  { text: "Small daily improvements are the key to staggering long-term results.", author: "James Clear", category: "productivity" },
  { text: "The expert in anything was once a beginner.", author: "Helen Hayes", category: "study" },
  { text: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln", category: "motivation" },
  { text: "What we learn with pleasure we never forget.", author: "Alfred Mercier", category: "study" },
  { text: "The mind is not a vessel to be filled, but a fire to be kindled.", author: "Plutarch", category: "study" },
  { text: "Start where you are. Use what you have. Do what you can.", author: "Arthur Ashe", category: "motivation" },
  { text: "The way to get started is to quit talking and begin doing.", author: "Walt Disney", category: "productivity" },
  { text: "I find that the harder I work, the more luck I seem to have.", author: "Thomas Jefferson", category: "productivity" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela", category: "motivation" },
  { text: "A person who never made a mistake never tried anything new.", author: "Albert Einstein", category: "motivation" },
  { text: "The roots of education are bitter, but the fruit is sweet.", author: "Aristotle", category: "study" },
  { text: "Tell me and I forget. Teach me and I remember. Involve me and I learn.", author: "Benjamin Franklin", category: "study" },
  { text: "Productivity is never an accident. It is the result of intelligent effort.", author: "Paul J. Meyer", category: "productivity" },
  { text: "Your limitation — it's only your imagination.", author: "Unknown", category: "motivation" },
  { text: "Great things never come from comfort zones.", author: "Unknown", category: "motivation" },
  { text: "Dream it. Wish it. Do it.", author: "Unknown", category: "motivation" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt", category: "motivation" },
  { text: "Knowledge is power. Information is liberating.", author: "Kofi Annan", category: "study" },
  { text: "Do something today that your future self will thank you for.", author: "Sean Patrick Flanery", category: "productivity" },
];

export default function QuoteWidget({ config, onUpdateConfig }: QuoteWidgetProps) {
  const category = config?.quoteCategory || "all";
  const accentColor = config?.accentColor || "#0e89d6";
  const customText = config?.customText || "";
  const customAuthor = config?.customAuthor || "";
  const isCustom = !!customText;

  const [editing, setEditing] = useState(false);
  const [editText, setEditText] = useState(customText);
  const [editAuthor, setEditAuthor] = useState(customAuthor);
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Sync edit fields when config changes externally
  useEffect(() => {
    setEditText(config?.customText || "");
    setEditAuthor(config?.customAuthor || "");
  }, [config?.customText, config?.customAuthor]);

  /** Daily-rotating quote from the curated list. */
  const dailyQuote = useMemo(() => {
    const filtered = category === "all"
      ? QUOTES
      : QUOTES.filter((q) => q.category === category);
    if (filtered.length === 0) return QUOTES[0];

    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return filtered[dayOfYear % filtered.length];
  }, [category]);

  /** The quote to display — custom if set, otherwise daily rotation. */
  const displayQuote = isCustom
    ? { text: customText, author: customAuthor || "You" }
    : { text: dailyQuote.text, author: dailyQuote.author };

  /** Saves the custom quote with debounce. */
  const saveCustomQuote = useCallback(
    (text: string, author: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        onUpdateConfig?.({
          ...config,
          customText: text,
          customAuthor: author,
        });
      }, 500);
    },
    [config, onUpdateConfig]
  );

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  /** Resets to daily-rotating quotes. */
  const resetToDaily = useCallback(() => {
    setEditText("");
    setEditAuthor("");
    setEditing(false);
    onUpdateConfig?.({
      ...config,
      customText: "",
      customAuthor: "",
    });
  }, [config, onUpdateConfig]);

  // Edit mode — inline text fields
  if (editing && onUpdateConfig) {
    return (
      <WidgetShell centered>
        <div className="w-full space-y-3">
          <textarea
            value={editText}
            onChange={(e) => {
              setEditText(e.target.value);
              saveCustomQuote(e.target.value, editAuthor);
            }}
            placeholder="Enter your quote..."
            className="w-full bg-transparent font-serif text-base leading-relaxed text-foreground italic resize-none focus:outline-none placeholder-muted-foreground min-h-[60px]"
            rows={3}
            autoFocus
          />
          <input
            type="text"
            value={editAuthor}
            onChange={(e) => {
              setEditAuthor(e.target.value);
              saveCustomQuote(editText, e.target.value);
            }}
            placeholder="Author (optional)"
            className="w-full bg-transparent text-[11px] text-muted-foreground tracking-wide focus:outline-none placeholder-muted-foreground/50"
          />
          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                setEditing(false);
                if (editText.trim()) {
                  onUpdateConfig?.({
                    ...config,
                    customText: editText.trim(),
                    customAuthor: editAuthor.trim(),
                  });
                }
              }}
              className="text-[11px] font-medium text-blue-500 hover:text-blue-600 transition-colors"
            >
              Done
            </button>
            {(isCustom || editText) && (
              <button
                type="button"
                onClick={resetToDaily}
                className="text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
              >
                <RotateCcw size={10} />
                Reset to daily
              </button>
            )}
          </div>
        </div>
      </WidgetShell>
    );
  }

  // View mode — display quote with edit button on hover
  return (
    <WidgetShell centered>
      <div className="relative group">
        <span className="text-6xl font-serif absolute -top-4 -left-1 opacity-[0.08] leading-none select-none">
          &ldquo;
        </span>
        <p className="font-serif text-base leading-relaxed text-foreground italic">
          {displayQuote.text}
        </p>
        <div className="w-12 h-0.5 opacity-30 mt-3 rounded-full" style={{ backgroundColor: accentColor }} />
        <p className="text-[11px] text-muted-foreground mt-2 tracking-wide">
          &mdash; {displayQuote.author}
        </p>

        {/* Edit button — visible on hover when in edit mode */}
        {onUpdateConfig && (
          <button
            type="button"
            onClick={() => {
              setEditText(isCustom ? customText : "");
              setEditAuthor(isCustom ? customAuthor : "");
              setEditing(true);
            }}
            className="absolute -top-1 -right-1 p-1.5 rounded-lg bg-card border border-border shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-accent"
            title="Edit quote"
          >
            <Pencil size={12} className="text-muted-foreground" />
          </button>
        )}
      </div>
    </WidgetShell>
  );
}
