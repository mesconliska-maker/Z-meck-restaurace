import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "react-router";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="fixed top-0 w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-2xl font-serif text-gray-900" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Zámecká restaurace
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`transition-colors ${
                isActive("/") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
            >
              Domů
            </Link>
            <Link 
              to="/menu" 
              className={`transition-colors ${
                isActive("/menu") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
            >
              Menu
            </Link>
            <Link 
              to="/galerie" 
              className={`transition-colors ${
                isActive("/galerie") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
            >
              Galerie
            </Link>
            <Link 
              to="/catering" 
              className={`transition-colors ${
                isActive("/catering") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
            >
              Catering
            </Link>
            <Link 
              to="/kontakt" 
              className={`transition-colors ${
                isActive("/kontakt") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
            >
              Kontakt
            </Link>
            <a 
              href="tel:+420379423483"
              className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-md hover:shadow-lg"
            >
              Zavolat
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 text-gray-700"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white">
          <nav className="px-4 py-4 space-y-3">
            <Link 
              to="/" 
              className={`block py-2 ${
                isActive("/") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Domů
            </Link>
            <Link 
              to="/menu" 
              className={`block py-2 ${
                isActive("/menu") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Menu
            </Link>
            <Link 
              to="/galerie" 
              className={`block py-2 ${
                isActive("/galerie") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Galerie
            </Link>
            <Link 
              to="/catering" 
              className={`block py-2 ${
                isActive("/catering") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Catering
            </Link>
            <Link 
              to="/kontakt" 
              className={`block py-2 ${
                isActive("/kontakt") ? "text-orange-700" : "text-gray-700 hover:text-orange-700"
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              Kontakt
            </Link>
            <a 
              href="tel:+420379423483"
              className="block text-center px-6 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg"
            >
              Zavolat
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}