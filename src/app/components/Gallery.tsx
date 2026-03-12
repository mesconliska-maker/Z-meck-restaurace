import { useState } from "react";

const galleryImages = [
  { id: 1, src: "/jidlo1.jpeg", alt: "Hovězí steak" },
  { id: 2, src: "/jidlo2.jpeg", alt: "Losos filet" },
  { id: 3, src: "/jidlo3.jpeg", alt: "Kachní prso" },
  { id: 4, src: "/jidlo4.jpeg", alt: "Vepřová panenka" },
  { id: 5, src: "/jidlo5.jpeg", alt: "Specialita šéfkuchaře" },
  { id: 6, src: "/jidlo6.jpeg", alt: "Dezert" },
  { id: 7, src: "/jidlo7.jpeg", alt: "Jídlo z restaurace" },
  { id: 8, src: "/jidlo8.jpeg", alt: "Jídlo z restaurace" },
];

export function Gallery() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  return (
    <section id="gallery" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 
            className="text-4xl sm:text-5xl font-light text-gray-900 mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Naše <span className="font-semibold">galerie</span>
          </h2>
          <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mb-6"></div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Prohlédněte si atmosféru naší restaurace a naše kulinářské výtvory
          </p>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryImages.map((image, index) => (
            <div 
              key={image.id}
              className="relative aspect-square overflow-hidden rounded-lg cursor-pointer group"
              onClick={() => setSelectedImage(index)}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-4 left-4 text-white font-medium">
                  {image.alt}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white text-4xl hover:text-orange-600 transition-colors"
          >
            ×
          </button>
          <img
            src={galleryImages[selectedImage].src}
            alt={galleryImages[selectedImage].alt}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        </div>
      )}
    </section>
  );
}
