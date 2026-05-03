import { useEffect, useRef, useState } from "react";
import { Eye, RefreshCw, Smartphone, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PreviewPayload } from "@/lib/preview-bus";

interface Props {
  payload: PreviewPayload;
}

export function LivePreviewFrame({ payload }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e?.data?.type === "amorette:preview-ready") setReady(true);
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  useEffect(() => {
    if (!ready) return;
    ref.current?.contentWindow?.postMessage(payload, "*");
  }, [payload, ready]);

  const reload = () => {
    setReady(false);
    if (ref.current) ref.current.src = ref.current.src;
  };

  return (
    <div className="glass-strong sticky top-24 overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Իրական ժամանակում</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="icon" variant={device === "phone" ? "default" : "ghost"} onClick={() => setDevice("phone")} className="h-8 w-8">
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant={device === "desktop" ? "default" : "ghost"} onClick={() => setDevice("desktop")} className="h-8 w-8">
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" onClick={reload} className="h-8 w-8">
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="bg-gradient-to-b from-background to-muted p-4">
        <div
          className="mx-auto overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl transition-all"
          style={{
            width: device === "phone" ? 320 : "100%",
            height: device === "phone" ? 640 : 720,
            maxWidth: "100%",
          }}
        >
          <iframe
            ref={ref}
            title="Invitation preview"
            src="/preview"
            className="h-full w-full border-0"
          />
        </div>
      </div>
    </div>
  );
}