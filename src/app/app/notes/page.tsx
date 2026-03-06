import { createClient } from "@/lib/supabase/server";
import NotesLayout from "@/components/notes/NotesLayout";
import { extractTextPreview } from "@/lib/notes-utils";
import type { Course } from "@/lib/types";

/**
 * Notes page. Fetches courses and note counts server-side for instant render,
 * then passes data to the client-side NotesLayout.
 */
export default async function NotesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let initialCourses: Course[] = [];
  let initialNoteCounts: Record<string, number> = {};

  if (user) {
    const [membershipsRes, notesRes] = await Promise.all([
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
    ]);

    if (membershipsRes.data) {
      initialCourses = membershipsRes.data
        .map((m) => m.courses as unknown as Course)
        .filter((c) => c && c.source !== "system")
        .sort((a, b) => a.name.localeCompare(b.name));
    }

    if (notesRes.data) {
      const counts: Record<string, number> = {};
      for (const note of notesRes.data) {
        // Skip blank untitled notes — they're auto-deleted on back navigation
        const hasContent = note.content ? extractTextPreview(note.content as Record<string, unknown>, 1).length > 0 : false;
        if (!note.title?.trim() && !hasContent) continue;
        const key = note.course_id ?? "general";
        counts[key] = (counts[key] ?? 0) + 1;
      }
      initialNoteCounts = counts;
    }
  }

  return (
    <NotesLayout
      initialCourses={initialCourses}
      initialNoteCounts={initialNoteCounts}
    />
  );
}
