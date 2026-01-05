// This script injects OGP meta tags into the generated index.html
// It's run after expo export to add SEO and social sharing tags

import { readFileSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';

const distDir = './dist';
const indexPath = join(distDir, 'index.html');

if (!existsSync(indexPath)) {
  console.error('index.html not found in dist directory');
  process.exit(1);
}

let html = readFileSync(indexPath, 'utf-8');

const ogpTags = `
    <!-- OGP Meta Tags for LINE/SNS -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://munus-moneyapp.vercel.app/">
    <meta property="og:title" content="資産形成シミュレーター | 投資・積立シミュレーション">
    <meta property="og:description" content="投資信託や積立投資の将来シミュレーションで資産形成を直感的に理解できるアプリ。毎月の積立額・期間・利回りから将来の資産を計算します。">
    <meta property="og:image" content="https://munus-moneyapp.vercel.app/ogp-image.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="資産形成シミュレーター">
    <meta property="og:locale" content="ja_JP">
    
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="資産形成シミュレーター | 投資・積立シミュレーション">
    <meta name="twitter:description" content="投資信託や積立投資の将来シミュレーションで資産形成を直感的に理解できるアプリ。">
    <meta name="twitter:image" content="https://munus-moneyapp.vercel.app/ogp-image.png">
    
    <!-- PWA -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png">
    <link rel="manifest" href="/manifest.json">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-title" content="資産形成シミュレーター">
    <meta name="theme-color" content="#0D9488">
`;

// LINE browser detection and redirect script
// This runs BEFORE any React/Expo code loads
const lineDetectionScript = `
<script>
(function() {
  // Detect LINE in-app browser
  var ua = navigator.userAgent || navigator.vendor || window.opera;
  var isLine = ua.indexOf('Line/') > -1 || ua.indexOf('LIFF') > -1;
  
  // Also detect other problematic in-app browsers
  var isFacebook = ua.indexOf('FBAN') > -1 || ua.indexOf('FBAV') > -1;
  var isInstagram = ua.indexOf('Instagram') > -1;
  
  if (isLine || isFacebook || isInstagram) {
    // Redirect to fallback page for in-app browsers
    window.location.replace('/fallback.html');
  }
})();
</script>
`;

// Replace the title tag
html = html.replace(/<title>.*?<\/title>/i, '<title>資産形成シミュレーター | 投資・積立シミュレーション</title>');

// Insert OGP tags after the opening head tag
if (!html.includes('og:title')) {
  html = html.replace(/<head>/i, '<head>' + ogpTags);
}

// Insert LINE detection script immediately after <head> (before any other scripts)
if (!html.includes('Line/')) {
  html = html.replace(/<head>/i, '<head>' + lineDetectionScript);
}

// Add noscript fallback
const noscriptFallback = `
<noscript>
  <meta http-equiv="refresh" content="0;url=/fallback.html">
</noscript>`;

if (!html.includes('<noscript>')) {
  html = html.replace(/<head>/i, '<head>' + noscriptFallback);
}

writeFileSync(indexPath, html, 'utf-8');
console.log('Successfully injected OGP meta tags, LINE browser detection, and noscript fallback into index.html');

// Also inject into other HTML files if they exist
const htmlFiles = readdirSync(distDir).filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'fallback.html');
for (const file of htmlFiles) {
  const filePath = join(distDir, file);
  let fileHtml = readFileSync(filePath, 'utf-8');

  if (!fileHtml.includes('Line/')) {
    fileHtml = fileHtml.replace(/<head>/i, '<head>' + lineDetectionScript);
  }
  if (!fileHtml.includes('og:title')) {
    fileHtml = fileHtml.replace(/<head>/i, '<head>' + ogpTags);
  }

  writeFileSync(filePath, fileHtml, 'utf-8');
  console.log(`Injected into ${file}`);
}
