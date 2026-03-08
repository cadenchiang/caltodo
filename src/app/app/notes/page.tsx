import { createClient } from "@/lib/supabase/server";
import NotesLayout from "@/components/notes/NotesLayout";
import { extractTextPreview } from "@/lib/notes-utils";
import type { Course, Note } from "@/lib/types";

/**
 * Notes page. Fetches courses, note counts, and recent notes server-side.
 * If ?note=ID is in the URL, also fetches that note so the editor can
 * render immediately without a client-side fetch (prevents flash on reload).
 */
export default async function NotesPage({
  searchParams,
}: {
  searchParams: Promise<{ note?: string; folder?: string }>;
}) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialCourses: Course[] = [];
  let initialNoteCounts: Record<string, number> = {};
  let initialRecentNotes: Note[] = [];
  let initialNote: Note | null = null;

  if (user) {
    // Build parallel fetches — always fetch courses, counts, recents
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fetches: PromiseLike<any>[] = [
      supabase
        .from("course_memberships")
        .select("course_id, courses(id, source, external_id, name, created_at)")
        .eq("user_id", user.id)
        .is("deleted_at", null),
      supabase
        .from("notes")
        .select("id, course_id, title, content")
        .eq("user_id", user.id)
        .is("deleted_at", null),
      supabase
        .from("notes")
        .select("*")
        .eq("user_id", user.id)
        .is("deleted_at", null)
        .order("updated_at", { ascending: false })
        .limit(12),
    ];

    // If a note ID is in the URL, fetch it in parallel too
    if (params.note) {
      fetches.push(
        supabase
          .from("notes")
          .select("*")
          .eq("id", params.note)
          .eq("user_id", user.id)
          .single()
      );
    }

    const results = await Promise.all(fetches);
    const [membershipsRes, notesRes, recentRes] = results as [
      { data: Array<{ course_id: string; courses: unknown }> | null },
      { data: Array<{ id: string; course_id: string | null; title: string; content: unknown }> | null },
      { data: Note[] | null },
    ];

    if (membershipsRes.data) {
      initialCourses = membershipsRes.data
        .map((m) => m.courses as unknown as Course)
        .filter((c) => c && c.source !== "system")
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    if (notesRes.data) {
      const counts: Record<string, number> = {};
      for (const note of notesRes.data) {
        const hasContent = note.content ? extractTextPreview(note.content as Record<string, unknown>, 1).length > 0 : false;
        if (!note.title?.trim() && !hasContent) continue;
        const key = note.course_id ?? "general";
        counts[key] = (counts[key] ?? 0) + 1;
      }
      initialNoteCounts = counts;
    }

    if (recentRes.data) {
      initialRecentNotes = (recentRes.data as Note[]).filter((n) => {
        const hasContent = n.content ? extractTextPreview(n.content as Record<string, unknown>, 1).length > 0 : false;
        return n.title?.trim() || hasContent;
      });
    }

    // Extract the pre-fetched note if available
    if (params.note && results[3]) {
      const noteRes = results[3] as { data: Note | null };
      initialNote = noteRes.data ?? null;
    }
  }

  return (
    <NotesLayout
      initialCourses={initialCourses}
      initialNoteCounts={initialNoteCounts}
      initialRecentNotes={initialRecentNotes}
      initialNote={initialNote}
      initialNoteFolder={params.folder ?? null}
    />
  );
}
