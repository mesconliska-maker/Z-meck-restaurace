import { useEffect } from "react";
import { useLocation } from "react-router";
import { findPage, notFoundPage, pageUrl } from "../../../site.config.mjs";

/** Nastaví (nebo při `value === null` odstraní) jeden tag v <head>. */
function setHeadTag(
  tag: "meta" | "link",
  attr: "name" | "property" | "rel",
  key: string,
  value: string | null,
) {
  const valueAttr = tag === "link" ? "href" : "content";
  let el = document.head.querySelector(`${tag}[${attr}="${key}"]`);
  if (value === null) {
    el?.remove();
    return;
  }
  if (!el) {
    el = document.createElement(tag);
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (el.getAttribute(valueAttr) !== value) el.setAttribute(valueAttr, value);
}

/**
 * Drží <title>, meta description, canonical, og:* a robots v souladu s aktuální adresou
 * při přechodu mezi stránkami. Hodnoty bere ze site.config.mjs – ze stejného zdroje jako
 * scripts/seo-pages.mjs při buildu, takže po načtení stránky nic nepřepíše jiným textem.
 * Neexistující adresa dostane noindex a přijde o canonical.
 *
 * Je jen ve veřejném layoutu (Root); administrace (/admin) si titulek řídí sama.
 */
export function PageSeo() {
  const { pathname } = useLocation();
  const found = findPage(pathname);
  const page = found ?? notFoundPage;
  const url = found ? pageUrl(found) : null;

  useEffect(() => {
    const ogTitle = page.ogTitle ?? page.title;
    const ogDescription = page.ogDescription ?? page.description;

    document.title = page.title;
    setHeadTag("meta", "name", "title", page.title);
    setHeadTag("meta", "name", "description", page.description);
    setHeadTag("link", "rel", "canonical", url);
    setHeadTag("meta", "property", "og:url", url);
    setHeadTag("meta", "property", "og:title", ogTitle);
    setHeadTag("meta", "property", "og:description", ogDescription);
    setHeadTag("meta", "name", "twitter:title", ogTitle);
    setHeadTag("meta", "name", "twitter:description", ogDescription);
    setHeadTag("meta", "name", "robots", url ? "index, follow" : "noindex");
  }, [page, url]);

  return null;
}
