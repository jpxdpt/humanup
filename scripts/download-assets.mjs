import { writeFileSync, mkdirSync } from 'fs';
import { join, extname } from 'path';

const ASSETS = {
  images: [
    { url: 'https://humanup.pt/wp-content/uploads/2025/12/Copilot_20251212_212127.png', name: 'logo.png' },
    { url: 'https://humanup.pt/wp-content/uploads/2025/12/disposicao-da-vista-superior-com-um-cartao-emoji-sorridente-1024x1024.jpg', name: 'emoji-card.jpg' },
  ],
  backgrounds: [
    { url: 'https://humanup.pt/wp-content/uploads/2025/12/grupo-de-amigos-reunidos-scaled.jpg', name: 'hero-bg.jpg' },
  ],
  videos: [
    { url: 'https://humanup.pt/wp-content/uploads/2025/12/3252063-uhd_3840_2160_25fps.mp4', name: 'hero-video.mp4' },
  ],
  favicons: [
    { url: 'https://humanup.pt/wp-content/uploads/2025/12/cropped-Copilot_20251212_212127-192x192.png', name: 'favicon.png' },
    { url: 'https://humanup.pt/wp-content/uploads/2025/12/cropped-Copilot_20251212_212127-180x180.png', name: 'apple-touch-icon.png' },
  ],
};

async function download(url, dest) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    writeFileSync(dest, buffer);
    console.log(`  ✓ ${dest.split('/').pop()} (${(buffer.length / 1024).toFixed(0)}KB)`);
  } catch (err) {
    console.error(`  ✗ ${url}: ${err.message}`);
  }
}

async function main() {
  const dirs = ['public/images', 'public/videos', 'public/seo'];
  dirs.forEach(d => mkdirSync(d, { recursive: true }));
  
  console.log('Downloading assets...\n');
  
  for (const [category, items] of Object.entries(ASSETS)) {
    console.log(`[${category}]`);
    const destDir = category === 'videos' ? 'public/videos' 
      : category === 'favicons' ? 'public/seo'
      : 'public/images';
    
    for (const item of items) {
      await download(item.url, join(destDir, item.name));
    }
    console.log();
  }
  
  console.log('Done!');
}

main();
