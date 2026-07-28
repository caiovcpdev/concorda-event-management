import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

export function StatCard({
  label,
  value,
  accent = "primary",
  icon,
}: {
  label: string;
  value: string | number;
  accent?: "primary" | "secondary" | "success" | "warning" | "danger";
  icon?: ReactNode;
}) {
  const top: Record<string, string> = {
    primary: "card-top-primary",
    secondary: "card-top-secondary",
    success: "card-top-success",
    warning: "card-top-warning",
    danger: "card-top-danger",
  };
  return (
    <div className={cn("rounded-lg bg-card p-4 shadow-sm", top[accent])}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-foreground">{value}</div>
        </div>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
    </div>
  );
}

export function DataTableShell({
  children,
  toolbar,
}: {
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-card shadow-sm card-top-primary">
      {toolbar && <div className="flex flex-wrap items-center gap-2 border-b p-3">{toolbar}</div>}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">{children}</table>
      </div>
    </div>
  );
}
