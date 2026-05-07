import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

/**
 * Main route group layout.
 *
 * Wraps all authenticated/public app routes with the standard
 * Header and Footer chrome.
 */
export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}
