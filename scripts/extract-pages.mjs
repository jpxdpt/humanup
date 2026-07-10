import { chromium } from '@playwright/test';

const PAGES = [
  { path: '/sobre', name: 'sobre' },
  { path: '/servicos', name: 'servicos' },
  { path: '/contactos', name: 'contactos' },
];

const BASE = 'https://humanup.pt';
const OUT = 'docs/research/humanup.pt';

async function main() {
  const browser = await chromium.launch({ headless: true });

  for (const pageDef of PAGES) {
    console.log(`\n=== ${pageDef.name} ===`);
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
    const page = await context.newPage();
    await page.goto(BASE + pageDef.path, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Screenshot
    await page.screenshot({ path: `docs/design-references/humanup.pt/${pageDef.name}.png`, fullPage: true });

    // Full HTML
    const html = await page.content();
    const fs = await import('fs');
    fs.writeFileSync(`${OUT}/${pageDef.name}-html.html`, html);

    // Text content
    const text = await page.evaluate(() => document.body.innerText);
    fs.writeFileSync(`${OUT}/${pageDef.name}-text.txt`, text);

    // All images on the page
    const images = await page.evaluate(() => {
      return [...document.querySelectorAll('img')].map(img => ({
        src: img.currentSrc || img.src,
        alt: img.alt,
        w: img.naturalWidth,
        h: img.naturalHeight,
      }));
    });
    fs.writeFileSync(`${OUT}/${pageDef.name}-images.json`, JSON.stringify(images, null, 2));

    // Key CSS variables
    const cssVars = await page.evaluate(() => {
      const root = document.documentElement;
      const cs = getComputedStyle(root);
      const vars = {};
      for (let i = 0; i < cs.length; i++) {
        const prop = cs[i];
        if (prop.startsWith('--')) vars[prop] = cs.getPropertyValue(prop).trim();
      }
      return vars;
    });
    const filetered = {};
    Object.entries(cssVars).filter(([k]) => k.includes('color') || k.includes('primary') || k.includes('background')).forEach(([k, v]) => filetered[k] = v);
    console.log('CSS Vars:', filetered);

    // Page structure / sections
    const sections = await page.evaluate(() => {
      return [...document.querySelectorAll('section, [class*="wp-block-uagb-container"], .entry-content > div, header, footer')]
        .filter(el => el.getBoundingClientRect().height > 50)
        .map(el => ({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          classes: el.className?.split(' ').slice(0, 4).join(' ') || '',
          height: el.getBoundingClientRect().height,
          text: (el.textContent || '').trim().slice(0, 120),
        }));
    });
    fs.writeFileSync(`${OUT}/${pageDef.name}-sections.json`, JSON.stringify(sections, null, 2));
    console.log(`Sections: ${sections.length}`);
    sections.forEach(s => console.log(`  ${s.classes?.slice(0, 50)} (${s.height}px): ${s.text.slice(0, 60)}`));

    // Download new images not already downloaded
    const existing = new Set(fs.readdirSync('public/images'));
    for (const img of images) {
      const url = new URL(img.src);
      const filename = url.pathname.split('/').pop();
      if (filename && !existing.has(filename) && !img.src.includes('data:')) {
        try {
          const res = await fetch(img.src);
          if (res.ok) {
            const buf = Buffer.from(await res.arrayBuffer());
            fs.writeFileSync(`public/images/${filename}`, buf);
            console.log(`  Downloaded: ${filename}`);
          }
        } catch {}
      }
    }

    await context.close();
  }

  await browser.close();
  console.log('\nDone extracting all pages');
}

main();
