import { RegisterForm } from "@/features/auth/components/register-form";
import { AuthSplitLayout } from "@/features/auth/components/auth-split-layout";
import { createPageMetadata } from "@/components/seo/metadata";

export const metadata = createPageMetadata({
  title: "Create Account",
  description: "Join MazadZoon to start bidding on exclusive items.",
  path: "/register",
});

/**
 * Register page
 * Composes the AuthSplitLayout and the RegisterForm.
 */
export default function Page() {
  return (
    <AuthSplitLayout>
      <RegisterForm />
    </AuthSplitLayout>
  );
}
