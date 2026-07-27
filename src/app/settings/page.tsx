"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, Loader2, AlertCircle } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { listCatalogs, createCatalogItem, deleteCatalogItem, type CatalogType } from "@/app/actions/catalog";

type CatalogItem = { id: string; name: string };

function CatalogEditor({
  type,
  title,
  description,
  placeholder,
  items,
  onChange,
}: {
  type: CatalogType;
  title: string;
  description: string;
  placeholder: string;
  items: CatalogItem[];
  onChange: (items: CatalogItem[]) => void;
}) {
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleAdd(event: React.FormEvent) {
    event.preventDefault();
    if (!draft.trim() || busy) return;

    setBusy(true);
    setError("");

    try {
      const created = await createCatalogItem(type, draft);
      onChange([...items, created]);
      setDraft("");
    } catch (err) {
      setError((err as Error)?.message || "No se pudo agregar.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: CatalogItem) {
    setError("");

    try {
      const result = await deleteCatalogItem(item.id);

      if (!result.deleted && result.inUse) {
        setError(
          `"${item.name}" está en uso por ${result.inUse} ${result.inUse === 1 ? "contenido" : "contenidos"}. Reasígnalos antes de eliminarlo.`,
        );
        return;
      }

      onChange(items.filter((current) => current.id !== item.id));
    } catch (err) {
      setError((err as Error)?.message || "No se pudo eliminar.");
    }
  }

  return (
    <section className="rounded-[24px] border border-gray-200 bg-white p-7">
      <h3 className="font-semibold text-gray-950">{title}</h3>
      <p className="mt-1 text-sm text-gray-400">{description}</p>

      <form onSubmit={handleAdd} className="mt-5 flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:bg-white"
        />
        <button
          type="submit"
          disabled={busy || !draft.trim()}
          className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
          Agregar
        </button>
      </form>

      {error ? (
        <p className="mt-3 flex items-start gap-2 text-sm text-red-600">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          {error}
        </p>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-2">
        {items.length ? (
          items.map((item) => (
            <span
              key={item.id}
              className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-3 pr-2 text-sm text-gray-700"
            >
              {item.name}
              <button
                type="button"
                onClick={() => handleDelete(item)}
                className="rounded-full p-1 text-gray-400 transition hover:bg-white hover:text-red-600"
                aria-label={`Eliminar ${item.name}`}
              >
                <Trash2 size={13} />
              </button>
            </span>
          ))
        ) : (
          <p className="text-sm text-gray-400">Todavía no hay elementos.</p>
        )}
      </div>
    </section>
  );
}

function SettingsView() {
  const [products, setProducts] = useState<CatalogItem[]>([]);
  const [pillars, setPillars] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    listCatalogs()
      .then((data) => {
        if (cancelled) return;
        setProducts(data.products);
        setPillars(data.pillars);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "No se pudo cargar la configuración.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        Cargando configuración...
      </div>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <CatalogEditor
        type="product"
        title="Productos"
        description="Aparecen en el selector de Producto al crear contenido."
        placeholder="Ej. Sartén cerámico"
        items={products}
        onChange={setProducts}
      />

      <CatalogEditor
        type="pillar"
        title="Pilares estratégicos"
        description="Categorías para clasificar el enfoque de cada contenido."
        placeholder="Ej. Inspiración"
        items={pillars}
        onChange={setPillars}
      />

      <section className="rounded-[24px] border border-gray-200 bg-white p-7 xl:col-span-2">
        <h3 className="font-semibold text-gray-950">Equipo</h3>
        <p className="mt-1 text-sm text-gray-400">
          Las cuentas se dan de alta manualmente desde el panel de Clerk. El registro público está deshabilitado.
        </p>
      </section>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <AppShell title="Configuración" subtitle="Catálogos y preferencias del espacio de trabajo.">
      <SettingsView />
    </AppShell>
  );
}
