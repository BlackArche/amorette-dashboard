import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

export function SectionCard({ title, description, icon, action, children, delay = 0, className }: Props) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={cn("glass rounded-3xl p-5 sm:p-6", className)}
    >
      <header className="mb-5 flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {icon && (
            <div className="rounded-xl bg-luxe p-2 text-primary-foreground shadow-md">
              {icon}
            </div>
          )}
          <div>
            <h3 className="font-display text-xl text-foreground">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
          </div>
        </div>
        {action}
      </header>
      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}