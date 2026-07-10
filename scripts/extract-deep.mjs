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
  'gridTemplateColumns','gridTemplateRows',
  'borderRadius','border','borderTop','borderBottom','borderLeft','borderRight','borderColor',
  'boxShadow','overflow','overflowX','overflowY',
  'position','top','right','bottom','left','zIndex',
  'opacity','transform','transition','cursor',
  'objectFit','objectPosition','mixBlendMode','filter','backdropFilter',
  'whiteSpace','textOverflow','textTransform','textDecoration',
  'textAlign','verticalAlign',
];

async function extractFull(page, selector, name) {
  console.log(`\n=== Extracting: ${name} (${selector}) ===`);
  const data = await page.evaluate(({ sel, styleProps }) => {
    const el = document.querySelector(sel);
    if (!el) return { error: `Element not found: ${sel}` };
    
    // Full extraction of every element in this container
    const allElements = [el, ...el.querySelectorAll('*')];
    const results = [];
    
    allElements.forEach(e => {
      if (e.children.length > 0 && e !== el) return; // only leaf elements + root
      const cs = window.getComputedStyle(e);
      const styles = {};
      styleProps.forEach(p => {
        try {
          const v = cs[p];
          if (v && v !== 'none' && v !== 'normal' && v !== 'auto' && v !== '0px' && v !== 'rgba(0, 0, 0, 0)') styles[p] = v;
        } catch(e) {}
      });
      results.push({
        tag: e.tagName.toLowerCase(),
        id: e.id || '',
        classes: e.className?.toString().slice(0, 150) || '',
        text: (e.textContent || '').trim().slice(0, 200) || null,
        styles,
        rect: e.getBoundingClientRect(),
      });
    });
    
    // Container box
    const rect = el.getBoundingClientRect();
    
    return { results, box: { top: rect.top, left: rect.left, width: rect.width, height: rect.height } };
  }, { sel: selector, styleProps: STYLE_PROPS });
  
  const fs = await import('fs');
  fs.writeFileSync(`${OUTPUT_DIR}/${name}-deep.json`, JSON.stringify(data, null, 2));
  console.log(`${name}: ${data.error || data.results?.length + ' elements'}`);
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
  
  // Extract all major sections with precise selectors
  const sections = [
    ['#masthead', 'header-deep'],
    ['.uagb-block-c832201d', 'hero-deep'],
    ['.uagb-block-f6a018af', 'services-swiper-deep'],
    ['.uagb-block-d90960c4', 'why-invest-deep'],
    ['.uagb-block-9f04ea17', 'counters-deep'],
    ['.uagb-block-0c49f28e', 'cta-deep'],
    ['#colophon', 'footer-deep'],
  ];
  
  for (const [selector, name] of sections) {
    await extractFull(page, selector, name);
  }
  
  // Click through swiper slides to extract each state
  console.log('\n=== Extracting swiper slide states ===');
  const swiperNav = page.locator('.uagb-block-f6a018af .swiper-button-next');
  for (let i = 0; i < 4; i++) {
    const slideContent = await page.evaluate(() => {
      const activeSlide = document.querySelector('.swiper-slide-active');
      if (!activeSlide) return null;
      const h3 = activeSlide.querySelector('h3');
      const desc = activeSlide.querySelector('.uagb-ifb-desc');
      const btn = activeSlide.querySelector('.wp-block-button__link .uagb-inline-editing');
      return {
        title: h3?.textContent?.trim() || '',
        description: desc?.innerHTML?.trim() || '',
        buttonText: btn?.textContent?.trim() || '',
      };
    });
    if (slideContent) {
      const fs = await import('fs');
      fs.writeFileSync(`${OUTPUT_DIR}/swiper-slide-${i}.json`, JSON.stringify(slideContent, null, 2));
      console.log(`Slide ${i}:`, slideContent.title?.slice(0, 50));
    }
    if (i < 3) await swiperNav.click();
    await page.waitForTimeout(500);
  }
  
  await browser.close();
  console.log('\n=== DEEP EXTRACTION COMPLETE ===');
}

main().catch(err => { console.error(err); process.exit(1); });
