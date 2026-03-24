import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const galleryImages = [
  { id: 1, src: "/jidlo1.jpeg", alt: "Catering", category: "Catering" },
  { id: 2, src: "/jidlo2.jpeg", alt: "Catering", category: "Catering" },
  { id: 3, src: "/jidlo3.jpeg", alt: "Catering", category: "Catering" },
  { id: 4, src: "/jidlo4.jpeg", alt: "Catering", category: "Catering" },
  { id: 5, src: "/jidlo5.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 6, src: "/jidlo6.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 7, src: "/jidlo7.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 8, src: "/jidlo8.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 9, src: "/jidlo9.jpeg", alt: "Catering", category: "Catering" },
  { id: 10, src: "/jidlo10.jpeg", alt: "Catering", category: "Catering" },
  { id: 11, src: "/jidlo11.jpeg", alt: "Catering", category: "Catering" },
  { id: 12, src: "/jidlo12.jpeg", alt: "Catering", category: "Catering" },
  { id: 13, src: "/jidlo13.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 14, src: "/jidlo14.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 15, src: "/jidlo15.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 16, src: "/jidlo16.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 17, src: "/jidlo17.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 18, src: "/jidlo18.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 19, src: "/jidlo19.jpeg", alt: "Jídlo", category: "Jídla" },
  { id: 18, src: "/catering1.jpeg", alt: "Catering", category: "Catering" },
  { id: 19, src: "/catering2.jpeg", alt: "Catering", category: "Catering" },
  { id: 20, src: "/catering3.jpeg", alt: "Catering", category: "Catering" },
  { id: 21, src: "/catering4.jpeg", alt: "Catering", category: "Catering" },
  { id: 22, src: "/prostor1.jpeg", alt: "Prostor restaurace", category: "Prostor" },
  { id: 23, src: "/prostor2.jpeg", alt: "Prostor restaurace", category: "Prostor" },
  { id: 24, src: "/prostor3.jpeg", alt: "Prostor restaurace", category: "Prostor" },
  { id: 25, src: "/prostor4.jpeg", alt: "Prostor restaurace", category: "Prostor" },
];

export function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Vše");

  const categories = ["Vše", "Jídla", "Catering", "Prostor"];
  
  const filteredImages = selectedCategory === "Vše" 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  const handlePrevious = () => {
    if (selectedImage !== null && selectedImage > 0) {
      setSelectedImage(selectedImage - 1);
    }
  };

  const handleNext = () => {
    if (selectedImage !== null && selectedImage < galleryImages.length - 1) {
      setSelectedImage(selectedImage + 1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1756397481872-ed981ef72a51?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxlbGVnYW50JTIwcmVzdGF1cmFudCUyMGludGVyaW9yJTIwdGFibGVzfGVufDF8fHx8MTc3MjQ0MTQ2NHww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Gallery"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Foto <span className="font-semibold">galerie</span>
          </h1>
          <p className="text-xl text-white/90">
            Prohlédněte si atmosféru naší restaurace
          </p>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-lg transition-all ${
                  selectedCategory === category
                    ? 'bg-gradient-to-r from-orange-600 to-orange-700 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredImages.map((image, index) => (
              <div 
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-xl cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300"
                onClick={() => setSelectedImage(galleryImages.indexOf(image))}
              >
                <ImageWithFallback
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="text-white font-medium text-lg mb-1">{image.alt}</p>
                    <p className="text-orange-400 text-sm">{image.category}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredImages.length === 0 && (
            <div className="text-center py-20">
              <p className="text-gray-500 text-lg">Žádné fotografie v této kategorii</p>
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {selectedImage !== null && (
        <div 
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          {/* Close Button */}
          <button 
            onClick={() => setSelectedImage(null)}
            className="absolute top-4 right-4 text-white hover:text-orange-600 transition-colors z-10"
          >
            <X size={40} />
          </button>

          {/* Previous Button */}
          {selectedImage > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
              className="absolute left-4 text-white hover:text-orange-600 transition-colors z-10"
            >
              <ChevronLeft size={48} />
            </button>
          )}

          {/* Next Button */}
          {selectedImage < galleryImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-4 text-white hover:text-orange-600 transition-colors z-10"
            >
              <ChevronRight size={48} />
            </button>
          )}

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} className="max-w-6xl max-h-[90vh]">
            <ImageWithFallback
              src={galleryImages[selectedImage].src}
              alt={galleryImages[selectedImage].alt}
              className="max-h-[85vh] max-w-full object-contain rounded-lg"
            />
            <div className="text-center mt-4">
              <p className="text-white text-lg font-medium">{galleryImages[selectedImage].alt}</p>
              <p className="text-orange-400 text-sm mt-1">{galleryImages[selectedImage].category}</p>
              <p className="text-gray-400 text-sm mt-2">
                {selectedImage + 1} / {galleryImages.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
