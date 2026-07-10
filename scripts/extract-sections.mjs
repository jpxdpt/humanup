import { chromium } from '@playwright/test';

const TARGET_URL = 'https://humanup.pt';
const OUTPUT_DIR = 'docs/research/humanup.pt';

const STYLE_PROPS = [
  'fontSize','fontWeight','fontFamily','lineHeight','letterSpacing','color',
  'backgroundColor','backgroundImage','backgroundRepeat','backgroundSize','backgroundPosition',
  'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
  'margin','marginTop','marginRight','marginBottom','marginLeft',
  'width','height','maxWidth','minWidth','maxHeight','minHeight',
  'display','flexDirection','justifyContent','alignItems','gap','flexWrap',
  'gridTemplateColumns','gridTemplateRows','gridGap',
  'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight','borderColor',
  'boxShadow','overflow','overflowX','overflowY',
  'position','top','right','bottom','left','zIndex',
  'opacity','transform','transition','cursor',
  'objectFit','objectPosition','mixBlendMode','filter','backdropFilter',
  'whiteSpace','textOverflow','textTransform','textDecoration',
  'verticalAlign','float','clear',
  'listStyle','listStyleType',
];

function extractStyles(el) {
  if (!el) return null;
  const cs = window.getComputedStyle(el);
  const styles = {};
  STYLE_PROPS.forEach(p => {
    try {
      const v = cs[p];
      if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)' && v !== '0%') styles[p] = v;
    } catch(e) {}
  });
  return styles;
}

function walkDOM(element, depth = 0) {
  if (depth > 3 || !element || element.children.length === 0) return null;
  const children = [...element.children];
  return {
    tag: element.tagName.toLowerCase(),
    id: element.id || '',
    classes: element.className?.toString().split(' ').filter(Boolean).slice(0, 8).join(' ') || '',
    text: element.childNodes.length === 1 && element.childNodes[0].nodeType === 3 ? (element.textContent || '').trim().slice(0, 300) : null,
    styles: extractStyles(element),
    images: element.tagName === 'IMG' ? { src: element.currentSrc || element.src, alt: element.alt, w: element.naturalWidth, h: element.naturalHeight } : null,
    childCount: children.length,
    children: children.slice(0, 15).map(c => walkDOM(c, depth + 1)).filter(Boolean)
  };
}

async function extractSection(page, selector, name) {
  console.log(`\n=== Extracting: ${name} (${selector}) ===`);
  const data = await page.evaluate(({ sel, walk }) => {
    const el = document.querySelector(sel);
    if (!el) return { error: `Element not found: ${sel}` };
    
    // Full text content
    const fullText = el.textContent.trim();
    
    // All images
    const images = [...el.querySelectorAll('img')].map(img => ({
      src: img.currentSrc || img.src,
      alt: img.alt,
      w: img.naturalWidth,
      h: img.naturalHeight,
      classes: img.className?.slice(0, 100),
    }));
    
    // All links
    const links = [...el.querySelectorAll('a')].map(a => ({
      href: a.href,
      text: a.textContent.trim().slice(0, 100),
      classes: a.className?.slice(0, 100),
    }));
    
    // Container styles
    const containerStyles = window.getComputedStyle(el);
    const cs = {};
    const props = ['fontSize','fontWeight','fontFamily','lineHeight','color','backgroundColor',
      'padding','paddingTop','paddingRight','paddingBottom','paddingLeft',
      'width','height','maxWidth','minWidth','display','flexDirection','justifyContent','alignItems','gap',
      'borderRadius','border','boxShadow','position','top','right','bottom','left','zIndex',
      'opacity','textAlign', 'margin', 'marginTop', 'marginRight', 'marginBottom', 'marginLeft'];
    props.forEach(p => { const v = containerStyles[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px') cs[p] = v; });
    
    // DOM tree
    const tree = (function walk(el, d) {
      if (d > 3 || !el || !el.children.length) return null;
      const ch = [...el.children];
      return {
        tag: el.tagName.toLowerCase(),
        id: el.id || '',
        classes: el.className?.toString().split(' ').filter(Boolean).slice(0, 8).join(' ') || '',
        text: el.childNodes.length === 1 && el.childNodes[0].nodeType === 3 ? (el.textContent || '').trim().slice(0, 300) : null,
        childCount: ch.length,
        children: ch.slice(0, 15).map(c => walk(c, d+1)).filter(Boolean)
      };
    })(el, 0);
    
    // Background image info
    let bgImage = containerStyles.backgroundImage;
    let bgSize = containerStyles.backgroundSize;
    let bgPos = containerStyles.backgroundPosition;
    
    // Extract computed styles for all elements matching a pattern
    const allEls = el.querySelectorAll('*');
    const uniqueStyles = {};
    allEls.forEach(e => {
      const key = e.tagName.toLowerCase() + '.' + (e.className?.toString().split(' ').filter(Boolean).slice(0, 3).join('.') || '');
      if (!uniqueStyles[key] && key.split('.').length > 1) {
        uniqueStyles[key] = (function() {
          const cs2 = window.getComputedStyle(e);
          const s = {};
          props.forEach(p => { const v = cs2[p]; if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') s[p] = v; });
          return s;
        })();
      }
    });
    
    return { fullText, images, links, containerStyles: cs, bgImage, bgSize, bgPos, domTree: tree, elementStyles: uniqueStyles, elementCount: allEls.length };
  }, { sel: selector, walk: walkDOM.toString() });
  
  const fs = await import('fs');
  fs.writeFileSync(`${OUTPUT_DIR}/${name}.json`, JSON.stringify(data, null, 2));
  console.log(`${name}: ${data.error || 'OK (' + (data.elementCount || 0) + ' elements)'}`);
  return data;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();
  
  await page.goto(TARGET_URL, { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);
  
  // Extract all major sections
  const sections = [
    ['header.ast-header-break-point, div#ast-desktop-header, header', 'header'],
    ['div#primary', 'main-content'],
    ['div.wp-block-uagb-container', 'hero-section'],
    ['div.swiper', 'services-swiper'],
    ['footer', 'footer'],
  ];
  
  for (const [selector, name] of sections) {
    await extractSection(page, selector, name);
  }
  
  // Also get full page HTML structure
  const pageStructure = await page.evaluate(() => {
    return document.body.innerHTML.slice(0, 50000);
  });
  const fs = await import('fs');
  fs.writeFileSync(`${OUTPUT_DIR}/page-html.html`, pageStructure);
  console.log('\nFull page HTML saved.');
  
  // Get all CSS variables
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
  fs.writeFileSync(`${OUTPUT_DIR}/all-css-vars.json`, JSON.stringify(cssVars, null, 2));
  console.log('All CSS vars saved.');
  
  await browser.close();
  console.log('\n=== SECTION EXTRACTION COMPLETE ===');
}

main().catch(err => { console.error(err); process.exit(1); });
