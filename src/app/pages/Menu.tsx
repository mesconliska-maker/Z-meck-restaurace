import { UtensilsCrossed } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";

const menuCategories = [
  {
    id: 1,
    name: "Studené předkrmy / Kalte Vorspeisen",
    items: [
      { name: "100 g Tatarský biftek, 3 ks topinek", nameDe: "Tatar Beafsteak, 3 st geröstete Brotscheiben", price: "175 Kč" },
      { name: "80 g Hovězí carpaccio, parmezán, capary, bylinková bagetka", nameDe: "Rindercarpaccio, Parmesan, Kapern und Baguette", price: "175 Kč" },
      { name: "100 g Carpaccio z červené řepy s kozím sýrem a karamelizovanými ořechy, bylinková bageta", nameDe: "Rote-Bete-Carpaccio mit Ziegenkäse und karamellisierten Nüssen, Kräuterbaguette", price: "159 Kč" },
      { name: "100 g Krevetový špíz (2 ks), wakame salát, dip z medvědího česneku", nameDe: "Garnelenspieß (2 Stk.), Wakame-Salat, Bärlauch-Dip", price: "175 Kč" }
    ]
  },
  {
    id: 2,
    name: "Polévky / Suppen",
    items: [
      { name: "Dle denní nabídky", nameDe: "Nach Tagesangebot", price: "49 Kč" },
      { name: "Tomatová, bylinková bageta", nameDe: "Tomatensuppe mit Baguette", price: "69 Kč" },
      { name: "Hříbková, bylinková bageta", nameDe: "Steinpilzsuppe mit Baguette", price: "69 Kč" }
    ]
  },
  {
    id: 3,
    name: "Speciality",
    items: [
      { name: "Jarní burger s trhaným hovězím masem, špenátovými listy, sázeným vejcem a slaninou, batátové hranolky, BBQ dip", nameDe: "Frühlingsburger mit Pulled Beef, Spinatblättern, Spiegelei und Speck, Süßkartoffelpommes, BBQ-Dip", price: "299 Kč", popular: true }
    ]
  },
  {
    id: 4,
    name: "Saláty / Salate",
    items: [
      { name: "S panenkou sous vide a chimichurri omáčkou, bylinková bagetka", nameDe: "Mit Sous-vide gegartem Schweinefilet und Chimichurri-Sauce, Kräuterbaguette", price: "269 Kč" },
      { name: "S rozpečeným hermelínem, karamelizované ořechy, vinaigrette, bylinková bageta", nameDe: "Mit gerösteten Camembert, karamellisierten Nüssen, Vinaigrette, Baguette", price: "249 Kč" },
      { name: "S kuřecím masem, slaninový chips, parmezán, caesar dresink a bylinková bageta", nameDe: "Mit Hühnerfleisch, Speckchips, Parmesan Käse, Caesar Dressing, Baguette", price: "249 Kč", popular: true }
    ]
  },
  {
    id: 5,
    name: "Bezmasá jídla / Vegetarisches Essen",
    items: [
      { name: "150 g Smažený sýr, tatarka", nameDe: "Panierter Käse, Remoulade", price: "159 Kč" },
      { name: "150 g Rozpečený hermelín s pečenou jarní zeleninou, bylinkový dip, bagetka", nameDe: "Überbackener Hermelin mit geröstetem Frühlingsgemüse, Kräuterdip, Baguette", price: "189 Kč" },
      { name: "200 g Smažený sýrový talíř (eidam, niva, balkánský sýr, hermelín), spousta čerstvé zeleniny, bylinkový dip, brusinky", nameDe: "Frittierter Käseteller (Edamer, Blauschimmelkäse, Balkan-Käse, Hermelinkäse), viel frisches Gemüse, Kräuterdip, Preiselbeeren", price: "229 Kč" }
    ]
  },
  {
    id: 6,
    name: "Ryby / Fisch",
    items: [
      { name: "200 g Losos filet s limetkovou omáčkou a zeleným chřestem, batátové hranolky", nameDe: "Lachsfilet mit Limettensauce und grünem Spargel, Süßkartoffelpommes", price: "329 Kč", popular: true },
      { name: "200 g Losos filet s bylinkovým máslem a spoustou čerstvé zeleniny, chimichurri dip", nameDe: "Lachsfilet mit Kräuterbutter, viel frischem Gemüse, Chimichurri dip", price: "329 Kč" }
    ]
  },
  {
    id: 7,
    name: "Drůbež / Geflügel",
    items: [
      { name: "200 g BBQ smoked kuřecí medailonky, restovaná jarní zelenina, cibulové kroužky, chimichurri dip", nameDe: "BBQ Smoked Hähnchenmedaillons, sautiertes Frühlingsgemüse, Zwiebelringe, Chimichurri-Dip", price: "279 Kč" },
      { name: "200 g Plněné kuřecí prso s mozzarellou a sušenými rajčaty, pikantní tomatová omáčka, opečený pařížský brambor", nameDe: "Gefüllte Hähnchenbrust mit Mozzarella und getrockneten Tomaten, pikante Tomatensauce, gebratene Parisienne-Kartoffeln", price: "279 Kč", popular: true },
      { name: "200 g Mini bramborové noky s kuřecím masem, špenátovými listy a smetanou", nameDe: "Mini-Kartoffelgnocchi mit Hähnchenfleisch, Spinatblättern und Sahne", price: "249 Kč" },
      { name: "200 g Kuřecí steak s bylinkovým máslem, spousta čerstvé zeleniny, bylinkový dip a tomatová salsa", nameDe: "Hähnchensteak mit Kräuterbutter, reichlich frischem Gemüse, Kräuterdip und Tomatensalsa", price: "269 Kč" },
      { name: "200 g Kachní prso s pikantní jarní zeleninou, šťouchaný bylinkový brambor", nameDe: "Entenbrust mit pikantem Frühlingsgemüse, gestampfte Kräuterkartoffeln", price: "299 Kč" },
      { name: "200 g Smažený kuřecí řízek obalený v sezamu", nameDe: "Hühnerschnitzel in Sezam paniert", price: "189 Kč" }
    ]
  },
  {
    id: 8,
    name: "Vepřové maso / Schwein",
    items: [
      { name: "200 g Vepřové medailonky s hříbkovou omáčkou", nameDe: "Schweinemedailons mit Steinpilzsauce", price: "259 Kč" },
      { name: "200 g Marinovaný špalíček BBQ smoked, grilovaná jarní zelenina, cibulové kroužky, dip z medvědího česneku", nameDe: "Marinierter BBQ-Smoked Schweinefilet, gegrilltes Frühlingsgemüse, Zwiebelringe, Bärlauch-Dip", price: "299 Kč", popular: true },
      { name: "200 g Špalíček z vepřové panenky, pikantní hořčičná omáčka, opečený pařížský brambor, slaninový chips", nameDe: "Schweinefilet, pikante Senfsauce, gebratene Parisienne-Kartoffeln, Speck-Chips", price: "299 Kč" },
      { name: "200 g Řízečky z panenky v panko strouhance, šťouchaný slaninový brambor, zelný salát s křenem", nameDe: "Schnitzel (Schweinefile), Speckkartoffeln mit Zwiebel, Krautsalat mit Meerrettich", price: "299 Kč" },
      { name: "200 g Smažený vepřový řízek", nameDe: "Schweineschnitzel paniert", price: "189 Kč" }
    ]
  },
  {
    id: 9,
    name: "Hovězí maso / Rind",
    items: [
      { name: "200 g Hovězí steak na barevném pepři, pečená pikantní jarní zelenina, cibulové kroužky, dip z medvědího česneku", nameDe: "Rindersteak mit buntem Pfeffer, geröstetem pikantem Frühlingsgemüse, Zwiebelringe, Bärlauch-Dip", price: "420 Kč", popular: true }
    ]
  },
  {
    id: 10,
    name: "Přílohy / Beilagen",
    items: [
      { name: "180 g Hranolky s chedarovým přelivem posypané drcenou cibulkou se slaninou", nameDe: "Pommes mit Chedar Sosse und Zwiebelspeck", price: "75 Kč" },
      { name: "180 g Batátové hranolky", nameDe: "Süßkartoffel-Pommes", price: "75 Kč" },
      { name: "180 g Hranolky, krokety", nameDe: "Pommes Frites, Kroketten", price: "50 Kč" },
      { name: "150 g Opékaný pařížský brambor", nameDe: "Pariser Bratkartoffeln", price: "50 Kč" },
      { name: "180 g Americký brambor", nameDe: "Amerikanische Kartoffeln", price: "50 Kč" },
      { name: "180 g Bramboráčky", nameDe: "Kartoffelrösti", price: "50 Kč" },
      { name: "180 g Šťouchaný slaninový brambor", nameDe: "Kartoffeln mit Speck", price: "50 Kč" },
      { name: "180 g Vařený brambor", nameDe: "Gekochte Kartoffeln", price: "37 Kč" },
      { name: "150 g Pečená zelenina", nameDe: "Gegrillte Gemüse", price: "69 Kč" },
      { name: "200 g Míchaný salát", nameDe: "Gemischter Salat", price: "79 Kč" },
      { name: "180 g Zelný salát", nameDe: "Kräutersalat", price: "47 Kč" },
      { name: "80 g Kečup", nameDe: "Ketschup", price: "25 Kč" },
      { name: "80 g Tatarská omáčka", nameDe: "Remoulade", price: "35 Kč" }
    ]
  },
  {
    id: 11,
    name: "Dětské jídlo / Kinder Menü",
    items: [
      { name: "100 g Kuřecí řízek, hranolky, kečup", nameDe: "Hähnchenschnitzel, Pommes Frites, Ketschup", price: "179 Kč" }
    ]
  },
  {
    id: 12,
    name: "Dezerty / Nachspeisen",
    items: [
      { name: "Trhanec s vanilkovou omáčkou a malinovým rozvarem", nameDe: "Kaiserschmarn mit Vanillesauce und Himbeermus", price: "99 Kč" },
      { name: "Čokoládové brownies s pistáciovým krémem a čerstvým ovocem", nameDe: "Schokoladen-Brownies mit Pistaziencreme und frischen Früchten", price: "99 Kč" },
      { name: "Čokoládový fondant s vanilkovou zmrzlinou", nameDe: "Schokoladenfondant mit Vanille-Eiscreme", price: "105 Kč", popular: true },
      { name: "Cheesecake s malinovou omáčkou", nameDe: "Cheesecake mit Himbeersauce", price: "99 Kč" },
      { name: "Horké maliny", nameDe: "Heisse Himbeeren", price: "99 Kč" }
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
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg text-gray-900">
                            {item.name}
                          </h3>
                          {item.popular && (
                            <span className="px-2 py-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-xs font-medium rounded">
                              OBLÍBENÉ
                            </span>
                          )}
                        </div>
                        {item.nameDe && (
                          <p className="text-sm text-gray-400 italic mt-0.5">{item.nameDe}</p>
                        )}
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
              Všechna poloviční hlavní jídla = polovina ceny + 30 Kč
            </p>
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
