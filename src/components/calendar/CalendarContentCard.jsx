import DistributionBadge from "../content/DistributionBadge";
import StatusBadge from "../content/StatusBadge";

function CalendarContentCard({ item, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(item)}
      className="w-full rounded-xl border border-purple-100 bg-purple-50/80 p-2 text-left shadow-sm transition hover:border-purple-300 hover:bg-purple-100"
    >
      <p className="text-[11px] font-semibold text-gray-900">
        {item.title || <span className="text-gray-400">Sin título</span>}
      </p>
      <div className="mt-1 flex flex-wrap items-center gap-1 text-[10px] text-gray-600">
        <span className="rounded-full bg-white px-2 py-0.5">{item.productName || item.product_name || item.brand}</span>
        <span className="rounded-full bg-white px-2 py-0.5">{item.type}</span>
        <span>{item.publishTime}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-1">
        <DistributionBadge distributionType={item.distributionType} />
        <StatusBadge status={item.statusKey || item.status} />
      </div>
    </button>
  );
}

export default CalendarContentCard;
