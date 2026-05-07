/**
 * Auth route group layout.
 *
 * Provides a centered layout without the main header/footer,
 * suitable for login, register, and forgot-password pages.
 * 
 * NOTE: For the Register page, the layout is handled by AuthSplitLayout 
 * directly inside the page to allow for full-screen bleed, but we keep this 
 * basic wrapper for other auth pages.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {children}
    </div>
  );
}
