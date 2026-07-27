"use client";

import { createContext, useContext } from "react";
import { updateContent } from "@/app/actions/content";

type ContentContextValue = {
  updateContentItem: (id: string, updates: Record<string, unknown>) => Promise<unknown>;
  onItemUpdated?: (item: any) => void;
};

const ContentContext = createContext<ContentContextValue | null>(null);

function ContentProvider({
  children,
  onItemUpdated,
}: {
  children: React.ReactNode;
  onItemUpdated?: (item: any) => void;
}) {
  const value: ContentContextValue = {
    updateContentItem: async (id, updates) => {
      const updated = await updateContent(id, updates);
      onItemUpdated?.(updated);
      return updated;
    },
  };

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>;
}

function useContent() {
  const context = useContext(ContentContext);
  if (!context) throw new Error("useContent must be used within a ContentProvider");
  return context;
}

export { ContentProvider, useContent };
