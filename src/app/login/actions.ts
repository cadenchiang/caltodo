"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action to sign in a user with email and password.
 *
 * @param formData - FormData containing 'email' and 'password' fields
 * @returns Redirects to /app/inbox on success, or returns error message
 */
export async function signIn(formData: FormData): Promise<{ error: string } | void> {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/", "layout");
  redirect("/app/inbox");
}

/**
 * Server action to sign up a new user with email and password.
 *
 * @param formData - FormData containing 'email' and 'password' fields
 * @returns Redirects to login with success message, or returns error message
 */
export async function signUp(formData: FormData): Promise<{ error: string } | { success: string } | void> {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? headerStore.get("referer")?.replace(/\/login.*$/, "") ?? "";

  const { error } = await supabase.auth.signUp({
    ...data,
    options: {
      emailRedirectTo: `${origin}/auth/confirm`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  return { success: "Check your email for a confirmation link." };
}
