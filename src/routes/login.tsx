import { createFileRoute, useNavigate, Navigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/lib/auth";
import { extractError } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/login")({
  ssr: false,
  component: LoginPage,
});

function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await login(email, senha);
      toast.success("Bem-vindo!");
      navigate({ to: "/dashboard" });
    } catch (err) {
      toast.error(extractError(err));
    }
  };

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hidden flex-col justify-between bg-sidebar p-10 text-sidebar-foreground md:flex">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded bg-primary font-bold text-primary-foreground">
            C
          </div>
          <div>
            <div className="text-lg font-semibold text-white">ConcordaAI</div>
            <div className="text-xs uppercase tracking-wider text-sidebar-foreground/60">
              Gestão Operacional de Eventos
            </div>
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Plataforma institucional para Carnaval, Micaretas e São João.
          </h2>
          <p className="mt-4 max-w-md text-sm text-sidebar-foreground/70">
            Controle de escalas, trabalhadores, check-in por geolocalização, ocorrências e
            pagamentos — em um só lugar.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-sidebar-foreground/60">
          <ShieldCheck className="h-4 w-4" /> Acesso restrito. Autenticação JWT com controle
          por perfil.
        </div>
      </div>

      <div className="flex items-center justify-center bg-background p-6">
        <form
          onSubmit={onSubmit}
          className="w-full max-w-sm rounded-lg bg-card p-6 shadow-sm card-top-primary"
        >
          <h1 className="text-xl font-semibold text-foreground">Entrar</h1>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">
            Acesse com suas credenciais institucionais.
          </p>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@orgao.gov.br"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? "Entrando..." : "Entrar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
