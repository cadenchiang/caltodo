/**
 * One-off script to copy course memberships from one user to another.
 * Usage: npx tsx scripts/enroll-user.ts
 */

import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const envFile = readFileSync(resolve(__dirname, "../.env.local"), "utf-8");
for (const line of envFile.split("\n")) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const SOURCE_EMAIL = "cadenchiang@berkeley.edu";
const TARGET_EMAIL = "cadenchiangjunk@gmail.com";

async function main() {
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  // Find both users
  const { data: usersData } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const users = usersData?.users ?? [];

  const sourceUser = users.find((u) => u.email === SOURCE_EMAIL);
  const targetUser = users.find((u) => u.email === TARGET_EMAIL);

  if (!sourceUser) {
    console.error(`Source user ${SOURCE_EMAIL} not found`);
    process.exit(1);
  }
  if (!targetUser) {
    console.error(`Target user ${TARGET_EMAIL} not found. Have they signed in yet?`);
    process.exit(1);
  }

  console.log(`Source: ${sourceUser.email} (${sourceUser.id})`);
  console.log(`Target: ${targetUser.email} (${targetUser.id})`);

  // Get source user's course memberships
  const { data: memberships, error: fetchError } = await supabase
    .from("course_memberships")
    .select("course_id")
    .eq("user_id", sourceUser.id);

  if (fetchError) {
    console.error("Failed to fetch memberships:", fetchError.message);
    process.exit(1);
  }

  if (!memberships || memberships.length === 0) {
    console.log("Source user has no course memberships.");
    return;
  }

  console.log(`Found ${memberships.length} course memberships to copy.`);

  // Insert memberships for target user (skip duplicates)
  let added = 0;
  for (const m of memberships) {
    const { error: insertError } = await supabase
      .from("course_memberships")
      .upsert(
        { user_id: targetUser.id, course_id: m.course_id },
        { onConflict: "user_id,course_id" }
      );

    if (insertError) {
      console.error(`  Failed to enroll in ${m.course_id}: ${insertError.message}`);
    } else {
      added++;
      console.log(`  Enrolled in ${m.course_id}`);
    }
  }

  console.log(`Done. Enrolled ${added}/${memberships.length} courses.`);
}

main().catch(console.error);
