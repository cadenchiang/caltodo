import LoginForm from "@/components/auth/LoginForm";

/**
 * Login page with centered glassy form card.
 */
export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="glass-strong rounded-3xl shadow-2xl p-8 w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
