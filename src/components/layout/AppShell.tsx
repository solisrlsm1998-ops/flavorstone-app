"use client";

import { Plus } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import Sidebar from "./Sidebar";
import { ContentWorkspaceProvider, useContentWorkspace } from "@/context/ContentWorkspace";

function ShellHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const { openCreateDrawer } = useContentWorkspace();

  return (
    <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-gray-950">{title}</h1>
        {subtitle ? <p className="mt-1 text-sm text-gray-400">{subtitle}</p> : null}
      </div>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={openCreateDrawer}
          className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-medium transition hover:bg-gray-50"
        >
          <Plus size={17} />
          Nuevo contenido
        </button>

        <UserButton />
      </div>
    </header>
  );
}

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <ContentWorkspaceProvider>
      <div className="min-h-screen bg-[#f7f7f9] text-[#17151c]">
        <Sidebar />

        <main className="ml-[220px] min-h-screen px-10 py-8">
          <ShellHeader title={title} subtitle={subtitle} />
          {children}
        </main>
      </div>
    </ContentWorkspaceProvider>
  );
}
