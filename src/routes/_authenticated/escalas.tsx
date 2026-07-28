import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, DataTableShell } from "@/components/layout/PageHeader";
import { eventosService } from "@/services";

export const Route = createFileRoute("/_authenticated/escalas")({
  component: EscalasIndex,
});

function EscalasIndex() {
  const { data } = useQuery({ queryKey: ["eventos"], queryFn: eventosService.list });
  return (
    <div>
      <PageHeader
        title="Escalas"
        description="Escolha um evento para gerenciar suas escalas."
      />
      <DataTableShell>
        <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="p-3">Evento</th>
            <th className="p-3">Cidade/UF</th>
            <th className="p-3">Início</th>
            <th className="p-3"></th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((e) => (
            <tr key={e.id} className="border-t">
              <td className="p-3 font-medium">{e.nome}</td>
              <td className="p-3">
                {e.cidade}/{e.estado}
              </td>
              <td className="p-3">
                {new Date(e.dataInicio).toLocaleDateString("pt-BR")}
              </td>
              <td className="p-3 text-right">
                <Link
                  to="/eventos/$id"
                  params={{ id: e.id }}
                  className="text-secondary hover:underline"
                >
                  Gerenciar escalas
                </Link>
              </td>
            </tr>
          ))}
          {!data?.length && (
            <tr>
              <td colSpan={4} className="p-6 text-center text-sm text-muted-foreground">
                Nenhum evento disponível.
              </td>
            </tr>
          )}
        </tbody>
      </DataTableShell>
    </div>
  );
}
