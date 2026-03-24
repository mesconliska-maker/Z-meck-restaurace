import { MapPin, Phone, Mail, Clock, Send } from "lucide-react";
import { ImageWithFallback } from "../components/figma/ImageWithFallback";
import { useState } from "react";

export function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Děkujeme za vaši zprávu! Brzy se vám ozveme.");
    setFormData({ name: "", email: "", phone: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1763301331567-21c465b66e02?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwdGVycmFjZSUyMG91dGRvb3IlMjBzZWF0aW5nfGVufDF8fHx8MTc3MjQ0MTQ2N3ww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
            alt="Contact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/70"></div>
        </div>
        <div className="relative z-10 text-center px-4">
          <h1 
            className="text-5xl sm:text-6xl lg:text-7xl font-light text-white mb-4"
            style={{ fontFamily: 'Cormorant Garamond, serif' }}
          >
            Kontaktujte <span className="font-semibold">nás</span>
          </h1>
          <p className="text-xl text-white/90">
            Jsme tu pro vás, rádi odpovíme na vaše dotazy
          </p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 
                className="text-4xl font-light text-gray-900 mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Kontaktní <span className="font-semibold">údaje</span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mb-8"></div>

              <div className="space-y-6">
                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Adresa</h3>
                      <p className="text-gray-600">
                        nám. Republiky 66<br />
                        346 01 Horšovský Týn
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Phone className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Telefon</h3>
                      <a href="tel:+420379423483" className="text-orange-700 hover:text-orange-800 text-lg">
                        +420 379 423 483
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Rezervace pouze telefonicky
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Mail className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">Email</h3>
                      <a href="mailto:info@zamecka-restaurace.cz" className="text-orange-700 hover:text-orange-800">
                        info@zamecka-restaurace.cz
                      </a>
                      <p className="text-sm text-gray-500 mt-1">
                        Odpovídáme do 24 hodin
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="text-white" size={24} />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 mb-3">Otevírací doba</h3>
                      <div className="space-y-2 text-gray-600">
                        <div className="flex justify-between gap-8">
                          <span>Pondělí - Čtvrtek</span>
                          <span className="font-medium">11:00 - 23:00</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span>Pátek - Sobota</span>
                          <span className="font-medium">11:00 - 24:00</span>
                        </div>
                        <div className="flex justify-between gap-8">
                          <span>Neděle</span>
                          <span className="font-medium">11:00 - 22:00</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2
                className="text-4xl font-light text-gray-900 mb-6"
                style={{ fontFamily: 'Cormorant Garamond, serif' }}
              >
                Napište <span className="font-semibold">nám</span>
              </h2>
              <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mb-6"></div>
              <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Phone className="text-orange-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-orange-800 text-sm">
                  <strong>Rezervace stolů jsou pouze telefonicky</strong> na čísle{" "}
                  <a href="tel:+420379423483" className="underline hover:text-orange-900">+420 379 423 483</a>.
                  Tento formulář slouží pro obecné dotazy.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="bg-white rounded-xl p-8 shadow-lg">
                <div className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-gray-700 mb-2">
                      Jméno a příjmení *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
                      placeholder="Jan Novák"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
                      placeholder="jan.novak@email.cz"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-gray-700 mb-2">
                      Telefon
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all"
                      placeholder="+420 123 456 789"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-gray-700 mb-2">
                      Vaše zpráva *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 focus:border-transparent transition-all resize-none"
                      placeholder="Napište nám váš dotaz..."
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full px-8 py-4 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:from-orange-700 hover:to-orange-800 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  >
                    <Send size={20} />
                    Odeslat zprávu
                  </button>

                  <p className="text-sm text-gray-500 text-center">
                    * Povinné pole
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Map */}
          <div className="mt-16">
            <h2 
              className="text-4xl font-light text-gray-900 mb-6 text-center"
              style={{ fontFamily: 'Cormorant Garamond, serif' }}
            >
              Kde <span className="font-semibold">nás najdete</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mx-auto mb-8"></div>
            
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <iframe 
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2589.627617553489!2d12.941469876786629!3d49.529305553258354!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x470abb5cba7ebd2d%3A0xf975b20c6a9cb67c!2zWsOhbWVja8OhIHJlc3RhdXJhY2U!5e0!3m2!1scs!2scz!4v1773305823821!5m2!1scs!2scz"
                width="100%"
                height="500"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
