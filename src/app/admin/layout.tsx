import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (
    !session?.user?.role ||
    !["ADMIN", "SUPERADMIN", "EDITOR"].includes(session.user.role)
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="w-56 bg-gray-900 text-white p-4">
        <h2 className="text-lg font-bold mb-6">Admin Panel</h2>
        <nav className="space-y-1">
          <Link
            href="/admin"
            className="block px-3 py-2 rounded hover:bg-gray-800 text-sm"
          >
            Overview
          </Link>
          <Link
            href="/admin/scenarios"
            className="block px-3 py-2 rounded hover:bg-gray-800 text-sm"
          >
            Scenarios
          </Link>
          <Link
            href="/admin/steps"
            className="block px-3 py-2 rounded hover:bg-gray-800 text-sm"
          >
            Steps
          </Link>
          <Link
            href="/admin/users"
            className="block px-3 py-2 rounded hover:bg-gray-800 text-sm"
          >
            Users
          </Link>
        </nav>
      </aside>
      <div className="flex-1 bg-gray-50 p-8">{children}</div>
    </div>
  );
}
