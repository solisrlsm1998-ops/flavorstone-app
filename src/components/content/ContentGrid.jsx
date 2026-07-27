import ContentCard from "./ContentCard";
import DistributionBadge from "./DistributionBadge";
import EmptyState from "./EmptyState";
import KanbanBoard from "./KanbanBoard";

function ContentGrid({ items, view = "cards", onEdit, onDelete }) {
  items = items || [];

  if (!items.length) {
    return <EmptyState />;
  }

  if (view === "table") {
    return (
      <div className="overflow-hidden rounded-[24px] border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-200 text-left text-sm">
          <thead className="bg-gray-50 text-gray-500">
            <tr>
              <th className="px-5 py-3 font-medium">Contenido</th>
              <th className="px-5 py-3 font-medium">Producto</th>
              <th className="px-5 py-3 font-medium">Plataforma</th>
              <th className="px-5 py-3 font-medium">Distribución</th>
              <th className="px-5 py-3 font-medium">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-gray-600">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-5 py-4 font-medium text-gray-900">
                  {item.title || <span className="text-gray-400">Sin título</span>}
                </td>
                <td className="px-5 py-4">{item.productName || item.product_name || item.brand}</td>
                <td className="px-5 py-4">{item.platform}</td>
                <td className="px-5 py-4">
                  <DistributionBadge distributionType={item.distributionType} />
                </td>
                <td className="px-5 py-4">{item.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (view === "kanban") {
    return <KanbanBoard items={items} />;
  }

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      {items.map((item) => (
        <ContentCard key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
}

export default ContentGrid;
