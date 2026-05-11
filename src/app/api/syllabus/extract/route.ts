/**
 * POST /api/syllabus/extract
 * Accepts a base64-encoded syllabus file (PDF or image), sends it to Claude API
 * for assignment extraction, and returns structured JSON.
 *
 * Body: { file: string (base64), mimeType: string, fileName: string }
 * Returns: { course_name: string | null, assignments: ExtractedAssignment[] }
 */

import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";
import { isPro } from "@/lib/entitlements";

/** Free-tier users may upload this many syllabus PDFs total. */
const FREE_SYLLABUS_LIMIT = 1;

/** Maximum file size in bytes (10 MB). */
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;

/** Allowed MIME types for uploaded syllabus files. */
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

/**
 * A single extracted assignment from a syllabus.
 */
export interface ExtractedAssignment {
  title: string;
  description: string | null;
  due_date: string | null;
  due_time: string | null;
  points_possible: number | null;
}

/** Shape returned by the Claude API structured output. */
interface ExtractionResult {
  course_name: string | null;
  assignments: ExtractedAssignment[];
}

/**
 * System prompt instructing Claude to extract assignments from a syllabus.
 */
const SYSTEM_PROMPT = `You are a syllabus parser. Extract ALL assignments, exams, quizzes, homework, projects, and deadlines from the uploaded syllabus document.

Return a JSON object with this exact schema:
{
  "course_name": "string or null — the course name/title if visible",
  "assignments": [
    {
      "title": "string — assignment name",
      "description": "string or null — brief description if available",
      "due_date": "string or null — due date in YYYY-MM-DD format",
      "due_time": "string or null — due time in HH:MM (24h) format, or null if not specified",
      "points_possible": "number or null — point value if listed"
    }
  ]
}

Rules:
- Extract EVERY graded item: homework, labs, projects, exams, quizzes, midterms, finals, papers, presentations, participation, readings, responses, journal entries
- Use YYYY-MM-DD format for dates. Try hard to find dates: check schedule tables, weekly breakdowns, course calendars, "Week of..." sections, and any date references near assignments
- If a syllabus lists assignments by week number or week date range (e.g. "Week 3: Jan 27"), calculate the due date from that context (assume due at end of that week, Friday, unless stated otherwise)
- If only a weekday is given (e.g. "due every Tuesday"), calculate specific dates based on the semester schedule
- Use 24-hour HH:MM format for times. If no time specified, set due_time to null
- If the year is not specified, assume the current academic year (2025-2026)
- For spring semester courses, dates are typically January-May 2026
- For fall semester courses, dates are typically August-December 2025
- Include point values when listed
- Number recurring assignments clearly (e.g. "Weekly Journal Writing #1", "Weekly Journal Writing #2") — do NOT collapse them into a single entry
- Return an empty assignments array if no assignments are found
- Return ONLY the JSON object, no additional text`;

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Pro-tier gating: free users get 1 lifetime upload. Read the counter from
  // integration_credentials (default 0 for users who haven't uploaded yet).
  const userIsPro = await isPro(user.id);
  if (!userIsPro) {
    const admin = createAdminClient();
    const { data: creds } = await admin
      .from("integration_credentials")
      .select("syllabus_upload_count")
      .eq("user_id", user.id)
      .maybeSingle();
    const usedCount = (creds?.syllabus_upload_count as number | undefined) ?? 0;
    if (usedCount >= FREE_SYLLABUS_LIMIT) {
      return NextResponse.json(
        {
          error: "Free plan allows 1 syllabus upload. Upgrade to Premium for unlimited uploads.",
          code: "pro_required",
        },
        { status: 402 },
      );
    }
  }

  // Rate limit: 10 requests per 60 seconds per user
  const { allowed } = rateLimit(`syllabus:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  // Validate API key is configured
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    logger.error("syllabus/extract: ANTHROPIC_API_KEY not configured");
    return NextResponse.json(
      { error: "Syllabus extraction is not configured" },
      { status: 503 }
    );
  }

  // Parse and validate request body
  let body: { file: string; mimeType: string; fileName: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { file, mimeType, fileName } = body;

  if (!file || !mimeType || !fileName) {
    return NextResponse.json(
      { error: "Missing required fields: file, mimeType, fileName" },
      { status: 400 }
    );
  }

  if (typeof file !== "string") {
    return NextResponse.json({ error: "file must be a base64 string" }, { status: 400 });
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return NextResponse.json(
      { error: `Unsupported file type: ${mimeType}. Allowed: PDF, PNG, JPG, WebP` },
      { status: 400 }
    );
  }

  // Guard against absurd raw-base64 payloads before doing any further work.
  // A 10 MB decoded file is ~13.4 MB as base64; we cap the raw string at 14 MB
  // to give a small buffer for data URL prefixes / whitespace.
  const MAX_BASE64_LENGTH = Math.ceil((MAX_FILE_SIZE_BYTES * 4) / 3) + 1024 * 1024;
  if (file.length > MAX_BASE64_LENGTH) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 413 }
    );
  }

  // Validate decoded file size (base64 is ~4/3 of original size)
  const fileSizeBytes = Math.ceil((file.length * 3) / 4);
  if (fileSizeBytes > MAX_FILE_SIZE_BYTES) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 10 MB." },
      { status: 413 }
    );
  }

  logger.info("syllabus/extract: starting extraction", {
    userId: user.id,
    fileName,
    mimeType,
    fileSizeKB: Math.round(fileSizeBytes / 1024),
  });

  try {
    const anthropic = new Anthropic({ apiKey });

    // Build the content block based on MIME type
    const contentBlock: Anthropic.Messages.ContentBlockParam =
      mimeType === "application/pdf"
        ? {
            type: "document",
            source: { type: "base64", media_type: mimeType, data: file },
          }
        : {
            type: "image",
            source: {
              type: "base64",
              media_type: mimeType as "image/png" | "image/jpeg" | "image/webp",
              data: file,
            },
          };

    const response = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            contentBlock,
            { type: "text", text: "Extract all assignments from this syllabus." },
          ],
        },
      ],
    });

    // Extract text from response
    const textBlock = response.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      logger.error("syllabus/extract: no text in Claude response", { userId: user.id });
      return NextResponse.json(
        { error: "Failed to extract assignments from the document" },
        { status: 500 }
      );
    }

    // Parse the JSON response — extract JSON from markdown fences or raw text
    let jsonText = textBlock.text.trim();
    // Strip markdown code fences (```json ... ``` or ``` ... ```)
    const fenceMatch = jsonText.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
      jsonText = fenceMatch[1];
    }
    // If still not valid JSON, try to extract the first { ... } block
    if (!jsonText.startsWith("{")) {
      const braceMatch = jsonText.match(/\{[\s\S]*\}/);
      if (braceMatch) {
        jsonText = braceMatch[0];
      }
    }

    let result: ExtractionResult;
    try {
      result = JSON.parse(jsonText);
    } catch {
      logger.error("syllabus/extract: failed to parse Claude JSON", {
        userId: user.id,
        rawResponse: jsonText.slice(0, 500),
      });
      return NextResponse.json(
        { error: "Failed to parse extraction results" },
        { status: 500 }
      );
    }

    // Validate and sanitize the result
    if (!Array.isArray(result.assignments)) {
      result.assignments = [];
    }

    result.assignments = result.assignments.map((a) => ({
      title: typeof a.title === "string" ? a.title : "Untitled Assignment",
      description: typeof a.description === "string" ? a.description : null,
      due_date: typeof a.due_date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(a.due_date) ? a.due_date : null,
      due_time: typeof a.due_time === "string" && /^\d{2}:\d{2}$/.test(a.due_time) ? a.due_time : null,
      points_possible: typeof a.points_possible === "number" ? a.points_possible : null,
    }));

    logger.info("syllabus/extract: extraction complete", {
      userId: user.id,
      courseName: result.course_name,
      assignmentCount: result.assignments.length,
    });

    // Increment the per-user upload counter so future free-tier requests are
    // gated. Only counts successful extractions so a failed upload doesn't
    // burn the user's free quota.
    try {
      const admin = createAdminClient();
      await admin.rpc("increment_syllabus_upload_count", { p_user_id: user.id }).single();
    } catch {
      // Fall back to a direct update if the RPC isn't deployed yet.
      const admin = createAdminClient();
      const { data: row } = await admin
        .from("integration_credentials")
        .select("syllabus_upload_count")
        .eq("user_id", user.id)
        .maybeSingle();
      const next = ((row?.syllabus_upload_count as number | undefined) ?? 0) + 1;
      await admin
        .from("integration_credentials")
        .upsert({ user_id: user.id, syllabus_upload_count: next }, { onConflict: "user_id" });
    }

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    logger.error("syllabus/extract: Claude API error", {
      userId: user.id,
      error: message,
    });
    return NextResponse.json(
      { error: "Failed to extract assignments. Please try again." },
      { status: 500 }
    );
  }
}
