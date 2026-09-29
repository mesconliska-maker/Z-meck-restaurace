// Ukázková data pro náhled PDF (skript scripts/render-menu-pdf.tsx a demo režim administrace).
import { emptyWeek } from "../lib/menu";
import type { WeekMenu } from "../lib/types";

export function sampleWeek(): WeekMenu {
  const w = emptyWeek("2026-09-28");
  const item = (name: string, price = "", allergens = "") => ({ name, price, allergens });
  w.days[1] = { ...w.days[1], closed: false, note: "",
    soup: item("Cibulačka se sýrem a krutóny", "", "1, 7"),
    meals: [
      item("Pečené chalupářské šišky, vařený brambor, hořčičný dip", "169", "1, 3, 10"),
      item("Podzimní zeleninový salát s rozpečenou mozzarellou obalenou v parmské šunce, vinaigrette, bagetka", "179", "1, 7"),
    ] };
  w.days[2] = { ...w.days[2],
    soup: item("Vývar se zeleninou a masovými knedlíčky", "", "1, 3, 9"),
    meals: [
      item("Hovězí líčka na červeném víně a zelenině, bramborové resti", "189", "9, 12"),
      item("Kuřecí prso supreme na bylinkovém másle, baby karotka, rozpečený brambor s kysanou smetanou", "179", "7"),
    ] };
  w.days[3] = { ...w.days[3],
    soup: item("Zeleninový vývar s játrovou rýží", "", "9"),
    meals: [
      item("Hovězí maso, svíčková na smetaně, houskový knedlík", "179", "1, 3, 7, 9, 10"),
      item("Steak z krkovice gyros, pečené papriky, tzatziky dip, bramborové plátky", "179", "7"),
    ] };
  w.days[4] = { ...w.days[4],
    soup: item("Zeleninový krém", "", "7, 9"),
    meals: [
      item("Lasagne s kuřecím masem a jemnou tomatovou omáčkou", "169", "1, 3, 7"),
      item("Smažený sýr se šunkou, vařený brambor, tatarka", "169", "1, 3, 7, 10"),
    ] };
  w.footerNote = "Polévka je v ceně menu";
  w.published = true;
  return w;
}

/** Zátěžový týden – 3 jídla denně, dlouhé názvy a poznámky – ověřuje, že se sazba vejde na stránku. */
export function sampleFullWeek(): WeekMenu {
  const w = sampleWeek();
  const long = (n: number) => ({
    name: [
      "Vepřová panenka na zeleném pepři s restovanými žampiony, šťouchané brambory se slaninou a jarní cibulkou",
      "Grilovaný pstruh na másle s mandlemi, petrželové brambory, citron a salát z polníčku",
      "Domácí gnocchi se smetanovou omáčkou z lesních hub, hobliny parmazánu, rukola",
    ][n % 3],
    price: String(169 + n * 10),
    allergens: "1, 3, 7",
  });
  w.days = w.days.map((d, i) => ({
    ...d,
    closed: false,
    note: i === 0 ? "Den české státnosti – otevřeno, menu podáváme jako obvykle" : "",
    soup: { name: "Hovězí vývar s nudlemi, masem a kořenovou zeleninou", price: "45", allergens: "1, 3, 9" },
    meals: [long(i), long(i + 1), long(i + 2)],
  }));
  w.footerNote = "Menu je možné zabalit s sebou (obal 10 Kč). Rezervace stolů na tel. +420 379 423 483.";
  return w;
}
