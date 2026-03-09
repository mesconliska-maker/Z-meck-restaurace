import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ArrowRight } from "lucide-react";

const menuItems = [
  {
    id: 1,
    name: "Kuřecí řízek s hranolkami",
    description: "Křupavý kuřecí řízek s domácími hranolkami a tatarskou omáčkou",
    image: "https://images.unsplash.com/photo-1584944868902-d06d1ba6ec55?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwc2Nobml0emVsJTIwZ291cm1ldCUyMGZvb2R8ZW58MXx8fHwxNzcyNDQxNDY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 2,
    name: "Hovězí steak",
    description: "Šťavnatý hovězí steak s pepřovou omáčkou a grilovanou zeleninou",
    image: "https://images.unsplash.com/photo-1652690772694-ac68867c30f1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiZWVmJTIwc3RlYWslMjBmaW5lJTIwZGluaW5nfGVufDF8fHx8MTc3MjQ0MTQ2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 3,
    name: "Losos s bylinkovým máslem",
    description: "Grilovaný losos s čerstvými bylinkami, citronem a restovanou zeleninou",
    image: "https://images.unsplash.com/photo-1712334651022-de457758c2c0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzYWxtb24lMjBmaXNoJTIwZ291cm1ldCUyMHBsYXRlfGVufDF8fHx8MTc3MjQ0MTQ2Nnww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
  },
  {
    id: 4,
    name: "Salát s kuřecími nugetkami",
    description: "Čerstvý salát s křupavými kuřecími kousky a domácím dresinkem",
    image: "https://images.unsplash.com/photo-1760888549075-0b9727e07735?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaGlja2VuJTIwc2FsYWQlMjBnb3VybWV0JTIwcmVzdGF1cmFudHxlbnwxfHx8fDE3NzI0NDE0NjZ8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
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
                <ImageWithFallback
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
          <a
            href="#menu-full"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Kompletní menu
            <ArrowRight size={20} />
          </a>
        </div>
      </div>
    </section>
  );
}