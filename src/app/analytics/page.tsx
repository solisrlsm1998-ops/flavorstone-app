import AppShell from "@/components/layout/AppShell";
import PendingSection from "@/components/layout/PendingSection";

export default function AnalyticsPage() {
  return (
    <AppShell title="Analítica" subtitle="Rendimiento y métricas de contenido.">
      <PendingSection note="Las métricas de alcance, interacción y ROAS llegan desde Meta. Falta conectar el Business Manager y la cuenta publicitaria de FlavorStone." />
    </AppShell>
  );
}
