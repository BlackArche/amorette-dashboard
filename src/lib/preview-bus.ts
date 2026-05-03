import type { InvitationFormValues } from "./invitation-schema";

export interface PreviewMedia {
  couplePhoto?: string | null;
  secondaryPhoto?: string | null;
  backgroundPhoto?: string | null;
  music?: string | null;
  gallery?: string[];
}

export interface PreviewPayload {
  type: "amorette:preview-update";
  data: InvitationFormValues;
  media: PreviewMedia;
  templateName?: string;
}

export function isPreviewPayload(v: unknown): v is PreviewPayload {
  return !!v && typeof v === "object" && (v as { type?: string }).type === "amorette:preview-update";
}