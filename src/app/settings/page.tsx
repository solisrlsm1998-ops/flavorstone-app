import AppShell from "@/components/layout/AppShell";
import PendingSection from "@/components/layout/PendingSection";

export default function SettingsPage() {
  return (
    <AppShell title="Configuración" subtitle="Preferencias del espacio de trabajo.">
      <PendingSection note="Las cuentas del equipo se administran hoy desde el panel de Clerk. Esta sección centralizará productos, pilares y miembros del equipo." />
    </AppShell>
  );
}
