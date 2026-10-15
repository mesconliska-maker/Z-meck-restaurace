import { UtensilsCrossed } from "lucide-react";
import { formatStandingPrice, type StandingMenu } from "../lib/standingMenu";

/**
 * Obsah stránky /menu – kategorie, jídla a poznámka dole. Používá ho veřejná
 * stránka i náhled v administraci, aby náhled vypadal přesně jako web.
 */
export function StandingMenuView({ menu }: { menu: StandingMenu }) {
  return (
    <>
      {menu.categories.map((category, index) => (
        <div key={category.id} id={`kategorie-${category.id}`} className={index !== 0 ? "mt-16" : ""}>
          {/* Category Header */}
          <div className="text-center mb-10">
            <h2
              className="text-4xl font-light text-gray-900 mb-3"
              style={{ fontFamily: "Cormorant Garamond, serif" }}
            >
              <span className="font-semibold">{category.name}</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto"></div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
            <div className="space-y-6">
              {category.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0 group hover:bg-orange-50/30 transition-colors px-4 py-2 rounded-lg -mx-4"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="text-lg text-gray-900">{item.name}</h3>
                      {item.popular && (
                        <span className="px-2 py-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-medium rounded">
                          OBLÍBENÉ
                        </span>
                      )}
                    </div>
                    {item.nameDe && <p className="text-sm text-gray-400 italic mt-0.5">{item.nameDe}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="hidden sm:block h-px flex-1 border-b border-dotted border-gray-300 min-w-[20px]"></div>
                    <span className="font-medium text-orange-700 whitespace-nowrap">
                      {formatStandingPrice(item.price)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      {/* Footer Note */}
      {menu.notes.length > 0 && (
        <div className="mt-12 bg-orange-50 rounded-xl p-8 text-center border border-orange-100">
          <UtensilsCrossed className="text-orange-700 mx-auto mb-4" size={40} />
          {menu.notes.map((note, i) => (
            <p
              key={i}
              className={i === menu.notes.length - 1 && menu.notes.length > 1 ? "text-sm text-gray-600" : "text-gray-700 mb-2"}
            >
              {note}
            </p>
          ))}
        </div>
      )}
    </>
  );
}
