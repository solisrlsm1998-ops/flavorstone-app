import { Pencil, Trash2 } from "lucide-react";
import DistributionBadge from "./DistributionBadge";
import StatusBadge from "./StatusBadge";

function ContentCard({ item, onEdit, onDelete }) {
  return (
    <article className="rounded-[24px] border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gray-400">
            {item.productName || item.product_name || item.brand}
          </p>
          <h4 className="mt-2 text-lg font-semibold text-gray-950">
            {item.title || <span className="text-gray-400">Sin título</span>}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          <DistributionBadge distributionType={item.distributionType} />
          <StatusBadge status={item.statusKey || item.status} />
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label={`Editar ${item.title}`}
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label={`Eliminar ${item.title}`}
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-gray-500">{item.description}</p>

      <div className="mt-5 space-y-3 text-sm text-gray-600">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-gray-100 px-2.5 py-1">{item.platform}</span>
          <span className="rounded-full bg-gray-100 px-2.5 py-1">{item.type}</span>
        </div>

        <div className="grid gap-2 rounded-2xl bg-gray-50 p-3 text-sm text-gray-600">
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Pilar estratégico</span>
            <span className="font-medium text-gray-900">{item.pillar || "—"}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Estado</span>
            <span className="font-medium text-gray-900">{item.statusLabel || item.status}</span>
          </div>
          <div className="flex items-center justify-between gap-3">
            <span className="text-gray-500">Publicación</span>
            <span className="font-medium text-gray-900">
              {item.publishDate || "Sin fecha"} · {item.publishTime || "Sin hora"}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ContentCard;
