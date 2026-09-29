import { UtensilsCrossed } from "lucide-react";
import { toPublicDays } from "../../lib/weeklyMenuSource";
import type { WeekMenu } from "../lib/types";

/**
 * Jak bude týden vypadat v sekci „Menu tohoto týdne“ na webu.
 * Kopíruje vzhled karet z components/WeeklyMenu.tsx a používá stejný
 * převod dat (toPublicDays) jako budoucí napojení veřejného webu.
 */
export function WebPreview({ week, today }: { week: WeekMenu; today: string }) {
  const days = toPublicDays(week, today);
  return (
    <div className="rounded-xl bg-gradient-to-b from-white to-gray-50 p-4">
      {days.length === 0 && <p className="py-10 text-center text-stone-500">Zatím není co zobrazit.</p>}
      <div className="grid gap-4 sm:grid-cols-2">
        {days.map((day) => (
          <div
            key={day.date}
            className={`rounded-xl border-2 bg-white p-5 shadow-lg ${
              day.isToday ? "border-orange-600 ring-2 ring-orange-100" : "border-gray-100"
            }`}
          >
            <div className="mb-4 flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-2xl font-medium text-gray-900" style={{ fontFamily: "Cormorant Garamond, serif" }}>
                  {day.day}
                </h3>
                <p className="text-sm text-gray-500">{day.date}</p>
              </div>
              {day.isToday && (
                <span className="rounded-full bg-gradient-to-r from-orange-600 to-orange-700 px-3 py-1 text-xs font-medium text-white">
                  DNES
                </span>
              )}
            </div>
            {day.note && day.meals.length === 0 && !day.soup && (
              <p className="py-4 text-center italic text-gray-600">{day.note}</p>
            )}
            {day.soup && (
              <div className="mb-4 border-b border-gray-100 pb-4">
                <div className="flex items-start gap-2">
                  <UtensilsCrossed size={18} className="mt-1 flex-shrink-0 text-orange-700" />
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wide text-gray-500">Polévka</p>
                    <p className="leading-snug text-gray-900">{day.soup}</p>
                  </div>
                </div>
              </div>
            )}
            {day.meals.length > 0 && (
              <div className="space-y-3">
                {day.meals.map((meal) => (
                  <div key={meal.number} className="flex items-start gap-3">
                    <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-600 to-orange-700 text-sm font-medium text-white">
                      {meal.number}
                    </div>
                    <p className="pt-0.5 leading-snug text-gray-700">{meal.name}</p>
                  </div>
                ))}
              </div>
            )}
            {day.note && (day.meals.length > 0 || day.soup) && (
              <p className="mt-3 border-t border-gray-100 pt-3 text-sm italic text-gray-500">{day.note}</p>
            )}
          </div>
        ))}
      </div>
      <p className="mt-6 text-center text-gray-600">
        Polední menu podáváme od <span className="font-medium text-orange-700">{week.servingHours.replace("–", " do ")}</span>
      </p>
    </div>
  );
}
