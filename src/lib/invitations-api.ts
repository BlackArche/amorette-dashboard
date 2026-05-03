import { api } from "./api";
import type { InvitationFormValues } from "./invitation-schema";

export interface Invitation {
  _id: string;
  slug: string;
  dateSlug: string;
  template?: string | { _id: string; name?: string };
  date?: string;
  couple?: { bride?: { name?: string }; groom?: { name?: string } };
  status?: string;
  views?: number;
  rsvpCount?: number;
  createdAt?: string;
  media?: {
    couplePhoto?: string;
    secondaryPhoto?: string;
    backgroundPhoto?: string;
    music?: string;
    gallery?: string[];
  };
}

export async function listInvitations(params: { page?: number; limit?: number } = {}) {
  const { data } = await api.get("/api/invitations", { params });
  const items: Invitation[] = Array.isArray(data) ? data : (data?.items ?? data?.data ?? []);
  return { items, raw: data };
}

export async function getInvitation(id: string) {
  const { data } = await api.get(`/api/invitations/${id}`);
  return (data?.invitation ?? data) as Invitation;
}

export async function deleteInvitation(id: string) {
  await api.delete(`/api/invitations/${id}`);
}

export interface InvitationFiles {
  couplePhoto?: File | null;
  secondaryPhoto?: File | null;
  backgroundPhoto?: File | null;
  music?: File | null;
  gallery?: File[];
}

function buildFormData(values: InvitationFormValues, files: InvitationFiles) {
  const fd = new FormData();
  fd.append("slug", values.slug);
  fd.append("dateSlug", values.dateSlug);
  fd.append("template", values.template);
  fd.append("language", values.language);
  fd.append("date", values.date);
  fd.append("rsvpDeadline", values.rsvpDeadline ?? "");
  fd.append("notes", values.notes ?? "");
  fd.append("couple", JSON.stringify(values.couple));
  fd.append("event", JSON.stringify(values.event));
  fd.append("texts", JSON.stringify(values.texts));
  fd.append("sections", JSON.stringify(values.sections));
  if (files.couplePhoto) fd.append("couplePhoto", files.couplePhoto);
  if (files.secondaryPhoto) fd.append("secondaryPhoto", files.secondaryPhoto);
  if (files.backgroundPhoto) fd.append("backgroundPhoto", files.backgroundPhoto);
  if (files.music) fd.append("music", files.music);
  files.gallery?.forEach((f) => fd.append("gallery", f));
  return fd;
}

export async function createInvitation(values: InvitationFormValues, files: InvitationFiles) {
  const fd = buildFormData(values, files);
  const { data } = await api.post("/api/invitations", fd, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}

export async function updateInvitation(id: string, values: InvitationFormValues, files: InvitationFiles) {
  const fd = buildFormData(values, files);
  const { data } = await api.put(`/api/invitations/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}