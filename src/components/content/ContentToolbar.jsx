import { Plus } from "lucide-react";
import ViewSwitcher from "./ViewSwitcher";

function ContentToolbar({
  search,
  onSearchChange,
  platform,
  onPlatformChange,
  status,
  onStatusChange,
  distributionType,
  onDistributionTypeChange,
  view,
  onViewChange,
  onCreate,
}) {
  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <label className="flex flex-1 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8">
              <circle cx="11" cy="11" r="6" />
              <path d="m20 20-4.2-4.2" />
            </svg>
            <input
              value={search}
              onChange={(event) => onSearchChange(event.target.value)}
              placeholder="Buscar contenido"
              className="w-full bg-transparent outline-none placeholder:text-gray-400"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <select
              value={platform}
              onChange={(event) => onPlatformChange(event.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none"
            >
              <option value="all">Platform</option>
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="YouTube">YouTube</option>
            </select>

            <select
              value={status}
              onChange={(event) => onStatusChange(event.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none"
            >
              <option value="all">Status</option>
              <option value="draft">Borrador</option>
              <option value="design">En diseño</option>
              <option value="review">En revisión</option>
              <option value="approved">Aprobado</option>
              <option value="scheduled">Programado</option>
              <option value="published">Publicado</option>
            </select>

            <select
              value={distributionType}
              onChange={(event) => onDistributionTypeChange(event.target.value)}
              className="rounded-2xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-600 outline-none"
            >
              <option value="all">Distribución</option>
              <option value="Orgánico">Orgánico</option>
              <option value="Pautado">Pautado</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <ViewSwitcher currentView={view} onChange={onViewChange} />
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center gap-2 rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            <Plus size={16} />
            Nuevo contenido
          </button>
        </div>
      </div>
    </section>
  );
}

export default ContentToolbar;
