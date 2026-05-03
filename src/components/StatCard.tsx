import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  delta?: string;
  icon?: React.ReactNode;
  delay?: number;
  tone?: "pink" | "gold" | "emerald";
}

export function StatCard({ label, value, delta, icon, delay = 0, tone = "pink" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass relative overflow-hidden rounded-3xl p-5"
    >
      <div className={cn(
        "absolute -right-10 -top-10 h-32 w-32 rounded-full blur-3xl opacity-50",
        tone === "pink" && "bg-pink",
        tone === "gold" && "bg-gold",
        tone === "emerald" && "bg-emerald",
      )} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl text-foreground">{value}</div>
          {delta && <div className="mt-1 text-xs text-emerald">{delta}</div>}
        </div>
        {icon && <div className="rounded-xl bg-background/60 p-2 text-primary shadow-sm">{icon}</div>}
      </div>
    </motion.div>
  );
}