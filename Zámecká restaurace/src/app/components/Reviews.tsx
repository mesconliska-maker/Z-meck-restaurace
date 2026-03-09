import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "Marie Nováková",
    rating: 5,
    text: "Nádherná restaurace s úžasnou atmosférou. Jídlo bylo vynikající a obsluha velmi milá a profesionální. Určitě se vrátíme!",
    date: "Před 2 týdny"
  },
  {
    id: 2,
    name: "Petr Svoboda",
    rating: 5,
    text: "Nejlepší steak v regionu! Krásné prostředí v historické budově. Ideální místo pro romantickou večeři i obchodní setkání.",
    date: "Před měsícem"
  },
  {
    id: 3,
    name: "Jana Dvořáková",
    rating: 4,
    text: "Velmi příjemné prostředí a kvalitní kuchyně. Oceňuji sezónní menu a čerstvé suroviny. Skvělá volba pro oběd i večeři.",
    date: "Před 3 týdny"
  }
];

export function Reviews() {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header with Google Rating */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-orange-50 to-orange-100 px-8 py-4 rounded-full mb-8">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-orange-600 text-orange-600" />
              ))}
            </div>
            <div className="text-left">
              <div className="text-3xl font-bold text-gray-900">4.3 / 5</div>
              <div className="text-sm text-gray-600">z 1000+ recenzí na Google</div>
            </div>
          </div>
          
          <h2 
            className="text-4xl sm:text-5xl font-light text-gray-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Co říkají naši <span className="font-semibold">hosté</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto"></div>
        </div>

        {/* Testimonials Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div 
              key={testimonial.id}
              className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100 relative"
            >
              <Quote className="absolute top-6 right-6 text-orange-100" size={48} />
              
              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={18} className="fill-orange-600 text-orange-600" />
                ))}
              </div>

              {/* Review Text */}
              <p className="text-gray-700 leading-relaxed mb-6 relative z-10">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div>
                  <div className="font-medium text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-500">{testimonial.date}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}