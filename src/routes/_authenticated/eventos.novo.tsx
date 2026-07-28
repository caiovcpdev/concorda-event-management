import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/PageHeader";
import { eventosService } from "@/services";
import { extractError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/eventos/novo")({
  component: NovoEvento,
});

function NovoEvento() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { user } = useAuth();
  const [form, setForm] = useState({
    nome: "",
    cidade: "",
    estado: "",
    dataInicio: "",
    dataFim: "",
    organizador: "",
  });

  const mut = useMutation({
    mutationFn: () =>
      eventosService.create({
        ...form,
        dataInicio: new Date(form.dataInicio).toISOString(),
        dataFim: new Date(form.dataFim).toISOString(),
        createdBy: user?.email ?? user?.id ?? "web",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["eventos"] });
      toast.success("Evento criado");
      navigate({ to: "/eventos" });
    },
    onError: (err) => toast.error(extractError(err)),
  });

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    mut.mutate();
  };

  return (
    <div>
      <PageHeader title="Novo evento" description="Cadastre um novo evento operacional." />
      <form
        onSubmit={submit}
        className="max-w-2xl space-y-4 rounded-lg bg-card p-6 shadow-sm card-top-primary"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label>Nome</Label>
            <Input required value={form.nome} onChange={set("nome")} />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input required value={form.cidade} onChange={set("cidade")} />
          </div>
          <div className="space-y-2">
            <Label>Estado (UF)</Label>
            <Input required maxLength={2} value={form.estado} onChange={set("estado")} />
          </div>
          <div className="space-y-2">
            <Label>Data de início</Label>
            <Input required type="datetime-local" value={form.dataInicio} onChange={set("dataInicio")} />
          </div>
          <div className="space-y-2">
            <Label>Data de fim</Label>
            <Input required type="datetime-local" value={form.dataFim} onChange={set("dataFim")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Organizador</Label>
            <Input required value={form.organizador} onChange={set("organizador")} />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => navigate({ to: "/eventos" })}>
            Cancelar
          </Button>
          <Button type="submit" disabled={mut.isPending}>
            {mut.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
