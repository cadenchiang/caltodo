/**
 * Sends a test digest email to a specified address using mock data.
 * Usage: npx tsx scripts/test-digest-email.ts cadenchiang@berkeley.edu
 */

import { Resend } from "resend";
import { readFileSync } from "fs";

// Load .env.local manually
const envFile = readFileSync(".env.local", "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const recipient = process.argv[2];
if (!recipient) {
  console.error("Usage: npx tsx scripts/test-digest-email.ts <email>");
  process.exit(1);
}

const apiKey = process.env.RESEND_API_KEY;
if (!apiKey) {
  console.error("RESEND_API_KEY not set in .env.local");
  process.exit(1);
}

const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://caltodo.me";
const fromAddress = process.env.RESEND_FROM_EMAIL || "caltodo <noreply@caltodo.me>";

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatTime(time: string | null): string {
  if (!time) return "";
  const [h, m] = time.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${ampm}`;
}

interface Task {
  title: string;
  due_time: string | null;
  course_name: string | null;
  points_possible: number | null;
}

function buildTaskRow(task: Task, color: string): string {
  const time = formatTime(task.due_time);
  const course = task.course_name ? escapeHtml(task.course_name) : "";
  const points = task.points_possible ? `${task.points_possible} pts` : "";
  const meta = [course, points, time].filter(Boolean).join(" · ");

  return `
    <a href="${appUrl}/app/inbox" style="display: block; text-decoration: none; color: inherit; padding: 12px 16px; border-left: 3px solid ${color}; background: #f9f9fb; border-radius: 0 8px 8px 0; margin-bottom: 6px;">
      <div style="font-size: 14px; font-weight: 500; color: #1a1a1a; line-height: 1.4;">${escapeHtml(task.title)}</div>
      ${meta ? `<div style="font-size: 12px; color: #888; margin-top: 2px;">${meta}</div>` : ""}
    </a>
  `;
}

function buildSection(label: string, tasks: Task[], color: string): string {
  if (tasks.length === 0) return "";
  return `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; color: ${color}; margin-bottom: 8px;">${label} (${tasks.length})</div>
      ${tasks.map((t) => buildTaskRow(t, color)).join("")}
    </div>
  `;
}

const now = new Date();
const dateStr = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

const overdue: Task[] = [
  { title: "Chapter 13 — Online Homework", due_time: "23:59", course_name: "MELC 175", points_possible: 10 },
];

const dueToday: Task[] = [
  { title: "Homework 5: Graph Algorithms", due_time: "23:59", course_name: "CS 170", points_possible: 100 },
  { title: "Lab 6: Recursion", due_time: "23:59", course_name: "CS 61A", points_possible: null },
  { title: "Reading Response Week 8", due_time: "18:00", course_name: "MELC 175", points_possible: 5 },
];

const dueTomorrow: Task[] = [
  { title: "Project 2: Network Flow", due_time: "23:59", course_name: "CS 170", points_possible: 200 },
  { title: "Discussion Worksheet 7", due_time: null, course_name: "CS 61A", points_possible: null },
];

const html = `
  <!DOCTYPE html>
  <html>
  <head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head>
  <body style="margin: 0; padding: 0; background: #f0f0f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
    <div style="display: none; max-height: 0; overflow: hidden;">6 assignments on deck today.&#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847; &#847;</div>
    <div style="max-width: 480px; margin: 0 auto; padding: 32px 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <img src="${appUrl}/logo.png" alt="caltodo" style="height: 36px; display: inline-block;" />
      </div>
      <div style="background: #ffffff; border-radius: 16px; padding: 28px 24px; box-shadow: 0 1px 3px rgba(0,0,0,0.06);">
        <div style="margin-bottom: 24px;">
          <div style="font-size: 20px; font-weight: 700; color: #1a1a1a;">Good morning, Caden.</div>
          <div style="font-size: 13px; color: #999; margin-top: 4px;">${dateStr}</div>
        </div>
        ${buildSection("Overdue", overdue, "#ef4444")}
        ${buildSection("Due Today", dueToday, "#3b82f6")}
        ${buildSection("Due Tomorrow", dueTomorrow, "#8b5cf6")}
        <a href="${appUrl}/app/inbox" style="display: block; text-align: center; background: #1a1a1a; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; margin-top: 8px;">Open CalTodo</a>
      </div>
      <div style="text-align: center; margin-top: 24px;">
        <a href="${appUrl}/app/settings?section=notifications" style="font-size: 12px; color: #999; text-decoration: underline;">Manage email preferences</a>
      </div>
    </div>
  </body>
  </html>
`;

async function main() {
  const resend = new Resend(apiKey);
  console.log(`Sending test digest to ${recipient}...`);

  const { data, error } = await resend.emails.send({
    from: fromAddress,
    to: recipient,
    subject: "your daily rundown",
    html,
  });

  if (error) {
    console.error("Failed:", error);
    process.exit(1);
  }

  console.log("Sent!", data);
}

main();
