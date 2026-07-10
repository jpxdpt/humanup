import { chromium } from '@playwright/test';

const TARGET_URL = 'https://humanup.pt';
const OUTPUT_DIR = process.env.OUTPUT_DIR || 'docs/research';
const SCREENSHOT_DIR = process.env.SCREENSHOT_DIR || 'docs/design-references/humanup.pt';

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
  });

  try {
    // ===== DESKTOP FULL PAGE SCREENSHOT =====
    console.log('Taking desktop full-page screenshot...');
    const desktopPage = await desktopContext.newPage();
    await desktopPage.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await sleep(2000);
    await desktopPage.screenshot({
      path: `${SCREENSHOT_DIR}/fullpage-desktop.png`,
      fullPage: true,
    });
    console.log('Desktop screenshot saved.');

    // ===== MOBILE FULL PAGE SCREENSHOT =====
    console.log('Taking mobile full-page screenshot...');
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(TARGET_URL, { waitUntil: 'networkidle' });
    await sleep(2000);
    await mobilePage.screenshot({
      path: `${SCREENSHOT_DIR}/fullpage-mobile.png`,
      fullPage: true,
    });
    console.log('Mobile screenshot saved.');

    // ===== GLOBAL EXTRACTION (on desktop page) =====
    const page = desktopPage; // continue with desktop for extraction

    // --- Fonts ---
    const fontData = await page.evaluate(() => {
      const fontLinks = [...document.querySelectorAll('link[rel="stylesheet"]')].map(l => l.href);
      const fontFaces = [...document.styleSheets].flatMap(s => {
        try { return [...s.cssRules].filter(r => r instanceof CSSFontFaceRule).map(r => ({
          fontFamily: r.style.fontFamily,
          src: r.style.src,
          fontWeight: r.style.fontWeight,
          fontStyle: r.style.fontStyle,
        })); } catch { return []; }
      });
      const keyElements = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'body', 'a', 'button', 'nav', 'label', 'code', 'blockquote'];
      const usedFonts = {};
      keyElements.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
          const cs = getComputedStyle(el);
          const fam = cs.fontFamily;
          const weight = cs.fontWeight;
          const key = `${fam} ${weight}`;
          if (!usedFonts[key]) usedFonts[key] = { fontFamily: fam, fontWeight: weight, elements: [] };
          usedFonts[key].elements.push(sel);
        });
      });
      return { fontLinks, fontFaces, usedFonts: Object.values(usedFonts).map(f => ({ ...f, elements: [...new Set(f.elements)] })) };
    });
    console.log('Fonts:', JSON.stringify(fontData, null, 2));

    // --- Colors ---
    const globalColors = await page.evaluate(() => {
      const root = document.documentElement;
      const rootCS = getComputedStyle(root);
      const cssVars = {};
      for (let i = 0; i < rootCS.length; i++) {
        const prop = rootCS[i];
        if (prop.startsWith('--')) cssVars[prop] = rootCS.getPropertyValue(prop).trim();
      }
      const keyElements = ['body', 'h1', 'h2', 'h3', 'p', 'a', 'button', 'nav', 'header', 'footer', 'section', 'div'];
      const computedColors = {};
      keyElements.forEach(sel => {
        [...document.querySelectorAll(sel)].slice(0, 3).forEach(el => {
          const cs = getComputedStyle(el);
          const tag = el.tagName.toLowerCase();
          const id = el.id || el.className?.split(' ')[0] || tag;
          computedColors[id] = {
            color: cs.color,
            backgroundColor: cs.backgroundColor,
            borderColor: cs.borderColor || cs.borderTopColor,
          };
        });
      });
      return { cssVars, computedColors };
    });
    console.log('Colors sample:', JSON.stringify(globalColors, null, 2).slice(0, 2000));

    // --- Favicons & Meta ---
    const metaData = await page.evaluate(() => {
      return {
        favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({
          href: l.href,
          sizes: l.sizes?.toString(),
          type: l.type,
        })),
        appleTouchIcons: [...document.querySelectorAll('link[rel="apple-touch-icon"]')].map(l => ({
          href: l.href,
          sizes: l.sizes?.toString(),
        })),
        ogImages: [...document.querySelectorAll('meta[property="og:image"]')].map(m => m.content),
        ogTitle: document.querySelector('meta[property="og:title"]')?.content,
        ogDescription: document.querySelector('meta[property="og:description"]')?.content,
        twitterImage: document.querySelector('meta[name="twitter:image"]')?.content,
        manifest: document.querySelector('link[rel="manifest"]')?.href,
        title: document.title,
        description: document.querySelector('meta[name="description"]')?.content,
      };
    });
    console.log('Meta:', JSON.stringify(metaData, null, 2));

    // --- Global UI patterns ---
    const globalUI = await page.evaluate(() => {
      const body = document.body;
      const bodyCS = getComputedStyle(body);
      const hasLenis = !!document.querySelector('.lenis');
      const hasLocomotive = !!document.querySelector('.locomotive-scroll');
      const scrollSnapContainers = [...document.querySelectorAll('*')].filter(el => {
        const cs = getComputedStyle(el);
        return cs.scrollSnapType !== 'none';
      }).map(el => ({
        tag: el.tagName.toLowerCase(),
        class: el.className?.split(' ').slice(0, 3).join(' '),
        scrollSnapType: getComputedStyle(el).scrollSnapType,
      }));
      const keyframes = [...document.styleSheets].flatMap(s => {
        try { return [...s.cssRules].filter(r => r instanceof CSSKeyframesRule).map(r => r.name); } catch { return []; }
      });
      const backdropFilterElements = [...document.querySelectorAll('*')].filter(el => {
        const cs = getComputedStyle(el);
        return cs.backdropFilter !== 'none';
      }).map(el => ({
        tag: el.tagName.toLowerCase(),
        class: el.className?.split(' ').slice(0, 3).join(' '),
        backdropFilter: getComputedStyle(el).backdropFilter,
      }));
      const bodyOverflow = bodyCS.overflow;
      const scrollBehavior = bodyCS.scrollBehavior;
      return {
        bodyOverflow,
        scrollBehavior,
        hasLenis,
        hasLocomotive,
        scrollSnapContainers: scrollSnapContainers.slice(0, 10),
        keyframes: [...new Set(keyframes)].slice(0, 30),
        backdropFilterElements: backdropFilterElements.slice(0, 10),
      };
    });
    console.log('Global UI:', JSON.stringify(globalUI, null, 2));

    // --- SVG extraction ---
    const svgData = await page.evaluate(() => {
      const svgs = [...document.querySelectorAll('svg')];
      return svgs.map((svg, i) => ({
        index: i,
        width: svg.getAttribute('width') || svg.getAttribute('viewBox')?.split(' ')[2],
        height: svg.getAttribute('height') || svg.getAttribute('viewBox')?.split(' ')[3],
        viewBox: svg.getAttribute('viewBox'),
        outerHTML: svg.outerHTML.slice(0, 1000),
        parentClasses: svg.parentElement?.className?.slice(0, 100),
        ariaLabel: svg.getAttribute('aria-label') || svg.querySelector('title')?.textContent,
      }));
    });
    console.log('SVGs found:', svgData.length);

    // --- Asset discovery ---
    const assets = await page.evaluate(() => {
      const images = [...document.querySelectorAll('img')].map(img => ({
        src: img.src || img.currentSrc,
        alt: img.alt,
        width: img.naturalWidth,
        height: img.naturalHeight,
        parentClasses: img.parentElement?.className?.slice(0, 100),
        siblings: img.parentElement ? [...img.parentElement.querySelectorAll('img')].length : 0,
        position: getComputedStyle(img).position,
        zIndex: getComputedStyle(img).zIndex,
      }));
      const videos = [...document.querySelectorAll('video')].map(v => ({
        src: v.src || v.querySelector('source')?.src,
        poster: v.poster,
        autoplay: v.autoplay,
        loop: v.loop,
        muted: v.muted,
        className: v.className,
      }));
      const bgImages = [...document.querySelectorAll('*')].filter(el => {
        const bg = getComputedStyle(el).backgroundImage;
        return bg && bg !== 'none' && !bg.includes('gradient');
      }).slice(0, 30).map(el => ({
        url: getComputedStyle(el).backgroundImage,
        element: el.tagName.toLowerCase() + '.' + (el.className?.split(' ')[0] || ''),
      }));
      return { images, videos, bgImages, svgCount: document.querySelectorAll('svg').length };
    });
    console.log('Assets:', JSON.stringify(assets, null, 2).slice(0, 3000));

    // ===== PAGE TOPOLOGY =====
    const topology = await page.evaluate(() => {
      const sections = [];
      const allElements = [...document.querySelectorAll('section, div[id], header, footer, nav, main, article, aside')];
      const seenParents = new Set();
      
      allElements.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.height < 50) return; // too small to be a section
        const parent = el.parentElement;
        const parentKey = parent?.tagName + parent?.className;
        if (seenParents.has(parentKey) && parent !== document.body && parent !== document.documentElement) return;
        seenParents.add(el.tagName + el.className);
        
        const cs = getComputedStyle(el);
        sections.push({
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          classNames: el.className?.toString().split(' ').slice(0, 5).join(' '),
          position: cs.position,
          zIndex: cs.zIndex,
          height: rect.height,
          order: sections.length,
          textPreview: (el.textContent || '').trim().slice(0, 100),
          childCount: el.children.length,
          display: cs.display,
          overflow: cs.overflow,
        });
      });
      return sections.slice(0, 50);
    });
    console.log('Page Topology:', JSON.stringify(topology, null, 2));

    // ===== COMPUTED STYLES FOR KEY ELEMENTS =====
    const keyStyles = await page.evaluate(() => {
      const selectors = ['body', 'h1', 'h2', 'h3', 'p', 'a', 'button', 'nav', 'header', 'footer', 'section', 'main'];
      const results = {};
      selectors.forEach(sel => {
        const el = document.querySelector(sel);
        if (!el) return;
        const cs = getComputedStyle(el);
        const props = [
          'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
          'backgroundColor','background',
          'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
          'margin','marginTop','marginRight','marginBottom','marginLeft',
          'width','height','maxWidth','minWidth','maxHeight','minHeight',
          'display','flexDirection','justifyContent','alignItems','gap',
          'borderRadius','border','boxShadow','overflow',
          'position','top','right','bottom','left','zIndex',
          'opacity','transform','transition','cursor',
          'textTransform','textDecoration',
        ];
        const styles = {};
        props.forEach(p => {
          const v = cs[p];
          if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') styles[p] = v;
        });
        results[sel] = styles;
      });
      return results;
    });
    console.log('Key Styles:', JSON.stringify(keyStyles, null, 2));

    // --- Write all data to files ---
    const fs = await import('fs');
    fs.writeFileSync(`${OUTPUT_DIR}/humanup.pt/fonts.json`, JSON.stringify(fontData, null, 2));
    fs.writeFileSync(`${OUTPUT_DIR}/humanup.pt/colors.json`, JSON.stringify(globalColors, null, 2));
    fs.writeFileSync(`${OUTPUT_DIR}/humanup.pt/meta.json`, JSON.stringify(metaData, null, 2));
    fs.writeFileSync(`${OUTPUT_DIR}/humanup.pt/global-ui.json`, JSON.stringify(globalUI, null, 2));
    fs.writeFileSync(`${OUTPUT_DIR}/humanup.pt/svgs.json`, JSON.stringify(svgData, null, 2));
    fs.writeFileSync(`${OUTPUT_DIR}/humanup.pt/assets.json`, JSON.stringify(assets, null, 2));
    fs.writeFileSync(`${OUTPUT_DIR}/humanup.pt/topology.json`, JSON.stringify(topology, null, 2));
    fs.writeFileSync(`${OUTPUT_DIR}/humanup.pt/key-styles.json`, JSON.stringify(keyStyles, null, 2));
    
    console.log('\n=== RECONNAISSANCE COMPLETE ===');
    console.log(`Data written to ${OUTPUT_DIR}/humanup.pt/`);

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();
