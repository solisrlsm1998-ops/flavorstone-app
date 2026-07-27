const statusStyles = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-slate-100 text-slate-700",
  design: "bg-amber-100 text-amber-700",
  review: "bg-amber-100 text-amber-700",
  "en revisión": "bg-amber-100 text-amber-700",
  approved: "bg-emerald-100 text-emerald-700",
  "en diseño": "bg-amber-100 text-amber-700",
  pendiente: "bg-slate-100 text-slate-700",
  aprobado: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-purple-100 text-purple-700",
  programado: "bg-purple-100 text-purple-700",
  published: "bg-fuchsia-100 text-fuchsia-700",
  publicado: "bg-fuchsia-100 text-fuchsia-700",
  borrador: "bg-gray-100 text-gray-700",
};

const labels = {
  draft: "Borrador",
  pending: "Pendiente",
  design: "En diseño",
  review: "En revisión",
  approved: "Aprobado",
  scheduled: "Programado",
  published: "Publicado",
  "en diseño": "En diseño",
  pendiente: "Pendiente",
  "en revisión": "En revisión",
  aprobado: "Aprobado",
  programado: "Programado",
  publicado: "Publicado",
  borrador: "Borrador",
};

function StatusBadge({ status }) {
  const normalized = status?.toLowerCase();
  const style = statusStyles[normalized] || statusStyles.draft;
  const label = labels[normalized] || status;

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

export default StatusBadge;
