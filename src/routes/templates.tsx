import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Search, Trash2, Pencil, ExternalLink } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import { EmptyState } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { listTemplates, deleteTemplate, upsertTemplate, type Template } from "@/lib/templates-api";
import { formatPrice } from "@/lib/format";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MediaDropzone } from "@/components/MediaDropzone";
import { toast } from "sonner";

export const Route = createFileRoute("/templates")({
  component: () => (
    <AppShell>
      <TemplatesPage />
    </AppShell>
  ),
});

function TemplatesPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();

  const params = { search: search || undefined, category: category === "all" ? undefined : category, limit: 24 };
  const { data, isLoading } = useQuery({ queryKey: ["templates", params], queryFn: () => listTemplates(params) });

  const del = useMutation({
    mutationFn: (id: string) => deleteTemplate(id),
    onSuccess: () => {
      toast.success("Թեմփլեյթը ջնջվեց");
      qc.invalidateQueries({ queryKey: ["templates"] });
    },
    onError: () => toast.error("Չհաջողվեց ջնջել"),
  });

  return (
    <div>
      <PageHeader
        eyebrow="Կատալոգ"
        title="Թեմփլեյթներ"
        description="Կառավարեք ձեր հրավիրատոմսի դիզայնները։"
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="bg-luxe text-primary-foreground hover:opacity-95">
                <Plus className="mr-2 h-4 w-4" /> Նոր թեմփլեյթ
              </Button>
            </DialogTrigger>
            <NewTemplateDialog onClose={() => setOpen(false)} />
          </Dialog>
        }
      />

      <div className="glass mb-6 flex flex-col gap-3 rounded-3xl p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Որոնել թեմփլեյթ..." className="pl-9" />
        </div>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger className="sm:w-56"><SelectValue placeholder="Կատեգորիա" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Բոլոր կատեգորիաները</SelectItem>
            <SelectItem value="wedding">Հարսանիք</SelectItem>
            <SelectItem value="christening">Մկրտություն</SelectItem>
            <SelectItem value="engagement">Նշանադրություն</SelectItem>
            <SelectItem value="birthday">Ծնունդ</SelectItem>
            <SelectItem value="other">Այլ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <Loading />
      ) : (data?.items.length ?? 0) === 0 ? (
        <EmptyState title="Թեմփլեյթներ չկան" description="Ստեղծեք ձեր առաջին թեմփլեյթը՝ սկսելու համար։" />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data!.items.map((t, i) => (
            <motion.div
              key={t._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="glass group overflow-hidden rounded-3xl"
            >
              <div className="relative aspect-[4/5] bg-luxe">
                {t.mainImage ? (
                  <img src={t.mainImage} alt={t.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                ) : null}
                <div className="absolute inset-x-2 bottom-2 flex justify-between gap-2 opacity-0 transition group-hover:opacity-100">
                  {t.demoLink && (
                    <a href={t.demoLink} target="_blank" rel="noreferrer" className="rounded-full bg-background/90 p-2 text-foreground shadow">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Ջնջե՞լ թեմփլեյթը։")) del.mutate(t._id);
                    }}
                    className="ml-auto rounded-full bg-destructive/90 p-2 text-destructive-foreground shadow"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-display text-lg leading-tight">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.category ?? "—"}</div>
                  </div>
                  <div className="rounded-full bg-luxe/10 px-2 py-1 text-xs font-semibold text-primary">
                    {formatPrice(t.basePrice ?? 0, t.currency ?? "֏")}
                  </div>
                </div>
                <Link to="/invitations/new" search={{ template: t._id } as never} className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline">
                  <Pencil className="h-3 w-3" /> Օգտագործել
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

function NewTemplateDialog({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [name, setName] = useState("");
  const [category, setCategory] = useState("wedding");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState<number>(20000);
  const [mainImage, setMainImage] = useState<File | null>(null);
  const [gallery, setGallery] = useState<File[]>([]);
  const [music, setMusic] = useState<File | null>(null);

  const create = useMutation({
    mutationFn: () => upsertTemplate(null, { name, category, description, basePrice, currency: "֏" }, { mainImage, gallery, music }),
    onSuccess: () => {
      toast.success("Թեմփլեյթը ստեղծվեց");
      qc.invalidateQueries({ queryKey: ["templates"] });
      onClose();
    },
    onError: () => toast.error("Չհաջողվեց ստեղծել"),
  });

  return (
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader><DialogTitle>Նոր թեմփլեյթ</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-1.5"><Label>Անուն</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Կատեգորիա</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="wedding">Հարսանիք</SelectItem>
                <SelectItem value="christening">Մկրտություն</SelectItem>
                <SelectItem value="engagement">Նշանադրություն</SelectItem>
                <SelectItem value="birthday">Ծնունդ</SelectItem>
                <SelectItem value="other">Այլ</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5"><Label>Գին</Label><Input type="number" value={basePrice} onChange={(e) => setBasePrice(Number(e.target.value))} /></div>
        </div>
        <div className="space-y-1.5"><Label>Նկարագրություն</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
        <MediaDropzone label="Գլխավոր նկար" accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }} value={mainImage} onChange={(f) => setMainImage(f as File | null)} />
        <MediaDropzone label="Gallery" multiple accept={{ "image/*": [".jpg", ".jpeg", ".png", ".webp"] }} value={gallery} onChange={(f) => setGallery((f as File[]) ?? [])} hint="մինչև 10 նկար" />
        <MediaDropzone label="Երաժշտություն" accept={{ "audio/*": [".mp3", ".wav", ".mpeg"] }} value={music} onChange={(f) => setMusic(f as File | null)} />
      </div>
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Չեղարկել</Button>
        <Button disabled={!name || !mainImage || create.isPending} onClick={() => create.mutate()} className="bg-luxe text-primary-foreground">
          {create.isPending ? "Ստեղծվում է..." : "Ստեղծել"}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}