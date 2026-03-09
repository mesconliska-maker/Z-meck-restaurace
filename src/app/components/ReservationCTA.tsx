import { Calendar } from "lucide-react";
import { Link } from "react-router";

export function ReservationCTA() {
  return (
    <section id="reservation" className="py-20 bg-gradient-to-r from-orange-600 to-orange-700 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full -translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full translate-x-48 translate-y-48"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <Calendar className="text-white mx-auto mb-6" size={64} />
        <h2 
          className="text-4xl sm:text-5xl lg:text-6xl font-light text-white mb-6"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Kontaktujte nás <br />
          <span className="font-semibold">ještě dnes</span>
        </h2>
        <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
          Rádi vám odpovíme na vaše dotazy a zajistíme vše potřebné
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="tel:+420379423483"
            className="inline-block px-10 py-5 bg-white text-orange-700 rounded-lg hover:bg-gray-50 transition-all shadow-2xl hover:shadow-3xl transform hover:-translate-y-1 text-lg font-medium"
          >
            Zavolat +420 379 423 483
          </a>
          <Link
            to="/kontakt"
            className="px-10 py-5 bg-transparent border-2 border-white text-white rounded-lg hover:bg-white/10 transition-all text-lg"
          >
            Kontaktní formulář
          </Link>
        </div>
      </div>
    </section>
  );
}