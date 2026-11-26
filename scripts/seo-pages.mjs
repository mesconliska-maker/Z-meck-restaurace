/**
 * Hlavičky stránek pro vyhledávače – poslední krok `npm run build` (po `vite build`).
 *
 * Web zůstává čistě klientská aplikace: skript nic nerenderuje, jen z dist/index.html
 * (šablona = úvodní stránka) udělá pro každou veřejnou stránku vlastní HTML soubor:
 *
 *  1. dist/<cesta>/index.html pro každou stránku ze site.config.mjs (úvod zůstává v
 *     dist/index.html) s vlastním <title>, meta title/description, canonical, og:url,
 *     og:title, og:description, twitter:title a twitter:description.
 *  2. dist/404.html pro neexistující adresy (noindex, bez canonical a og:url) – Vercel ho
 *     vrací se stavem 404 pro každou adresu, ke které nenajde soubor ani rewrite.
 *     Aplikace se v něm normálně spustí a ukáže stránku „Stránka nenalezena“.
 *  3. V dist/sitemap.xml nastaví <lastmod> na datum buildu.
 *
 * Výstup je záměrně ve složkách (dist/menu/index.html), ne dist/menu.html: web nepoužívá
 * Vercel `cleanUrls`, aby ověřovací soubor Google Search Console (public/google….html)
 * dál odpovídal na své adrese bez přesměrování.
 *
 * Build spadne s chybou, když
 *  - v dist/index.html chybí (nebo je víckrát) tag, který se má přepsat,
 *  - veřejná route v src/app/routes.ts nemá záznam v site.config.mjs (nebo naopak) –
 *    taková adresa by na Vercelu vracela 404, protože vercel.json už nepřepisuje vše na index.html,
 *  - public/sitemap.xml neobsahuje přesně stránky ze site.config.mjs.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { SITE_URL, pages, notFoundPage, pageUrl } from '../site.config.mjs'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const dist = resolve(root, 'dist')

const TITLE_MAX = 65
const DESCRIPTION_MAX = 160

const warnings = []

const esc = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** <meta name="description" …> / <meta property="og:title" …> bez ohledu na pořadí atributů. */
const metaPattern = (attr, value) => new RegExp(`<meta\\b[^>]*\\b${attr}=["']${value}["'][^>]*>`, 'g')
const metaTag = (attr, value, content) => `<meta ${attr}="${value}" content="${esc(content)}" />`

