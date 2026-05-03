import { useDropzone } from "react-dropzone";
import { UploadCloud, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  value: File | File[] | null;
  onChange: (files: File | File[] | null) => void;
  hint?: string;
}

export function MediaDropzone({ label, accept, multiple, value, onChange, hint }: Props) {
  const files = useMemo<File[]>(() => {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const [previews, setPreviews] = useState<{ url: string; name: string; isImage: boolean }[]>([]);

  useEffect(() => {
    const urls = files.map((f) => ({
      url: URL.createObjectURL(f),
      name: f.name,
      isImage: f.type.startsWith("image/"),
    }));
    setPreviews(urls);
    return () => urls.forEach((u) => URL.revokeObjectURL(u.url));
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple: !!multiple,
    onDrop: (accepted) => {
      if (!accepted.length) return;
      if (multiple) {
        onChange([...(files || []), ...accepted]);
      } else {
        onChange(accepted[0]);
      }
    },
  });

  const remove = (idx: number) => {
    if (multiple) {
      const next = files.filter((_, i) => i !== idx);
      onChange(next.length ? next : null);
    } else {
      onChange(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      <div
        {...getRootProps()}
        className={cn(
          "group relative cursor-pointer rounded-2xl border border-dashed border-border/80 px-4 py-6 text-center transition-all",
          "hover:border-primary/60 hover:bg-primary/5",
          isDragActive && "border-primary bg-primary/10",
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="mx-auto h-7 w-7 text-muted-foreground transition group-hover:text-primary" />
        <p className="mt-2 text-sm text-foreground">
          {isDragActive ? "Թողեք ֆայլերը այստեղ..." : "Քաշեք-գցեք կամ սեղմեք ընտրելու համար"}
        </p>
        <p className="text-xs text-muted-foreground">
          {multiple ? "Ընդունվում են մի քանի ֆայլ" : "Ընդունվում է մեկ ֆայլ"}
        </p>
      </div>
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {previews.map((p, i) => (
            <div key={i} className="group relative aspect-square overflow-hidden rounded-xl border border-border/60 bg-muted">
              {p.isImage ? (
                <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center p-2 text-center text-[10px] text-muted-foreground">
                  {p.name}
                </div>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  remove(i);
                }}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 opacity-0 shadow transition group-hover:opacity-100"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}