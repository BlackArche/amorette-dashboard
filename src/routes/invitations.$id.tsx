import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import { InvitationEditor } from "@/components/InvitationEditor";
import { getInvitation } from "@/lib/invitations-api";
import type { InvitationFormValues } from "@/lib/invitation-schema";
import type { PreviewMedia } from "@/lib/preview-bus";

export const Route = createFileRoute("/invitations/$id")({
  component: EditPage,
});

function EditPage() {
  const { id } = Route.useParams();
  const { data, isLoading } = useQuery({ queryKey: ["invitation", id], queryFn: () => getInvitation(id) });

  return (
    <AppShell>
      <PageHeader eyebrow="Խմբագրել" title="Հրավիրատոմս" description="Թարմացրեք մանրամասները, պահպանեք փոփոխությունները։" />
      {isLoading || !data ? (
        <Loading />
      ) : (
        <InvitationEditor
          invitationId={id}
          initial={data as unknown as Partial<InvitationFormValues>}
          initialMedia={(data.media ?? {}) as PreviewMedia}
        />
      )}
    </AppShell>
  );
}