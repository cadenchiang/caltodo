"use client";

import { useState, useEffect, useRef, type FormEvent } from "react";
import { ShieldCheck } from "lucide-react";
import { extractCourseCode } from "@/lib/course-name-merge";
import { useToast } from "@/contexts/ToastContext";
import Button from "@/components/ui/Button";
import TextField from "@/components/ui/TextField";
import CoursePicker from "@/components/onboarding/CoursePicker";
import GradescopeAuthHelp from "@/components/onboarding/GradescopeAuthHelp";
import GradescopeMergeDialog from "@/components/onboarding/GradescopeMergeDialog";
import SecretField from "@/components/onboarding/SecretField";
import { StepHeading } from "@/components/onboarding/StepChrome";

interface GradescopeCourse {
  id: string;
  name: string;
  shortName: string;
}

interface GradescopeStepProps {
  onNext: (payload: {
    gradescope_email: string;
    gradescope_password: string;
    selected_gradescope_courses: Array<{ id: string; name: string }>;
  }) => Promise<boolean>;
  onSkip: () => void;
  saving: boolean;
  error: string | null;
  setError: (error: string | null) => void;
  /** Persisted draft state from a previous visit to this step. */
  initialEmail?: string;
  initialPassword?: string;
  initialCourses?: GradescopeCourse[] | null;
  initialSelectedIds?: string[];
  /** Called on unmount to persist draft state across step navigation. */
  onDraftChange?: (draft: { email: string; password: string; courses: GradescopeCourse[] | null; selectedIds: string[] }) => void;
  /** Already-selected Canvas courses (for detecting overlaps). */
  existingCanvasCourses?: Array<{ id: number; name: string }>;
}

/** Minimum gap between verification attempts. */
const VERIFY_COOLDOWN_MS = 2000;

/**
 * Finds Gradescope classes whose course code matches a selected Canvas class.
 *
 * @param fetched - Classes returned by Gradescope
 * @param canvas - Canvas classes the user already selected
 * @returns The overlapping Gradescope classes, in Gradescope order
 */
export function findOverlappingCourses(
  fetched: GradescopeCourse[],
  canvas: Array<{ name: string }> | undefined
): GradescopeCourse[] {
  if (!canvas || canvas.length === 0) return [];
  const codes = new Set(canvas.map((c) => extractCourseCode(c.name)).filter(Boolean) as string[]);
  return fetched.filter((gc) => {
    const code = extractCourseCode(gc.name);
    return Boolean(code && codes.has(code));
  });
}

/**
 * Gradescope onboarding step: email and password, verify, pick classes, save.
 *
 * @param onNext - Saves credentials; resolves true on success
 * @param saving - Whether the parent is saving
 * @param setError - Clears or sets the flow-level error
 * @param initialEmail - Draft or stored email; adopted while the field is empty
 * @param existingCanvasCourses - Used to offer merging matching classes
 */
