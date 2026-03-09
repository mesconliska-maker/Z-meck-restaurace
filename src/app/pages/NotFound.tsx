import { Link } from "react-router";
import { Home } from "lucide-react";

export function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="text-center">
        <h1 
          className="text-9xl font-light text-gray-300 mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          404
        </h1>
        <h2 
          className="text-4xl font-light text-gray-900 mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Stránka <span className="font-semibold">nenalezena</span>
        </h2>
        <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mb-8"></div>
        <p className="text-lg text-gray-600 mb-8">
          Omlouváme se, ale stránka, kterou hledáte, neexistuje.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg"
        >
          <Home size={20} />
          Zpět na domovskou stránku
        </Link>
      </div>
    </div>
  );
}