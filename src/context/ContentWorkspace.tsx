"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import CreateContentDrawer from "@/components/content/CreateContentDrawer";
import { listContent, createContent, updateContent, deleteContent } from "@/app/actions/content";

export type ContentItem = Record<string, any>;

type WorkspaceValue = {
  items: ContentItem[];
  loading: boolean;
  error: string;
  openCreateDrawer: () => void;
  openEditDrawer: (item: ContentItem) => void;
  closeDrawer: () => void;
  deleteItem: (id: string) => Promise<void>;
  updateContentItem: (id: string, updates: Record<string, unknown>) => Promise<ContentItem>;
};

const WorkspaceContext = createContext<WorkspaceValue | null>(null);

export function ContentWorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);

  useEffect(() => {
    let cancelled = false;

    listContent()
      .then((data) => {
        if (!cancelled) setItems(data as ContentItem[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || "No se pudo cargar el contenido.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const openCreateDrawer = useCallback(() => {
    setEditingItem(null);
    setDrawerOpen(true);
  }, []);

  const openEditDrawer = useCallback((item: ContentItem) => {
    setEditingItem(item);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    setEditingItem(null);
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    await deleteContent(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }, []);

  const updateContentItem = useCallback(async (id: string, updates: Record<string, unknown>) => {
    const updated = await updateContent(id, updates);
    setItems((current) => current.map((item) => (item.id === id ? updated : item)));
    return updated as ContentItem;
  }, []);

  const handleSave = useCallback(
    async (formValues: Record<string, unknown>, setContentId: (id: string) => void) => {
      if (editingItem) {
        const updated = await updateContent(editingItem.id, formValues);
        setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)));
        setDrawerOpen(false);
        setEditingItem(null);
        return updated;
      }

      const created = await createContent(formValues);
      setItems((current) => [created, ...current]);
      if (created?.id) setContentId(created.id);
      setDrawerOpen(false);
      return created;
    },
    [editingItem],
  );

  const value = useMemo<WorkspaceValue>(
    () => ({
      items,
      loading,
      error,
      openCreateDrawer,
      openEditDrawer,
      closeDrawer,
      deleteItem,
      updateContentItem,
    }),
    [items, loading, error, openCreateDrawer, openEditDrawer, closeDrawer, deleteItem, updateContentItem],
  );

  return (
    <WorkspaceContext.Provider value={value}>
      {children}

      <CreateContentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onSave={handleSave}
        editItem={editingItem}
        mode={editingItem ? "edit" : "create"}
        onCancel={closeDrawer}
      />
    </WorkspaceContext.Provider>
  );
}

export function useContentWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useContentWorkspace must be used within a ContentWorkspaceProvider");
  return context;
}

// Compatibilidad con KanbanBoard, que espera useContent().updateContentItem
export function useContent() {
  return useContentWorkspace();
}
