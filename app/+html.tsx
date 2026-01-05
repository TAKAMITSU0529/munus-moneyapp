import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
    return (
        <html lang="ja">
            <head>
                <meta charSet="utf-8" />
                <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
                <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

                {/* Primary Meta Tags */}
                <title>資産形成シミュレーター | 投資・積立シミュレーション</title>
                <meta name="title" content="資産形成シミュレーター | 投資・積立シミュレーション" />
                <meta name="description" content="投資信託や積立投資の将来シミュレーションで資産形成を直感的に理解できるアプリ。毎月の積立額・期間・利回りから将来の資産を計算します。" />

                {/* Open Graph / Facebook / LINE */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://munus-moneyapp.vercel.app/" />
                <meta property="og:title" content="資産形成シミュレーター | 投資・積立シミュレーション" />
                <meta property="og:description" content="投資信託や積立投資の将来シミュレーションで資産形成を直感的に理解できるアプリ。毎月の積立額・期間・利回りから将来の資産を計算します。" />
                <meta property="og:image" content="https://munus-moneyapp.vercel.app/ogp-image.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:site_name" content="資産形成シミュレーター" />
                <meta property="og:locale" content="ja_JP" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content="https://munus-moneyapp.vercel.app/" />
                <meta name="twitter:title" content="資産形成シミュレーター | 投資・積立シミュレーション" />
                <meta name="twitter:description" content="投資信託や積立投資の将来シミュレーションで資産形成を直感的に理解できるアプリ。毎月の積立額・期間・利回りから将来の資産を計算します。" />
                <meta name="twitter:image" content="https://munus-moneyapp.vercel.app/ogp-image.png" />

                {/* PWA / Mobile Web App */}
                <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
                <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
                <link rel="icon" type="image/png" sizes="16x16" href="/favicon.png" />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="apple-mobile-web-app-status-bar-style" content="default" />
                <meta name="apple-mobile-web-app-title" content="資産形成シミュレーター" />
                <meta name="mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#0D9488" />
                <meta name="application-name" content="資産形成シミュレーター" />
                <link rel="manifest" href="/manifest.json" />

                {/* Using raw CSS styles as this is static rendering */}
                <ScrollViewStyleReset />
                <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
            </head>
            <body>{children}</body>
        </html>
    );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}
`;
