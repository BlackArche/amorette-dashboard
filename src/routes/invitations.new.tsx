import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { InvitationEditor } from "@/components/InvitationEditor";

export const Route = createFileRoute("/invitations/new")({
  validateSearch: z.object({ template: z.string().optional() }),
  component: () => {
    const { template } = Route.useSearch();
    return (
      <AppShell>
        <PageHeader eyebrow="Ստեղծել" title="Նոր հրավիրատոմս" description="Լրացրեք տվյալները, դիտեք իրական ժամանակում աջ կողմում։" />
        <InvitationEditor initialTemplate={template} />
      </AppShell>
    );
  },
});