import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PageHeader, DataTableShell } from "@/components/layout/PageHeader";
import {
  escalasService,
  eventoTrabalhadoresService,
  eventosService,
  trabalhadoresService,
} from "@/services";
import { extractError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/_authenticated/eventos/$id")({
  component: EventoDetalhe,
});

function EventoDetalhe() {
  const { id } = Route.useParams();
  const evento = useQuery({ queryKey: ["evento", id], queryFn: () => eventosService.get(id) });
  const vinculados = useQuery({
    queryKey: ["evento-trabalhadores", id],
    queryFn: () => eventoTrabalhadoresService.list(id),
  });
  const escalas = useQuery({
    queryKey: ["escalas", id],
    queryFn: () => escalasService.list(id),
  });

  return (
    <div>
      <div className="mb-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/eventos">
            <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
          </Link>
        </Button>
      </div>
      <PageHeader
        title={evento.data?.nome ?? "Evento"}
        description={
          evento.data
            ? `${evento.data.cidade}/${evento.data.estado} • ${new Date(
                evento.data.dataInicio,
              ).toLocaleDateString("pt-BR")} — ${new Date(evento.data.dataFim).toLocaleDateString(
                "pt-BR",
              )}`
            : "Carregando..."
        }
      />

      <Tabs defaultValue="trabalhadores">
        <TabsList>
          <TabsTrigger value="trabalhadores">Trabalhadores</TabsTrigger>
          <TabsTrigger value="escalas">Escalas</TabsTrigger>
        </TabsList>

        <TabsContent value="trabalhadores" className="mt-4">
          <div className="mb-3 flex justify-end">
            <VincularDialog eventoId={id} />
          </div>
          <DataTableShell>
            <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Trabalhador</th>
                <th className="p-3">Tipo</th>
                <th className="p-3">Valor diária</th>
              </tr>
            </thead>
            <tbody>
              {(vinculados.data ?? []).map((v) => (
                <tr key={v.id} className="border-t">
                  <td className="p-3">{v.nome ?? v.trabalhadorId}</td>
                  <td className="p-3">Tipo {v.tipoTrabalhador}</td>
                  <td className="p-3">
                    {v.valorDiaria.toLocaleString("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    })}
                  </td>
                </tr>
              ))}
              {!vinculados.isLoading && !vinculados.data?.length && (
                <tr>
                  <td colSpan={3} className="p-6 text-center text-sm text-muted-foreground">
                    Nenhum trabalhador vinculado.
                  </td>
                </tr>
              )}
            </tbody>
          </DataTableShell>
        </TabsContent>

        <TabsContent value="escalas" className="mt-4">
          <div className="mb-3 flex justify-end">
            <EscalaDialog eventoId={id} />
          </div>
          <DataTableShell>
            <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="p-3">Nome</th>
                <th className="p-3">Data</th>
                <th className="p-3">Horário</th>
                <th className="p-3">Ponto de encontro</th>
              </tr>
            </thead>
            <tbody>
              {(escalas.data ?? []).map((e) => (
                <tr key={e.id} className="border-t">
                  <td className="p-3 font-medium">{e.nome}</td>
                  <td className="p-3">{new Date(e.data).toLocaleDateString("pt-BR")}</td>
                  <td className="p-3">
                    {e.horaInicio} — {e.horaFim}
                  </td>
                  <td className="p-3">{e.pontoEncontro}</td>
                </tr>
              ))}
              {!escalas.isLoading && !escalas.data?.length && (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                    Nenhuma escala criada.
                  </td>
                </tr>
              )}
            </tbody>
          </DataTableShell>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function VincularDialog({ eventoId }: { eventoId: string }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [trabalhadorId, setTrabalhadorId] = useState("");
  const [tipo, setTipo] = useState("1");
  const [valor, setValor] = useState("150");
  const trabs = useQuery({
    queryKey: ["trabalhadores"],
    queryFn: trabalhadoresService.list,
    enabled: open,
  });
  const mut = useMutation({
    mutationFn: () =>
      eventoTrabalhadoresService.vincular(eventoId, {
        trabalhadorId,
        tipoTrabalhador: Number(tipo),
        valorDiaria: Number(valor),
        createdBy: user?.email ?? "web",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["evento-trabalhadores", eventoId] });
      toast.success("Trabalhador vinculado");
      setOpen(false);
    },
    onError: (err) => toast.error(extractError(err)),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Vincular trabalhador
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular trabalhador</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Trabalhador</Label>
            <Select value={trabalhadorId} onValueChange={setTrabalhadorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {(trabs.data ?? []).map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.nome} — {t.cpf}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Input type="number" value={tipo} onChange={(e) => setTipo(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valor diária (R$)</Label>
              <Input type="number" value={valor} onChange={(e) => setValor(e.target.value)} />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!trabalhadorId || mut.isPending}
            onClick={() => mut.mutate()}
          >
            {mut.isPending ? "Vinculando..." : "Vincular"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function EscalaDialog({ eventoId }: { eventoId: string }) {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    data: "",
    horaInicio: "",
    horaFim: "",
    pontoEncontro: "",
  });
  const mut = useMutation({
    mutationFn: () =>
      escalasService.create(eventoId, {
        ...form,
        createdBy: user?.email ?? "web",
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["escalas", eventoId] });
      toast.success("Escala criada");
      setOpen(false);
    },
    onError: (err) => toast.error(extractError(err)),
  });
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-1 h-4 w-4" /> Nova escala
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nova escala</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label>Nome</Label>
            <Input value={form.nome} onChange={set("nome")} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Data</Label>
              <Input type="date" value={form.data} onChange={set("data")} />
            </div>
            <div className="space-y-2">
              <Label>Início</Label>
              <Input type="time" value={form.horaInicio} onChange={set("horaInicio")} />
            </div>
            <div className="space-y-2">
              <Label>Fim</Label>
              <Input type="time" value={form.horaFim} onChange={set("horaFim")} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Ponto de encontro</Label>
            <Input value={form.pontoEncontro} onChange={set("pontoEncontro")} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={mut.isPending} onClick={() => mut.mutate()}>
            {mut.isPending ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
