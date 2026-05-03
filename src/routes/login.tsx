import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Mail, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Բարի վերադարձ");
      navigate({ to: "/" });
    } catch (err) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message ?? (err as Error)?.message ?? "Մուտքի սխալ";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-6">
      <div className="absolute inset-0 -z-10 bg-luxe opacity-20 blur-3xl" />
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="glass-strong w-full max-w-md rounded-3xl p-8"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 rounded-2xl bg-luxe p-3 shadow-lg">
            <Sparkles className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="font-display text-3xl text-luxe">Amorette</h1>
          <p className="text-sm text-muted-foreground">Admin Studio · Մուտք</p>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Էլ. հասցե</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" placeholder="admin@amorette.am" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Գաղտնաբառ</Label>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" placeholder="••••••••" />
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-luxe text-primary-foreground shadow-lg hover:opacity-95">
            {loading ? "Մուտք..." : "Մուտք"}
          </Button>
        </form>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Միացված API՝ <code className="rounded bg-muted px-1.5 py-0.5">{import.meta.env.VITE_API_BASE_URL ?? "http://localhost:7777"}</code>
        </p>
      </motion.div>
    </div>
  );
}