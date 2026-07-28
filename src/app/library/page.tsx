"use client";

import { useEffect, useMemo, useState } from "react";
import { FileText, FileVideo, ImageIcon } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import { listAllMedia } from "@/app/actions/content";

type MediaEntry = {
  id: string;
  file_name: string;
  file_url: string;
  media_type: string;
  role: string;
  size_bytes: number | string | null;
  content_title: string;
  product_name: string;
};

function formatSize(bytes: number | string | null) {
  const value = Number(bytes);
  if (!value || Number.isNaN(value)) return "—";
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function LibraryView() {
  const [entries, setEntries] = useState<MediaEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    let cancelled = false;

    listAllMedia()
      .then((data) => {
        if (!cancelled) setEntries(data as MediaEntry[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "No se pudieron cargar los archivos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? entries : entries.filter((entry) => entry.media_type === filter)),
    [entries, filter],
  );

  if (error) {
    return <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>;
  }

  if (loading) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
        Cargando biblioteca...
      </div>
    );
  }

  if (!entries.length) {
    return (
      <div className="rounded-[24px] border border-gray-200 bg-white p-12 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-50 text-purple-600">
          <ImageIcon size={24} />
        </div>
        <h3 className="mt-5 text-lg font-semibold text-gray-900">La biblioteca está vacía</h3>
        <p className="mx-auto mt-2 max-w-md text-sm text-gray-500">
          Los archivos que adjuntes a un contenido aparecerán aquí automáticamente.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2 rounded-[24px] border border-gray-200 bg-white p-4">
        {[
          { key: "all", label: `Todos (${entries.length})` },
          { key: "image", label: "Imágenes" },
          { key: "video", label: "Videos" },
          { key: "document", label: "Documentos" },
        ].map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition ${
              filter === key ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((entry) => (
          <a
            key={entry.id}
            href={entry.file_url}
            target="_blank"
            rel="noreferrer"
            className="group overflow-hidden rounded-[20px] border border-gray-200 bg-white transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-40 items-center justify-center overflow-hidden bg-gray-100">
              {entry.media_type === "video" ? (
                <video src={entry.file_url} className="h-full w-full object-cover" preload="metadata" muted playsInline />
              ) : entry.media_type === "document" ? (
                <FileText size={32} className="text-gray-400" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.file_url} alt={entry.file_name} className="h-full w-full object-cover" />
              )}
            </div>

            <div className="p-4">
              <p className="truncate text-sm font-medium text-gray-900">{entry.file_name}</p>
              <p className="mt-1 truncate text-xs text-gray-500">{entry.content_title || "Sin contenido asociado"}</p>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5">
                  {entry.media_type === "video" ? (
                    <FileVideo size={12} />
                  ) : entry.media_type === "document" ? (
                    <FileText size={12} />
                  ) : (
                    <ImageIcon size={12} />
                  )}
                  {entry.media_type}
                </span>
                {entry.role && entry.role !== "attachment" ? (
                  <span className="rounded-full bg-purple-50 px-2 py-0.5 text-purple-700">
                    {entry.role === "cover" ? "portada" : "referencia"}
                  </span>
                ) : null}
                {entry.product_name ? (
                  <span className="rounded-full bg-gray-100 px-2 py-0.5">{entry.product_name}</span>
                ) : null}
                <span className="tabular-nums">{formatSize(entry.size_bytes)}</span>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function LibraryPage() {
  return (
    <AppShell title="Biblioteca" subtitle="Todos los archivos vinculados a tus contenidos.">
      <LibraryView />
    </AppShell>
  );
}
