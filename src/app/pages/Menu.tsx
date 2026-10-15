import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { StandingMenuView } from "../components/StandingMenuView";
import { DEFAULT_STANDING_MENU, fetchStandingMenu, type StandingMenu } from "../lib/standingMenu";

export function Menu() {
  // Lístek z administrace; když databáze neodpoví, výchozí obsah z kódu
  const [menu, setMenu] = useState<StandingMenu | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchStandingMenu().then((fromDb) => {
      if (!cancelled) setMenu(fromDb ?? DEFAULT_STANDING_MENU);
    });
    return () => {
      cancelled = true;
    };
  }, []);

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
          {menu ? (
            <StandingMenuView menu={menu} />
          ) : (
            <div className="flex justify-center py-20">
              <Loader2 className="animate-spin text-orange-600" size={40} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
