import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  LayoutTemplate,
  Mail,
  BarChart3,
  ShieldCheck,
  Users,
  LogOut,
  Moon,
  Sun,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/", label: "Ընդհանուր", icon: LayoutDashboard, exact: true },
  { to: "/templates", label: "Թեմփլեյթներ", icon: LayoutTemplate },
  { to: "/invitations", label: "Հրավիրատոմսեր", icon: Mail },
  { to: "/rsvp", label: "RSVP", icon: Users },
  { to: "/analytics", label: "Անալիտիկա", icon: BarChart3 },
  { to: "/audit-logs", label: "Audit Log", icon: ShieldCheck },
];

function useDarkMode() {
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("amorette_theme") === "dark";
  });
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("amorette_theme", dark ? "dark" : "light");
  }, [dark]);
  return { dark, toggle: () => setDark((v) => !v) };
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { dark, toggle } = useDarkMode();

  useEffect(() => {
    if (!loading && !isAuthenticated && location.pathname !== "/login") {
      navigate({ to: "/login" });
    }
  }, [loading, isAuthenticated, location.pathname, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="font-display text-2xl text-luxe">Amorette</div>
      </div>
    );
  }

  if (!isAuthenticated) return <>{children}</>;

  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 border-r border-border/60 bg-sidebar/60 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-2 px-6 py-6">
          <div className="rounded-xl bg-luxe p-2 shadow-lg">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <div className="font-display text-2xl leading-none text-luxe">Amorette</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Admin Studio</div>
          </div>
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.exact
              ? location.pathname === n.to
              : location.pathname.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                  active
                    ? "bg-primary/10 text-primary shadow-sm"
                    : "text-muted-foreground hover:bg-sidebar-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border/60 p-4">
          <div className="mb-3 flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-luxe text-sm font-semibold text-primary-foreground">
              {user?.email?.[0]?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-foreground">{user?.email ?? "Admin"}</div>
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{user?.role ?? "Administrator"}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={toggle}>
              {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              <span className="ml-1">{dark ? "Light" : "Dark"}</span>
            </Button>
            <Button variant="ghost" size="sm" onClick={() => logout().then(() => navigate({ to: "/login" }))}>
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b border-border/40 bg-background/60 px-4 py-3 backdrop-blur-xl lg:px-8">
          <div className="flex items-center justify-between">
            <div className="lg:hidden font-display text-xl text-luxe">Amorette</div>
            <div className="hidden text-sm text-muted-foreground lg:block">
              {new Date().toLocaleDateString("hy-AM", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
            </div>
            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" size="icon" onClick={toggle}>
                {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={() => logout().then(() => navigate({ to: "/login" }))}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
        <nav className="sticky bottom-0 z-30 mt-6 grid grid-cols-6 gap-1 border-t border-border/60 bg-background/80 p-2 backdrop-blur-xl lg:hidden">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = n.exact ? location.pathname === n.to : location.pathname.startsWith(n.to);
            return (
              <Link key={n.to} to={n.to} className={cn(
                "flex flex-col items-center gap-1 rounded-lg p-2 text-[10px]",
                active ? "text-primary" : "text-muted-foreground"
              )}>
                <Icon className="h-4 w-4" />
              </Link>
            );
          })}
        </nav>
      </main>
    </div>
  );
}