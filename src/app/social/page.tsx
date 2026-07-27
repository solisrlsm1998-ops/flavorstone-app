import AppShell from "@/components/layout/AppShell";
import PendingSection from "@/components/layout/PendingSection";

export default function SocialMediaPage() {
  return (
    <AppShell title="Redes sociales" subtitle="Publicaciones y desempeño por canal.">
      <PendingSection note="Aquí se verá el desempeño orgánico de cada post. Requiere que la cuenta de Instagram sea Business o Creator y esté vinculada a una página de Facebook." />
    </AppShell>
  );
}
