import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, ArrowUpRight, Eye, Users } from "lucide-react";
import { motion } from "framer-motion";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { listInvitations, deleteInvitation } from "@/lib/invitations-api";
import { formatDate } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/invitations/")({
  component: () => (
    <AppShell>
      <InvitationsList />
    </AppShell>
  ),
});

function InvitationsList() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["invitations"], queryFn: () => listInvitations({ limit: 50 }) });
  const del = useMutation({
    mutationFn: (id: string) => deleteInvitation(id),
    onSuccess: () => { toast.success("Ջնջվեց"); qc.invalidateQueries({ queryKey: ["invitations"] }); },
    onError: () => toast.error("Չհաջողվեց ջնջել"),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Հրավիրատոմսեր"
        title="Բոլոր հրավիրատոմսերը"
        description="Կառավարեք ակտիվ ու սևագիր հրավիրատոմսերը։"
        actions={
          <Link to="/invitations/new">
            <Button className="bg-luxe text-primary-foreground hover:opacity-95">
              <Plus className="mr-2 h-4 w-4" /> Նոր հրավիրատոմս
            </Button>
          </Link>
        }
      />
      {isLoading ? <Loading /> : (data?.items.length ?? 0) === 0 ? (
        <EmptyState
          title="Դեռ չկան հրավիրատոմսեր"
          description="Ստեղծեք ձեր առաջին թվային հրավիրատոմսը։"
          action={<Link to="/invitations/new"><Button className="bg-luxe text-primary-foreground">Սկսել</Button></Link>}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data!.items.map((inv, i) => (
            <motion.div
              key={inv._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass overflow-hidden rounded-3xl"
            >
              <div className="relative h-36 bg-luxe">
                {inv.media?.couplePhoto && (
                  <img src={inv.media.couplePhoto} alt="" className="h-full w-full object-cover opacity-90" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4 text-primary-foreground">
                  <div className="font-display text-lg leading-tight drop-shadow">
                    {inv.couple?.bride?.name || "—"} & {inv.couple?.groom?.name || "—"}
                  </div>
                  <div className="text-[11px] opacity-90">{formatDate(inv.date)}</div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" />{inv.views ?? 0}</span>
                  <span className="flex items-center gap-1"><Users className="h-3 w-3" />{inv.rsvpCount ?? 0}</span>
                  <span className="ml-auto truncate">/{inv.slug}/{inv.dateSlug}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <Link to="/invitations/$id" params={{ id: inv._id }} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                      <ArrowUpRight className="mr-1 h-3 w-3" /> Բացել
                    </Button>
                  </Link>
                  <Button variant="ghost" size="sm" onClick={() => confirm("Ջնջե՞լ։") && del.mutate(inv._id)}>
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}