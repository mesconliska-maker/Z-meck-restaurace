import { MapPin, Phone, Clock, UtensilsCrossed } from "lucide-react";

export function Information() {
  return (
    <section id="contact" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl sm:text-5xl font-light text-gray-900 mb-6"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Kontaktní <span className="font-semibold">informace</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto"></div>
        </div>

        {/* Info Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Address */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <MapPin className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Adresa</h3>
            <p className="text-gray-600 leading-relaxed">
              nám. Republiky 66<br />
              Horšovský Týn
            </p>
          </div>

          {/* Phone */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Phone className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Telefon</h3>
            <p className="text-gray-600 leading-relaxed">
              <a href="tel:+420379423483" className="hover:text-orange-700 transition-colors">
                +420 379 423 483
              </a>
            </p>
          </div>

          {/* Hours */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Clock className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Otevírací doba</h3>
            <p className="text-gray-600 leading-relaxed">
              Denně od 11:00<br />
              Pondělí - Neděle
            </p>
          </div>

          {/* Services */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <UtensilsCrossed className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Služby</h3>
            <p className="text-gray-600 leading-relaxed">
              Dine-in<br />
              Takeaway
            </p>
          </div>
        </div>

        {/* Map */}
        <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gray-200 h-96 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="text-gray-400 mx-auto mb-4" size={48} />
              <p className="text-gray-500">Mapa - nám. Republiky 66, Horšovský Týn</p>
              <p className="text-sm text-gray-400 mt-2">Map integration placeholder</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}