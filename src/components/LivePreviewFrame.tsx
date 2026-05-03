import { useEffect, useRef, useState } from "react";
import {
  Eye,
  RefreshCw,
  Smartphone,
  Monitor,
  ExternalLink,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  src: string;
  payload: unknown;
}

type Status = "idle" | "loading" | "ready" | "error";

export function LivePreviewFrame({ src, payload }: Props) {
  const ref = useRef<HTMLIFrameElement | null>(null);
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [status, setStatus] = useState<Status>("idle");
  const [lastSync, setLastSync] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const loadTimerRef = useRef<number | null>(null);

  // (Re)load tracking when src changes
  useEffect(() => {
    if (!src) {
      setStatus("idle");
      return;
    }
    setStatus("loading");
    setErrorMsg(null);
    if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    loadTimerRef.current = window.setTimeout(() => {
      setStatus((s) => {
        if (s === "loading") {
          setErrorMsg(
            "Iframe-ը չի բեռնվեց (հնարավոր է՝ X-Frame-Options արգելում է)",
          );
          return "error";
        }
        return s;
      });
    }, 8000);
    return () => {
      if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    };
  }, [src]);

  // Push updates to iframe whenever payload changes (after load)
  useEffect(() => {
    if (status !== "ready" && status !== "loading") return;
    try {
      ref.current?.contentWindow?.postMessage(
        { type: "UPDATE_PREVIEW", payload },
        "*",
      );
      setLastSync(Date.now());
    } catch (e) {
      console.error("postMessage failed", e);
      setErrorMsg("postMessage խնդիր");
    }
  }, [payload, status]);

  // Burst-send for first few seconds to catch late listener attach
  useEffect(() => {
    if (status !== "ready") return;
    const start = Date.now();
    const id = window.setInterval(() => {
      try {
        ref.current?.contentWindow?.postMessage(
          { type: "UPDATE_PREVIEW", payload },
          "*",
        );
        setLastSync(Date.now());
      } catch {
        /* noop */
      }
      if (Date.now() - start > 4000) window.clearInterval(id);
    }, 700);
    return () => window.clearInterval(id);
  }, [status, payload]);

  const reload = () => {
    setStatus("loading");
    setErrorMsg(null);
    if (ref.current) ref.current.src = ref.current.src;
  };

  const onLoad = () => {
    if (loadTimerRef.current) window.clearTimeout(loadTimerRef.current);
    setStatus("ready");
    setErrorMsg(null);
  };

  const StatusBadge = () => {
    if (status === "idle")
      return <span className="text-muted-foreground">սպասում</span>;
    if (status === "loading")
      return (
        <span className="inline-flex items-center gap-1 text-amber-600">
          <Loader2 className="h-3 w-3 animate-spin" /> բեռնվում
        </span>
      );
    if (status === "error")
      return (
        <span className="inline-flex items-center gap-1 text-destructive">
          <AlertTriangle className="h-3 w-3" /> սխալ
        </span>
      );
    return (
      <span className="inline-flex items-center gap-1 text-emerald-600">
        <CheckCircle2 className="h-3 w-3" /> համաժամ
        {lastSync && (
          <span className="text-muted-foreground">
            · {new Date(lastSync).toLocaleTimeString()}
          </span>
        )}
      </span>
    );
  };

  return (
    <div className="glass-strong sticky top-24 overflow-hidden rounded-3xl">
      <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
        <div className="flex items-center gap-2">
          <Eye className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Իրական ժամանակում</span>
        </div>
        <div className="flex items-center gap-1">
          {src && (
            <a
              href={src}
              target="_blank"
              rel="noreferrer"
              className="rounded-md p-2 text-muted-foreground hover:text-foreground"
              title="Բացել նոր ներդիրում"
            >
              <ExternalLink className="h-3.5 w-3.5" />
            </a>
          )}
          <Button
            size="icon"
            variant={device === "phone" ? "default" : "ghost"}
            onClick={() => setDevice("phone")}
            className="h-8 w-8"
            type="button"
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant={device === "desktop" ? "default" : "ghost"}
            onClick={() => setDevice("desktop")}
            className="h-8 w-8"
            type="button"
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={reload}
            className="h-8 w-8"
            type="button"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between border-b border-border/40 px-4 py-2 text-[11px]">
        <StatusBadge />
        {src && (
          <span className="truncate text-muted-foreground" title={src}>
            {src.replace(/^https?:\/\//, "")}
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-[11px] text-destructive">
          {errorMsg} —{" "}
          {src && (
            <a href={src} target="_blank" rel="noreferrer" className="underline">
              բացեք demo-ն նոր ներդիրում
            </a>
          )}
        </div>
      )}

      <div className="bg-gradient-to-b from-background to-muted p-4">
        <div
          className="mx-auto overflow-hidden rounded-2xl border border-border/60 bg-background shadow-2xl transition-all"
          style={{
            width: device === "phone" ? 320 : "100%",
            height: device === "phone" ? 640 : 720,
            maxWidth: "100%",
          }}
        >
          {src ? (
            <iframe
              ref={ref}
              title="Invitation preview"
              src={src}
              onLoad={onLoad}
              onError={() => {
                setStatus("error");
                setErrorMsg("iframe error");
              }}
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              className="h-full w-full border-0"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
              Ընտրեք թեմփլեյթ՝ նախադիտումը տեսնելու համար
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
