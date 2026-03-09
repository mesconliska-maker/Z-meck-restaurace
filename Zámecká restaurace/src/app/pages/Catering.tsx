import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { Users, UtensilsCrossed, Calendar, CheckCircle, Phone } from "lucide-react";

const cateringServices = [
  {
    id: 1,
    icon: Users,
    title: "Firemní akce",
    description: "Zajistíme kompletní catering pro vaše firemní setkání, konference a teambuildingy"
  },
  {
    id: 2,
    icon: UtensilsCrossed,
    title: "Svatby a oslavy",
    description: "Vytvoříme nezapomenutelný gastronomický zážitek pro vaši významnou událost"
  },
  {
    id: 3,
    icon: Calendar,
    title: "Pravidelné dodávky",
    description: "Nabízíme pravidelné dodávky obědů pro firmy a instituce v okolí"
  }
];

const cateringPackages = [
  {
    id: 1,
    name: "Základní balíček",
    price: "od 350 Kč/osoba",
    items: [
      "Studené předkrmě",
      "Hlavní chod dle výběru",
      "Přílohy",
      "Nápoje (voda, káva)",
      "Rozvoz do 10 km zdarma"
    ]
  },
  {
    id: 2,
    name: "Premium balíček",
    price: "od 550 Kč/osoba",
    popular: true,
    items: [
      "Studené i teplé předkrmy",
      "Polévka",
      "2 hlavní chody dle výběru",
      "Přílohy a saláty",
      "Dezert",
      "Nápoje (voda, káva, džus)",
      "Rozvoz do 20 km zdarma",
      "Servírovací nádobí a příbory"
    ]
  },
  {
    id: 3,
    name: "Luxusní balíček",
    price: "od 850 Kč/osoba",
    items: [
      "Welcome drink",
      "Studené i teplé předkrmy",
      "Polévka",
      "3 hlavní chody dle výběru",
      "Přílohy premium kvality",
      "Dezertový buffet",
      "Kompletní výběr nápojů",
      "Rozvoz bez omezení",
      "Obsluha a servírování",
      "Premium nádobí a výzdoba"
    ]
  }
];

export function Catering() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1703797967062-70681a18f71c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaW5lJTIwZGluaW5nJTIwZm9vZCUyMHByZXNlbnRhdGlvbnxlbnwxfHx8fDE3NzI0NDE0Njd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Catering"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            <span className="font-semibold">Catering</span> služby
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Profesionální cateringové služby pro vaše akce a oslavy
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-4xl font-light text-gray-900 mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Vaše akce <span className="font-semibold">na klíč</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mb-8"></div>
          <p className="text-lg text-gray-600 leading-relaxed">
            Nabízíme komplexní cateringové služby pro firemní i soukromé akce. Naše 
            zkušenosti v gastronomii a důraz na kvalitu surovin zaručují, že vaše 
            akce bude nezapomenutelná. Připravíme menu přesně podle vašich představ 
            a postaráme se o vše od A do Z.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-light text-gray-900 mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Naše <span className="font-semibold">služby</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cateringServices.map((service) => (
              <div 
                key={service.id}
                className="bg-white rounded-xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <service.icon className="text-white" size={32} />
                </div>
                <h3 
                  className="text-2xl font-medium text-gray-900 mb-4"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-light text-gray-900 mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Cateringové <span className="font-semibold">balíčky</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mb-6"></div>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Vyberte si jeden z našich připravených balíčků nebo nám sdělte vaše představy 
              a vytvoříme nabídku na míru
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {cateringPackages.map((pkg) => (
              <div 
                key={pkg.id}
                className={`bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 ${
                  pkg.popular 
                    ? 'border-orange-600 ring-4 ring-orange-50 scale-105' 
                    : 'border-gray-100'
                }`}
              >
                {pkg.popular && (
                  <div className="text-center mb-4">
                    <span className="inline-block px-4 py-1 bg-gradient-to-r from-orange-600 to-orange-700 text-white text-sm font-medium rounded-full">
                      NEJOBLÍBENĚJŠÍ
                    </span>
                  </div>
                )}
                
                <h3 
                  className="text-3xl font-medium text-gray-900 mb-2 text-center"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {pkg.name}
                </h3>
                <p className="text-2xl text-orange-700 font-medium text-center mb-8">
                  {pkg.price}
                </p>

                <ul className="space-y-4 mb-8">
                  {pkg.items.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <CheckCircle size={20} className="text-orange-700 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>

                <a
                  href="/kontakt"
                  className={`block text-center px-6 py-3 rounded-lg transition-all ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-700 hover:to-orange-800 shadow-lg'
                      : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                  }`}
                >
                  Objednat
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 
              className="text-4xl font-light text-gray-900 mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Jak to <span className="font-semibold">funguje</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: "1", title: "Kontaktujte nás", desc: "Zavolejte nebo napište email s vaším dotazem" },
              { step: "2", title: "Konzultace", desc: "Probereme vaše požadavky a sestavíme nabídku" },
              { step: "3", title: "Potvrzení", desc: "Po odsouhlasení zpracujeme závaznou objednávku" },
              { step: "4", title: "Dodání", desc: "V dohodnutý čas doručíme a případně servírujeme" }
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-medium text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-orange-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 
            className="text-4xl sm:text-5xl font-light text-white mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Plánujete <span className="font-semibold">akci?</span>
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Kontaktujte nás pro nezávaznou cenovou nabídku a konzultaci
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a
              href="tel:+420379423483"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white text-orange-700 rounded-lg hover:bg-gray-50 transition-all shadow-xl"
            >
              <Phone size={20} />
              +420 379 423 483
            </a>
            <a
              href="/kontakt"
              className="px-8 py-4 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all"
            >
              Kontaktní formulář
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}