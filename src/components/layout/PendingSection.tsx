import { Construction } from "lucide-react";

export default function PendingSection({ note }: { note: string }) {
  return (
    <section className="rounded-[28px] border border-gray-200 bg-white p-8">
      <div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50">
        <div className="max-w-md px-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-gray-400 shadow-sm">
            <Construction size={22} />
          </div>
          <p className="mt-4 text-lg font-semibold text-gray-900">Sección en construcción</p>
          <p className="mt-2 text-sm leading-6 text-gray-500">{note}</p>
        </div>
      </div>
    </section>
  );
}
