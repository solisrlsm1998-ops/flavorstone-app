"use client";

import { useMemo } from "react";
import AppShell from "@/components/layout/AppShell";
import { useContentWorkspace, type ContentItem } from "@/context/ContentWorkspace";

const STATUS_ORDER = [
  { key: "draft", label: "Borrador", color: "#94a3b8" },
  { key: "design", label: "En diseño", color: "#d97706" },
  { key: "review", label: "En revisión", color: "#2563eb" },
  { key: "approved", label: "Aprobado", color: "#059669" },
  { key: "scheduled", label: "Programado", color: "#7c3aed" },
  { key: "published", label: "Publicado", color: "#9333ea" },
];

function tally(items: ContentItem[], pick: (item: ContentItem) => string) {
  const map = new Map<string, number>();

  for (const item of items) {
    const key = `${pick(item) || ""}`.trim() || "Sin definir";
    map.set(key, (map.get(key) || 0) + 1);
  }

  return [...map.entries()].map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
}

function BarList({ title, rows, total }: { title: string; rows: { label: string; value: number }[]; total: number }) {
  return (
    <section className="rounded-[24px] border border-gray-200 bg-white p-7">
      <h3 className="font-semibold text-gray-950">{title}</h3>

      {rows.length ? (
        <div className="mt-5 space-y-4">
          {rows.map(({ label, value }) => {
            const pct = total ? Math.round((value / total) * 100) : 0;

            return (
              <div key={label}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="min-w-0 truncate text-gray-700">{label}</span>
                  <span className="shrink-0 tabular-nums text-gray-500">
                    {value} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full bg-purple-500" style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="mt-5 text-sm text-gray-400">Sin datos todavía.</p>
      )}
    </section>
  );
}

function AnalyticsView() {
  const { items, loading, error } = useContentWorkspace();

  const total = items.length;

  const statusRows = useMemo(
    () =>
      STATUS_ORDER.map(({ key, label, color }) => ({
        key,
        label,
        color,
        value: items.filter((item) => item.statusKey === key).length,
      })),
    [items],
  );

  const byProduct = useMemo(() => tally(items, (item) => item.productName), [items]);
  const byPlatform = useMemo(() => tally(items, (item) => item.platform), [items]);
  const byPillar = useMemo(() => tally(items, (item) => item.pillar), [items]);
  const byDistribution = useMemo(() => tally(items, (item) => item.distributionType), [items]);

  const sinFecha = useMemo(() => items.filter((item) => !`${item.publishDate || ""}`.trim()).length, [items]);

  if (error) {
    return <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        Calculando métricas...
      </div>
    );
  }

  if (!total) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-12 text-center">
        <h3 className="text-lg font-semibold text-gray-900">Aún no hay nada que medir</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Cuando registres contenido, aquí verás su distribución por estado, producto, plataforma y pilar.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-2 gap-5 xl:grid-cols-4">
        <article className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Total de contenidos</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums">{total}</p>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Publicados</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums">
            {statusRows.find((row) => row.key === "published")?.value ?? 0}
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">En proceso</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums">
            {statusRows
              .filter((row) => ["draft", "design", "review"].includes(row.key))
              .reduce((sum, row) => sum + row.value, 0)}
          </p>
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-6">
          <p className="text-sm text-gray-500">Sin fecha asignada</p>
          <p className="mt-4 text-4xl font-semibold tracking-tight tabular-nums">{sinFecha}</p>
        </article>
      </section>

      <section className="rounded-[24px] border border-gray-200 bg-white p-7">
        <h3 className="font-semibold text-gray-950">Flujo de producción</h3>
        <p className="mt-1 text-sm text-gray-400">Dónde está atorado el contenido</p>

        <div className="mt-6 space-y-4">
          {statusRows.map(({ key, label, value, color }) => {
            const pct = total ? Math.round((value / total) * 100) : 0;

            return (
              <div key={key}>
                <div className="flex items-baseline justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2 text-gray-700">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </span>
                  <span className="tabular-nums text-gray-500">
                    {value} · {pct}%
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid gap-5 xl:grid-cols-2">
        <BarList title="Por producto" rows={byProduct} total={total} />
        <BarList title="Por plataforma" rows={byPlatform} total={total} />
        <BarList title="Por pilar estratégico" rows={byPillar} total={total} />
        <BarList title="Orgánico vs pautado" rows={byDistribution} total={total} />
      </div>

      <p className="px-2 text-xs text-gray-400">
        Estas métricas describen tu propia planeación de contenido. El alcance, la interacción y el ROAS requieren
        conectar Meta.
      </p>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <AppShell title="Analítica" subtitle="Distribución y avance de tu contenido.">
      <AnalyticsView />
    </AppShell>
  );
}
