"use client";

import { useMemo } from "react";
import { useContentWorkspace, type ContentItem } from "@/context/ContentWorkspace";
import StatusBadge from "@/components/content/StatusBadge";

const NEEDS_ATTENTION = ["draft", "pending", "design", "review"];

function formatRelativeTime(value?: string | Date | null) {
  if (!value) return "Sin fecha";

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Sin fecha";

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);

  if (minutes < 1) return "Hace unos segundos";
  if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? "minuto" : "minutos"}`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`;

  const days = Math.round(hours / 24);
  return `Hace ${days} ${days === 1 ? "día" : "días"}`;
}

function countByStatus(items: ContentItem[], keys: string[]) {
  return items.filter((item) => keys.includes(`${item.statusKey || ""}`)).length;
}

export default function DashboardView() {
  const { items, loading, error, openEditDrawer } = useContentWorkspace();

  const stats = useMemo(
    () => [
      { label: "Pendientes", value: countByStatus(items, ["draft", "pending"]) },
      { label: "En revisión", value: countByStatus(items, ["review"]) },
      { label: "Programados", value: countByStatus(items, ["scheduled"]) },
      { label: "Publicados", value: countByStatus(items, ["published"]) },
    ],
    [items],
  );

  const priorities = useMemo(
    () => items.filter((item) => NEEDS_ATTENTION.includes(`${item.statusKey || ""}`)).slice(0, 5),
    [items],
  );

  const recentActivity = useMemo(
    () =>
      [...items]
        .sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime())
        .slice(0, 4),
    [items],
  );

  return (
    <>
      <section className="rounded-[28px] bg-[#271733] px-10 py-10 text-white">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-purple-200">
          Objetivo estratégico del mes
        </p>

        <h2 className="max-w-4xl text-4xl font-semibold leading-tight tracking-tight">
          Construir una presencia más moderna, cercana y deseable para FlavorStone.
        </h2>

        <p className="mt-5 max-w-2xl text-base leading-7 text-purple-100/70">
          El contenido se enfoca en generar inspiración, confianza y deseo mediante demostraciones reales de producto.
        </p>
      </section>

      {error ? (
        <div className="mt-7 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : null}

      <section className="mt-7 grid grid-cols-2 gap-5 xl:grid-cols-4">
        {stats.map(({ label, value }) => (
          <article key={label} className="rounded-2xl border border-gray-200 bg-white p-6">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-5 text-4xl font-semibold tracking-tight tabular-nums">{loading ? "—" : value}</p>
          </article>
        ))}
      </section>

      <section className="mt-7 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="rounded-2xl border border-gray-200 bg-white p-7">
          <h3 className="font-semibold">Prioridades</h3>
          <p className="mt-1 text-sm text-gray-400">Contenido que requiere atención</p>

          {loading ? (
            <p className="mt-6 text-sm text-gray-400">Cargando...</p>
          ) : priorities.length ? (
            <div className="mt-5 divide-y divide-gray-100">
              {priorities.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => openEditDrawer(item)}
                  className="flex w-full items-center justify-between gap-3 py-4 text-left text-sm transition hover:text-purple-700"
                >
                  <span className="min-w-0 flex-1 truncate font-medium text-gray-900">{item.title || "Sin título"}</span>
                  <StatusBadge status={item.statusKey || item.status} />
                </button>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-400">Nada pendiente por ahora.</p>
          )}
        </article>

        <article className="rounded-2xl border border-gray-200 bg-white p-7">
          <h3 className="font-semibold">Actividad reciente</h3>
          <p className="mt-1 text-sm text-gray-400">Últimos cambios del equipo</p>

          {loading ? (
            <p className="mt-6 text-sm text-gray-400">Cargando...</p>
          ) : recentActivity.length ? (
            <div className="mt-6 space-y-6">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-purple-500" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{item.title || "Sin título"}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {item.statusLabel || item.status} · {formatRelativeTime(item.updatedAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-6 text-sm text-gray-400">Aún no hay actividad registrada.</p>
          )}
        </article>
      </section>
    </>
  );
}
