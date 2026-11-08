/**
 * Clone-side parity measurements (run 79) — measures the SAME surfaces the
 * live-reference pass measured, against a locally-started standalone server,
 * and prints the numbers as JSON for side-by-side comparison.
 *
 * Usage (server + measurement in ONE invocation, per the sandbox contract):
 *   (node .next/standalone/server.js &) ; sleep 4 ; \
 *     node scripts/measure-parity.mjs ; pkill -f "next-server"
 */
import { chromium, devices } from "@playwright/test";

const BASE = process.argv[2] ?? "http://localhost:3000";

const desktop = { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } };
const mobile = { ...devices["iPhone 13"], browserName: "chromium" };

const out = { base: BASE };

async function evalJson(page, fn) {
  return page.evaluate(fn);
}

const browser = await chromium.launch();

// ---------- MOBILE: the panel + overlay ----------
{
  const ctx = await browser.newContext({ ...mobile, baseURL: BASE });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForSelector('html[data-hydrated="true"]');
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.waitForTimeout(500);
  out.mobilePanel = await evalJson(page, () => {
    const panel = document.querySelector('[data-testid="mobile-menu"]');
    const header = panel.closest("header");
    const searchBtn = [...document.querySelectorAll("button")].find((b) => b.textContent.trim().toUpperCase() === "SEARCH");
    const links = [...document.querySelectorAll("header a")].filter((a) => ["Shop", "Beauty Tools", "Brush & Combs", "About"].includes(a.textContent.trim()));
    const hr = header.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const pc = getComputedStyle(panel);
    return {
      header: { y: Math.round(hr.y), h: Math.round(hr.height), position: getComputedStyle(header).position },
      panel: { y: Math.round(pr.y), h: Math.round(pr.height), w: Math.round(pr.width) },
      panelStyle: { bg: pc.backgroundColor, borderBottom: pc.borderBottomWidth },
      links: links.map((l) => {
        const r = l.getBoundingClientRect();
        const cs = getComputedStyle(l);
        return { text: l.textContent.trim(), h: Math.round(r.height), y: Math.round(r.y), fontSize: cs.fontSize, ls: cs.letterSpacing, lh: cs.lineHeight, tt: cs.textTransform, fw: cs.fontWeight };
      }),
      searchRow: (() => {
        const s = searchBtn;
        const r = s.getBoundingClientRect();
        const cs = getComputedStyle(s);
        return { h: Math.round(r.height), y: Math.round(r.y), fontSize: cs.fontSize, ls: cs.letterSpacing, tt: cs.textTransform, gap: cs.gap };
      })(),
    };
  });
  // open the overlay from the panel's SEARCH row
  await page.getByTestId("mobile-menu").getByRole("button", { name: "Search", exact: true }).click();
  await page.waitForTimeout(400);
  await page.locator('input[aria-label="Search products"]').fill("e");
  await page.waitForTimeout(800);
  out.mobileOverlay = await evalJson(page, () => {
    const input = document.querySelector('input[aria-label="Search products"]');
    const overlay = input.closest("div.fixed");
    const list = overlay.querySelector("ul");
    const rows = list ? [...list.querySelectorAll("li")] : [];
    const oc = getComputedStyle(overlay);
    const or = overlay.getBoundingClientRect();
    const priceEl = rows[0]?.querySelector("li a span:last-child") ?? rows[0]?.querySelector("a span[class*='font']");
    return {
      overlay: { w: Math.round(or.width), h: Math.round(or.height), z: oc.zIndex, bg: oc.backgroundColor, blur: oc.backdropFilter, position: oc.position },
      input: { fontSize: getComputedStyle(input).fontSize, ff: getComputedStyle(input).fontFamily.slice(0, 30), h: Math.round(input.getBoundingClientRect().height) },
      rowCount: rows.length,
      list: list ? { mt: getComputedStyle(list).marginTop, maxH: getComputedStyle(list).maxHeight, overflow: getComputedStyle(list).overflowY, scrollH: list.scrollHeight, clientH: list.clientHeight } : null,
      firstRow: rows[0]
        ? {
            h: Math.round(rows[0].getBoundingClientRect().height),
            radius: getComputedStyle(rows[0].querySelector("a")).borderRadius,
            priceText: priceEl ? priceEl.textContent.trim() : null,
            priceComputed: priceEl ? { fontSize: getComputedStyle(priceEl).fontSize, ff: getComputedStyle(priceEl).fontFamily.slice(0, 30), fw: getComputedStyle(priceEl).fontWeight } : null,
          }
        : null,
    };
  });
  await ctx.close();
}

