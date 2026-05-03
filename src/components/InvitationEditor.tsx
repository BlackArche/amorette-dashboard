import { useEffect, useMemo, useState } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { Heart, CalendarDays, Image as ImageIcon, Music, Settings2, Save, Type } from "lucide-react";
import { motion } from "framer-motion";
import { invitationSchema, defaultInvitation, type InvitationFormValues } from "@/lib/invitation-schema";
import { listTemplates, getTemplate } from "@/lib/templates-api";
import { createInvitation, updateInvitation, type InvitationFiles, type Invitation } from "@/lib/invitations-api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionCard } from "@/components/SectionCard";
import { MediaDropzone } from "@/components/MediaDropzone";
import { LivePreviewFrame } from "@/components/LivePreviewFrame";
import { toast } from "sonner";
import type { PreviewMedia, PreviewPayload } from "@/lib/preview-bus";

interface Props {
  initial?: Partial<InvitationFormValues>;
  initialMedia?: PreviewMedia;
  invitationId?: string;
  initialTemplate?: string;
}

export function InvitationEditor({ initial, initialMedia, invitationId, initialTemplate }: Props) {
  const navigate = useNavigate();
  const templates = useQuery({ queryKey: ["templates", { limit: 50 }], queryFn: () => listTemplates({ limit: 50 }) });

  const form = useForm<InvitationFormValues>({
    resolver: zodResolver(invitationSchema) as never,
    defaultValues: { ...defaultInvitation, ...(initial ?? {}), template: initial?.template ?? initialTemplate ?? "" },
    mode: "onBlur",
  });
  const { register, handleSubmit, control, watch, reset, setValue, formState: { errors } } = form;

  const [files, setFiles] = useState<InvitationFiles>({ couplePhoto: null, secondaryPhoto: null, backgroundPhoto: null, music: null, gallery: [] });
  const [previews, setPreviews] = useState<PreviewMedia>(initialMedia ?? {});

  // generate object URLs for preview
  useEffect(() => {
    const urls: string[] = [];
    const next: PreviewMedia = { ...(initialMedia ?? {}) };
    const single = (f: File | null | undefined) => {
      if (!f) return undefined;
      const u = URL.createObjectURL(f);
      urls.push(u);
      return u;
    };
    next.couplePhoto = single(files.couplePhoto) ?? next.couplePhoto;
    next.secondaryPhoto = single(files.secondaryPhoto) ?? next.secondaryPhoto;
    next.backgroundPhoto = single(files.backgroundPhoto) ?? next.backgroundPhoto;
    next.music = single(files.music) ?? next.music;
    if (files.gallery && files.gallery.length) {
      next.gallery = files.gallery.map((f) => {
        const u = URL.createObjectURL(f);
        urls.push(u);
        return u;
      });
    }
    setPreviews(next);
    return () => urls.forEach((u) => URL.revokeObjectURL(u));
  }, [files, initialMedia]);

  const watchedAll = watch();
  const templateId = watch("template");
  const selectedTemplate = templates.data?.items.find((t) => t._id === templateId || t.slug === templateId);

  // Auto-fill defaults when template changes
  useEffect(() => {
    if (!templateId) return;
    let cancelled = false;
    (async () => {
      try {
        const t = await getTemplate(templateId);
        if (cancelled) return;
        const dflt = (t.defaultData ?? {}) as Partial<InvitationFormValues>;
        if (dflt && Object.keys(dflt).length) {
          reset({ ...defaultInvitation, ...dflt, ...form.getValues(), template: templateId });
          toast.success(`Շաբլոնի լռելյայն տվյալները բեռնված են՝ ${t.name}`);
        }
      } catch {
        /* noop */
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  const payload = useMemo<PreviewPayload>(() => ({
    type: "amorette:preview-update",
    data: watchedAll,
    media: previews,
    templateName: selectedTemplate?.name,
  }), [watchedAll, previews, selectedTemplate]);

  const save = useMutation({
    mutationFn: async (values: InvitationFormValues) => {
      if (invitationId) return updateInvitation(invitationId, values, files);
      return createInvitation(values, files);
    },
    onSuccess: (data: Invitation | { invitation?: Invitation }) => {
      toast.success("Պահպանված է");
      const inv = (data as { invitation?: Invitation }).invitation ?? (data as Invitation);
      if (!invitationId && inv?._id) navigate({ to: "/invitations/$id", params: { id: inv._id } });
    },
    onError: (err: { response?: { data?: { message?: string } }; message?: string }) => {
      toast.error(err?.response?.data?.message ?? err?.message ?? "Չհաջողվեց պահպանել");
    },
  });

  const onSubmit: SubmitHandler<InvitationFormValues> = (values) => save.mutate(values);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 xl:grid-cols-12">
      <div className="space-y-6 xl:col-span-8">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="glass mb-4 grid h-auto w-full grid-cols-2 gap-1 rounded-2xl p-1 sm:grid-cols-5">
            <TabsTrigger value="general"><Settings2 className="mr-1 h-3.5 w-3.5" />Ընդհանուր</TabsTrigger>
            <TabsTrigger value="couple"><Heart className="mr-1 h-3.5 w-3.5" />Զույգ</TabsTrigger>
            <TabsTrigger value="event"><CalendarDays className="mr-1 h-3.5 w-3.5" />Իրադարձ.</TabsTrigger>
            <TabsTrigger value="texts"><Type className="mr-1 h-3.5 w-3.5" />Տեքստեր</TabsTrigger>
            <TabsTrigger value="media"><ImageIcon className="mr-1 h-3.5 w-3.5" />Մեդիա</TabsTrigger>
          </TabsList>

          <TabsContent value="general" className="space-y-6">
            <SectionCard title="Կարգավորումներ" description="Հիմնական տվյալներ ու URL slug" icon={<Settings2 className="h-4 w-4" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Slug</Label>
                  <Input placeholder="anna-narek" {...register("slug")} />
                  {errors.slug && <p className="mt-1 text-xs text-destructive">{errors.slug.message}</p>}
                </div>
                <div>
                  <Label>Date Slug</Label>
                  <Input placeholder="2026-08-12" {...register("dateSlug")} />
                  {errors.dateSlug && <p className="mt-1 text-xs text-destructive">{errors.dateSlug.message}</p>}
                </div>
                <div>
                  <Label>Ամսաթիվ</Label>
                  <Input type="date" {...register("date")} />
                </div>
                <div>
                  <Label>Լեզու</Label>
                  <Controller control={control} name="language" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="hy">Հայերեն</SelectItem>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="ru">Русский</SelectItem>
                      </SelectContent>
                    </Select>
                  )} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Թեմփլեյթ</Label>
                  <Controller control={control} name="template" render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger><SelectValue placeholder="Ընտրեք թեմփլեյթ" /></SelectTrigger>
                      <SelectContent>
                        {(templates.data?.items ?? []).map((t) => (
                          <SelectItem key={t._id} value={t._id}>{t.name} {t.category ? `· ${t.category}` : ""}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )} />
                  {errors.template && <p className="mt-1 text-xs text-destructive">{errors.template.message}</p>}
                </div>
                <div>
                  <Label>RSVP վերջնաժամկետ</Label>
                  <Input type="date" {...register("rsvpDeadline")} />
                </div>
                <div className="sm:col-span-2">
                  <Label>Ներքին նշումներ</Label>
                  <Textarea rows={2} {...register("notes")} />
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Բաժիններ" description="Միացրեք/անջատեք բաժինները" icon={<Settings2 className="h-4 w-4" />}>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {(["gallery", "rsvp", "countdown", "music"] as const).map((k) => (
                  <Controller key={k} control={control} name={`sections.${k}` as const} render={({ field }) => (
                    <label className="flex cursor-pointer items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3">
                      <span className="text-sm capitalize">{k}</span>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </label>
                  )} />
                ))}
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="couple" className="space-y-6">
            <SectionCard title="Հարս" icon={<Heart className="h-4 w-4" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Անուն</Label><Input {...register("couple.bride.name")} /></div>
                <div><Label>Ծնողներ</Label><Input {...register("couple.bride.parents")} /></div>
              </div>
            </SectionCard>
            <SectionCard title="Փեսա" icon={<Heart className="h-4 w-4" />}>
              <div className="grid gap-3 sm:grid-cols-2">
                <div><Label>Անուն</Label><Input {...register("couple.groom.name")} /></div>
                <div><Label>Ծնողներ</Label><Input {...register("couple.groom.parents")} /></div>
              </div>
            </SectionCard>
            <SectionCard title="Մեր պատմությունը">
              <Textarea rows={5} {...register("couple.story")} />
            </SectionCard>
          </TabsContent>

          <TabsContent value="event" className="space-y-6">
            {(["ceremony", "reception", "party"] as const).map((k, i) => (
              <SectionCard key={k} title={k === "ceremony" ? "Պսակադրություն" : k === "reception" ? "Ընդունելություն" : "Պարահանդես"} icon={<CalendarDays className="h-4 w-4" />} delay={i * 0.05}
                action={
                  <Controller control={control} name={`event.${k}.enabled` as const} render={({ field }) => (
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  )} />
                }
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <div><Label>Վերնագիր</Label><Input {...register(`event.${k}.title` as const)} /></div>
                  <div><Label>Ամսաթիվ</Label><Input type="date" {...register(`event.${k}.date` as const)} /></div>
                  <div><Label>Ժամ</Label><Input type="time" {...register(`event.${k}.time` as const)} /></div>
                  <div><Label>Վայր</Label><Input {...register(`event.${k}.venue` as const)} /></div>
                  <div className="sm:col-span-2"><Label>Հասցե</Label><Input {...register(`event.${k}.address` as const)} /></div>
                  <div className="sm:col-span-2"><Label>Քարտեզի հղում</Label><Input placeholder="https://maps..." {...register(`event.${k}.mapUrl` as const)} /></div>
                </div>
              </SectionCard>
            ))}
          </TabsContent>

          <TabsContent value="texts" className="space-y-6">
            <SectionCard title="Հատուկ տեքստեր" icon={<Type className="h-4 w-4" />}>
              <div className="grid gap-3">
                <div><Label>Հրավիրատոմս</Label><Textarea rows={3} {...register("texts.invitation")} /></div>
                <div><Label>Մեջբերում</Label><Textarea rows={2} {...register("texts.quote")} /></div>
                <div><Label>Շնորհակալություն</Label><Textarea rows={2} {...register("texts.thanks")} /></div>
                <div><Label>RSVP հուշում</Label><Input {...register("texts.rsvpPrompt")} /></div>
              </div>
            </SectionCard>
          </TabsContent>

          <TabsContent value="media" className="space-y-6">
            <SectionCard title="Լուսանկարներ" icon={<ImageIcon className="h-4 w-4" />}>
              <div className="grid gap-4 sm:grid-cols-2">
                <MediaDropzone label="Զույգի լուսանկար" accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }} value={files.couplePhoto ?? null} onChange={(f) => setFiles((s) => ({ ...s, couplePhoto: (f as File) ?? null }))} />
                <MediaDropzone label="Երկրորդական լուսանկար" accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }} value={files.secondaryPhoto ?? null} onChange={(f) => setFiles((s) => ({ ...s, secondaryPhoto: (f as File) ?? null }))} />
                <div className="sm:col-span-2">
                  <MediaDropzone label="Ֆոնային նկար" accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }} value={files.backgroundPhoto ?? null} onChange={(f) => setFiles((s) => ({ ...s, backgroundPhoto: (f as File) ?? null }))} />
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Gallery" icon={<ImageIcon className="h-4 w-4" />}>
              <MediaDropzone label="Gallery նկարներ" multiple accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }} value={files.gallery ?? []} onChange={(f) => setFiles((s) => ({ ...s, gallery: (f as File[]) ?? [] }))} hint="Մի քանի նկար" />
            </SectionCard>
            <SectionCard title="Երաժշտություն" icon={<Music className="h-4 w-4" />}>
              <MediaDropzone label="Երաժշտական ֆայլ" accept={{ "audio/*": [".mp3", ".wav", ".mpeg"] }} value={files.music ?? null} onChange={(f) => setFiles((s) => ({ ...s, music: (f as File) ?? null }))} />
            </SectionCard>
          </TabsContent>
        </Tabs>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass sticky bottom-4 z-10 flex items-center justify-between rounded-2xl p-3">
          <div className="text-xs text-muted-foreground">
            {invitationId ? "Խմբագրում եք գոյություն ունեցող հրավիրատոմս" : "Նոր հրավիրատոմս"}
          </div>
          <Button type="submit" disabled={save.isPending} className="bg-luxe text-primary-foreground shadow-lg hover:opacity-95">
            <Save className="mr-2 h-4 w-4" /> {save.isPending ? "Պահպանվում է..." : "Պահպանել"}
          </Button>
        </motion.div>
      </div>

      <div className="xl:col-span-4">
        <LivePreviewFrame payload={payload} />
      </div>
    </form>
  );
}