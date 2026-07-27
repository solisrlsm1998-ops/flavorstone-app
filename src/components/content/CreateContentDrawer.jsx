import { useEffect, useState } from "react";
import { X } from "lucide-react";
import ContentForm from "./ContentForm";

const predefinedProducts = [
  "Grape",
  "Fortezza",
  "Sapphire",
  "Quartz",
  "Diamond",
  "Samurai",
  "Sky Blue",
  "Comales",
  "Sartenes",
  "Utensilios",
  "Cuchillos",
  "Accesorios",
];

function getProductState(productValue) {
  const normalized = `${productValue || ""}`.trim();

  if (!normalized) {
    return { productName: "Grape", customProductName: "" };
  }

  if (predefinedProducts.includes(normalized)) {
    return { productName: normalized, customProductName: "" };
  }

  return { productName: "Otro", customProductName: normalized };
}

function CreateContentDrawer({ open, onClose, onSave, editItem = null, mode = "create", onCancel }) {
  const [contentId, setContentId] = useState(editItem?.id || null);
  const [formState, setFormState] = useState({
    name: "",
    productName: "Grape",
    customProductName: "",
    campaign: "",
    platform: "Instagram",
    format: "Reel",
    distributionType: "Orgánico",
    objective: "",
    pillar: "",
    audience: "",
    hook: "",
    copy: "",
    cta: "",
    hashtags: "",
    status: "draft",
    date: "",
    time: "",
    designer: "",
    reviewer: "",
    responsible: "",
    notes: "",
  });

  useEffect(() => {
    if (open && editItem) {
      const productState = getProductState(editItem.productName || editItem.product_name || editItem.brand);

      setFormState({
        name: editItem.title || "",
        productName: productState.productName,
        customProductName: productState.customProductName,
        campaign: editItem.campaign || "",
        platform: editItem.platform || "Instagram",
        format: editItem.type || "Reel",
        distributionType: editItem.distributionType || editItem.distribution_type || "Orgánico",
        objective: editItem.description || "",
        pillar: editItem.pillar || "",
        audience: editItem.audience || "",
        hook: editItem.hook || "",
        copy: editItem.copy || editItem.description || "",
        cta: editItem.cta || "",
        hashtags: editItem.hashtags || "",
        status: editItem.statusKey || "draft",
        date: editItem.publishDate || "",
        time: editItem.publishTime || "",
        designer: editItem.designer || "",
        reviewer: editItem.reviewer || "",
        responsible: editItem.responsible || "",
        notes: editItem.notes || "",
      });
      return;
    }

    if (!open) {
      setContentId(null);
      setFormState({
        name: "",
        productName: "Grape",
        customProductName: "",
        campaign: "",
        platform: "Instagram",
        format: "Reel",
        distributionType: "Orgánico",
        objective: "",
        pillar: "",
        audience: "",
        hook: "",
        copy: "",
        cta: "",
        hashtags: "",
        status: "draft",
        date: "",
        time: "",
        designer: "",
        reviewer: "",
        responsible: "",
        notes: "",
      });
    }
  }, [editItem, open]);

  function handleFieldChange(key, value) {
    setFormState((current) => ({ ...current, [key]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (onSave) {
      const savedItem = await onSave(formState, setContentId);
      if (savedItem?.id) {
        setContentId(savedItem.id);
      }
    }

    onClose();
  }

  return (
    <div className={`fixed inset-0 z-40 transition ${open ? "pointer-events-auto" : "pointer-events-none"}`}>
      <div
        className={`absolute inset-0 bg-black/20 transition ${open ? "opacity-100" : "opacity-0"}`}
        onClick={onClose}
      />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-2xl flex-col border-l border-gray-200 bg-[#fcfbff] shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-6 py-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-purple-500">
              {mode === "edit" ? "Editar contenido" : "Nuevo contenido"}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-gray-950">
              {mode === "edit" ? "Editar contenido" : "Crear contenido"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <ContentForm
            formState={formState}
            onFieldChange={handleFieldChange}
            onSubmit={handleSubmit}
            mode={mode}
            onCancel={onCancel || onClose}
            contentId={contentId}
          />
        </div>
      </aside>
    </div>
  );
}

export default CreateContentDrawer;
