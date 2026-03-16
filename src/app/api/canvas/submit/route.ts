/**
 * POST /api/canvas/submit
 * Uploads a PDF file to Canvas and submits it for an assignment.
 *
 * Expects multipart form data:
 *   - file: PDF blob
 *   - courseId: Canvas course ID
 *   - assignmentId: Canvas assignment ID
 *
 * Uses the 3-step Canvas file upload flow:
 *   1. Notify Canvas of pending upload → get upload_url + params
 *   2. POST file to upload_url → get file ID
 *   3. Submit assignment with file ID
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

const TIMEOUT_MS = 30_000;

/**
 * Retrieves the user's Canvas token and base URL from integration_credentials.
 *
 * @param userId - Authenticated user ID
 * @returns Object with token and baseUrl, or null if not configured
 */
async function getCanvasCredentials(userId: string) {
  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();
  const { data } = await admin
    .from("integration_credentials")
    .select("canvas_token, canvas_base_url")
    .eq("user_id", userId)
    .single();

  if (!data?.canvas_token) return null;
  return {
    token: data.canvas_token,
    baseUrl: data.canvas_base_url || "https://bcourses.berkeley.edu",
  };
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`canvas-submit:${user.id}`, 10, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const creds = await getCanvasCredentials(user.id);
  if (!creds) {
    return NextResponse.json({ error: "Canvas not connected" }, { status: 400 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const courseId = formData.get("courseId") as string | null;
  const assignmentId = formData.get("assignmentId") as string | null;

  if (!file || !courseId || !assignmentId) {
    return NextResponse.json({ error: "Missing file, courseId, or assignmentId" }, { status: 400 });
  }

  const { token, baseUrl } = creds;
  const headers = { Authorization: `Bearer ${token}` };

  try {
    // Pre-check: verify assignment accepts file uploads
    const checkRes = await fetch(
      `${baseUrl}/api/v1/courses/${courseId}/assignments/${assignmentId}`,
      { headers, signal: AbortSignal.timeout(TIMEOUT_MS) }
    );
    if (checkRes.ok) {
      const assignmentData = await checkRes.json();
      const submissionTypes: string[] = assignmentData.submission_types || [];
      if (!submissionTypes.includes("online_upload")) {
        const accepted = submissionTypes.join(", ") || "none";
        logger.warn("canvas-submit:no-upload-type", { courseId, assignmentId, submissionTypes });
        return NextResponse.json(
          { error: `This assignment doesn't accept file uploads (accepts: ${accepted})` },
          { status: 400 }
        );
      }
    }

    // Step 1: Notify Canvas of the file upload
    logger.info("canvas-submit:step1", { courseId, assignmentId, fileName: file.name, fileSize: file.size });

    const step1Res = await fetch(
      `${baseUrl}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions/self/files`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          name: file.name,
          size: file.size,
          content_type: "application/pdf",
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );

    if (!step1Res.ok) {
      const errText = await step1Res.text();
      logger.error("canvas-submit:step1-failed", { status: step1Res.status, body: errText });
      const friendlyMsg = step1Res.status === 403
        ? "Permission denied — this assignment may be locked or doesn't accept file uploads"
        : step1Res.status === 404
          ? "Assignment not found on Canvas"
          : `Canvas upload failed (${step1Res.status})`;
      return NextResponse.json(
        { error: friendlyMsg },
        { status: step1Res.status }
      );
    }

    const step1Data = await step1Res.json();
    const { upload_url, upload_params } = step1Data;

    // Step 2: Upload the actual file to Canvas (or S3)
    logger.info("canvas-submit:step2", { uploadUrl: upload_url });

    const uploadForm = new FormData();
    for (const [key, value] of Object.entries(upload_params)) {
      uploadForm.append(key, value as string);
    }
    uploadForm.append("file", file);

    const step2Res = await fetch(upload_url, {
      method: "POST",
      body: uploadForm,
      signal: AbortSignal.timeout(TIMEOUT_MS),
      redirect: "manual",
    });

    let fileId: number | null = null;

    if (step2Res.status >= 300 && step2Res.status < 400) {
      // 3XX redirect — follow it with GET to complete upload
      const location = step2Res.headers.get("location");
      if (location) {
        const confirmRes = await fetch(location, {
          headers,
          signal: AbortSignal.timeout(TIMEOUT_MS),
        });
        const confirmData = await confirmRes.json();
        fileId = confirmData.id;
      }
    } else if (step2Res.status === 201) {
      const step2Data = await step2Res.json();
      fileId = step2Data.id;
    } else {
      const errText = await step2Res.text();
      logger.error("canvas-submit:step2-failed", { status: step2Res.status, body: errText });
      return NextResponse.json(
        { error: `File upload failed: ${step2Res.status}` },
        { status: 500 }
      );
    }

    if (!fileId) {
      logger.error("canvas-submit:no-file-id", {});
      return NextResponse.json({ error: "Failed to get file ID from Canvas" }, { status: 500 });
    }

    // Step 3: Submit the assignment with the uploaded file
    logger.info("canvas-submit:step3", { fileId });

    const step3Res = await fetch(
      `${baseUrl}/api/v1/courses/${courseId}/assignments/${assignmentId}/submissions`,
      {
        method: "POST",
        headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({
          submission: {
            submission_type: "online_upload",
            file_ids: [fileId],
          },
        }),
        signal: AbortSignal.timeout(TIMEOUT_MS),
      }
    );

    if (!step3Res.ok) {
      const errText = await step3Res.text();
      logger.error("canvas-submit:step3-failed", { status: step3Res.status, body: errText });
      return NextResponse.json(
        { error: `Submission failed: ${step3Res.status}` },
        { status: step3Res.status }
      );
    }

    const submissionData = await step3Res.json();
    logger.info("canvas-submit:success", { submissionId: submissionData.id });

    return NextResponse.json({ success: true, submissionId: submissionData.id });
  } catch (err) {
    logger.error("canvas-submit:error", { error: (err as Error).message });
    return NextResponse.json({ error: "Submission failed unexpectedly" }, { status: 500 });
  }
}
