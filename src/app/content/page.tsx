"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Plus, Search } from "lucide-react";
import Sidebar from "@/components/layout/Sidebar";
import ContentToolbar from "@/components/content/ContentToolbar";
import ContentGrid from "@/components/content/ContentGrid";
import CreateContentDrawer from "@/components/content/CreateContentDrawer";
import { listContent, createContent, updateContent, deleteContent } from "@/app/actions/content";
import { ContentProvider } from "@/context/ContentContext";

export default function ContentPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [distributionType, setDistributionType] = useState("all");
  const [view, setView] = useState("cards");
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    listContent()
      .then((data) => setItems(data as any[]))
      .finally(() => setLoading(false));
  }, []);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch = !search || item.title?.toLowerCase().includes(search.toLowerCase());
      const matchesPlatform = platform === "all" || item.platform === platform;
      const matchesStatus = status === "all" || item.statusKey === status;
      const matchesDistribution = distributionType === "all" || item.distributionType === distributionType;
      return matchesSearch && matchesPlatform && matchesStatus && matchesDistribution;
    });
  }, [items, search, platform, status, distributionType]);

  function openCreateDrawer() {
    setEditingItem(null);
    setDrawerOpen(true);
  }

  function openEditDrawer(item: any) {
    setEditingItem(item);
    setDrawerOpen(true);
  }

  function closeDrawer() {
    setDrawerOpen(false);
    setEditingItem(null);
  }

  async function handleSave(formValues: Record<string, unknown>, setContentId: (id: string) => void) {
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
  }

  async function handleDelete(id: string) {
    await deleteContent(id);
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="min-h-screen bg-[#f7f7f9] text-[#17151c]">
      <Sidebar />

      <main className="ml-[220px] min-h-screen px-10 py-8">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-950">Contenido</h1>
            <p className="mt-1 text-sm text-gray-400">Administra todo el contenido de la estrategia.</p>
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

        <div className="space-y-5">
          <ContentToolbar
            search={search}
            onSearchChange={setSearch}
            platform={platform}
            onPlatformChange={setPlatform}
            status={status}
            onStatusChange={setStatus}
            distributionType={distributionType}
            onDistributionTypeChange={setDistributionType}
            view={view}
            onViewChange={setView}
            onCreate={openCreateDrawer}
          />

          {loading ? (
            <div className="rounded-[24px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
              Cargando contenido...
            </div>
          ) : (
            <ContentProvider
              onItemUpdated={(updated) =>
                setItems((current) => current.map((item) => (item.id === updated.id ? updated : item)))
              }
            >
              <ContentGrid items={filteredItems as never[]} view={view} onEdit={openEditDrawer} onDelete={handleDelete} />
            </ContentProvider>
          )}
        </div>
      </main>

      <CreateContentDrawer
        open={drawerOpen}
        onClose={closeDrawer}
        onSave={handleSave}
        editItem={editingItem}
        mode={editingItem ? "edit" : "create"}
        onCancel={closeDrawer}
      />
    </div>
  );
}
