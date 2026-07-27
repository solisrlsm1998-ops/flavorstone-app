"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import MonthView from "@/components/calendar/MonthView";
import { useContentWorkspace } from "@/context/ContentWorkspace";

const monthNames = [
  "Enero",
  "Febrero",
  "Marzo",
  "Abril",
  "Mayo",
  "Junio",
  "Julio",
  "Agosto",
  "Septiembre",
  "Octubre",
  "Noviembre",
  "Diciembre",
];

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const daysInMonth = lastDay.getDate();
  const startDay = (firstDay.getDay() + 6) % 7;

  const days: (number | null)[] = [];

  for (let i = 0; i < startDay; i += 1) days.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) days.push(day);

  return days;
}

function MiniMonth({
  year,
  month,
  count,
  onOpenMonth,
}: {
  year: number;
  month: number;
  count: number;
  onOpenMonth: (month: number) => void;
}) {
  const days = useMemo(() => getMonthDays(year, month), [year, month]);

  return (
    <button
      type="button"
      onClick={() => onOpenMonth(month)}
      className="rounded-2xl border border-gray-200 bg-white p-5 text-left transition hover:border-purple-300 hover:shadow-sm"
    >
      <div className="mb-4 flex items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-950">{monthNames[month]}</h3>
        {count > 0 ? (
          <span className="rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium tabular-nums text-purple-700">
            {count}
          </span>
        ) : null}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center">
        {weekDays.map((day) => (
          <span key={day} className="text-[10px] font-medium uppercase text-gray-400">
            {day.slice(0, 1)}
          </span>
        ))}

        {days.map((day, index) => (
          <span
            key={`${month}-${index}`}
            className="flex h-7 items-center justify-center rounded-md text-xs tabular-nums text-gray-600"
          >
            {day || ""}
          </span>
        ))}
      </div>
    </button>
  );
}

function CalendarView() {
  const today = new Date();
  const { items, loading, error, openEditDrawer } = useContentWorkspace();

  const [view, setView] = useState<"year" | "month">("year");
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(today.getMonth());

  const monthDays = useMemo(() => getMonthDays(selectedYear, selectedMonth), [selectedYear, selectedMonth]);

  // publishDate viene como "YYYY-MM-DD", así que el prefijo basta para contar por mes.
  const countsByMonth = useMemo(() => {
    const counts = new Array(12).fill(0);

    for (const item of items) {
      const publishDate = `${item.publishDate || ""}`;
      const [year, month] = publishDate.split("-");
      if (Number(year) === selectedYear && month) {
        const index = Number(month) - 1;
        if (index >= 0 && index < 12) counts[index] += 1;
      }
    }

    return counts;
  }, [items, selectedYear]);

  function handlePrevious() {
    if (view === "year") {
      setSelectedYear((current) => current - 1);
      return;
    }

    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((current) => current - 1);
    } else {
      setSelectedMonth((current) => current - 1);
    }
  }

  function handleNext() {
    if (view === "year") {
      setSelectedYear((current) => current + 1);
      return;
    }

    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((current) => current + 1);
    } else {
      setSelectedMonth((current) => current + 1);
    }
  }

  function handleToday() {
    const now = new Date();
    setSelectedYear(now.getFullYear());
    setSelectedMonth(now.getMonth());
  }

  return (
    <div>
      <section className="mb-6 flex flex-wrap items-center justify-end gap-3">
        <div className="flex rounded-xl border border-gray-200 bg-white p-1">
          <button
            type="button"
            onClick={() => setView("year")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === "year" ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Anual
          </button>

          <button
            type="button"
            onClick={() => setView("month")}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
              view === "month" ? "bg-purple-50 text-purple-700" : "text-gray-500 hover:text-gray-900"
            }`}
          >
            Mensual
          </button>
        </div>

        <button
          type="button"
          onClick={handleToday}
          className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
        >
          Hoy
        </button>
      </section>

      <section className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-5 py-4">
        <button
          type="button"
          onClick={handlePrevious}
          className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
          aria-label={view === "year" ? "Año anterior" : "Mes anterior"}
        >
          <ChevronLeft size={20} />
        </button>

        <h3 className="text-xl font-semibold tabular-nums text-gray-950">
          {view === "year" ? selectedYear : `${monthNames[selectedMonth]} ${selectedYear}`}
        </h3>

        <button
          type="button"
          onClick={handleNext}
          className="rounded-xl p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
          aria-label={view === "year" ? "Año siguiente" : "Mes siguiente"}
        >
          <ChevronRight size={20} />
        </button>
      </section>

      {error ? (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500">
          Cargando contenido...
        </div>
      ) : view === "year" ? (
        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {monthNames.map((month, index) => (
            <MiniMonth
              key={month}
              year={selectedYear}
              month={index}
              count={countsByMonth[index]}
              onOpenMonth={(nextMonth) => {
                setSelectedMonth(nextMonth);
                setView("month");
              }}
            />
          ))}
        </section>
      ) : (
        <MonthView
          monthDays={monthDays}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          contentItems={items}
          onSelectContent={openEditDrawer}
        />
      )}
    </div>
  );
}

export default function CalendarPage() {
  return (
    <AppShell title="Calendario" subtitle="Planeación anual y mensual de contenidos.">
      <CalendarView />
    </AppShell>
  );
}
