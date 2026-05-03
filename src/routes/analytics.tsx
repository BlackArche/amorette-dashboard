import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { AppShell } from "@/components/AppShell";
import { PageHeader } from "@/components/PageHeader";
import { Loading } from "@/components/Loading";
import { api } from "@/lib/api";

interface TrendPoint { date: string; views?: number; rsvps?: number }

export const Route = createFileRoute("/analytics")({
  component: () => (
    <AppShell>
      <AnalyticsPage />
    </AppShell>
  ),
});

function AnalyticsPage() {
  const today = new Date();
  const from = new Date(today);
  from.setDate(from.getDate() - 30);
  const fmt = (d: Date) => d.toISOString().slice(0, 10);

  const { data, isLoading } = useQuery({
    queryKey: ["analytics-trends", fmt(from), fmt(today)],
    queryFn: async () => {
      const { data } = await api.get("/api/analytics/trends", {
        params: { from: fmt(from), to: fmt(today) },
      });
      return (data?.trends ?? data?.data ?? data ?? []) as TrendPoint[];
    },
  });

  const series: TrendPoint[] = Array.isArray(data) ? data : [];

  return (
    <div>
      <PageHeader eyebrow="Տվյալներ" title="Անալիտիկա" description="Հետևեք դիտումներին ու RSVP-ներին ժամանակի ընթացքում։" />
      <div className="glass rounded-3xl p-6">
        {isLoading ? <Loading /> : series.length === 0 ? (
          <p className="py-12 text-center text-sm text-muted-foreground">Տվյալներ չեն գտնվել</p>
        ) : (
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="vw" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.72 0.16 5)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.72 0.16 5)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="rs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.13 165)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.55 0.13 165)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="oklch(0.88 0.02 340 / 0.4)" strokeDasharray="3 3" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Area type="monotone" dataKey="views" stroke="oklch(0.72 0.16 5)" fill="url(#vw)" />
                <Area type="monotone" dataKey="rsvps" stroke="oklch(0.55 0.13 165)" fill="url(#rs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}