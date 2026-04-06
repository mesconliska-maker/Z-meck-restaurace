import { Calendar, UtensilsCrossed, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";

interface Meal {
  number: string;
  name: string;
}

interface DayMenu {
  day: string;
  date: string;
  isToday: boolean;
  soup: string;
  meals: Meal[];
  note?: string;
}

const SHEET_ID = "1OJp1WUjXfYEXAOIh4AM08gBg4JumJS0Yd8DDlXi1API";
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

const fallbackMenu: DayMenu[] = [
  {
    day: "Pondělí", date: "6.4.2026", isToday: false,
    note: "Svátek, otevřeno",
    soup: "",
    meals: []
  },
  {
    day: "Úterý", date: "7.4.2026", isToday: false,
    soup: "Česnečka se sýrem a krutóny",
    meals: [
      { number: "1", name: "Domácí sekaná, bramborová kaše, okurkový salát" },
      { number: "2", name: "Zeleninový salát s kuřecími nugetkami v popcornu, koktejlový dip, bagetka" }
    ]
  },
  {
    day: "Středa", date: "8.4.2026", isToday: false,
    soup: "Zelňačka",
    meals: [
      { number: "1", name: "Plněný vepřový řízek cordon bleu, vařený brambor, tatarka" },
      { number: "2", name: "Lasagne s kuřecím masem a jemnou tomatovou omáčkou, zapečené mozzarellou" }
    ]
  },
  {
    day: "Čtvrtek", date: "9.4.2026", isToday: false,
    soup: "Hrachová se slaninovým chipsem",
    meals: [
      { number: "1", name: "Dušená mrkev, vepřové kostky, domácí rozpek" },
      { number: "2", name: "Pečené masové koule, rajská omáčka, kolínka nebo houskový knedlík" }
    ]
  },
  {
    day: "Pátek", date: "10.4.2026", isToday: false,
    soup: "Bramboračka",
    meals: [
      { number: "1", name: "Smažený hermelín se šunkou, vařený brambor, tatarka" },
      { number: "2", name: "Domácí pražská kuřecí roláda, šťouchaný bylinkový brambor" }
    ]
  }
];

function getTodayDay(): string {
  const days = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];
  return days[new Date().getDay()];
}

function formatDate(value: any): string {
  if (!value) return "";
  // Google Sheets vrací datum jako "Date(2026,3,3)" — měsíc je 0-indexed
  if (typeof value === "string" && value.startsWith("Date(")) {
    const parts = value.replace("Date(", "").replace(")", "").split(",");
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) + 1; // +1 protože je 0-indexed
    const day = parseInt(parts[2]);
    return `${day}.${month}.${year}`;
  }
  return String(value);
}

export function WeeklyMenu() {
  const [menu, setMenu] = useState<DayMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = getTodayDay();

    fetch(SHEET_URL)
      .then((res) => res.text())
      .then((text) => {
        const json = JSON.parse(
          text.replace("/*O_o*/\ngoogle.visualization.Query.setResponse(", "").replace(");", "")
        );
        const rows = json.table.rows;

        const parsed: DayMenu[] = rows
          .filter((row: any) => row.c[0]?.v)
          .map((row: any) => ({
            day: row.c[0]?.v || "",
            date: formatDate(row.c[1]?.v),
            isToday: (row.c[0]?.v || "") === today,
            soup: row.c[2]?.v || "",
            meals: [
              { number: "1", name: row.c[3]?.v || "" },
              { number: "2", name: row.c[4]?.v || "" },
            ],
          }));

        setMenu(parsed.length > 0 ? parsed : fallbackMenu.map(d => ({ ...d, isToday: d.day === today })));
      })
      .catch(() => {
        const today = getTodayDay();
        setMenu(fallbackMenu.map(d => ({ ...d, isToday: d.day === today })));
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-900 px-4 py-2 rounded-full mb-4">
            <Calendar size={18} />
            <span className="font-medium">Týdenní nabídka</span>
          </div>
          <h2
            className="text-4xl sm:text-5xl font-light text-gray-900 mb-4"
            style={{ fontFamily: "Cormorant Garamond, serif" }}
          >
            Menu <span className="font-semibold">tohoto týdne</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Každý den pro vás připravujeme čerstvé polední menu s domácí polévkou
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-orange-600" size={40} />
          </div>
        )}

        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menu.map((day, index) => (
              <div
                key={index}
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                  day.isToday
                    ? "border-orange-600 ring-2 ring-orange-100"
                    : "border-gray-100 hover:border-orange-100"
                }`}
              >
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div>
                    <h3
                      className="text-2xl font-medium text-gray-900"
                      style={{ fontFamily: "Cormorant Garamond, serif" }}
                    >
                      {day.day}
                    </h3>
                    <p className="text-sm text-gray-500">{day.date}</p>
                  </div>
                  {day.isToday && (
                    <span className="px-3 py-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-medium rounded-full">
                      DNES
                    </span>
                  )}
                </div>

                {day.note ? (
                  <div className="flex items-center justify-center py-6">
                    <span className="text-orange-700 font-medium text-lg">{day.note}</span>
                  </div>
                ) : (
                  <>
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-start gap-2">
                        <UtensilsCrossed size={18} className="text-orange-700 mt-1 flex-shrink-0" />
                        <div>
                          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Polévka</p>
                          <p className="text-gray-900 leading-snug">{day.soup}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {day.meals.map((meal, mealIndex) => (
                        <div key={mealIndex} className="flex items-start gap-3">
                          <div className="w-7 h-7 bg-gradient-to-br from-orange-600 to-orange-700 text-white rounded-full flex items-center justify-center font-medium text-sm flex-shrink-0">
                            {meal.number}
                          </div>
                          <p className="text-gray-700 leading-snug pt-0.5">{meal.name}</p>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Polední menu podáváme od{" "}
            <span className="text-orange-700 font-medium">11:00 do 14:00</span>
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Ceny a dostupnost pokrmů se mohou měnit. Kontaktujte nás pro aktuální informace.
          </p>
        </div>
      </div>
    </section>
  );
}
