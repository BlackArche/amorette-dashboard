import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Mail, LayoutTemplate, Users, BarChart3, ArrowUpRight, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { StatCard } from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { listInvitations } from "@/lib/invitations-api";
import { listTemplates } from "@/lib/templates-api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/")({
  component: () => (
    <AppShell>
      <Dashboard />
    </AppShell>
  ),
});

function Dashboard() {
  const invitations = useQuery({ queryKey: ["invitations", { limit: 5 }], queryFn: () => listInvitations({ limit: 5 }) });
  const templates = useQuery({ queryKey: ["templates", { limit: 4 }], queryFn: () => listTemplates({ limit: 4 }) });

  const totalInv = invitations.data?.items.length ?? 0;
  const totalTpl = templates.data?.items.length ?? 0;
  const totalRsvp = invitations.data?.items.reduce((s, i) => s + (i.rsvpCount ?? 0), 0) ?? 0;
  const totalViews = invitations.data?.items.reduce((s, i) => s + (i.views ?? 0), 0) ?? 0;

  return (
    <div>
      <PageHeader
        eyebrow="Amorette Studio"
        title="Բարի վերադարձ ✨"
        description="Կառավարեք ձեր թվային հրավիրատոմսերը, թեմփլեյթներն ու հյուրերին մեկ էլեգանտ վահանակից։"
        actions={
          <Link to="/invitations/new">
            <Button className="bg-luxe text-primary-foreground shadow-lg hover:opacity-95">
              <Sparkles className="mr-2 h-4 w-4" /> Նոր հրավիրատոմս
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Հրավիրատոմսեր" value={totalInv} icon={<Mail className="h-4 w-4" />} tone="pink" delay={0} />
        <StatCard label="Թեմփլեյթներ" value={totalTpl} icon={<LayoutTemplate className="h-4 w-4" />} tone="gold" delay={0.05} />
        <StatCard label="RSVP" value={totalRsvp} icon={<Users className="h-4 w-4" />} tone="emerald" delay={0.1} />
        <StatCard label="Դիտումներ" value={totalViews} icon={<BarChart3 className="h-4 w-4" />} tone="pink" delay={0.15} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-3xl p-6 lg:col-span-2"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl">Վերջին հրավիրատոմսերը</h3>
            <Link to="/invitations" className="text-sm text-primary hover:underline">Բոլորը</Link>
          </div>
          {invitations.isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : (invitations.data?.items.length ?? 0) === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">Դեռ չկան հրավիրատոմսեր</p>
          ) : (
            <ul className="divide-y divide-border/60">
              {invitations.data!.items.map((inv) => (
                <li key={inv._id} className="flex items-center justify-between py-3">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">
                      {inv.couple?.bride?.name || "—"} & {inv.couple?.groom?.name || "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      /{inv.slug}/{inv.dateSlug} · {formatDate(inv.date)}
                    </div>
                  </div>
                  <Link to="/invitations/$id" params={{ id: inv._id }} className="rounded-full p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary">
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass rounded-3xl p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-xl">Թեմփլեյթներ</h3>
            <Link to="/templates" className="text-sm text-primary hover:underline">Բոլորը</Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {(templates.data?.items ?? []).slice(0, 4).map((t) => (
              <Link key={t._id} to="/templates" className="group overflow-hidden rounded-2xl border border-border/60">
                <div className="aspect-[3/4] bg-luxe">
                  {t.mainImage ? (
                    <img src={t.mainImage} alt={t.name} className="h-full w-full object-cover transition group-hover:scale-105" />
                  ) : null}
                </div>
                <div className="p-2 text-xs">
                  <div className="truncate font-medium">{t.name}</div>
                  <div className="text-muted-foreground">{t.category ?? "—"}</div>
                </div>
              </Link>
            ))}
            {(templates.data?.items ?? []).length === 0 && (
              <p className="col-span-2 py-6 text-center text-sm text-muted-foreground">Թեմփլեյթներ չկան</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
