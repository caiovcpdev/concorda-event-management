import { Link, useRouterState } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarDays,
  Users,
  ClipboardList,
  Wallet,
  MapPin,
  LogOut,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/eventos", label: "Eventos", icon: CalendarDays },
  { to: "/trabalhadores", label: "Trabalhadores", icon: Users },
  { to: "/escalas", label: "Escalas", icon: ClipboardList },
  { to: "/pagamentos", label: "Pagamentos", icon: Wallet },
  { to: "/checkin", label: "Check-in", icon: MapPin },
] as const;

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const { user, logout } = useAuth();

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/40 md:hidden" onClick={onClose} />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-4">
          <div className="grid h-8 w-8 place-items-center rounded bg-primary font-bold text-primary-foreground">
            C
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-white">ConcordaAI</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
              Gestão de Eventos
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {nav.map((n) => {
            const active = pathname === n.to || pathname.startsWith(n.to + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.to}
                to={n.to}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground/80 hover:bg-white/5 hover:text-white",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className="mb-2 px-2 text-xs text-sidebar-foreground/70">
            <div className="truncate font-medium text-white">{user?.email ?? "Usuário"}</div>
            <div className="truncate">
              {Array.isArray(user?.role) ? user?.role.join(", ") : user?.role ?? ""}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-sidebar-foreground/80 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Sair
          </button>
        </div>
      </aside>
    </>
  );
}

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b bg-topbar px-4 text-topbar-foreground shadow-sm">
      <button
        onClick={onMenuClick}
        className="rounded p-2 hover:bg-muted md:hidden"
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </button>
      <div className="text-sm font-medium">Painel Administrativo</div>
      <div className="ml-auto flex items-center gap-3">
        <div className="text-right text-xs">
          <div className="font-medium">{user?.email ?? "—"}</div>
          <div className="text-muted-foreground">
            {Array.isArray(user?.role) ? user?.role.join(", ") : user?.role ?? "—"}
          </div>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
          {(user?.email ?? "U").slice(0, 1).toUpperCase()}
        </div>
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={open} onClose={() => setOpen(false)} />
      <div className="md:pl-64">
        <Topbar onMenuClick={() => setOpen(true)} />
        <main className="p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
