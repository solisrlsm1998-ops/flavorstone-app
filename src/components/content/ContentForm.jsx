"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertCircle, CheckCircle2, FileText, Loader2, Paperclip, RefreshCw, Trash2, UploadCloud } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { deleteContentMediaBlob } from "../../app/actions/media";
import { listContentMedia, createContentMedia, deleteContentMedia, setCoverImage } from "../../app/actions/content";
import { useContentWorkspace } from "../../context/ContentWorkspace";
import FormSection from "./FormSection";

const selectClassName =
  "w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:bg-white";

// La portada se muestra como imagen/video, así que no admite documentos.
const COVER_EXTENSIONS = ["jpg", "jpeg", "png", "webp", "mp4"];
const COVER_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "video/mp4"];
const COVER_INPUT = ".jpg,.jpeg,.png,.webp,.mp4";

// Adjuntos y referencias sí aceptan PDF (briefs, guías), como ya prometía la UI.
const FILE_EXTENSIONS = [...COVER_EXTENSIONS, "pdf"];
const FILE_MIME_TYPES = [...COVER_MIME_TYPES, "application/pdf"];
const FILE_INPUT = `${COVER_INPUT},.pdf`;
// Respaldo por si el catálogo de Configuración aún no carga.
const FALLBACK_PRODUCTS = [
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

function getFileExtension(fileName = "") {
  const segments = fileName.toLowerCase().split(".");
  return segments.length > 1 ? segments.at(-1) : "";
}

function isAllowedUpload(file, isCover) {
  const extension = getFileExtension(file?.name || "");
  const mimeType = `${file?.type || ""}`.toLowerCase();
  const extensions = isCover ? COVER_EXTENSIONS : FILE_EXTENSIONS;
  const mimeTypes = isCover ? COVER_MIME_TYPES : FILE_MIME_TYPES;

  return extensions.includes(extension) && (!mimeType || mimeTypes.includes(mimeType));
}

function getMediaType({ mimeType = "", fileName = "" }) {
  if (mimeType.startsWith("video/") || getFileExtension(fileName) === "mp4") {
    return "video";
  }

  if (mimeType === "application/pdf" || getFileExtension(fileName) === "pdf") {
    return "document";
  }

  return "image";
}

function isVideoFile(entry) {
  const mimeType = `${entry?.mime_type || ""}`.toLowerCase();
  return getMediaType({ mimeType, fileName: entry?.file_name }) === "video";
}

function isDocumentFile(entry) {
  const mimeType = `${entry?.mime_type || ""}`.toLowerCase();
  return getMediaType({ mimeType, fileName: entry?.file_name }) === "document";
}

function resolveProductName(formState) {
  if (formState?.productName === "Otro") {
    return formState?.customProductName || "Otro";
  }

  return formState?.productName || "Otro";
}

function ContentForm({ formState, onFieldChange, onSubmit, mode = "create", onCancel, contentId, onMediaChange }) {
  const [uploadState, setUploadState] = useState({
    cover: { loading: false, error: "", fileName: "", previewUrl: "", progress: 0 },
    attachment: { loading: false, error: "", fileName: "", progress: 0 },
    reference: { loading: false, error: "", fileName: "", progress: 0 },
  });
  const [mediaEntries, setMediaEntries] = useState([]);
  const [coverPreview, setCoverPreview] = useState(formState.coverImageUrl || "");
  const [mediaLoadState, setMediaLoadState] = useState({ loading: false, error: "" });

  const { products, pillars } = useContentWorkspace();
  const productOptions = useMemo(
    () => [...(products?.length ? products : FALLBACK_PRODUCTS), "Otro"],
    [products],
  );

  useEffect(() => {
    setCoverPreview(formState.coverImageUrl || "");
  }, [formState.coverImageUrl]);

  const acceptInputValue = useMemo(() => FILE_INPUT, []);
  const coverAcceptValue = useMemo(() => COVER_INPUT, []);

  const coverEntry = useMemo(
    () => mediaEntries.find((entry) => entry.file_url === coverPreview),
    [coverPreview, mediaEntries],
  );

  useEffect(() => {
    let cancelled = false;

    const loadMediaEntries = async () => {
      if (!contentId) {
        setMediaEntries([]);
        setMediaLoadState({ loading: false, error: "" });
        return;
      }

      setMediaLoadState({ loading: true, error: "" });

      try {
        const data = await listContentMedia(contentId);

        if (!cancelled) {
          setMediaEntries(data || []);
        }
      } catch (error) {
        if (!cancelled) {
          setMediaLoadState({
            loading: false,
            error: error?.message || "No se pudieron cargar los archivos de media.",
          });
        }
        return;
      }

      if (!cancelled) {
        setMediaLoadState({ loading: false, error: "" });
      }
    };

    void loadMediaEntries();

    return () => {
      cancelled = true;
    };
  }, [contentId]);

  async function handleFileUpload(type, file, replaceEntry = null) {
    if (!file) return;
    if (!contentId) {
      setUploadState((current) => ({
        ...current,
        [type]: {
          ...current[type],
          loading: false,
          error: "Guarda el contenido primero para poder subir archivos.",
        },
      }));
      return;
    }

    if (!isAllowedUpload(file, type === "cover")) {
      setUploadState((current) => ({
        ...current,
        [type]: {
          ...current[type],
          loading: false,
          error:
            type === "cover"
              ? "La portada admite JPG, JPEG, PNG, WEBP o MP4."
              : "Solo se permiten archivos JPG, JPEG, PNG, WEBP, MP4 y PDF.",
        },
      }));
      return;
    }

    const productName = resolveProductName(formState);

    setUploadState((current) => ({
      ...current,
      [type]: {
        ...current[type],
        loading: true,
        error: "",
        fileName: file.name,
        progress: 0,
      },
    }));

    try {
      const timestamp = Date.now();
      const safeName = file.name.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9._-]/g, "");
      const storagePath = `${productName || "workspace"}/${contentId}/${timestamp}-${safeName}`;
      const mediaType = getMediaType({ mimeType: file.type, fileName: file.name });

      // Sube del navegador directo a Blob: si pasara por el servidor, los
      // videos se caerían por el límite de tamaño de la función serverless.
      const blob = await upload(storagePath, file, {
        access: "public",
        handleUploadUrl: "/api/media/upload",
        contentType: file.type || undefined,
        onUploadProgress: ({ percentage }) => {
          setUploadState((current) => ({
            ...current,
            [type]: { ...current[type], progress: Math.round(percentage) },
          }));
        },
      });

      const fileUrl = blob.url;

      const data = await createContentMedia({
        workspaceId: productName || "default-workspace",
        contentId,
        fileName: file.name,
        fileUrl,
        storagePath,
        mimeType: file.type,
        mediaType,
        role: type,
        sizeBytes: file.size,
        thumbnailUrl: mediaType === "image" ? fileUrl : null,
      });

      if (replaceEntry?.id) {
        await deleteContentMedia(replaceEntry.id);
      }

      if (replaceEntry?.file_url) {
        await deleteContentMediaBlob(replaceEntry.file_url).catch(() => {});
      }

      if (type === "cover") {
        await setCoverImage(contentId, fileUrl);
        setCoverPreview(fileUrl);
        onFieldChange("coverImageUrl", fileUrl);
      }

      setMediaEntries((current) => {
        const nextEntry = data;

        if (replaceEntry?.id) {
          return current.map((entry) => (entry.id === replaceEntry.id ? nextEntry : entry));
        }

        return [nextEntry, ...current];
      });

      setUploadState((current) => ({
        ...current,
        [type]: {
          ...current[type],
          loading: false,
          error: "",
          fileName: file.name,
        },
      }));
      if (onMediaChange) {
        onMediaChange({ type, fileName: file.name, fileUrl, mediaType, storagePath, contentId });
      }
    } catch (error) {
      setUploadState((current) => ({
        ...current,
        [type]: {
          ...current[type],
          loading: false,
          error: error?.message || "No se pudo subir el archivo.",
        },
      }));
    }
  }

  async function handleRemoveMedia(entry, isCover = false) {
    if (!entry) {
      return;
    }

    try {
      if (entry.file_url) {
        await deleteContentMediaBlob(entry.file_url).catch(() => {});
      }

      if (entry.id) {
        await deleteContentMedia(entry.id);
      }

      if (isCover && contentId) {
        await setCoverImage(contentId, null);
        setCoverPreview("");
        onFieldChange("coverImageUrl", "");
      }

      setMediaEntries((current) => current.filter((currentEntry) => currentEntry.id !== entry.id));
    } catch (error) {
      setUploadState((current) => ({
        ...current,
        cover: {
          ...current.cover,
          error: error?.message || "No se pudo eliminar el archivo.",
        },
      }));
    }
  }

  return (
    <form className="space-y-5" onSubmit={onSubmit}>
      <FormSection title="General" description="Información principal del contenido.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-600 md:col-span-2">
            <span className="mb-2 block font-medium text-gray-900">Content title</span>
            <input
              type="text"
              required
              value={formState.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              className={selectClassName}
              placeholder="Ej. Reel de lanzamiento"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Producto</span>
            <select
              value={formState.productName || "Grape"}
              onChange={(event) => onFieldChange("productName", event.target.value)}
              className={selectClassName}
            >
              {productOptions.map((product) => (
                <option key={product} value={product}>{product}</option>
              ))}
            </select>
          </label>

          {formState.productName === "Otro" ? (
            <label className="text-sm text-gray-600">
              <span className="mb-2 block font-medium text-gray-900">Nombre del producto</span>
              <input
                type="text"
                required
                value={formState.customProductName || ""}
                onChange={(event) => onFieldChange("customProductName", event.target.value)}
                className={selectClassName}
                placeholder="Escribe el nombre del producto"
              />
            </label>
          ) : null}

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Campaign</span>
            <input
              type="text"
              value={formState.campaign}
              onChange={(event) => onFieldChange("campaign", event.target.value)}
              className={selectClassName}
              placeholder="Ej. Verano 2026"
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Strategy" description="Objetivo y contexto estratégico.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-600 md:col-span-2">
            <span className="mb-2 block font-medium text-gray-900">Objective</span>
            <textarea
              value={formState.objective}
              onChange={(event) => onFieldChange("objective", event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:bg-white"
              placeholder="Describe la meta del contenido"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Strategic pillar</span>
            <input
              type="text"
              list="pillar-options"
              value={formState.pillar}
              onChange={(event) => onFieldChange("pillar", event.target.value)}
              className={selectClassName}
              placeholder="Ej. Inspiración"
            />
            <datalist id="pillar-options">
              {(pillars || []).map((pillar) => (
                <option key={pillar} value={pillar} />
              ))}
            </datalist>
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Target audience</span>
            <input
              type="text"
              value={formState.audience}
              onChange={(event) => onFieldChange("audience", event.target.value)}
              className={selectClassName}
              placeholder="Ej. Diseñadores"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Platform</span>
            <select
              value={formState.platform}
              onChange={(event) => onFieldChange("platform", event.target.value)}
              className={selectClassName}
            >
              <option value="Instagram">Instagram</option>
              <option value="TikTok">TikTok</option>
              <option value="LinkedIn">LinkedIn</option>
              <option value="YouTube">YouTube</option>
            </select>
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Format</span>
            <select
              value={formState.format}
              onChange={(event) => onFieldChange("format", event.target.value)}
              className={selectClassName}
            >
              <option value="Reel">Reel</option>
              <option value="Carrusel">Carrusel</option>
              <option value="Story">Story</option>
              <option value="Post">Post</option>
            </select>
          </label>

          <label className="text-sm text-gray-600 md:col-span-2">
            <span className="mb-2 block font-medium text-gray-900">Tipo de contenido</span>
            <select
              required
              value={formState.distributionType || "Orgánico"}
              onChange={(event) => onFieldChange("distributionType", event.target.value)}
              className={selectClassName}
            >
              <option value="Orgánico">Orgánico</option>
              <option value="Pautado">Pautado</option>
            </select>
          </label>
        </div>
      </FormSection>

      <FormSection title="Creative" description="Mensaje principal y propuesta creativa.">
        <div className="grid gap-4">
          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Hook</span>
            <input
              type="text"
              value={formState.hook}
              onChange={(event) => onFieldChange("hook", event.target.value)}
              className={selectClassName}
              placeholder="Ej. Diseño que inspira"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Main copy</span>
            <textarea
              value={formState.copy}
              onChange={(event) => onFieldChange("copy", event.target.value)}
              className="min-h-24 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:bg-white"
              placeholder="Escribe el mensaje principal"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">CTA</span>
            <input
              type="text"
              value={formState.cta}
              onChange={(event) => onFieldChange("cta", event.target.value)}
              className={selectClassName}
              placeholder="Ej. Descubre más"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Hashtags</span>
            <input
              type="text"
              value={formState.hashtags}
              onChange={(event) => onFieldChange("hashtags", event.target.value)}
              className={selectClassName}
              placeholder="#FlavorStone #Diseño"
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Media" description="Recursos y referencias del contenido.">
        <div className="space-y-3">
          <div className="rounded-[20px] border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">Cover image</p>
                <p className="mt-1 text-xs text-gray-500">Imagen principal del contenido (JPG, JPEG, PNG, WEBP o MP4).</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <UploadCloud size={15} />
                {coverEntry ? "Reemplazar" : "Seleccionar"}
                <input
                  type="file"
                  accept={coverAcceptValue}
                  className="hidden"
                  onChange={(event) => {
                    void handleFileUpload("cover", event.target.files?.[0], coverEntry || null);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            {uploadState.cover.loading ? (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Loader2 size={15} className="animate-spin" />
                  Subiendo cover image... {uploadState.cover.progress || 0}%
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-purple-100">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all"
                    style={{ width: `${uploadState.cover.progress || 0}%` }}
                  />
                </div>
              </div>
            ) : null}

            {uploadState.cover.error ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={15} />
                {uploadState.cover.error}
              </div>
            ) : null}

            {uploadState.cover.fileName ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 size={15} className="text-emerald-600" />
                {uploadState.cover.fileName}
              </div>
            ) : null}

            {coverPreview ? (
              <div className="mt-4 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                {isVideoFile(coverEntry || { file_name: coverPreview, mime_type: "" }) ? (
                  <video src={coverPreview} className="h-40 w-full object-cover" controls preload="metadata" />
                ) : (
                  <img src={coverPreview} alt="Cover preview" className="h-40 w-full object-cover" />
                )}
              </div>
            ) : null}

            {coverEntry ? (
              <div className="mt-3 flex justify-end">
                <button
                  type="button"
                  onClick={() => handleRemoveMedia(coverEntry, true)}
                  className="inline-flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  <Trash2 size={14} />
                  Quitar cover
                </button>
              </div>
            ) : null}
          </div>

          <div className="rounded-[20px] border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">Attach files</p>
                <p className="mt-1 text-xs text-gray-500">PDF, videos e imágenes.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <Paperclip size={15} />
                Seleccionar
                <input
                  type="file"
                  accept={acceptInputValue}
                  className="hidden"
                  onChange={(event) => {
                    void handleFileUpload("attachment", event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            {uploadState.attachment.loading ? (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Loader2 size={15} className="animate-spin" />
                  Subiendo archivo... {uploadState.attachment.progress || 0}%
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-purple-100">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all"
                    style={{ width: `${uploadState.attachment.progress || 0}%` }}
                  />
                </div>
              </div>
            ) : null}

            {uploadState.attachment.error ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={15} />
                {uploadState.attachment.error}
              </div>
            ) : null}

            {uploadState.attachment.fileName ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 size={15} className="text-emerald-600" />
                {uploadState.attachment.fileName}
              </div>
            ) : null}
          </div>

          <div className="rounded-[20px] border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-600">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium text-gray-900">Reference files</p>
                <p className="mt-1 text-xs text-gray-500">Archivos de referencia adicionales.</p>
              </div>
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50">
                <UploadCloud size={15} />
                Seleccionar
                <input
                  type="file"
                  accept={acceptInputValue}
                  className="hidden"
                  onChange={(event) => {
                    void handleFileUpload("reference", event.target.files?.[0]);
                    event.target.value = "";
                  }}
                />
              </label>
            </div>

            {uploadState.reference.loading ? (
              <div className="mt-3">
                <div className="flex items-center gap-2 text-sm text-purple-700">
                  <Loader2 size={15} className="animate-spin" />
                  Subiendo referencia... {uploadState.reference.progress || 0}%
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-purple-100">
                  <div
                    className="h-full rounded-full bg-purple-600 transition-all"
                    style={{ width: `${uploadState.reference.progress || 0}%` }}
                  />
                </div>
              </div>
            ) : null}

            {uploadState.reference.error ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle size={15} />
                {uploadState.reference.error}
              </div>
            ) : null}

            {uploadState.reference.fileName ? (
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <CheckCircle2 size={15} className="text-emerald-600" />
                {uploadState.reference.fileName}
              </div>
            ) : null}
          </div>

          {mediaLoadState.loading ? (
            <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-600">
              <Loader2 size={15} className="animate-spin text-purple-700" />
              Cargando archivos vinculados...
            </div>
          ) : null}

          {mediaLoadState.error ? (
            <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              <AlertCircle size={15} />
              {mediaLoadState.error}
            </div>
          ) : null}

          {mediaEntries.length ? (
            <div className="space-y-2">
              {mediaEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between gap-3 rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-200 bg-gray-100">
                      {isVideoFile(entry) ? (
                        <video src={entry.file_url} className="h-full w-full object-cover" preload="metadata" muted playsInline />
                      ) : isDocumentFile(entry) ? (
                        <span className="flex h-full w-full items-center justify-center text-gray-400">
                          <FileText size={18} />
                        </span>
                      ) : (
                        <img src={entry.file_url} alt={entry.file_name || "Media preview"} className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-medium text-gray-900">{entry.file_name}</p>
                      <p className="text-xs text-gray-500">{entry.media_type || (isVideoFile(entry) ? "video" : "image")}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-1 rounded-xl border border-gray-200 bg-white px-2.5 py-1.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50">
                      <RefreshCw size={13} />
                      Reemplazar
                      <input
                        type="file"
                        accept={acceptInputValue}
                        className="hidden"
                        onChange={(event) => {
                          void handleFileUpload("attachment", event.target.files?.[0], entry);
                          event.target.value = "";
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(entry, entry.file_url === coverPreview)}
                      className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-900"
                      aria-label={`Eliminar ${entry.file_name || "archivo"}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </FormSection>

      <FormSection title="Scheduling" description="Fecha, hora y estado de publicación.">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Publish date</span>
            <input
              type="date"
              value={formState.date}
              onChange={(event) => onFieldChange("date", event.target.value)}
              className={selectClassName}
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Publish time</span>
            <input
              type="time"
              value={formState.time}
              onChange={(event) => onFieldChange("time", event.target.value)}
              className={selectClassName}
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Status</span>
            <select
              value={formState.status}
              onChange={(event) => onFieldChange("status", event.target.value)}
              className={selectClassName}
            >
              <option value="draft">Borrador</option>
              <option value="design">En diseño</option>
              <option value="review">En revisión</option>
              <option value="approved">Aprobado</option>
              <option value="scheduled">Programado</option>
              <option value="published">Publicado</option>
            </select>
          </label>
        </div>
      </FormSection>

      <FormSection title="Team" description="Asignaciones internas del equipo.">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Designer</span>
            <input
              type="text"
              value={formState.designer}
              onChange={(event) => onFieldChange("designer", event.target.value)}
              className={selectClassName}
              placeholder="Nombre"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Reviewer</span>
            <input
              type="text"
              value={formState.reviewer}
              onChange={(event) => onFieldChange("reviewer", event.target.value)}
              className={selectClassName}
              placeholder="Nombre"
            />
          </label>

          <label className="text-sm text-gray-600">
            <span className="mb-2 block font-medium text-gray-900">Responsible</span>
            <input
              type="text"
              value={formState.responsible}
              onChange={(event) => onFieldChange("responsible", event.target.value)}
              className={selectClassName}
              placeholder="Nombre"
            />
          </label>
        </div>
      </FormSection>

      <FormSection title="Notes" description="Observaciones internas.">
        <label className="text-sm text-gray-600">
          <span className="mb-2 block font-medium text-gray-900">Internal observations</span>
          <textarea
            value={formState.notes}
            onChange={(event) => onFieldChange("notes", event.target.value)}
            className="min-h-24 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-purple-400 focus:bg-white"
            placeholder="Añade notas para el equipo"
          />
        </label>
      </FormSection>

      <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-2xl bg-purple-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
        >
          {mode === "edit" ? "Guardar cambios" : "Save"}
        </button>
      </div>
    </form>
  );
}

export default ContentForm;
