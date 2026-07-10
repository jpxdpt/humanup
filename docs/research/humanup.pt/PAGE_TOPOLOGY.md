# HumanUp.pt - Page Topology

## Page Structure
- **Container:** `#page.hfeed.site` — flex column, relative positioning
- **Fixed/Sticky:** None. Header is static (z-index: 99)
- **Width:** 1440px full width, content max-width 1200px
- **Total height:** ~2606px at 1440px viewport

## Sections (top to bottom)

### 1. Header (`#masthead`)
- **Height:** ~95px
- **z-index:** 99
- **Layout:** Flex row, logo left, nav + search right
- **Logo:** Image (250x62px)
- **Nav:** Início, Sobre, Serviços, Contactos
- **Search:** Slide-search icon
- **Mobile:** Hamburger toggle with dropdown overlay
- **Interaction model:** Static (click-driven search, mobile menu toggle)

### 2. Hero Section (`.uagb-block-c832201d`)
- **Height:** ~746px
- **Background:** Image `grupo-de-amigos-reunidos-scaled.jpg` (cover) + autoplay video overlay
- **Content:** Centered left, max 600px width
- **Title:** h1 "Felicidade que gera resultados" — 60px DM Sans 700
- **Subtitle:** p — 16px Inter 500
- **CTA:** "Saber Mais" button — white text, gold/brand background
- **Interaction model:** Static (video autoplays)

### 3. Services Swiper (`.uagb-block-f6a018af`)
- **Height:** ~350px
- **Type:** Swiper carousel with 4 slides
- **Slides:**
  1. "Projetos de Felicidade Organizacional" → "Solicitar Diagnóstico"
  2. "Diagnóstico Organizacional" → "Saber mais"
  3. "Consultoria de Bem-Estar" → "Saber Mais"
  4. "Acompanhamento" → "Saber Mais"
- **Navigation:** Prev/next arrows + pagination bullets
- **Interaction model:** Click-driven (swiper navigation) + auto-play

### 4. Why Invest (`.uagb-block-d90960c4`)
- **Layout:** 2-column grid (image left, text right)
- **Image:** Emoji card graphic (484x500px)
- **Heading:** h2 "Porquê investir em felicidade organizacional?" — 46px DM Sans 700
- **Body:** Descriptive paragraph with bold emphasis
- **CTA:** "Saber Mais" button
- **Interaction model:** Static

### 5. Counters Section (`.uagb-block-9f04ea17`)
- **Layout:** 3-column grid with 6 counter items
- **Counters:** 53%, 79%, 54%, 47%, 1.4%, 12.4 dias
- **Animation:** Count-up from 0 (duration: 1.5s)
- **Source:** "Relatórios Gallup, Deloitte, McKinsey, OCDE"
- **Interaction model:** Scroll-driven (counter animation on viewport entry)

### 6. CTA Section (`.uagb-block-0c49f28e`)
- **Background:** Gold/yellow #f8b449
- **Padding:** 100px 40px
- **Heading:** h2 "E se o próximo crescimento do seu negócio viesse da cultura?" — white text
- **CTA:** "Saber mais" button — outlined style
- **Interaction model:** Static

### 7. Footer (`#colophon`)
- **Height:** ~70px
- **Layout:** 2-column: nav links left, copyright right
- **Nav:** Início, Sobre, Serviços, Contactos (horizontal)
- **Copyright:** "Direitos de Autor © 2026 HumanUp"
- **Interaction model:** Static (link hovers)

## Scroll Behavior
- Native scroll (no Lenis/Locomotive)
- No scroll-snap
- Body overflow: hidden auto
