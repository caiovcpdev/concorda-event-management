import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, DataTableShell } from "@/components/layout/PageHeader";
import { trabalhadoresService } from "@/services";
import { extractError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/trabalhadores")({
  component: TrabalhadoresPage,
});

function TrabalhadoresPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["trabalhadores"],
    queryFn: trabalhadoresService.list,
  });
  const [q, setQ] = useState("");
  const filtered = (data ?? []).filter((t) =>
    [t.nome, t.cpf, t.cidade].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  const toggleStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      trabalhadoresService.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["trabalhadores"] }),
    onError: (err) => toast.error(extractError(err)),
  });

  return (
    <div>
      <PageHeader
        title="Trabalhadores"
        description="Cadastro de trabalhadores disponíveis para vínculo."
        actions={<NovoTrabalhadorDialog />}
      />

      <DataTableShell
        toolbar={
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar por nome ou CPF..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        }
      >
        <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">CPF</th>
            <th className="p-3">Cidade/UF</th>
            <th className="p-3">Telefone</th>
            <th className="p-3">Status</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                Carregando...
              </td>
            </tr>
          )}
          {!isLoading &&
            filtered.map((t) => {
              const active = (t.status ?? "ativo").toLowerCase() === "ativo";
              return (
                <tr key={t.id} className="border-t hover:bg-muted/30">
                  <td className="p-3 font-medium">{t.nome}</td>
                  <td className="p-3">{t.cpf}</td>
                  <td className="p-3">
                    {t.cidade}/{t.estado}
                  </td>
                  <td className="p-3">{t.telefone}</td>
                  <td className="p-3">
                    <Badge
                      className={
                        active
                          ? "bg-success text-success-foreground"
                          : "bg-muted text-muted-foreground"
                      }
                    >
                      {active ? "Ativo" : "Inativo"}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        toggleStatus.mutate({
                          id: t.id,
                          status: active ? "inativo" : "ativo",
                        })
                      }
                    >
                      {active ? "Inativar" : "Ativar"}
                    </Button>
                  </td>
                </tr>
              );
            })}
          {!isLoading && !filtered.length && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                Nenhum trabalhador encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </DataTableShell>
    </div>
  );
}

function NovoTrabalhadorDialog() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    sexo: "1",
    telefone: "",
    endereco: "",
    cidade: "",
    estado: "",
    cep: "",
  });
  const mut = useMutation({
    mutationFn: () =>
      trabalhadoresService.create({
        ...form,
        sexo: Number(form.sexo),
        dataNascimento: new Date(form.dataNascimento).toISOString(),
        createdBy: user?.email ?? "web",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trabalhadores"] });
      toast.success("Trabalhador cadastrado");
      setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Novo trabalhador
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo trabalhador</DialogTitle>
        </DialogHeader>
        <form onSubmit={submit} className="grid grid-cols-1 gap-3 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <Label>Nome</Label>
            <Input required value={form.nome} onChange={set("nome")} />
          </div>
          <div className="space-y-2">
            <Label>CPF</Label>
            <Input required value={form.cpf} onChange={set("cpf")} />
          </div>
          <div className="space-y-2">
            <Label>Data de nascimento</Label>
            <Input
              required
              type="date"
              value={form.dataNascimento}
              onChange={set("dataNascimento")}
            />
          </div>
          <div className="space-y-2">
            <Label>Sexo (1-M / 2-F)</Label>
            <Input required type="number" value={form.sexo} onChange={set("sexo")} />
          </div>
          <div className="space-y-2">
            <Label>Telefone</Label>
            <Input required value={form.telefone} onChange={set("telefone")} />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Endereço</Label>
            <Input required value={form.endereco} onChange={set("endereco")} />
          </div>
          <div className="space-y-2">
            <Label>Cidade</Label>
            <Input required value={form.cidade} onChange={set("cidade")} />
          </div>
          <div className="space-y-2">
            <Label>Estado</Label>
            <Input required maxLength={2} value={form.estado} onChange={set("estado")} />
          </div>
          <div className="space-y-2">
            <Label>CEP</Label>
            <Input required value={form.cep} onChange={set("cep")} />
          </div>
          <DialogFooter className="md:col-span-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={mut.isPending}>
              {mut.isPending ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
