// This script injects OGP meta tags into the generated index.html
// It's run after expo export to add SEO and social sharing tags

import { readFileSync, writeFileSync, existsSync } from 'fs';
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

// Replace the title tag
html = html.replace(/<title>.*?<\/title>/i, '<title>資産形成シミュレーター | 投資・積立シミュレーション</title>');

// Insert OGP tags after the opening head tag
if (!html.includes('og:title')) {
    html = html.replace(/<head>/i, '<head>' + ogpTags);
}

// Add noscript fallback
const noscriptFallback = `
<noscript>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; background: linear-gradient(135deg, #0D9488, #0EA5E9); min-height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
    .noscript-msg { background: white; padding: 40px; border-radius: 16px; text-align: center; max-width: 90%; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
    .noscript-msg h1 { color: #0D9488; margin-bottom: 16px; }
    .noscript-msg p { color: #666; line-height: 1.6; }
    .noscript-msg a { display: inline-block; margin-top: 20px; background: #0D9488; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; }
  </style>
  <div class="noscript-msg">
    <h1>📊 資産形成シミュレーター</h1>
    <p>このアプリを利用するにはJavaScriptを有効にしてください。</p>
    <p>LINEアプリ内ブラウザでは正常に動作しない場合があります。</p>
    <a href="https://munus-moneyapp.vercel.app/?openExternalBrowser=1">Safari/Chromeで開く</a>
  </div>
</noscript>`;

if (!html.includes('<noscript>')) {
    html = html.replace(/<body[^>]*>/i, (match) => match + noscriptFallback);
}

writeFileSync(indexPath, html, 'utf-8');
console.log('Successfully injected OGP meta tags and noscript fallback into index.html');
