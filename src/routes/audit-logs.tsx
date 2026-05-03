import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ShieldCheck } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { api } from "@/lib/api";
import { formatDateTime } from "@/lib/format";

interface LogEntry { _id?: string; id?: string; action?: string; actor?: string; actorEmail?: string; ip?: string; userAgent?: string; createdAt?: string; meta?: unknown }

export const Route = createFileRoute("/audit-logs")({
  component: () => (
    <AppShell>
      <AuditLogs />
    </AppShell>
  ),
});

function AuditLogs() {
  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs"],
    queryFn: async () => {
      const { data } = await api.get("/api/audit-logs/", { params: { limit: 50 } });
      return (data?.items ?? data?.logs ?? data?.data ?? data ?? []) as LogEntry[];
    },
  });
  const logs = Array.isArray(data) ? data : [];

  return (
    <div>
      <PageHeader eyebrow="Անվտանգություն" title="Audit Log" description="Համակարգի գործողությունների մատյանը։" />
      {isLoading ? <Loading /> : logs.length === 0 ? (
        <EmptyState title="Մատյանը դատարկ է" description="Գործողությունները կհայտնվեն այստեղ։" />
      ) : (
        <div className="glass overflow-hidden rounded-3xl">
          <ul className="divide-y divide-border/60">
            {logs.map((l, i) => (
              <li key={l._id ?? l.id ?? i} className="flex items-start gap-3 p-4">
                <div className="rounded-xl bg-luxe/10 p-2 text-primary"><ShieldCheck className="h-4 w-4" /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-foreground">{l.action ?? "—"}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(l.createdAt)}</div>
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">
                    {l.actorEmail ?? l.actor ?? "Unknown"} {l.ip ? `· ${l.ip}` : ""}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}