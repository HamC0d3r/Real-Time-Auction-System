import { LoginForm } from "@/features/auth/components/login-form";
import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { createPageMetadata } from "@/components/seo/metadata";

export const metadata = createPageMetadata({
  title: "Sign In",
  description: "Sign in to your MazadZone account to bid on exclusive items.",
  path: "/login",
});

/**
 * Login page
 * Composes the AuthSplitLayout and the LoginForm.
 */
export default function Page() {
  return (
    <AuthSplitLayout>
      <LoginForm />
    </AuthSplitLayout>
  );
}
