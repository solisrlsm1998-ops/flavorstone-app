import { useDroppable } from "@dnd-kit/core";
import KanbanCard from "./KanbanCard";

function KanbanColumn({ title, items = [], accentClass, statusKey, isOver }) {
  const { setNodeRef } = useDroppable({
    id: statusKey,
    data: { type: "column", statusKey },
  });

  return (
    <section
      ref={setNodeRef}
      className={`rounded-[24px] border p-4 transition ${
        isOver ? "border-purple-300 bg-purple-50/60" : "border-gray-200 bg-gray-50/70"
      }`}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className={`text-[11px] font-semibold uppercase tracking-[0.24em] ${accentClass}`}>
            {title}
          </p>
          <h4 className="mt-1 text-sm font-semibold text-gray-900">{title}</h4>
        </div>
        <span className="rounded-full border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600">
          {items.length}
        </span>
      </div>

      <div className="space-y-3">
        {items.length ? (
          items.map((item) => <KanbanCard key={item.id} item={item} />)
        ) : (
          <div className="rounded-[18px] border border-dashed border-gray-200 bg-white/70 px-4 py-6 text-center text-sm text-gray-400">
            Sin elementos
          </div>
        )}
      </div>
    </section>
  );
}

export default KanbanColumn;
