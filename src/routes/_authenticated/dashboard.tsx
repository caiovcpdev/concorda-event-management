import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { CalendarDays, Users, Wallet, MapPin } from "lucide-react";
import { PageHeader, StatCard } from "@/components/layout/PageHeader";
import { eventosService, trabalhadoresService } from "@/services";

export const Route = createFileRoute("/_authenticated/dashboard")({
  component: DashboardPage,
});

function DashboardPage() {
  const eventos = useQuery({ queryKey: ["eventos"], queryFn: eventosService.list });
  const trabalhadores = useQuery({
    queryKey: ["trabalhadores"],
    queryFn: trabalhadoresService.list,
  });

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Visão geral das operações em andamento."
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Eventos"
          value={eventos.data?.length ?? "—"}
          accent="primary"
          icon={<CalendarDays />}
        />
        <StatCard
          label="Trabalhadores"
          value={trabalhadores.data?.length ?? "—"}
          accent="secondary"
          icon={<Users />}
        />
        <StatCard label="Check-ins hoje" value={0} accent="success" icon={<MapPin />} />
        <StatCard label="Pagamentos pendentes" value={0} accent="warning" icon={<Wallet />} />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <div className="rounded-lg bg-card p-5 shadow-sm card-top-primary">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Últimos eventos
          </h2>
          <ul className="divide-y">
            {(eventos.data ?? []).slice(0, 5).map((e) => (
              <li key={e.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium text-foreground">{e.nome}</div>
                  <div className="text-xs text-muted-foreground">
                    {e.cidade}/{e.estado}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(e.dataInicio).toLocaleDateString("pt-BR")}
                </div>
              </li>
            ))}
            {!eventos.isLoading && !eventos.data?.length && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Nenhum evento cadastrado.
              </li>
            )}
          </ul>
        </div>

        <div className="rounded-lg bg-card p-5 shadow-sm card-top-secondary">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Trabalhadores recentes
          </h2>
          <ul className="divide-y">
            {(trabalhadores.data ?? []).slice(0, 5).map((t) => (
              <li key={t.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <div className="font-medium text-foreground">{t.nome}</div>
                  <div className="text-xs text-muted-foreground">{t.cpf}</div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {t.cidade}/{t.estado}
                </div>
              </li>
            ))}
            {!trabalhadores.isLoading && !trabalhadores.data?.length && (
              <li className="py-6 text-center text-sm text-muted-foreground">
                Nenhum trabalhador cadastrado.
              </li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
