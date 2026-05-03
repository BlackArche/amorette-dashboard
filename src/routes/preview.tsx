import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Heart, MapPin, Music2, Calendar } from "lucide-react";
import { isPreviewPayload, type PreviewPayload } from "@/lib/preview-bus";
import { defaultInvitation } from "@/lib/invitation-schema";

export const Route = createFileRoute("/preview")({
  component: PreviewPage,
});

function PreviewPage() {
  const [payload, setPayload] = useState<PreviewPayload>({
    type: "amorette:preview-update",
    data: defaultInvitation,
    media: {},
  });

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (isPreviewPayload(e.data)) setPayload(e.data);
    }
    window.addEventListener("message", onMessage);
    window.parent?.postMessage({ type: "amorette:preview-ready" }, "*");
    return () => window.removeEventListener("message", onMessage);
  }, []);

  const { data, media } = payload;
  const bg = media.backgroundPhoto;

  return (
    <div className="relative min-h-screen overflow-hidden bg-ivory text-foreground">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: bg ? `url(${bg})` : "linear-gradient(135deg, oklch(0.95 0.06 350), oklch(0.96 0.06 85), oklch(0.93 0.05 165))" }}
      />
      <div className="relative z-10 mx-auto flex min-h-screen max-w-md flex-col px-6 py-10 text-center">
        <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.3em] text-primary/70">Save the Date</div>
        <h1 className="font-display text-4xl leading-tight text-foreground">
          {data.couple.bride.name || "Անուն"}
          <span className="mx-2 text-primary">&</span>
          {data.couple.groom.name || "Անուն"}
        </h1>
        <div className="mt-4 inline-flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {data.date || "Ամսաթիվ"}
        </div>

        {media.couplePhoto && (
          <div className="mx-auto mt-6 h-56 w-44 overflow-hidden rounded-3xl border-4 border-background shadow-xl">
            <img src={media.couplePhoto} alt="Couple" className="h-full w-full object-cover" />
          </div>
        )}

        <p className="mx-auto mt-6 max-w-sm text-sm italic text-muted-foreground">
          {data.texts.invitation}
        </p>

        <div className="mt-8 space-y-4">
          {(["ceremony", "reception", "party"] as const).map((k) => {
            const e = data.event[k];
            if (!e.enabled) return null;
            return (
              <div key={k} className="rounded-2xl border border-border/60 bg-background/70 p-4 text-left shadow-sm">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-primary" />
                  <div className="font-display text-lg">{e.title}</div>
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  {e.date} {e.time && `· ${e.time}`}
                </div>
                {e.venue && <div className="mt-1 text-sm font-medium">{e.venue}</div>}
                {e.address && (
                  <div className="mt-1 flex items-start gap-1 text-xs text-muted-foreground">
                    <MapPin className="mt-0.5 h-3 w-3" />{e.address}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {data.sections.gallery && media.gallery && media.gallery.length > 0 && (
          <div className="mt-8 grid grid-cols-3 gap-2">
            {media.gallery.slice(0, 6).map((g, i) => (
              <div key={i} className="aspect-square overflow-hidden rounded-xl">
                <img src={g} alt="" className="h-full w-full object-cover" />
              </div>
            ))}
          </div>
        )}

        {data.texts.thanks && (
          <p className="mt-8 font-display text-lg text-primary">{data.texts.thanks}</p>
        )}

        {data.sections.music && media.music && (
          <div className="mt-6 inline-flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Music2 className="h-3 w-3" /> Երաժշտություն ակտիվ
          </div>
        )}
      </div>
    </div>
  );
}