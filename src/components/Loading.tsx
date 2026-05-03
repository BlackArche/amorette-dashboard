export function Loading({ label = "Բեռնում..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="flex items-center gap-3 text-muted-foreground">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm">{label}</span>
      </div>
    </div>
  );
}