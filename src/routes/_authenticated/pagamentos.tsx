import { createFileRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/layout/PageHeader";
import { pagamentosService } from "@/services";
import { extractError } from "@/lib/api";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_authenticated/pagamentos")({
  component: PagamentosPage,
});

function PagamentosPage() {
  const { user } = useAuth();
  const [aprovarId, setAprovarId] = useState("");
  const [registrar, setRegistrar] = useState({
    id: "",
    valorPago: "",
    formaPagamento: "1",
    comprovanteUrl: "",
  });
  const [criar, setCriar] = useState({
    eventoTrabalhadorId: "",
    valorPrevisto: "",
    dataPrevista: "",
    formaPagamento: "1",
  });

  const criarMut = useMutation({
    mutationFn: () =>
      pagamentosService.create(criar.eventoTrabalhadorId, {
        valorPrevisto: Number(criar.valorPrevisto),
        dataPrevista: criar.dataPrevista,
        formaPagamento: Number(criar.formaPagamento),
        createdBy: user?.email ?? "web",
      }),
    onSuccess: () => toast.success("Pagamento previsto criado"),
    onError: (err) => toast.error(extractError(err)),
  });

  const aprovarMut = useMutation({
    mutationFn: () => pagamentosService.aprovar(aprovarId),
    onSuccess: () => toast.success("Pagamento aprovado"),
    onError: (err) => toast.error(extractError(err)),
  });

  const registrarMut = useMutation({
    mutationFn: () =>
      pagamentosService.registrar(registrar.id, {
        valorPago: Number(registrar.valorPago),
        formaPagamento: Number(registrar.formaPagamento),
        comprovanteUrl: registrar.comprovanteUrl || undefined,
      }),
    onSuccess: () => toast.success("Pagamento registrado"),
    onError: (err) => toast.error(extractError(err)),
  });

  return (
    <div>
      <PageHeader
        title="Pagamentos"
        description="Crie previsões, aprove e registre pagamentos aos trabalhadores."
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-lg bg-card p-5 shadow-sm card-top-primary">
          <h2 className="mb-3 font-semibold">Criar previsão</h2>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Evento-Trabalhador ID</Label>
              <Input
                value={criar.eventoTrabalhadorId}
                onChange={(e) =>
                  setCriar((c) => ({ ...c, eventoTrabalhadorId: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Valor previsto (R$)</Label>
              <Input
                type="number"
                value={criar.valorPrevisto}
                onChange={(e) => setCriar((c) => ({ ...c, valorPrevisto: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Data prevista</Label>
              <Input
                type="date"
                value={criar.dataPrevista}
                onChange={(e) => setCriar((c) => ({ ...c, dataPrevista: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <Input
                type="number"
                value={criar.formaPagamento}
                onChange={(e) => setCriar((c) => ({ ...c, formaPagamento: e.target.value }))}
              />
            </div>
            <Button
              className="w-full"
              disabled={criarMut.isPending || !criar.eventoTrabalhadorId}
              onClick={() => criarMut.mutate()}
            >
              {criarMut.isPending ? "Enviando..." : "Criar"}
            </Button>
          </div>
        </section>

        <section className="rounded-lg bg-card p-5 shadow-sm card-top-warning">
          <h2 className="mb-3 font-semibold">Aprovar pagamento</h2>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Pagamento ID</Label>
              <Input value={aprovarId} onChange={(e) => setAprovarId(e.target.value)} />
            </div>
            <Button
              className="w-full"
              disabled={aprovarMut.isPending || !aprovarId}
              onClick={() => aprovarMut.mutate()}
            >
              {aprovarMut.isPending ? "Enviando..." : "Aprovar"}
            </Button>
          </div>
        </section>

        <section className="rounded-lg bg-card p-5 shadow-sm card-top-success">
          <h2 className="mb-3 font-semibold">Registrar pagamento</h2>
          <div className="space-y-3">
            <div className="space-y-2">
              <Label>Pagamento ID</Label>
              <Input
                value={registrar.id}
                onChange={(e) => setRegistrar((c) => ({ ...c, id: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Valor pago (R$)</Label>
              <Input
                type="number"
                value={registrar.valorPago}
                onChange={(e) => setRegistrar((c) => ({ ...c, valorPago: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Forma de pagamento</Label>
              <Input
                type="number"
                value={registrar.formaPagamento}
                onChange={(e) =>
                  setRegistrar((c) => ({ ...c, formaPagamento: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>URL do comprovante</Label>
              <Input
                value={registrar.comprovanteUrl}
                onChange={(e) =>
                  setRegistrar((c) => ({ ...c, comprovanteUrl: e.target.value }))
                }
              />
            </div>
            <Button
              className="w-full"
              disabled={registrarMut.isPending || !registrar.id}
              onClick={() => registrarMut.mutate()}
            >
              {registrarMut.isPending ? "Enviando..." : "Registrar"}
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
