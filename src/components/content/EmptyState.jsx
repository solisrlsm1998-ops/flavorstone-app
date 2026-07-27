function EmptyState() {
  return (
    <div className="rounded-[28px] border border-gray-200 bg-white p-10">
      <div className="flex min-h-[320px] flex-col items-center justify-center rounded-[24px] border border-dashed border-gray-200 bg-gradient-to-br from-purple-50/60 via-white to-gray-50 px-6 text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 text-purple-700 shadow-sm">
          <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.7">
            <rect x="4" y="5" width="16" height="14" rx="4" />
            <path d="M8 9h8" />
            <path d="M8 13h5" />
          </svg>
        </div>

        <h3 className="text-2xl font-semibold text-gray-950">
          No hay contenido todavía
        </h3>
        <p className="mt-3 max-w-xl text-sm leading-6 text-gray-500">
          Crea tu primer contenido para comenzar y construir tu centro de
          estrategia editorial.
        </p>
      </div>
    </div>
  );
}

export default EmptyState;
