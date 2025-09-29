import Document, { Html, Head, Main, NextScript } from 'next/document'

class MyDocument extends Document {
  render() {
    const themeColor = '#0ea5a4'
    return (
      <Html lang="es">
        <Head>
          {/* Standard PWA meta */}
          <meta name="theme-color" content={themeColor} />

          {/* Apple mobile web app capable */}
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />

          {/* Apple touch startup images (iOS) - reference generated splash images */}
          {/* iPhone 5/SE (640x1136) */}
          <link rel="apple-touch-startup-image" href="/splash-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
          {/* iPhone 6/7/8 (750x1334) */}
          <link rel="apple-touch-startup-image" href="/splash-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
          {/* iPhone X/XS/11 Pro (1125x2436) */}
          <link rel="apple-touch-startup-image" href="/splash-1125x2436.png" media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" />
          {/* iPhone 6+/7+/8+ (1242x2208) */}
          <link rel="apple-touch-startup-image" href="/splash-1242x2208.png" media="(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" />
          {/* iPad Retina (1536x2048) */}
          <link rel="apple-touch-startup-image" href="/splash-1536x2048.png" media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)" />

          {/* Apple touch icon fallback */}
          <link rel="apple-touch-icon" href="/icon-192.png" />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}

export default MyDocument