// ---------- DESKTOP: the overlay row anatomy + price font ----------
{
  const ctx = await browser.newContext({ ...desktop, baseURL: BASE });
  const page = await ctx.newPage();
  await page.goto("/");
  await page.waitForSelector('html[data-hydrated="true"]');
  await page.getByRole("button", { name: "Search products" }).click();
  await page.waitForTimeout(400);
  await page.locator('input[aria-label="Search products"]').fill("silk");
  await page.waitForTimeout(800);
  out.desktopOverlay = await evalJson(page, () => {
    const input = document.querySelector('input[aria-label="Search products"]');
    const overlay = input.closest("div.fixed");
    const rows = [...overlay.querySelectorAll("li")];
    const row = rows.find((r) => r.textContent.includes("Pillowcase")) ?? rows[0];
    const link = row.querySelector("a");
    const name = row.querySelector("span.block");
    const desc = [...row.querySelectorAll("span.block")][1];
    const price = [...row.querySelectorAll("a > span")].filter((s) => !s.classList.contains("relative") && !s.classList.contains("min-w-0")).pop();
    const img = row.querySelector("img");
    const rr = row.getBoundingClientRect();
    const rowCs = getComputedStyle(link);
    return {
      viewport: window.innerWidth + "x" + window.innerHeight,
      rowCount: rows.length,
      row: { w: Math.round(rr.width), h: Math.round(rr.height), display: rowCs.display, gap: rowCs.gap, alignItems: rowCs.alignItems, padding: rowCs.padding, radius: rowCs.borderRadius },
      img: img ? { w: Math.round(img.getBoundingClientRect().width), h: Math.round(img.getBoundingClientRect().height) } : null,
      name: name ? { fontSize: getComputedStyle(name).fontSize, fw: getComputedStyle(name).fontWeight, overflow: getComputedStyle(name).overflow } : null,
      desc: desc ? { fontSize: getComputedStyle(desc).fontSize, color: getComputedStyle(desc).color, fw: getComputedStyle(desc).fontWeight, lh: getComputedStyle(desc).lineHeight, text: desc.textContent.trim().slice(0, 28) } : null,
      price: price
        ? {
            text: price.textContent.trim(),
            fontSize: getComputedStyle(price).fontSize,
            ff: getComputedStyle(price).fontFamily.slice(0, 30),
            fw: getComputedStyle(price).fontWeight,
            x: Math.round(price.getBoundingClientRect().x),
            rowRight: Math.round(rr.right),
          }
        : null,
    };
  });
  // no-results copy
  await page.locator('input[aria-label="Search products"]').fill("zzzzq");
  await page.waitForTimeout(800);
  out.noResults = await evalJson(page, () => {
    const p = [...document.querySelectorAll("div.fixed p")].find((el) => /No products/i.test(el.textContent));
    return p ? p.textContent.trim() : null;
  });
  await ctx.close();
}

// ---------- DESKTOP: shop pills + footer ----------
{
  const ctx = await browser.newContext({ ...desktop, baseURL: BASE });
  const page = await ctx.newPage();
  await page.goto("/shop");
  await page.waitForSelector('html[data-hydrated="true"]');
  out.shopPills = await evalJson(page, () => {
    const main = document.querySelector("main");
    const candidates = [...main.querySelectorAll("button")].filter((b) => {
      const r = b.getBoundingClientRect();
      return r.height >= 28 && r.height <= 56 && r.y < 600 && r.width > 40;
    });
    return candidates.map((p) => {
      const r = p.getBoundingClientRect();
      const cs = getComputedStyle(p);
      const img = p.querySelector("img");
      return { text: p.textContent.trim().slice(0, 18), h: Math.round(r.height), radius: cs.borderRadius, bg: cs.backgroundColor.slice(0, 30), hasThumb: !!img, thumbW: img ? Math.round(img.getBoundingClientRect().width) : 0 };
    });
  });
  out.footerLinks = await evalJson(page, () => JSON.stringify([...document.querySelectorAll("footer a")].map((a) => ({ text: a.textContent.trim().slice(0, 16), href: a.getAttribute("href") }))));
  out.footerLinks = JSON.parse(out.footerLinks);
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(out, null, 1));
