"use client";

/**
 * Quick Links widget — grid of pinned bookmarks with favicons.
 * Notion-style: clean grid, subtle hover states, favicon + label.
 * Links are stored as JSON in widget config.
 *
 * @module QuickLinksWidget
 */

import { useState } from "react";
import { Plus, X, Link as LinkIcon } from "lucide-react";
import { WidgetShell, WidgetHeader, WidgetEmptyState } from "./WidgetPrimitives";

interface QuickLink {
  url: string;
  label: string;
}

interface QuickLinksWidgetProps {
  config?: Record<string, string>;
  onUpdateConfig?: (config: Record<string, string>) => void;
}

/**
 * Extracts the favicon URL for a given site.
 *
 * @param url - Full URL string
 * @returns Google favicon service URL
 */
function getFaviconUrl(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${hostname}&sz=32`;
  } catch {
    return "";
  }
}

/**
 * Parses links from the widget config JSON string.
 *
 * @param config - Widget config record
 * @returns Array of QuickLink objects
 */
function parseLinks(config?: Record<string, string>): QuickLink[] {
  if (!config?.links) return [];
  try {
    return JSON.parse(config.links);
  } catch {
    return [];
  }
}

export default function QuickLinksWidget({ config, onUpdateConfig }: QuickLinksWidgetProps) {
  const links = parseLinks(config);
  const [adding, setAdding] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");

  /**
   * Saves a new link to the widget config.
   * Normalizes URLs without protocol by prepending https://.
   */
  function handleAdd() {
    if (!newUrl.trim()) return;
    let url = newUrl.trim();
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      url = "https://" + url;
    }
    const label = newLabel.trim() || new URL(url).hostname.replace("www.", "");
    const updated = [...links, { url, label }];
    onUpdateConfig?.({ ...config, links: JSON.stringify(updated) });
    setNewUrl("");
    setNewLabel("");
    setAdding(false);
  }

  /**
   * Removes a link by index from the widget config.
   *
   * @param index - Index of the link to remove
   */
  function handleRemove(index: number) {
    const updated = links.filter((_, i) => i !== index);
    onUpdateConfig?.({ ...config, links: JSON.stringify(updated) });
  }

  if (links.length === 0 && !adding) {
    return (
      <WidgetEmptyState
        icon={<LinkIcon size={24} />}
        message="Add your favorite links"
        action={
          <button
            onClick={() => setAdding(true)}
            className="no-drag flex items-center gap-1 text-xs font-medium text-blue-500 hover:text-blue-600 transition-colors"
          >
            <Plus size={12} />
            Add Link
          </button>
        }
      />
    );
  }

  return (
    <WidgetShell>
      <WidgetHeader
        title="Quick Links"
        right={
          <button
            onClick={() => setAdding(true)}
            className="no-drag w-5 h-5 rounded flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Add link"
          >
            <Plus size={12} />
          </button>
        }
      />

      <div className="flex-1 grid grid-cols-2 gap-1.5 overflow-y-auto content-start">
        {links.map((link, i) => (
          <a
            key={i}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="no-drag group flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-muted transition-colors relative"
          >
            <img
              src={getFaviconUrl(link.url)}
              alt=""
              className="w-4 h-4 rounded-sm shrink-0"
              loading="lazy"
            />
            <span className="text-xs text-foreground truncate">{link.label}</span>
            <button
              onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleRemove(i); }}
              className="no-drag absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center bg-muted text-muted-foreground opacity-0 group-hover:opacity-100 hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-500/10 transition-all"
              aria-label={`Remove ${link.label}`}
            >
              <X size={8} />
            </button>
          </a>
        ))}
      </div>

      {/* Inline add form */}
      {adding && (
        <div className="no-drag mt-2 p-2 rounded-lg border border-border bg-muted/50 space-y-1.5">
          <input
            type="url"
            placeholder="https://example.com"
            value={newUrl}
            onChange={(e) => setNewUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-full px-2 py-1.5 text-xs rounded-md border border-input-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            autoFocus
          />
          <input
            type="text"
            placeholder="Label (optional)"
            value={newLabel}
            onChange={(e) => setNewLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            className="w-full px-2 py-1.5 text-xs rounded-md border border-input-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <div className="flex gap-1.5">
            <button
              onClick={() => setAdding(false)}
              className="flex-1 px-2 py-1 text-xs rounded-md text-muted-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              className="flex-1 px-2 py-1 text-xs rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </WidgetShell>
  );
}