const TITLE = /<title>[\s\S]*?<\/title>/g
const CANONICAL = /<link\b[^>]*\brel=["']canonical["'][^>]*>/g
const ROBOTS = metaPattern('name', 'robots')
const OG_URL = metaPattern('property', 'og:url')

/** Kolikrát je tag v HTML; cokoli jiného než právě jednou je chyba šablony. */
function expectOnce(html, pattern, label) {
  const count = (html.match(pattern) || []).length
  if (count !== 1) {
    throw new Error(
      `seo-pages: v dist/index.html ${count === 0 ? 'chybí' : `je ${count}×`} ${label} – ` +
        'skript ho potřebuje právě jednou (viz <head> v index.html).',
    )
  }
}

/** Nahradí tag odpovídající `pattern`. */
function setTag(html, pattern, label, tag) {
  expectOnce(html, pattern, label)
  return html.replace(pattern, () => tag)
}

/** Odstraní tag i s řádkem, na kterém stojí. */
function removeTag(html, pattern, label) {
  expectOnce(html, pattern, label)
  return html.replace(new RegExp(`[ \\t]*${pattern.source}[ \\t]*\\r?\\n?`), '')
}

const template = await readFile(resolve(dist, 'index.html'), 'utf8').catch(() => {
  throw new Error('seo-pages: dist/index.html neexistuje – skript běží až po `vite build` (použijte `npm run build`).')
})

function buildPage(page, { indexable }) {
  const ogTitle = page.ogTitle ?? page.title
  const ogDescription = page.ogDescription ?? page.description

  let html = template
  html = setTag(html, TITLE, '<title>', `<title>${esc(page.title)}</title>`)
  html = setTag(html, metaPattern('name', 'title'), '<meta name="title">', metaTag('name', 'title', page.title))
  html = setTag(html, metaPattern('name', 'description'), '<meta name="description">', metaTag('name', 'description', page.description))
  html = setTag(html, metaPattern('property', 'og:title'), '<meta property="og:title">', metaTag('property', 'og:title', ogTitle))
  html = setTag(html, metaPattern('property', 'og:description'), '<meta property="og:description">', metaTag('property', 'og:description', ogDescription))
  html = setTag(html, metaPattern('name', 'twitter:title'), '<meta name="twitter:title">', metaTag('name', 'twitter:title', ogTitle))
  html = setTag(html, metaPattern('name', 'twitter:description'), '<meta name="twitter:description">', metaTag('name', 'twitter:description', ogDescription))

  let canonical = null
  if (indexable) {
    canonical = pageUrl(page)
    html = setTag(html, CANONICAL, '<link rel="canonical">', `<link rel="canonical" href="${esc(canonical)}" />`)
    html = setTag(html, OG_URL, '<meta property="og:url">', metaTag('property', 'og:url', canonical))
    html = setTag(html, ROBOTS, '<meta name="robots">', metaTag('name', 'robots', 'index, follow'))
  } else {
    html = removeTag(html, CANONICAL, '<link rel="canonical">')
    html = removeTag(html, OG_URL, '<meta property="og:url">')
    html = setTag(html, ROBOTS, '<meta name="robots">', metaTag('name', 'robots', 'noindex'))
  }

  if (page.title.length > TITLE_MAX) warnings.push(`${page.path}: titulek má ${page.title.length} znaků (max. ${TITLE_MAX})`)
  if (page.description.length > DESCRIPTION_MAX) warnings.push(`${page.path}: popis má ${page.description.length} znaků (max. ${DESCRIPTION_MAX})`)

  return { html, canonical }
}

async function writePage(file, page, options) {
  const { html, canonical } = buildPage(page, options)
  await mkdir(dirname(file), { recursive: true })
  await writeFile(file, html, 'utf8')
  console.log(
    `[seo-pages] ${relative(root, file).replace(/\\/g, '/').padEnd(42)} title=${String(page.title.length).padStart(2)} desc=${String(page.description.length).padStart(3)} canonical=${canonical ?? '— (noindex)'}`,
  )
  return html
}

// --- Kontroly před zápisem: nic se nezapíše, dokud nesedí routy a sitemap. ---

const duplicate = pages.map((page) => page.path).find((path, index, all) => all.indexOf(path) !== index)
if (duplicate) throw new Error(`seo-pages: cesta ${duplicate} je v site.config.mjs dvakrát.`)

// Veřejné routy ze src/app/routes.ts (jednoduché `path: "…"`; /admin, "*" a parametrické cesty se přeskakují).
const routesFile = resolve(root, 'src/app/routes.ts')
const routesSource = await readFile(routesFile, 'utf8').catch(() => null)
const routePaths = [...(routesSource ?? '').matchAll(/\bpath:\s*["'`]([^"'`]+)["'`]/g)]
  .map((match) => match[1])
  .filter((path) => !/[*:]/.test(path) && !/^\/?admin(\/|$)/.test(path))
  .map((path) => (path.startsWith('/') ? path : `/${path}`))
if (routePaths.length === 0) {
  warnings.push('src/app/routes.ts se nepodařilo přečíst – nekontroluji, že každá route má záznam v site.config.mjs')
} else {
  const configured = pages.map((page) => page.path)
  const withoutMeta = routePaths.filter((path) => !configured.includes(path))
  const withoutRoute = configured.filter((path) => !routePaths.includes(path))
  if (withoutMeta.length || withoutRoute.length) {
    throw new Error(
      'seo-pages: src/app/routes.ts a site.config.mjs si neodpovídají.' +
        (withoutMeta.length
          ? `\n  route bez záznamu v site.config.mjs (na webu by vracela 404): ${withoutMeta.join(', ')}`
          : '') +
        (withoutRoute.length ? `\n  záznam v site.config.mjs bez route: ${withoutRoute.join(', ')}` : '') +
        '\n  Doplňte stránku do `pages` v site.config.mjs a do public/sitemap.xml.',
    )
  }
}

// sitemap.xml: zdrojem zůstává public/sitemap.xml, tady se jen ověří a nastaví <lastmod>.
const sitemapFile = resolve(dist, 'sitemap.xml')
const sitemap = await readFile(sitemapFile, 'utf8').catch(() => {
  throw new Error('seo-pages: dist/sitemap.xml neexistuje (má vzniknout z public/sitemap.xml).')
})
const listed = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1])
const expected = pages.map(pageUrl)
const missing = expected.filter((url) => !listed.includes(url))
const extra = listed.filter((url) => !expected.includes(url))
if (missing.length || extra.length || listed.length !== expected.length) {
  throw new Error(
    'seo-pages: public/sitemap.xml neodpovídá stránkám v site.config.mjs' +
      (missing.length ? `\n  v sitemap chybí: ${missing.join(', ')}` : '') +
      (extra.length ? `\n  v sitemap je navíc: ${extra.join(', ')}` : ''),
  )
}

// --- Zápis ---

for (const page of pages) {
  const isHome = page.path === '/'
  const file = isHome ? resolve(dist, 'index.html') : resolve(dist, page.path.slice(1), 'index.html')
  const html = await writePage(file, page, { indexable: true })
  if (isHome && html !== template) {
    warnings.push('hlavička úvodní stránky v index.html se liší od site.config.mjs – do dist/index.html se zapsaly hodnoty ze site.config.mjs')
  }
}
await writePage(resolve(dist, '404.html'), notFoundPage, { indexable: false })

const today = new Date().toISOString().slice(0, 10)
const eol = sitemap.includes('\r\n') ? '\r\n' : '\n'
await writeFile(
  sitemapFile,
  sitemap
    .replace(/[ \t]*<lastmod>[^<]*<\/lastmod>[ \t]*\r?\n?/g, '')
    .replace(/^([ \t]*)<loc>[^<]*<\/loc>[ \t]*$/gm, (line, indent) => `${line}${eol}${indent}<lastmod>${today}</lastmod>`),
  'utf8',
)

console.log(`[seo-pages] ${SITE_URL} – ${pages.length} stránek + 404.html, sitemap.xml s lastmod ${today}`)
for (const warning of warnings) console.warn(`[seo-pages] POZOR: ${warning}`)
