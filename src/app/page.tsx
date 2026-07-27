import AppShell from "@/components/layout/AppShell";
import DashboardView from "./dashboard-view";

// Sin esto la fecha del encabezado se congela en el momento del build.
export const dynamic = "force-dynamic";

const dateFormatter = new Intl.DateTimeFormat("es-MX", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});

export default function Home() {
  const today = dateFormatter.format(new Date());
  const subtitle = today.charAt(0).toUpperCase() + today.slice(1);

  return (
    <AppShell title="Dashboard" subtitle={subtitle}>
      <DashboardView />
    </AppShell>
  );
}
