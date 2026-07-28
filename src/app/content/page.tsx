"use client";

import { useMemo, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import ContentToolbar from "@/components/content/ContentToolbar";
import ContentGrid from "@/components/content/ContentGrid";
import { useContentWorkspace } from "@/context/ContentWorkspace";

function ContentWorkspaceView() {
  const { items, loading, error, openCreateDrawer, openEditDrawer, deleteItem } = useContentWorkspace();

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("all");
  const [status, setStatus] = useState("all");
  const [distributionType, setDistributionType] = useState("all");
  const [view, setView] = useState("cards");

  const filteredItems = useMemo(
    () =>
      items.filter((item) => {
        // El campo dice "Buscar contenido", así que debe cubrir más que el título.
        const haystack = [item.title, item.productName, item.campaign, item.pillar, item.description, item.hook]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        const matchesSearch = !search || haystack.includes(search.toLowerCase());
        const matchesPlatform = platform === "all" || item.platform === platform;
        const matchesStatus = status === "all" || item.statusKey === status;
        const matchesDistribution = distributionType === "all" || item.distributionType === distributionType;
        return matchesSearch && matchesPlatform && matchesStatus && matchesDistribution;
      }),
    [items, search, platform, status, distributionType],
  );

  return (
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

      {error ? (
        <div className="rounded-[24px] border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : loading ? (
        <div className="rounded-[24px] border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Cargando contenido...
        </div>
      ) : (
        <ContentGrid
          items={filteredItems}
          view={view}
          onEdit={openEditDrawer}
          onDelete={deleteItem}
        />
      )}
    </div>
  );
}

export default function ContentPage() {
  return (
    <AppShell title="Contenido" subtitle="Administra todo el contenido de la estrategia.">
      <ContentWorkspaceView />
    </AppShell>
  );
}
