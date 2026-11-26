/**
 * Jediný zdroj veřejné adresy webu a <title> / meta description každé veřejné stránky.
 *
 * Používá ho:
 *  - scripts/seo-pages.mjs při `npm run build` – pro každou stránku zapíše dist/<cesta>/index.html
 *    s vlastní hlavičkou (title, description, canonical, og:*, twitter:*) a dist/404.html,
 *  - src/app/components/PageSeo.tsx v prohlížeči – drží hlavičku aktuální při přechodu mezi stránkami.
 *
 * Nová veřejná stránka = route v src/app/routes.ts + záznam tady + <url> v public/sitemap.xml.
 * Bez záznamu tady by adresa na Vercelu vracela 404 (vercel.json už nepřepisuje vše na index.html);
 * build na chybějící záznam upozorní chybou.
 *
 * Titulek max. 65 znaků, popis max. 160 znaků – build na delší texty upozorní.
 * Popisy vycházejí jen z toho, co na dané stránce opravdu je (žádné ceny, jídla ani sliby navíc).
 *
 * Čistý JavaScript bez importů: soubor načítá Vite i samotný Node.
 */

/** Veřejná adresa webu, bez lomítka na konci. */
export const SITE_URL = 'https://www.zamecka-htyn.cz'

/**
 * @typedef {object} PageMeta
 * @property {string} path Cesta bez lomítka na konci (úvod = "/").
 * @property {string} title <title> a meta name="title".
 * @property {string} description meta name="description".
 * @property {string} [ogTitle] og:title a twitter:title; když chybí, použije se title.
 * @property {string} [ogDescription] og:description a twitter:description; když chybí, použije se description.
 */

/** @type {PageMeta[]} */
export const pages = [
  {
    // Úvod: stejné texty jako v index.html (ten slouží jako šablona a pro `npm run dev`).
    path: '/',
    title: 'Zámecká restaurace Horšovský Týn | nám. Republiky 66',
    description:
      'Zámecká restaurace v Horšovském Týně nabízí tradiční českou a mezinárodní kuchyni v historickém prostředí. Otevřeno Po–Čt 11–23, Pá–So 11–24, Ne 11–22. Catering, firemní akce. Rezervace: +420 379 423 483.',
    ogTitle: 'Zámecká restaurace Horšovský Týn',
    ogDescription:
      'Tradiční česká a mezinárodní kuchyně v historickém prostředí zámku v Horšovském Týně. Catering, firemní akce, slavnostní příležitosti.',
  },
  {
    path: '/menu',
    title: 'Menu a jídelní lístek | Zámecká restaurace Horšovský Týn',
    description:
      'Jídelní lístek Zámecké restaurace v Horšovském Týně. Objevte chuť tradiční české a mezinárodní kuchyně. Názvy jídel uvádíme česky i německy.',
  },
  {
    path: '/galerie',
    title: 'Fotogalerie | Zámecká restaurace Horšovský Týn',
    description:
      'Fotogalerie Zámecké restaurace v Horšovském Týně. Prohlédněte si atmosféru naší restaurace – fotografie jídel, cateringu a prostor restaurace.',
  },
  {
    path: '/kontakt',
    title: 'Kontakt a otevírací doba | Zámecká restaurace Horšovský Týn',
    description:
      'Zámecká restaurace, nám. Republiky 66, 346 01 Horšovský Týn. Rezervace stolů pouze telefonicky: +420 379 423 483, +420 777 251 953. Otevírací doba a mapa.',
  },
  {
    path: '/catering',
    title: 'Catering na akce a oslavy | Zámecká restaurace Horšovský Týn',
    description:
      'Catering Zámecké restaurace Horšovský Týn: firemní akce, svatby a oslavy i pravidelné dodávky obědů. Menu podle vašich představ, nezávazná cenová nabídka.',
  },
  {
    path: '/ochrana-osobnich-udaju',
    title: 'Ochrana osobních údajů | Zámecká restaurace Horšovský Týn',
    description:
      'Jak Zámecká restaurace Horšovský Týn zpracovává osobní údaje z dotazů a rezervací, jak dlouho je uchovává, jaké služby web využívá a jaká máte práva.',
  },
]

/**
 * Neexistující adresa (dist/404.html a route "*"): bez canonical, s noindex.
 * @type {PageMeta}
 */
export const notFoundPage = {
  path: '/404',
  title: 'Stránka nenalezena | Zámecká restaurace Horšovský Týn',
  description:
    'Omlouváme se, ale stránka, kterou hledáte, neexistuje. Pokračujte na úvodní stránku Zámecké restaurace Horšovský Týn.',
}

/**
 * "/galerie/" → "/galerie", "" → "/".
 * @param {string} pathname
 */
export function normalizePath(pathname) {
  return pathname.replace(/\/+$/, '') || '/'
}

/**
 * Záznam stránky pro danou cestu. Router porovnává cesty bez ohledu na velikost písmen, proto i tady.
 * @param {string} pathname
 * @returns {PageMeta | undefined}
 */
export function findPage(pathname) {
  const path = normalizePath(pathname).toLowerCase()
  return pages.find((page) => page.path === path)
}

/**
 * Kanonická adresa: https://www.zamecka-htyn.cz + cesta, lomítko na konci jen u úvodu.
 * @param {PageMeta} page
 */
export function pageUrl(page) {
  return page.path === '/' ? `${SITE_URL}/` : `${SITE_URL}${page.path}`
}
