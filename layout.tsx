import Link from "next/link";
import { redirect } from "next/navigation";
import { LayoutDashboard, Package, Tags, Settings, LogOut, Store } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/actions/auth";

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Filet de sécurité en plus du middleware : jamais de rendu du dashboard
  // sans utilisateur authentifié.
  if (!user) redirect("/admin/login");

  const navItems = [
    { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/admin/produits", label: "Produits", icon: Package },
    { href: "/admin/categories", label: "Catégories", icon: Tags },
    { href: "/admin/parametres", label: "Paramètres", icon: Settings },
  ];

  return (
    <div className="mx-auto flex min-h-[80vh] max-w-6xl gap-6 px-4 py-6">
      <aside className="hidden w-56 shrink-0 flex-col gap-1 sm:flex">
        <div className="mb-4 flex items-center gap-2 px-2 font-display text-sm font-semibold text-ink-muted">
          <Store className="h-4 w-4" /> Administration
        </div>
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-muted"
          >
            <Icon className="h-4 w-4" /> {label}
          </Link>
        ))}
        <form action={logout} className="mt-4 border-t border-border pt-4">
          <button className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-danger hover:bg-danger/10">
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </form>
      </aside>

      {/* Navigation mobile */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex justify-around border-t border-border bg-surface py-2 sm:hidden">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-2 text-xs">
            <Icon className="h-5 w-5" />
            {label.split(" ")[0]}
          </Link>
        ))}
      </nav>

      <div className="min-w-0 flex-1 pb-16 sm:pb-0">{children}</div>
    </div>
  );
}
