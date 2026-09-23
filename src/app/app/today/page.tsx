import { redirect } from "next/navigation";

/**
 * /app/today is kept as a route for old links, installed PWAs and push
 * notifications, but it no longer renders its own list. The inbox's Today
 * filter (due today or overdue, plus undated) is the one "today" view, so
 * this redirects there with the filter preselected. The ?task= deep link
 * from a reminder is carried across.
 *
 * @param searchParams - Incoming query; only `task` is forwarded
 */
export default async function TodayPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const task = typeof params.task === "string" ? params.task : null;
  const query = new URLSearchParams({ filter: "today" });
  if (task) query.set("task", task);
  redirect(`/app/inbox?${query.toString()}`);
}
