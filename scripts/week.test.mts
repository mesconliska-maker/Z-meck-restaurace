// Kontrola přepínání týdne a svátků:  npx tsx scripts/week.test.mts
import assert from "node:assert/strict";
import { activeWeekStart, czechHoliday, formatWeekRangeLong, mondayOf } from "../src/app/admin/lib/week";

const at = (iso: string) => activeWeekStart(new Date(iso));

// Letní čas (UTC+2): pondělí 5. 10. 2026
assert.equal(at("2026-10-04T22:00:00Z"), "2026-09-28", "po 00:00:00 ještě starý týden");
assert.equal(at("2026-10-04T22:00:59Z"), "2026-09-28", "po 00:00:59 ještě starý týden");
assert.equal(at("2026-10-04T22:01:00Z"), "2026-10-05", "po 00:01:00 nový týden");
// Zimní čas (UTC+1): pondělí 2. 11. 2026
assert.equal(at("2026-11-01T23:00:59Z"), "2026-10-26");
assert.equal(at("2026-11-01T23:01:00Z"), "2026-11-02");
// Neděle v týdnu se změnou času (25. 10. 2026) a konec roku
assert.equal(at("2026-10-25T12:00:00Z"), "2026-10-19");
assert.equal(at("2027-01-01T10:00:00Z"), "2026-12-28");
assert.equal(mondayOf("2026-10-04"), "2026-09-28");

assert.equal(czechHoliday("2026-09-28"), "Den české státnosti");
assert.equal(czechHoliday("2026-04-03"), "Velký pátek");
assert.equal(czechHoliday("2026-04-06"), "Velikonoční pondělí");
assert.equal(czechHoliday("2027-03-29"), "Velikonoční pondělí");
assert.equal(czechHoliday("2026-09-29"), null);

assert.equal(formatWeekRangeLong("2026-09-28"), "28. září – 2. října 2026");
assert.equal(formatWeekRangeLong("2026-10-05"), "5. – 9. října 2026");
assert.equal(formatWeekRangeLong("2026-12-28"), "28. prosince 2026 – 1. ledna 2027");
console.log("week.ts: vše OK");
