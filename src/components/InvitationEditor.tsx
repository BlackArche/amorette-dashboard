import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Save, Settings2, Image as ImageIcon, Music, FileJson, Sparkles, CloudCheck } from "lucide-react";
import { motion } from "framer-motion";
import { listTemplates, getTemplate } from "@/lib/templates-api";
import {
  createInvitation,
  updateInvitation,
  type InvitationFiles,
  type Invitation,
} from "@/lib/invitations-api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCard } from "@/components/SectionCard";
import { MediaDropzone } from "@/components/MediaDropzone";
import { LivePreviewFrame } from "@/components/LivePreviewFrame";
import { DynamicFields } from "@/components/DynamicFields";
import { toast } from "sonner";

type AnyRecord = Record<string, unknown>;

interface CoreFields {
  slug: string;
  dateSlug: string;
  date: string;
  language: "hy" | "en" | "ru";
  template: string;
  rsvpDeadline: string;
  notes: string;
}

interface Props {
  initial?: Partial<CoreFields> & { data?: AnyRecord };
  initialMedia?: {
    couplePhoto?: string | null;
    secondaryPhoto?: string | null;
    backgroundPhoto?: string | null;
    music?: string | null;
    gallery?: string[];
  };
  invitationId?: string;
  initialTemplate?: string;
}

const DEFAULT_CORE: CoreFields = {
  slug: "",
  dateSlug: "",
  date: "",
  language: "hy",
  template: "",
  rsvpDeadline: "",
  notes: "",
};

