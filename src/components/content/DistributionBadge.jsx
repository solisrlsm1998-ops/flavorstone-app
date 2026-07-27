const distributionStyles = {
  "Orgánico": "bg-emerald-100 text-emerald-700",
  "Pautado": "bg-indigo-100 text-indigo-700",
};

function DistributionBadge({ distributionType }) {
  const normalized = distributionType === "Pautado" ? "Pautado" : "Orgánico";
  const style = distributionStyles[normalized];

  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {normalized}
    </span>
  );
}

export default DistributionBadge;
