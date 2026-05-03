import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass flex flex-col items-center justify-center rounded-3xl p-10 text-center"
    >
      <div className="mb-4 rounded-2xl bg-luxe p-3 text-primary-foreground shadow-lg">
        <Sparkles className="h-6 w-6" />
      </div>
      <h3 className="font-display text-xl">{title}</h3>
      {description && <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </motion.div>
  );
}