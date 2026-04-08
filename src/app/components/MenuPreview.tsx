import { ArrowRight } from "lucide-react";
import { Link } from "react-router";

const menuItems = [
  {
    id: 1,
    name: "Hovězí steak na zeleném pepři",
    description: "200 gr hovězí steak, hráškové lusky se slaninou, cibulové kroužky, aioli dip",
    image: "/jidlo16.jpeg"
  },
  {
    id: 2,
    name: "Losos filet",
    description: "200 g Losos filet s limetkovou omáčkou a zeleným chřestem, batátové hranolky",
    image: "/jidlo18.jpeg"
  },
  {
    id: 3,
    name: "Kachní prso",
    description: "200 gr kachní prso se švestkovou omáčkou, šťouchaný slaninový brambor",
    image: "/jidlo19.jpeg"
  },
  {
    id: 4,
    name: "Hovězí carpaccio",
    description: "80 g Hovězí carpaccio, parmezán, capary, bylinková bagetka",
    image: "/jidlo14.jpeg"
  }
];

export function MenuPreview() {
  return (
    <section id="menu" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl sm:text-5xl font-light text-gray-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Naše <span className="font-semibold">speciality</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Vyberte si z našich oblíbených jídel připravených z čerstvých lokálních surovin
          </p>
        </div>

        {/* Menu Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {menuItems.map((item) => (
            <div 
              key={item.id}
              className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300 group"
            >
              <div className="relative h-64 overflow-hidden">
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
              </div>
              <div className="p-6">
                <h3 
                  className="text-2xl font-medium text-gray-900 mb-3"
                  style={{ fontFamily: 'Cormorant Garamond, serif' }}
                >
                  {item.name}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Kompletní menu
            <ArrowRight size={20} />
          </Link>
        </div>
      </div>
    </section>
  );
}
