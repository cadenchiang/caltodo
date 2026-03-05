"use client";

/**
 * Quote of the Day widget — displays a rotating motivational quote.
 * Notion-style: elegant serif typography, minimal layout, warm feel.
 * Rotates daily based on the day of year. Configurable categories.
 *
 * @module QuoteWidget
 */

import { useMemo } from "react";
import { WidgetShell } from "./WidgetPrimitives";

interface QuoteWidgetProps {
  config?: Record<string, string>;
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

export default function QuoteWidget({ config }: QuoteWidgetProps) {
  const category = config?.quoteCategory || "all";

  const quote = useMemo(() => {
    const filtered = category === "all"
      ? QUOTES
      : QUOTES.filter((q) => q.category === category);
    if (filtered.length === 0) return QUOTES[0];

    // Rotate daily based on day of year
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return filtered[dayOfYear % filtered.length];
  }, [category]);

  return (
    <WidgetShell centered>
      <div className="relative">
        <span className="text-6xl font-serif absolute -top-4 -left-1 opacity-[0.08] leading-none select-none">
          &ldquo;
        </span>
        <p
          className="font-serif text-base leading-relaxed text-foreground italic"
        >
          {quote.text}
        </p>
        <div className="w-12 h-0.5 bg-gradient-to-r from-purple-400 to-pink-400 opacity-30 mt-3 rounded-full" />
        <p className="text-[11px] text-muted-foreground mt-2 tracking-wide">
          &mdash; {quote.author}
        </p>
      </div>
    </WidgetShell>
  );
}
