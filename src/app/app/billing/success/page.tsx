import Link from "next/link";
import { CheckIcon, ArrowRight } from "lucide-react";

/**
 * Post-checkout success page. Stripe sends the user here after they pay.
 * The webhook may not have arrived yet, but it's fine — the row updates
 * within a few seconds and the next entitlement fetch picks it up.
 */
export default function BillingSuccessPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0e89d6]/10 text-[#0e89d6] mb-5">
          <CheckIcon size={28} strokeWidth={2.5} />
        </div>
        <h1 className="text-2xl font-bold text-foreground tracking-tight">
          You&rsquo;re Pro
        </h1>
        <p className="text-sm text-muted-foreground mt-2 leading-snug">
          Everything in Pro is unlocked. Build your board, sync Google
          Calendar, upload every syllabus, you know the drill.
        </p>
        <Link
          href="/app/home"
          className="mt-6 inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0e89d6] text-white text-sm font-semibold hover:bg-[#3D8FE8] transition-colors"
        >
          Open your board
          <ArrowRight size={14} strokeWidth={2.5} />
        </Link>
        <p className="text-[11px] text-muted-foreground mt-4">
          Receipt has been emailed to you. Manage your subscription from Settings &rarr; Account at any time.
        </p>
      </div>
    </div>
  );
}
