import { Bell, Plus, Search } from "lucide-react";
import { useContentDrawer } from "../../context/ContentDrawerContext";

function Header() {
  const { openCreateDrawer } = useContentDrawer();

  return (
    <header className="mb-8 flex items-center justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">
          Dashboard
        </h1>

        <p className="mt-1 text-sm text-gray-400">
          Miércoles, 22 de julio de 2026
        </p>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="rounded-xl border border-gray-200 bg-white p-3 text-gray-500 transition hover:bg-gray-50"
        >
          <Search size={18} />
        </button>

        <button
          type="button"
          className="rounded-xl border border-gray-200 bg-white p-3 text-gray-500 transition hover:bg-gray-50"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          onClick={openCreateDrawer}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
        >
          <Plus size={17} />
          Nuevo contenido
        </button>
      </div>
    </header>
  );
}

export default Header;