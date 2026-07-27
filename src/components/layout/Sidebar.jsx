"use client";

import {
  BarChart3,
  CalendarDays,
  FileText,
  LayoutDashboard,
  Library,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { label: "Dashboard", icon: LayoutDashboard, path: "/" },
  { label: "Calendario", icon: CalendarDays, path: "/calendar" },
  { label: "Contenido", icon: FileText, path: "/content" },
  { label: "Biblioteca", icon: Library, path: "/library" },
  { label: "Redes sociales", icon: Users, path: "/social" },
  { label: "Analítica", icon: BarChart3, path: "/analytics" },
  { label: "Configuración", icon: Settings, path: "/settings" },
];

function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-[220px] border-r border-gray-200 bg-white px-5 py-7">
      <div className="mb-12">
        <h2 className="text-lg font-semibold tracking-tight text-gray-950">
          FlavorStone
        </h2>
      </div>

      <nav className="space-y-1">
        {menuItems.map(({ label, icon: Icon, path }) => {
          const isActive = path === "/" ? pathname === "/" : pathname.startsWith(path);

          return (
            <Link
              key={label}
              href={path}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                isActive
                  ? "bg-purple-50 font-medium text-purple-700"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <Icon size={18} strokeWidth={1.8} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

export default Sidebar;
