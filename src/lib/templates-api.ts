import { api } from "./api";

export interface Template {
  _id: string;
  id?: string;
  name: string;
  slug?: string;
  category?: string;
  description?: string;
  basePrice?: number;
  currency?: string;
  mainImage?: string;
  gallery?: string[];
  musicUrl?: string;
  musicTitle?: string;
  features?: string[];
  demoLink?: string;
  isActive?: boolean;
  defaultData?: Record<string, unknown>;
  createdAt?: string;
}

export interface ListResponse<T> {
  items?: T[];
  data?: T[];
  total?: number;
  totalPages?: number;
  page?: number;
}

function unwrap<T>(d: ListResponse<T> | T[] | undefined): T[] {
  if (!d) return [];
  if (Array.isArray(d)) return d;
  return d.items ?? d.data ?? [];
}

export async function listTemplates(params: { page?: number; limit?: number; category?: string; price?: string; search?: string } = {}) {
  const { data } = await api.get("/api/templates/", { params });
  return { items: unwrap<Template>(data), raw: data };
}

export async function getTemplate(idOrSlug: string) {
  const { data } = await api.get(`/api/templates/${idOrSlug}`);
  return (data?.template ?? data) as Template;
}

export async function deleteTemplate(id: string) {
  await api.delete(`/api/templates/${id}`);
}

export async function upsertTemplate(id: string | null, fields: Record<string, string | number | undefined>, files: { mainImage?: File | null; gallery?: File[]; music?: File | null }) {
  const fd = new FormData();
  Object.entries(fields).forEach(([k, v]) => {
    if (v !== undefined && v !== "") fd.append(k, String(v));
  });
  if (files.mainImage) fd.append("mainImage", files.mainImage);
  if (files.music) fd.append("music", files.music);
  files.gallery?.forEach((f) => fd.append("gallery", f));
  if (id) {
    const { data } = await api.put(`/api/templates/${id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
    return data;
  }
  const { data } = await api.post(`/api/templates/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
  return data;
}