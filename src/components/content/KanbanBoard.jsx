"use client";

import { DndContext, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { useMemo, useState } from "react";
import { useContent } from "../../context/ContentWorkspace";
import KanbanColumn from "./KanbanColumn";

const columns = [
  { id: "pending", title: "Pendiente", accentClass: "text-gray-500", statusKey: "pending", statusLabel: "Pendiente" },
  { id: "design", title: "En diseño", accentClass: "text-amber-600", statusKey: "design", statusLabel: "En diseño" },
  { id: "review", title: "En revisión", accentClass: "text-blue-600", statusKey: "review", statusLabel: "En revisión" },
  { id: "approved", title: "Aprobado", accentClass: "text-emerald-600", statusKey: "approved", statusLabel: "Aprobado" },
  { id: "scheduled", title: "Programado", accentClass: "text-violet-600", statusKey: "scheduled", statusLabel: "Programado" },
  { id: "published", title: "Publicado", accentClass: "text-purple-600", statusKey: "published", statusLabel: "Publicado" },
];

function getColumnId(item) {
  const status = `${item.statusKey || item.status || item.statusLabel || ""}`.toLowerCase();

  if (status.includes("design")) return "design";
  if (status.includes("review")) return "review";
  if (status.includes("approved")) return "approved";
  if (status.includes("scheduled") || status.includes("program")) return "scheduled";
  if (status.includes("publish") || status.includes("done")) return "published";
  if (status.includes("draft") || status.includes("pending")) return "pending";

  return "pending";
}

function getStatusLabel(statusKey) {
  const labels = {
    pending: "Pendiente",
    design: "En diseño",
    review: "En revisión",
    approved: "Aprobado",
    scheduled: "Programado",
    published: "Publicado",
  };

  return labels[statusKey] || statusKey;
}

function KanbanBoard({ items = [] }) {
  const { updateContentItem } = useContent();
  const [activeColumn, setActiveColumn] = useState(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const groupedItems = useMemo(
    () =>
      columns.map((column) => ({
        ...column,
        items: items.filter((item) => getColumnId(item) === column.id),
      })),
    [items],
  );

  function handleDragStart(event) {
    const columnId = event.active?.data?.current?.statusKey;
    setActiveColumn(columnId || null);
  }

  function handleDragOver(event) {
    const targetStatusKey = event.over?.data?.current?.statusKey;
    setActiveColumn(targetStatusKey || null);
  }

  function handleDragEnd(event) {
    const { active, over } = event;

    if (!active || !over) {
      setActiveColumn(null);
      return;
    }

    const targetStatusKey = over.data?.current?.statusKey;

    if (!targetStatusKey) {
      setActiveColumn(null);
      return;
    }

    const itemId = active.data?.current?.itemId;

    if (!itemId || targetStatusKey === active.data?.current?.statusKey) {
      setActiveColumn(null);
      return;
    }

    updateContentItem(itemId, {
      status: getStatusLabel(targetStatusKey),
      statusLabel: getStatusLabel(targetStatusKey),
      statusKey: targetStatusKey,
    });

    setActiveColumn(null);
  }

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
        {groupedItems.map((column) => (
          <KanbanColumn
            key={column.id}
            title={column.title}
            items={column.items}
            accentClass={column.accentClass}
            statusKey={column.statusKey}
            isOver={activeColumn === column.statusKey}
          />
        ))}
      </div>
    </DndContext>
  );
}

export default KanbanBoard;
export { getColumnId };
