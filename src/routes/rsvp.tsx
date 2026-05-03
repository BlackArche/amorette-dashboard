import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Users } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { listInvitations } from "@/lib/invitations-api";
import { formatDate } from "@/lib/format";

export const Route = createFileRoute("/rsvp")({
  component: () => (
    <AppShell>
      <RsvpPage />
    </AppShell>
  ),
});

function RsvpPage() {
  const { data, isLoading } = useQuery({ queryKey: ["invitations", "rsvp"], queryFn: () => listInvitations({ limit: 100 }) });
  return (
    <div>
      <PageHeader eyebrow="Հյուրեր" title="RSVP վահանակ" description="Դիտեք պատասխանները ըստ հրավիրատոմսերի։" />
      {isLoading ? <Loading /> : (data?.items.length ?? 0) === 0 ? (
        <EmptyState title="RSVP-ներ չկան" description="Հրավիրատոմս ստեղծելուն պես դիտումները կհայտնվեն այստեղ։" />
      ) : (
        <div className="glass overflow-hidden rounded-3xl">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-5 py-3">Զույգ</th>
                <th className="px-5 py-3">Ամսաթիվ</th>
                <th className="px-5 py-3">Slug</th>
                <th className="px-5 py-3 text-right">RSVP</th>
                <th className="px-5 py-3 text-right">Դիտումներ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {data!.items.map((i) => (
                <tr key={i._id} className="transition hover:bg-primary/5">
                  <td className="px-5 py-3 font-medium">{i.couple?.bride?.name || "—"} & {i.couple?.groom?.name || "—"}</td>
                  <td className="px-5 py-3 text-muted-foreground">{formatDate(i.date)}</td>
                  <td className="px-5 py-3 text-muted-foreground">/{i.slug}/{i.dateSlug}</td>
                  <td className="px-5 py-3 text-right">
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald/10 px-2 py-0.5 text-emerald">
                      <Users className="h-3 w-3" />{i.rsvpCount ?? 0}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-muted-foreground">{i.views ?? 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}