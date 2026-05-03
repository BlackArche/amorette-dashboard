import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

type AnyRecord = Record<string, unknown>;

interface Props {
  value: AnyRecord;
  onChange: (next: AnyRecord) => void;
  path?: string[];
}

function setDeep(obj: AnyRecord, path: string[], value: unknown): AnyRecord {
  if (path.length === 0) return obj;
  const [head, ...rest] = path;
  const current = (obj?.[head] as AnyRecord) ?? {};
  return {
    ...obj,
    [head]: rest.length === 0 ? value : setDeep(current, rest, value),
  };
}

function humanize(key: string) {
  return key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
}

export function DynamicFields({ value, onChange, path = [] }: Props) {
  if (!value || typeof value !== "object") return null;

  const update = (key: string, v: unknown) => {
    onChange(setDeep(value, [key], v));
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {Object.entries(value).map(([key, v]) => {
        const fullKey = [...path, key].join(".");

        // Skip arrays of objects (gallery handled separately) and null
        if (v === null || v === undefined) {
          return (
            <div key={fullKey}>
              <Label className="text-xs">{humanize(key)}</Label>
              <Input value="" onChange={(e) => update(key, e.target.value)} />
            </div>
          );
        }

        if (typeof v === "boolean") {
          return (
            <label
              key={fullKey}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background/60 p-3 sm:col-span-1"
            >
              <span className="text-sm">{humanize(key)}</span>
              <Switch checked={v} onCheckedChange={(c) => update(key, c)} />
            </label>
          );
        }

        if (typeof v === "number") {
          return (
            <div key={fullKey}>
              <Label className="text-xs">{humanize(key)}</Label>
              <Input
                type="number"
                value={v}
                onChange={(e) => update(key, Number(e.target.value))}
              />
            </div>
          );
        }

        if (typeof v === "string") {
          const long = v.length > 60 || /\n/.test(v);
          return (
            <div key={fullKey} className={long ? "sm:col-span-2" : ""}>
              <Label className="text-xs">{humanize(key)}</Label>
              {long ? (
                <Textarea
                  rows={3}
                  value={v}
                  onChange={(e) => update(key, e.target.value)}
                />
              ) : (
                <Input
                  value={v}
                  onChange={(e) => update(key, e.target.value)}
                />
              )}
            </div>
          );
        }

        if (Array.isArray(v)) {
          // Skip non-primitive arrays in dynamic editor
          if (v.length && typeof v[0] === "object") return null;
          return (
            <div key={fullKey} className="sm:col-span-2">
              <Label className="text-xs">{humanize(key)}</Label>
              <Input
                value={(v as unknown[]).join(", ")}
                onChange={(e) =>
                  update(
                    key,
                    e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  )
                }
              />
              <p className="mt-1 text-[10px] text-muted-foreground">Բաժանեք ստորակետով</p>
            </div>
          );
        }

        if (typeof v === "object") {
          return (
            <div
              key={fullKey}
              className="sm:col-span-2 rounded-2xl border border-border/50 bg-background/40 p-4"
            >
              <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary/80">
                {humanize(key)}
              </div>
              <DynamicFields
                value={v as AnyRecord}
                onChange={(next) => update(key, next)}
                path={[...path, key]}
              />
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}
