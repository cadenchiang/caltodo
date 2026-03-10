/**
 * GET /api/cron/email-digest/preview
 *
 * Dev-only route that renders the digest email HTML in the browser
 * using the current user's real tasks. Visit this URL to preview
 * the email template without actually sending anything.
 *
 * @returns HTML response showing the digest email
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Formats HH:MM to 12h time string. */
function formatTime(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

/** Escapes HTML special characters. */
function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** Builds a single task row. */
function buildTaskRow(task: { title: string; due_time: string | null; course_name: string | null; points_possible: number | null; source_url: string | null }, color: string, appUrl: string): string {
  const time = formatTime(task.due_time);
  const course = task.course_name ? escapeHtml(task.course_name) : "";
  const points = task.points_possible ? `${task.points_possible} pts` : "";
  const meta = [course, points, time].filter(Boolean).join(" · ");
  const link = task.source_url || `${appUrl}/app/inbox`;

  return `
    <a href="${link}" style="display: block; text-decoration: none; color: inherit; padding: 12px 16px; border-left: 3px solid ${color}; background: #f9f9fb; border-radius: 0 8px 8px 0; margin-bottom: 6px;">
      <div style="font-size: 14px; font-weight: 500; color: #1a1a1a; line-height: 1.4;">${escapeHtml(task.title)}</div>
      ${meta ? `<div style="font-size: 12px; color: #888; margin-top: 2px;">${meta}</div>` : ""}
    </a>
  `;
}

/** Builds a section with heading and task rows. */
function buildSection(label: string, tasks: Array<{ title: string; due_time: string | null; course_name: string | null; points_possible: number | null; source_url: string | null }>, color: string, appUrl: string): string {
  if (tasks.length === 0) return "";
  return `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${color}; margin-bottom: 6px;">${label} (${tasks.length})</div>
      ${tasks.map((t) => buildTaskRow(t, color, appUrl)).join("")}
    </div>
  `;
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const tomorrowStr = tomorrow.toISOString().split("T")[0];

  const { data: tasks } = await supabase
    .from("tasks")
    .select("title, due_date, due_time, course_name, points_possible, is_completed, source_url")
    .is("dismissed_at", null)
    .eq("is_completed", false)
    .not("due_date", "is", null)
    .lte("due_date", tomorrowStr)
    .order("due_date", { ascending: true });

  const allTasks = tasks || [];
  const overdue = allTasks.filter((t) => t.due_date && t.due_date < todayStr);
  const dueToday = allTasks.filter((t) => t.due_date === todayStr);
  const dueTomorrow = allTasks.filter((t) => t.due_date === tomorrowStr);

  const firstName = user.user_metadata?.full_name?.split(" ")[0] || "there";
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://caltodo.me";
  const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
    <body style="margin: 0; padding: 0; background: #f0f0f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="display: none; max-height: 0; overflow: hidden;">${allTasks.length === 1 ? "1 assignment on deck today." : `${allTasks.length} assignments on deck today.`}&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;</div>
      <div style="max-width: 480px; margin: 0 auto; padding: 32px 16px;">
        <div style="text-align: center; margin-bottom: 32px;">
          <img src="${appUrl}/logo.png" alt="caltodo" style="height: 36px; display: inline-block;" />
        </div>
        <div style="background: #ffffff; border-radius: 16px; padding: 28px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
          <div style="margin-bottom: 24px;">
            <div style="font-size: 20px; font-weight: 700; color: #1a1a1a;">Good morning, ${escapeHtml(firstName)}.</div>
            <div style="font-size: 13px; color: #999; margin-top: 4px;">${dateStr}</div>
          </div>
          ${buildSection("Overdue", overdue, "#ef4444", appUrl)}
          ${buildSection("Due Today", dueToday, "#3b82f6", appUrl)}
          ${buildSection("Due Tomorrow", dueTomorrow, "#8b5cf6", appUrl)}
          ${allTasks.length === 0 ? '<div style="text-align: center; color: #999; font-size: 14px; padding: 24px 0;">No upcoming assignments. You\'re all caught up!</div>' : ""}
          <a href="${appUrl}/app/inbox" style="display: block; text-align: center; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; margin-top: 8px;">Open CalTodo</a>
        </div>
        <div style="text-align: center; margin-top: 24px;">
          <a href="${appUrl}/app/settings" style="font-size: 12px; color: #999; text-decoration: underline;">Manage email preferences</a>
        </div>
      </div>
    </body>
    </html>
  `;

  return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
}
