import { UtensilsCrossed } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const menuCategories = [
  {
    id: 1,
    name: "Polévky",
    items: [
      { name: "Masový vývar se zeleninou a játrovými knedlíčky", price: "55 Kč" },
      { name: "Krkonošská zelňačka", price: "55 Kč" },
      { name: "Gulášová polévka", price: "60 Kč" },
      { name: "Pórková s vajíčkem", price: "55 Kč" },
      { name: "Zeleninový vývar se šunkovými knedlíčky", price: "55 Kč" },
      { name: "Česneková s krutony", price: "60 Kč" }
    ]
  },
  {
    id: 2,
    name: "Hlavní jídla - Klasika",
    items: [
      { name: "Kuřecí řízek s hranolkami a tatarskou omáčkou", price: "189 Kč", popular: true },
      { name: "Vepřový řízek Ondráš, vařený brambor, coleslaw salát", price: "179 Kč" },
      { name: "Zapečené šunkofleky s chedarem, kyselá okurka", price: "159 Kč" },
      { name: "Holandský řízek, bramborová kaše, okurkový salát", price: "169 Kč" },
      { name: "Plněný paprikový lusk, rajská omáčka, houskový knedlík", price: "149 Kč" },
      { name: "Smažený sýr, hranolky, tatarská omáčka", price: "145 Kč" }
    ]
  },
  {
    id: 3,
    name: "Speciality",
    items: [
      { name: "Hovězí steak s pepřovou omáčkou, grilovaná zelenina", price: "349 Kč", popular: true },
      { name: "Losos s bylinkovým máslem, restovaná zelenina", price: "289 Kč", popular: true },
      { name: "Pečené králičí stehno, špenát, špekový bramborový knedlík", price: "249 Kč" },
      { name: "Tajemství trhanovského zámku, domácí bramborové plátky, tatarka", price: "269 Kč" },
      { name: "Kuřecí medailonky s pikantní hořčičnou omáčkou, divoká rýže", price: "199 Kč" },
      { name: "Pečená kuřecí roláda, pařížský brambor s bylinkami, dijonský dip", price: "189 Kč" }
    ]
  },
  {
    id: 4,
    name: "Saláty",
    items: [
      { name: "Zeleninový salát s caesar dresinkem a kuřecím masem, slaninový chips, parmezán, bageta", price: "169 Kč" },
      { name: "Salát s kuřecími nugetkami a domácím dresinkem", price: "159 Kč" },
      { name: "Řecký salát s fetou, olivami a zeleninou", price: "149 Kč" },
      { name: "Teplý kozí sýr na salátu s medovou zálivkou", price: "179 Kč" }
    ]
  },
  {
    id: 5,
    name: "Dezerty",
    items: [
      { name: "Domácí jablečný závin se šlehačkou", price: "75 Kč" },
      { name: "Palačinky s čokoládou a šlehačkou", price: "85 Kč" },
      { name: "Crème brûlée", price: "95 Kč" },
      { name: "Tiramisu", price: "95 Kč" },
      { name: "Zmrzlinový pohár s ovocem", price: "89 Kč" }
    ]
  },
  {
    id: 6,
    name: "Nápoje",
    items: [
      { name: "Čepované pivo 0,5l", price: "45 Kč" },
      { name: "Víno bílé/červené 0,2l", price: "55 Kč" },
      { name: "Domácí limonáda 0,4l", price: "65 Kč" },
      { name: "Káva espresso", price: "45 Kč" },
      { name: "Cappuccino", price: "55 Kč" },
      { name: "Nealko nápoje 0,3l", price: "35 Kč" }
    ]
  }
];

export function Menu() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1703797967062-70681a18f71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwZm9vZCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzI0NDE0Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Menu"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Naše <span className="font-semibold">menu</span>
          </h1>
          <p className="text-xl text-white/90">
            Objevte chuť tradiční české a mezinárodní kuchyně
          </p>
        </div>
      </section>

      {/* Menu Content */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          {menuCategories.map((category, index) => (
            <div key={category.id} className={index !== 0 ? "mt-16" : ""}>
              {/* Category Header */}
              <div className="text-center mb-10">
                <h2 
                  className="text-4xl font-light text-gray-900 mb-3"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  <span className="font-semibold">{category.name}</span>
                </h2>
                <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto"></div>
              </div>

              {/* Menu Items */}
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                <div className="space-y-6">
                  {category.items.map((item, itemIndex) => (
                    <div 
                      key={itemIndex}
                      className="flex items-start justify-between gap-4 pb-6 border-b border-gray-100 last:border-0 last:pb-0 group hover:bg-orange-50/30 transition-colors px-4 py-2 rounded-lg -mx-4"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg text-gray-900">
                            {item.name}
                          </h3>
                          {item.popular && (
                            <span className="px-2 py-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-medium rounded">
                              OBLÍBENÉ
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="hidden sm:block h-px flex-1 border-b border-dotted border-gray-300 min-w-[20px]"></div>
                        <span className="font-medium text-orange-700 whitespace-nowrap">
                          {item.price}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}

          {/* Footer Note */}
          <div className="mt-12 bg-orange-50 rounded-xl p-8 text-center border border-orange-100">
            <UtensilsCrossed className="text-orange-700 mx-auto mb-4" size={40} />
            <p className="text-gray-700 mb-2">
              Alergeny a další informace o jídlech rádi sdělíme na vyžádání.
            </p>
            <p className="text-sm text-gray-600">
              Ceny jsou uvedeny včetně DPH. Změna cen vyhrazena.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}