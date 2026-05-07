/**
 * Admin layout — wraps all admin pages.
 *
 * TODO: Add admin sidebar navigation, role-based access guard,
 * and admin-specific styling.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* TODO: Admin sidebar */}
      <div className="flex-1">{children}</div>
    </div>
  );
}
