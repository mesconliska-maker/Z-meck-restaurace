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
              346 01 Horšovský Týn
            </p>
          </div>

          {/* Phone */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Phone className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Rezervace</h3>
            <p className="text-gray-600 leading-relaxed">
              <a href="tel:+420379423483" className="hover:text-orange-700 transition-colors block">
                +420 379 423 483
              </a>
              <a href="tel:+420777251953" className="hover:text-orange-700 transition-colors block">
                +420 777 251 953
              </a>
            </p>
            <p className="text-sm text-gray-500 mt-1">pouze telefonicky</p>
          </div>

          {/* Hours */}
          <div className="text-center group">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-orange-600 to-orange-700 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <Clock className="text-white" size={28} />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">Otevírací doba</h3>
            <p className="text-gray-600 leading-relaxed text-sm">
              Po – Čt: 11:00 – 23:00<br />
              Pá – So: 11:00 – 24:00<br />
              Ne: 11:00 – 22:00
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

        {/* Google Map */}
        <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl">
          <iframe 
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2589.627617553489!2d12.941469876786629!3d49.529305553258354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470abb5cba7ebd2d%3A0xf975b20c6a9cb67c!2zWsOhbWVja8OhIHJlc3RhdXJhY2U!5e0!3m2!1scs!2scz!4v1773305823821!5m2!1scs!2scz"
            width="100%"
            height="400"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-[400px]"
          />
        </div>
      </div>
    </section>
  );
}
