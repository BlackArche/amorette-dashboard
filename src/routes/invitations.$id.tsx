import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import { InvitationEditor } from "@/components/InvitationEditor";
import { getInvitation } from "@/lib/invitations-api";

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
          initial={{
            slug: data.slug ?? "",
            dateSlug: data.dateSlug ?? "",
            date: data.date ?? "",
            template:
              typeof data.template === "string"
                ? data.template
                : (data.template as { _id?: string })?._id ?? "",
            data: (data.data ?? {}) as Record<string, unknown>,
          }}
          initialMedia={data.media ?? {}}
        />
      )}
    </AppShell>
  );
}