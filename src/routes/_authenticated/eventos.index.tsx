import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader, DataTableShell } from "@/components/layout/PageHeader";
import { eventosService } from "@/services";

export const Route = createFileRoute("/_authenticated/eventos/")({
  component: EventosList,
});

function EventosList() {
  const { data, isLoading } = useQuery({ queryKey: ["eventos"], queryFn: eventosService.list });
  const [q, setQ] = useState("");
  const filtered = (data ?? []).filter((e) =>
    [e.nome, e.cidade, e.estado, e.organizador].join(" ").toLowerCase().includes(q.toLowerCase()),
  );

  return (
    <div>
      <PageHeader
        title="Eventos"
        description="Gerencie eventos operacionais."
        actions={
          <Button asChild>
            <Link to="/eventos/novo">
              <Plus className="mr-1 h-4 w-4" /> Novo evento
            </Link>
          </Button>
        }
      />

      <DataTableShell
        toolbar={
          <div className="relative w-full max-w-sm">
            <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              placeholder="Buscar por nome, cidade..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        }
      >
        <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Nome</th>
            <th className="p-3">Cidade/UF</th>
            <th className="p-3">Início</th>
            <th className="p-3">Fim</th>
            <th className="p-3">Organizador</th>
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
            filtered.map((e) => (
              <tr key={e.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-medium">{e.nome}</td>
                <td className="p-3">
                  {e.cidade}/{e.estado}
                </td>
                <td className="p-3">
                  {new Date(e.dataInicio).toLocaleDateString("pt-BR")}
                </td>
                <td className="p-3">{new Date(e.dataFim).toLocaleDateString("pt-BR")}</td>
                <td className="p-3">{e.organizador}</td>
                <td className="p-3 text-right">
                  <Link
                    to="/eventos/$id"
                    params={{ id: e.id }}
                    className="text-secondary hover:underline"
                  >
                    Detalhes
                  </Link>
                </td>
              </tr>
            ))}
          {!isLoading && !filtered.length && (
            <tr>
              <td colSpan={6} className="p-6 text-center text-sm text-muted-foreground">
                Nenhum evento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </DataTableShell>
    </div>
  );
}
