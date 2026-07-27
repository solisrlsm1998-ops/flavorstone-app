import { useDraggable } from "@dnd-kit/core";
import { GripVertical } from "lucide-react";
import DistributionBadge from "./DistributionBadge";
import StatusBadge from "./StatusBadge";

function KanbanCard({ item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: item.id,
    data: { type: "card", itemId: item.id, statusKey: item.statusKey || item.status },
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <article
      ref={setNodeRef}
      style={style}
      className={`rounded-[20px] border border-gray-200 bg-white p-4 shadow-sm transition ${
        isDragging ? "opacity-70 shadow-lg" : "hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              {...listeners}
              {...attributes}
              className="rounded-full p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
              aria-label={`Mover ${item.title}`}
            >
              <GripVertical size={16} />
            </button>
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-gray-400">
              {item.productName || item.product_name || item.brand}
            </p>
          </div>
          <h5 className="mt-2 text-sm font-semibold text-gray-900">{item.title}</h5>
        </div>
        <div className="flex flex-col items-end gap-1">
          <DistributionBadge distributionType={item.distributionType} />
          <StatusBadge status={item.statusKey || item.status} />
        </div>
      </div>

      <p className="mt-3 text-sm leading-6 text-gray-500">{item.description}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-600">
        <span className="rounded-full bg-gray-100 px-2.5 py-1">{item.platform}</span>
        <span className="rounded-full bg-gray-100 px-2.5 py-1">{item.type}</span>
      </div>

      <div className="mt-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <div className="flex items-center justify-between gap-3">
          <span>Publicación</span>
          <span className="font-medium text-gray-900">
            {item.publishDate || "Sin fecha"}
          </span>
        </div>
      </div>
    </article>
  );
}

export default KanbanCard;
