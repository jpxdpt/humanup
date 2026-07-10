# HumanUp.pt - Behaviors

## Global Behaviors
- **Smooth scroll:** None — native browser scrolling
- **Scroll libraries:** None detected (no .lenis, no .locomotive-scroll)
- **Scroll snap:** None
- **Scroll to top:** Scroll-to-top button appears after scrolling down (hidden by default)

## Per-Section Behaviors

### Header
- **Scroll:** No sticky/scrolled state detected — header is static
- **Mobile menu:** Click hamburger → dropdown overlay with slide animation
- **Search:** Click search icon → form slides open
- **Link hovers:** color transitions at 0.2s linear

### Hero Section
- **Background video:** Autoplay, loop, muted — plays on page load
- **No scroll-driven behavior:** Static section

### Services Swiper
- **Navigation:** Click prev/next arrows to navigate slides
- **Pagination:** Click bullets to jump to slide
- **Auto-play:** Swiper cycles through slides
- **Transition:** Slide animation (horizontal translate)

### Counters
- **Count-up animation:** Numbers animate from 0 to target value
- **Duration:** 1.5 seconds per counter
- **Trigger:** Likely on viewport entry (IntersectionObserver or scroll-based)

### CTA Section
- **Static** — no scroll or click behavior beyond link hover

### Footer
- **Link hovers:** Color transitions at 0.2s linear
- **Static layout** — no scroll behavior

## Responsive Behaviors
- **Breakpoints:** 921px (Astra theme standard)
- **Mobile header:** Hamburger menu replaces nav links
- **Counters:** Stack to single column on mobile
- **Swiper:** Full-width on all viewports
