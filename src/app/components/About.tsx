import { ImageWithFallback } from "./figma/ImageWithFallback";

export function About() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image */}
          <div className="relative h-[500px] rounded-2xl overflow-hidden shadow-2xl">
            <ImageWithFallback
              src="/prostor1.jpeg"
              alt="Restaurant interior"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
          </div>

          {/* Content */}
          <div>
            <h2 
              className="text-4xl sm:text-5xl font-light text-gray-900 mb-6"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              O naší <span className="font-semibold">restauraci</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mb-8"></div>
            
            <div className="space-y-4 text-gray-700 text-lg leading-relaxed">
              <p>
                Naše restaurace se nachází v historickém centru města Horšovský Týn, 
                v bezprostřední blízkosti zámku. Nabízíme unique spojení tradiční české 
                kuchyně s mezinárodními specialitami.
              </p>
              <p>
                Klademe důraz na <span className="text-orange-700 font-medium">kvalitní čerstvé suroviny</span>, 
                profesionální přípravu jídel a příjemnou atmosféru, která kombinuje 
                historický charakter budovy s moderním komfortem.
              </p>
              <p>
                Náš tým se těší na vaši návštěvu a rád vám zajistí nezapomenutelný 
                gastronomický zážitek. Restaurace je ideální pro:
              </p>
              <ul className="space-y-2 ml-6">
                <li className="flex items-start">
                  <span className="text-orange-700 mr-2">✦</span>
                  <span>Obchodní schůzky a pracovní obědy</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-700 mr-2">✦</span>
                  <span>Romantické večeře pro dva</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-700 mr-2">✦</span>
                  <span>Rodinné oslavy a setkání</span>
                </li>
                <li className="flex items-start">
                  <span className="text-orange-700 mr-2">✦</span>
                  <span>Každodenní kvalitní stravování</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
