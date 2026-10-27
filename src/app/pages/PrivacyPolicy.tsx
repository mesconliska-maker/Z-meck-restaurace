import type { ReactNode } from "react";

// Zásady ochrany osobních údajů. Odkazuje na ně patička webu a uvádí se
// i jako Privacy Policy URL Meta aplikace, přes kterou web sdílí menu na Facebook.

const UPDATED = "27. 10. 2026";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-10">
      <h2
        className="text-2xl font-semibold text-gray-900 mb-3"
        style={{ fontFamily: 'Cormorant Garamond, serif' }}
      >
        {title}
      </h2>
      <div className="space-y-3 text-gray-600 leading-relaxed">{children}</div>
    </section>
  );
}

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1
          className="text-4xl sm:text-5xl font-light text-gray-900 mb-4"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >
          Ochrana <span className="font-semibold">osobních údajů</span>
        </h1>
        <div className="w-20 h-1 bg-gradient-to-r from-orange-600 to-orange-700 mb-6"></div>
        <p className="text-sm text-gray-500 mb-10">Platné od {UPDATED}</p>

        <Section title="Kdo údaje spravuje">
          <p>
            Správcem osobních údajů je provozovatel Zámecké restaurace Horšovský Týn,
            nám. Republiky 66, 346 01 Horšovský Týn (dále „my“).
          </p>
          <p>
            Kontakt ve věcech osobních údajů:{" "}
            <a href="mailto:veronikabaumannova@seznam.cz" className="text-orange-700 hover:underline">
              veronikabaumannova@seznam.cz
            </a>
            , tel. <a href="tel:+420379423483" className="text-orange-700 hover:underline">+420 379 423 483</a>.
          </p>
        </Section>

        <Section title="Jaké údaje zpracováváme a proč">
          <p>
            <strong className="text-gray-800">Dotazy a rezervace.</strong> Když nás kontaktujete telefonem,
            e-mailem nebo přes formulář na webu, zpracujeme jméno, kontakt a obsah zprávy jen proto,
            abychom vám mohli odpovědět nebo vyřídit rezervaci či objednávku cateringu. Právním
            základem je jednání o smlouvě a náš oprávněný zájem odpovědět na dotaz. Údaje uchováváme
            po dobu nutnou k vyřízení, nejdéle 1 rok, pokud nevznikne smluvní vztah.
          </p>
          <p>
            <strong className="text-gray-800">Návštěva webu.</strong> Web nepoužívá reklamní ani
            analytické cookies a neprovádí profilování. Poskytovatel hostingu může krátkodobě
            uchovávat technické záznamy o přístupu (IP adresa, prohlížeč), které slouží k zajištění
            provozu a bezpečnosti.
          </p>
          <p>
            <strong className="text-gray-800">Administrace.</strong> Přihlášení do administrace webu
            je určeno jen personálu restaurace; ukládá se přitom technický údaj o přihlášení
            v prohlížeči.
          </p>
        </Section>

        <Section title="Facebook">
          <p>
            Polední menu zveřejňujeme na naší facebookové stránce. Web k tomu používá aplikaci
            napojenou na Facebook, která pouze publikuje příspěvky na stránku restaurace a čte
            jejich stav. Nezískává ani neukládá údaje o návštěvnících webu ani o uživatelích
            Facebooku.
          </p>
          <p>
            Pokud navštívíte naši stránku na Facebooku nebo Instagramu, platí pro zpracování
            vašich údajů také zásady společnosti Meta Platforms.
          </p>
        </Section>

        <Section title="Služby třetích stran">
          <p>Při provozu webu využíváme tyto služby, které mohou zpracovávat technické údaje (např. IP adresu):</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Vercel – hosting webu,</li>
            <li>Supabase – databáze s nabídkou jídel a přihlášení do administrace,</li>
            <li>Google Maps – vložená mapa s polohou restaurace,</li>
            <li>Google Fonts – písma použitá na webu.</li>
          </ul>
          <p>Údaje nikomu neprodáváme ani je nepředáváme pro marketingové účely.</p>
        </Section>

        <Section title="Vaše práva">
          <p>
            Máte právo požadovat přístup ke svým údajům, jejich opravu nebo výmaz, omezení
            zpracování, vznést námitku a právo na přenositelnost údajů. Stačí nám napsat na
            e-mail uvedený výše. Máte také právo podat stížnost u Úřadu pro ochranu osobních
            údajů (
            <a href="https://uoou.gov.cz" target="_blank" rel="noopener noreferrer" className="text-orange-700 hover:underline">
              uoou.gov.cz
            </a>
            ).
          </p>
        </Section>

        <Section title="Výmaz údajů">
          <p>
            Chcete-li smazat údaje, které o vás máme, pošlete žádost na{" "}
            <a href="mailto:veronikabaumannova@seznam.cz" className="text-orange-700 hover:underline">
              veronikabaumannova@seznam.cz
            </a>
            . Žádost vyřídíme bez zbytečného odkladu, nejpozději do 30 dnů.
          </p>
        </Section>
      </div>
    </div>
  );
}
