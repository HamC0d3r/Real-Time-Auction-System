// import { ForgotPasswordPage } from "@/features/auth/components/forgot-password-page";

/**
 * Forgot password page — thin wrapper.
 * TODO: Import and render ForgotPasswordPage from the auth feature module.
 */
export default function Page() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Forgot password</h1>
        <p className="text-sm text-muted-foreground">
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>
    </div>
  );
}
