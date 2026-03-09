import { ImageWithFallback } from "./figma/ImageWithFallback";

export function Hero() {
  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1768697358705-c1b60333da35?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjByZXN0YXVyYW50JTIwaW50ZXJpb3IlMjBlbGVnYW50JTIwZGluaW5nfGVufDF8fHx8MTc3MjM0MTY2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          alt="Luxury restaurant interior"
          className="w-full h-full object-cover"
        />
        {/* Overlay with gold gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900/20 to-transparent"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 
          className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-6 tracking-wide"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Zámecká restaurace v srdci
          <br />
          <span className="font-semibold">Horšovského Týna</span>
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-10 font-light max-w-2xl mx-auto">
          Traditional Czech and international cuisine in a unique historic atmosphere
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <a
            href="#reservation"
            className="px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-xl hover:shadow-2xl transform hover:-translate-y-0.5"
          >
            Rezervovat stůl
          </a>
          <a
            href="#menu"
            className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/50 rounded-lg hover:bg-white/20 transition-all"
          >
            Zobrazit menu
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-white/50 rounded-full mt-2"></div>
        </div>
      </div>
    </section>
  );
}