export function InvitationEditor({
  initial,
  initialMedia,
  invitationId,
  initialTemplate,
}: Props) {
  const navigate = useNavigate();

  const templates = useQuery({
    queryKey: ["templates", { limit: 50 }],
    queryFn: () => listTemplates({ limit: 50 }),
  });

  const [core, setCore] = useState<CoreFields>({
    ...DEFAULT_CORE,
    ...(initial ?? {}),
    template: initial?.template ?? initialTemplate ?? "",
  });

  const [data, setData] = useState<AnyRecord>(initial?.data ?? {});
  const [draftSavedAt, setDraftSavedAt] = useState<number | null>(null);
  const draftKey = `amorette:draft:${invitationId ?? "new"}`;

  // Restore draft on mount (only when no server-provided initial.data)
  useEffect(() => {
    if (initial?.data && Object.keys(initial.data).length) return;
    try {
      const raw = localStorage.getItem(draftKey);
      if (!raw) return;
      const parsed = JSON.parse(raw) as { core?: Partial<CoreFields>; data?: AnyRecord; savedAt?: number };
      if (parsed.core) setCore((c) => ({ ...c, ...parsed.core }));
      if (parsed.data) setData(parsed.data);
      if (parsed.savedAt) setDraftSavedAt(parsed.savedAt);
      toast.message("Վերականգնված է չպահպանված սևագիրը");
    } catch {
      /* noop */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save draft (debounced)
  useEffect(() => {
    const id = window.setTimeout(() => {
      try {
        const savedAt = Date.now();
        localStorage.setItem(
          draftKey,
          JSON.stringify({ core, data, savedAt }),
        );
        setDraftSavedAt(savedAt);
      } catch {
        /* noop */
      }
    }, 800);
    return () => window.clearTimeout(id);
  }, [core, data, draftKey]);
  const [files, setFiles] = useState<InvitationFiles>({
    couplePhoto: null,
    secondaryPhoto: null,
    backgroundPhoto: null,
    music: null,
    gallery: [],
  });

  // Load full template (including defaultData + demoLink) when template changes
  const templateQuery = useQuery({
    queryKey: ["template", core.template],
    queryFn: () => getTemplate(core.template),
    enabled: !!core.template,
  });

  // Auto-fill defaults when template is freshly chosen (not on edit-mode reload)
  useEffect(() => {
    const t = templateQuery.data;
    if (!t) return;
    if (initial?.data && Object.keys(initial.data).length) return;
    if (data && Object.keys(data).length) return;
    if (t.defaultData && Object.keys(t.defaultData).length) {
      setData({ ...(t.defaultData as AnyRecord) });
      toast.success(`Շաբլոնի տվյալները բեռնված են՝ ${t.name}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateQuery.data]);

  const previewSrc = templateQuery.data?.demoLink ?? "";

  const payload = useMemo(() => data, [data]);

  const updateCore = <K extends keyof CoreFields>(k: K, v: CoreFields[K]) =>
    setCore((c) => ({ ...c, [k]: v }));

  const save = useMutation({
    mutationFn: async () => {
      const values = {
        slug: core.slug,
        dateSlug: core.dateSlug,
        template: core.template,
        language: core.language,
        date: core.date,
        rsvpDeadline: core.rsvpDeadline,
        notes: core.notes,
        // backend-stored payload mirrors template's defaultData shape
        data,
      } as unknown as Parameters<typeof createInvitation>[0];
      if (invitationId) return updateInvitation(invitationId, values, files);
      return createInvitation(values, files);
    },
    onSuccess: (resp: Invitation | { invitation?: Invitation }) => {
      toast.success("Պահպանված է");
      try { localStorage.removeItem(draftKey); } catch { /* noop */ }
      const inv =
        (resp as { invitation?: Invitation }).invitation ??
        (resp as Invitation);
      if (!invitationId && inv?._id)
        navigate({ to: "/invitations/$id", params: { id: inv._id } });
    },
    onError: (err: {
      response?: { data?: { message?: string } };
      message?: string;
    }) => {
      toast.error(
        err?.response?.data?.message ?? err?.message ?? "Չհաջողվեց պահպանել",
      );
    },
  });

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!core.template) return toast.error("Ընտրեք թեմփլեյթ");
    if (!core.slug || !core.dateSlug)
      return toast.error("Slug-ը ու Date Slug-ը պարտադիր են");
    save.mutate();
  };

  const reapplyDefaults = () => {
    const t = templateQuery.data;
    if (!t?.defaultData) return;
    setData({ ...(t.defaultData as AnyRecord) });
    toast.success("Թեմփլեյթի լռելյայն տվյալները վերականգնված են");
  };

  return (
    <form onSubmit={onSubmit} className="grid gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-7">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="glass mb-4 grid h-auto w-full grid-cols-3 gap-1 rounded-2xl p-1">
            <TabsTrigger value="general">
              <Settings2 className="mr-1 h-3.5 w-3.5" />
              Ընդհանուր
            </TabsTrigger>
            <TabsTrigger value="content">
              <FileJson className="mr-1 h-3.5 w-3.5" />
              Բովանդակություն
            </TabsTrigger>
            <TabsTrigger value="media">
              <ImageIcon className="mr-1 h-3.5 w-3.5" />
              Մեդիա
            </TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <SectionCard
              title="Կարգավորումներ"
              description="Հիմնական տվյալներ ու URL"
              icon={<Settings2 className="h-4 w-4" />}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <Label>Թեմփլեյթ</Label>
                  <Select
                    value={core.template}
                    onValueChange={(v) => updateCore("template", v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Ընտրեք թեմփլեյթ" />
                    </SelectTrigger>
                    <SelectContent>
                      {(templates.data?.items ?? []).map((t) => (
                        <SelectItem key={t._id} value={t._id}>
                          {t.name} {t.category ? `· ${t.category}` : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {templateQuery.data?.demoLink && (
                    <p className="mt-2 text-xs text-muted-foreground">
                      Demo: {templateQuery.data.demoLink}
                    </p>
                  )}
                </div>
                <div>
                  <Label>Slug</Label>
                  <Input
                    placeholder="anna-narek"
                    value={core.slug}
                    onChange={(e) => updateCore("slug", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Date Slug</Label>
                  <Input
                    placeholder="2026-08-12"
                    value={core.dateSlug}
                    onChange={(e) => updateCore("dateSlug", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Ամսաթիվ</Label>
                  <Input
                    type="date"
                    value={core.date}
                    onChange={(e) => updateCore("date", e.target.value)}
                  />
                </div>
                <div>
                  <Label>Լեզու</Label>
                  <Select
                    value={core.language}
                    onValueChange={(v) =>
                      updateCore("language", v as CoreFields["language"])
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hy">Հայերեն</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Русский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>RSVP վերջնաժամկետ</Label>
                  <Input
                    type="date"
                    value={core.rsvpDeadline}
                    onChange={(e) =>
                      updateCore("rsvpDeadline", e.target.value)
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <Label>Ներքին նշումներ</Label>
                  <Textarea
                    rows={2}
                    value={core.notes}
                    onChange={(e) => updateCore("notes", e.target.value)}
                  />
                </div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="content" className="space-y-6">
            <SectionCard
              title="Թեմփլեյթի դաշտեր"
              description="Խմբագրեք ցանկացած դաշտ՝ ստացված շաբլոնից"
              icon={<FileJson className="h-4 w-4" />}
              action={
                templateQuery.data?.defaultData ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={reapplyDefaults}
                  >
                    <Sparkles className="mr-1 h-3.5 w-3.5" />
                    Վերականգնել
                  </Button>
                ) : null
              }
            >
              {!core.template ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Նախ ընտրեք թեմփլեյթ
                </p>
              ) : templateQuery.isLoading ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Բեռնվում է...
                </p>
              ) : Object.keys(data).length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  Այս թեմփլեյթը չունի լռելյայն դաշտեր
                </p>
              ) : (
                <DynamicFields value={data} onChange={setData} />
              )}
            </SectionCard>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <SectionCard title="Լուսանկարներ" icon={<ImageIcon className="h-4 w-4" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <MediaDropzone
                  label="Զույգի լուսանկար"
                  accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
                  value={files.couplePhoto ?? null}
                  onChange={(f) =>
                    setFiles((s) => ({ ...s, couplePhoto: (f as File) ?? null }))
                  }
                />
                <MediaDropzone
                  label="Երկրորդական լուսանկար"
                  accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
                  value={files.secondaryPhoto ?? null}
                  onChange={(f) =>
                    setFiles((s) => ({
                      ...s,
                      secondaryPhoto: (f as File) ?? null,
                    }))
                  }
                />
                <div className="sm:col-span-2">
                  <MediaDropzone
                    label="Ֆոնային նկար"
                    accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
                    value={files.backgroundPhoto ?? null}
                    onChange={(f) =>
                      setFiles((s) => ({
                        ...s,
                        backgroundPhoto: (f as File) ?? null,
                      }))
                    }
                  />
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Gallery" icon={<ImageIcon className="h-4 w-4" />}>
              <MediaDropzone
                label="Gallery նկարներ"
                multiple
                accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }}
                value={files.gallery ?? []}
                onChange={(f) =>
                  setFiles((s) => ({ ...s, gallery: (f as File[]) ?? [] }))
                }
                hint="Մի քանի նկար"
              />
            </SectionCard>
            <SectionCard title="Երաժշտություն" icon={<Music className="h-4 w-4" />}>
              <MediaDropzone
                label="Երաժշտական ֆայլ"
                accept={{ "audio/*": [".mp3", ".wav", ".mpeg"] }}
                value={files.music ?? null}
                onChange={(f) =>
                  setFiles((s) => ({ ...s, music: (f as File) ?? null }))
                }
              />
            </SectionCard>
          </TabsContent>
        </Tabs>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass sticky bottom-4 z-10 flex items-center justify-between rounded-2xl p-3"
        >
          <div className="text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <CloudCheck className="h-3.5 w-3.5 text-emerald-600" />
              {draftSavedAt
                ? `Ավտո-պահպանված ${new Date(draftSavedAt).toLocaleTimeString()}`
                : "Ավտո-պահպանում միացված է"}
            </span>
          </div>
          <Button
            type="submit"
            disabled={save.isPending}
            className="bg-luxe text-primary-foreground shadow-lg hover:opacity-95"
          >
            <Save className="mr-2 h-4 w-4" />
            {save.isPending ? "Պահպանվում է..." : "Պահպանել"}
          </Button>
        </motion.div>
      </div>

      <div className="xl:col-span-5">
        <LivePreviewFrame src={previewSrc} payload={payload} />
        {!previewSrc && core.template && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Այս թեմփլեյթը չունի demo հղում
          </p>
        )}
      </div>
    </form>
  );
}

// keep referenced to avoid unused warnings — used by initialMedia prop type
export type { Props as InvitationEditorProps };
