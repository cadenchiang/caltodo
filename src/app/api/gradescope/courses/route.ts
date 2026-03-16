/**
 * API route for fetching Gradescope courses.
 * POST /api/gradescope/courses
 * Accepts email and password in body, logs in and returns course list.
 * If no body provided, uses stored credentials.
 */

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { gradescopeLogin, fetchGradescopeCourses } from "@/lib/gradescope-client";
import { decrypt } from "@/lib/crypto";
import { logger } from "@/lib/logger";
import { rateLimit } from "@/lib/rate-limit";

/**
 * POST /api/gradescope/courses
 * Returns list of Gradescope courses for the user.
 * Body: { email?: string, password?: string }
 */
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { allowed } = rateLimit(`gradescope-courses:${user.id}`, 30, 60_000);
  if (!allowed) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let email: string;
  let password: string;

  try {
    const body = await request.json().catch(() => ({}));

    if (body.email && body.password) {
      email = body.email;
      password = body.password;
    } else {
      const { data: creds } = await supabase
        .from("integration_credentials")
        .select("gradescope_email, gradescope_password_encrypted")
        .eq("user_id", user.id)
        .single();

      if (!creds?.gradescope_email || !creds?.gradescope_password_encrypted) {
        return NextResponse.json(
          { error: "No Gradescope credentials configured." },
          { status: 400 }
        );
      }

      email = creds.gradescope_email;
      password = decrypt(creds.gradescope_password_encrypted);
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  try {
    const jar = await gradescopeLogin(email, password);
    const courses = await fetchGradescopeCourses(jar);
    logger.info("POST /api/gradescope/courses success", { userId: user.id, courseCount: courses.length });
    return NextResponse.json({ courses });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const isAuthError = message.toLowerCase().includes("login failed");
    logger.error("POST /api/gradescope/courses failed", { userId: user.id, error: message });
    return NextResponse.json(
      { error: message },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
