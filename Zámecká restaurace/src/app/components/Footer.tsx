import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { Link } from "react-router";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 
              className="text-3xl font-light mb-4"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Zámecká<br />
              <span className="font-semibold">restaurace</span>
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Tradiční česká a mezinárodní kuchyně v srdci Horšovského Týna
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-medium text-lg mb-4">Navigace</h4>
            <nav className="space-y-2">
              <Link to="/" className="block text-gray-400 hover:text-orange-600 transition-colors">
                Domů
              </Link>
              <Link to="/menu" className="block text-gray-400 hover:text-orange-600 transition-colors">
                Menu
              </Link>
              <Link to="/galerie" className="block text-gray-400 hover:text-orange-600 transition-colors">
                Galerie
              </Link>
              <Link to="/catering" className="block text-gray-400 hover:text-orange-600 transition-colors">
                Catering
              </Link>
              <Link to="/kontakt" className="block text-gray-400 hover:text-orange-600 transition-colors">
                Kontakt
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-medium text-lg mb-4">Kontakt</h4>
            <div className="space-y-3 text-gray-400">
              <div className="flex items-start gap-2">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span className="text-sm">nám. Republiky 66, Horšovský Týn</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={18} className="flex-shrink-0" />
                <a href="tel:+420379423483" className="text-sm hover:text-orange-600 transition-colors">
                  +420 379 423 483
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={18} className="flex-shrink-0" />
                <a href="mailto:info@zamecka-restaurace.cz" className="text-sm hover:text-orange-600 transition-colors">
                  info@zamecka-restaurace.cz
                </a>
              </div>
            </div>
          </div>

          {/* Opening Hours */}
          <div>
            <h4 className="font-medium text-lg mb-4">Otevírací doba</h4>
            <div className="space-y-2 text-gray-400 text-sm">
              <div className="flex justify-between">
                <span>Pondělí - Pátek</span>
                <span>11:00 - 22:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sobota - Neděle</span>
                <span>11:00 - 23:00</span>
              </div>
            </div>
            
            {/* Social Media */}
            <div className="mt-6">
              <h4 className="font-medium text-lg mb-4">Sledujte nás</h4>
              <div className="flex gap-3">
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-orange-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Facebook size={20} />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 bg-gray-800 hover:bg-orange-700 rounded-full flex items-center justify-center transition-colors"
                >
                  <Instagram size={20} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-gray-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-400">
            <p>© 2026 Zámecká restaurace Horšovský Týn. Všechna práva vyhrazena.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-orange-600 transition-colors">
                Ochrana osobních údajů
              </a>
              <a href="#" className="hover:text-orange-600 transition-colors">
                Podmínky použití
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}