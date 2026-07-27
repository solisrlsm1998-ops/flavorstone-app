const views = [
  { id: "cards", label: "Tarjetas" },
  { id: "table", label: "Tabla" },
  { id: "kanban", label: "Flujo" },
];

function ViewSwitcher({ currentView, onChange }) {
  return (
    <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-1">
      {views.map((view) => {
        const isActive = currentView === view.id;

        return (
          <button
            key={view.id}
            type="button"
            onClick={() => onChange(view.id)}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-white text-purple-700 shadow-sm"
                : "text-gray-500 hover:text-gray-900"
            }`}
          >
            {view.label}
          </button>
        );
      })}
    </div>
  );
}

export default ViewSwitcher;