export default function GradescopeStep({ onNext, saving, setError, initialEmail, initialPassword, initialCourses, initialSelectedIds, onDraftChange, existingCanvasCourses }: GradescopeStepProps) {
  const { showToast } = useToast();
  const [email, setEmail] = useState(initialEmail ?? "");
  const [password, setPassword] = useState(initialPassword ?? "");
  const [verifying, setVerifying] = useState(false);
  const [courses, setCourses] = useState<GradescopeCourse[] | null>(initialCourses ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set(initialSelectedIds ?? []));
  const [showMergeModal, setShowMergeModal] = useState(false);
  /** Whether the last verification attempt returned 401 (wrong password or SSO user). */
  const [authFailed, setAuthFailed] = useState(false);
  const [overlappingCourses, setOverlappingCourses] = useState<GradescopeCourse[]>([]);
  const lastVerifyRef = useRef<number>(0);

  // In standalone retry mode the saved email arrives from a fetch after this
  // step has mounted, so the useState initializer above never saw it. Adopt
  // it when it changes, but only while the field is still empty so a value
  // the user has started typing is never overwritten.
  const [seenInitialEmail, setSeenInitialEmail] = useState(initialEmail);
  if (initialEmail !== seenInitialEmail) {
    setSeenInitialEmail(initialEmail);
    if (initialEmail && email === "") setEmail(initialEmail);
  }

  const draftRef = useRef({ email, password, courses, selectedIds: Array.from(selectedIds) });
  useEffect(() => {
    draftRef.current = { email, password, courses, selectedIds: Array.from(selectedIds) };
  });
  useEffect(() => {
    return () => { onDraftChange?.(draftRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Verifies credentials by fetching classes; shows the picker on success. */
  async function handleVerify(e: FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Please enter both your email and password.", { variant: "error", duration: 4000 });
      return;
    }
    const now = Date.now();
    if (now - lastVerifyRef.current < VERIFY_COOLDOWN_MS) return;
    lastVerifyRef.current = now;

    setVerifying(true);
    setError(null);
    setAuthFailed(false);
    try {
      const res = await fetch("/api/gradescope/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          setAuthFailed(true);
          // The help text below explains the SSO case; the toast is the
          // immediate signal that the attempt was rejected.
          showToast("Gradescope rejected that email or password.", { variant: "error", duration: 4000 });
          return;
        }
        if (res.status >= 500 && res.status < 600) throw new Error("Server error. Please try again later.");
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Verification failed: ${res.status}`);
      }
      const data = await res.json();
      const fetched: GradescopeCourse[] = data.courses;
      setCourses(fetched);
      setSelectedIds(new Set());
      const overlaps = findOverlappingCourses(fetched, existingCanvasCourses);
      if (overlaps.length > 0) {
        setOverlappingCourses(overlaps);
        setShowMergeModal(true);
      }
    } catch (err) {
      if (err instanceof TypeError) showToast("Network error. Check your connection.", { variant: "error", duration: 4000 });
      else showToast(err instanceof Error ? err.message : String(err), { variant: "error", duration: 4000 });
    } finally {
      setVerifying(false);
    }
  }

  /** Saves credentials and the picked classes. */
  async function handleSaveAndNext(e: FormEvent) {
    e.preventDefault();
    if (!courses) return;
    const selected = courses.filter((c) => selectedIds.has(c.id)).map((c) => ({ id: c.id, name: c.name }));
    await onNext({ gradescope_email: email.trim(), gradescope_password: password.trim(), selected_gradescope_courses: selected });
  }

  function toggleCourse(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const canVerify = Boolean(email.trim() && password.trim());

  return (
    <div>
      <StepHeading provider="gradescope" />

      {!courses && (
        <form onSubmit={handleVerify} noValidate className="text-left">
          <p className="text-xs text-muted-foreground mb-4 flex items-center gap-1.5">
            <ShieldCheck size={13} className="shrink-0" aria-hidden="true" />
            <span>Encrypted with AES-256. Only you can see it.</span>
          </p>
          <div className="flex flex-col gap-3 mb-5">
            <TextField
              label="School email"
              type="text"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@school.edu"
              autoComplete="new-password"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore
              name="gs-email-nofill"
            />
            <SecretField
              label="Gradescope password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              autoComplete="new-password"
              data-form-type="other"
              data-lpignore="true"
              data-1p-ignore
              name="gs-pass-nofill"
            />
          </div>
          <Button type="submit" variant="inverted" size="lg" className="w-full" loading={verifying} disabled={saving || !canVerify}>
            {verifying ? "Verifying..." : "Connect"}
          </Button>
          {authFailed && <GradescopeAuthHelp />}
        </form>
      )}

      {courses && (
        <form onSubmit={handleSaveAndNext} noValidate>
          <CoursePicker
            courses={courses}
            selectedIds={selectedIds}
            onToggle={toggleCourse}
            onSetSelection={(ids) => setSelectedIds(new Set(ids))}
            emptyState={<div className="px-3 py-4"><GradescopeAuthHelp /></div>}
          />
          <Button type="submit" variant="inverted" size="lg" className="w-full" loading={saving}>
            {saving ? "Saving..." : selectedIds.size > 0 ? "Save and continue" : "Continue"}
          </Button>
        </form>
      )}

      <GradescopeMergeDialog
        open={showMergeModal && overlappingCourses.length > 0}
        overlapping={overlappingCourses}
        onDecline={() => setShowMergeModal(false)}
        onMerge={() => {
          setSelectedIds((prev) => {
            const next = new Set(prev);
            overlappingCourses.forEach((c) => next.add(c.id));
            return next;
          });
          setShowMergeModal(false);
        }}
      />
    </div>
  );
}
