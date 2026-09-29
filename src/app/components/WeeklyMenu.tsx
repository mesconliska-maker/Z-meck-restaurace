import { Calendar, UtensilsCrossed, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { fetchCurrentWeekMenu } from "../lib/weeklyMenuSource";

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

const fallbackMenu: DayMenu[] = [
  {
    day: "Pondělí", date: "7.4.2026", isToday: false,
    soup: "Masový vývar se zeleninou a játrovými knedlíčky",
    meals: [
      { number: "1", name: "Zapečené šunkofleky s chedarem, kyselá okurka" },
      { number: "2", name: "Kuřecí medailonky s pikantní hořčičnou omáčkou, divoká rýže" }
    ]
  },
  {
    day: "Úterý", date: "8.4.2026", isToday: false,
    soup: "Krkonošská zelňačka",
    meals: [
      { number: "1", name: "Holandský řízek, bramborová kaše, okurkový salát" },
      { number: "2", name: "Zeleninový salát s caesar dresinkem a kuřecím masem, corn bageta" }
    ]
  },
  {
    day: "Středa", date: "9.4.2026", isToday: false,
    soup: "Gulášová",
    meals: [
      { number: "1", name: "Plněný paprikový lusk, rajská omáčka, houskový knedlík" },
      { number: "2", name: "Tajemství trhanovského zámku, domácí bramborové plátky, tatarka" }
    ]
  },
  {
    day: "Čtvrtek", date: "10.4.2026", isToday: false,
    soup: "Pórková s vajíčkem",
    meals: [
      { number: "1", name: "Pečené králičí stehno, špenát, špekový bramborový knedlík" },
      { number: "2", name: "Vepřový řízek Ondráš, vařený brambor, coleslaw salát" }
    ]
  },
  {
    day: "Pátek", date: "11.4.2026", isToday: false,
    soup: "Zeleninový vývar se šunkovými knedlíčky",
    meals: [
      { number: "1", name: "Pečená kuřecí roláda, vařený pařížský brambor s bylinkami, dijonský dip" },
      { number: "2", name: "Rizoto z vepřového masa se zeleninou, strouhaný sýr, beraní rohy" }
    ]
  }
];

function getTodayDay(): string {
  const days = ["Neděle", "Pondělí", "Úterý", "Středa", "Čtvrtek", "Pátek", "Sobota"];
  return days[new Date().getDay()];
}

export function WeeklyMenu() {
  const [menu, setMenu] = useState<DayMenu[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = getTodayDay();

    // Nejdřív vlastní administrace (/admin); dokud není zapnutá
    // (PUBLIC_SITE_CONNECTED), vrací null a jede se postaru přes menicka.cz.
    fetchCurrentWeekMenu()
      .then((own) =>
        own ??
        fetch("/api/menu")
          .then((res) => res.json())
          .then((data) => (Array.isArray(data?.menu) ? data.menu : []))
      )
      .then((parsed: DayMenu[]) => {
        // Doplníme isToday podle aktuálního dne (i když API už isToday nastavuje, dáme to ještě jednou pro jistotu)
        const withToday = parsed.map((d) => ({ ...d, isToday: d.day === today }));

        // Odfiltrujeme dny, kde Robert ještě nic nezadal — ty nemá smysl ukazovat
        // (typicky příští týden, který ještě není vyplněný).
        const cleaned = withToday.filter(
          (d) => !(d.note && /nebylo zadáno menu/i.test(d.note) && !d.soup && d.meals.length === 0)
        );

        // Když API nevrátilo nic použitelného (parser selhal nebo menička.cz je dole),
        // ukážeme fallback menu místo prázdné stránky.
        setMenu(
          cleaned.length > 0
            ? cleaned
            : fallbackMenu.map((d) => ({ ...d, isToday: d.day === today }))
        );
      })
      .catch(() => {
        setMenu(fallbackMenu.map((d) => ({ ...d, isToday: d.day === today })));
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
                className={`bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 wrap-anywhere ${
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

                {/* Speciální stav (svátek, nezadané menu) — zobrazíme místo polévky+jídel */}
                {day.note && day.meals.length === 0 && !day.soup && (
                  <div className="py-4 text-center">
                    <p className="text-gray-600 italic">{day.note}</p>
                  </div>
                )}

                {/* Polévka (jen když existuje) */}
                {day.soup && (
                  <div className="mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-start gap-2">
                      <UtensilsCrossed size={18} className="text-orange-700 mt-1 flex-shrink-0" />
                      <div>
                        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Polévka</p>
                        <p className="text-gray-900 leading-snug">{day.soup}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hlavní jídla */}
                {day.meals.length > 0 && (
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
                )}

                {/* Pokud je note + zároveň jsou jídla, ukaž note jako poznámku navíc */}
                {day.note && (day.meals.length > 0 || day.soup) && (
                  <p className="text-sm text-gray-500 italic mt-3 pt-3 border-t border-gray-100">
                    {day.note}
                  </p>
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
