import CalendarContentCard from "./CalendarContentCard";

const weekDays = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

function formatDateKey(year, month, day) {
  const normalizedMonth = `${month + 1}`.padStart(2, "0");
  const normalizedDay = `${day}`.padStart(2, "0");
  return `${year}-${normalizedMonth}-${normalizedDay}`;
}

export default function MonthView({
  monthDays,
  selectedYear,
  selectedMonth,
  contentItems,
  onSelectContent,
}) {
  const items = contentItems || [];

  return (
    <section className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
        {weekDays.map((day) => (
          <div
            key={day}
            className="px-3 py-4 text-center text-xs font-semibold uppercase tracking-wide text-gray-500"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {monthDays.map((day, index) => {
          const dayKey = day ? formatDateKey(selectedYear, selectedMonth, day) : null;
          const dayItems = dayKey
            ? items.filter((item) => item.publishDate === dayKey)
            : [];

          return (
            <div
              key={`${selectedYear}-${selectedMonth}-${index}`}
              className="min-h-32 border-b border-r border-gray-100 p-3"
            >
              {day && (
                <>
                  <span className="mb-2 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium text-gray-700">
                    {day}
                  </span>

                  <div className="space-y-2">
                    {dayItems.map((item) => (
                      <CalendarContentCard key={item.id} item={item} onSelect={onSelectContent} />
                    ))}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
