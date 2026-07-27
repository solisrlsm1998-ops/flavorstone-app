function getStatusLabel(statusKey: string) {
  const labels: Record<string, string> = {
    draft: "Pendiente",
    pending: "Pendiente",
    design: "En diseño",
    review: "En revisión",
    approved: "Aprobado",
    scheduled: "Programado",
    published: "Publicado",
  };

  return labels[statusKey] || statusKey;
}

function normalizeDistributionType(value?: string | null) {
  if (`${value || ""}`.toLowerCase() === "pautado") {
    return "Pautado";
  }

  return "Orgánico";
}

function resolveProductName(values: Record<string, unknown> = {}) {
  const selectedProduct = (values?.productName as string) || "";
  const customProductName = (values?.customProductName as string) || "";

  if (selectedProduct === "Otro") {
    return customProductName || "Otro";
  }

  return selectedProduct || customProductName || "Otro";
}

type FormValues = Record<string, unknown>;

function buildContentPayload(formValues: FormValues) {
  const statusKey = (formValues?.statusKey as string) || (formValues?.status as string) || "draft";
  const statusLabel = getStatusLabel(statusKey);
  const distributionType = normalizeDistributionType(
    (formValues?.distributionType as string) || (formValues?.distribution_type as string),
  );
  const productName = resolveProductName(formValues);

  return {
    title: (formValues?.name as string) || (formValues?.title as string) || "",
    description:
      (formValues?.objective as string) || (formValues?.description as string) || (formValues?.copy as string) || "",
    productName,
    platform: (formValues?.platform as string) || "",
    type: (formValues?.format as string) || (formValues?.type as string) || "",
    status: statusLabel,
    statusLabel,
    statusKey,
    distributionType,
    pillar: (formValues?.pillar as string) || "—",
    publishDate: (formValues?.date as string) || (formValues?.publishDate as string) || "",
    publishTime: (formValues?.time as string) || (formValues?.publishTime as string) || "",
    campaign: (formValues?.campaign as string) || "",
    audience: (formValues?.audience as string) || "",
    hook: (formValues?.hook as string) || "",
    copy: (formValues?.copy as string) || "",
    cta: (formValues?.cta as string) || "",
    hashtags: (formValues?.hashtags as string) || "",
    designer: (formValues?.designer as string) || "",
    reviewer: (formValues?.reviewer as string) || "",
    responsible: (formValues?.responsible as string) || "",
    notes: (formValues?.notes as string) || "",
    coverImageUrl: (formValues?.coverImageUrl as string) || (formValues?.cover_image_url as string) || "",
  };
}

export { buildContentPayload, getStatusLabel, normalizeDistributionType, resolveProductName };
