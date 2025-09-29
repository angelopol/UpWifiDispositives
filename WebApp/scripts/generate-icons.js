const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const outDir = path.join(__dirname, '..', 'public')
const svgPath = path.join(outDir, 'favicon.svg')
const pngPath = path.join(outDir, 'favicon.png')
const sizes = [192, 512]
// common splash screen sizes (height x width) for various devices
const splashSizes = [
  { w: 640, h: 1136 },
  { w: 750, h: 1334 },
  { w: 1125, h: 2436 },
  { w: 1242, h: 2208 },
  { w: 1536, h: 2048 }
]

// screenshots to satisfy PWA richer install UI (one wide, one portrait)
const screenshotVariants = [
  { name: 'screenshot-wide.png', w: 1280, h: 720, form_factor: 'wide' },
  { name: 'screenshot-portrait.png', w: 720, h: 1280 }
]

async function run(){
  if (!fs.existsSync(svgPath)){
    console.error('favicon.svg not found at', svgPath)
    process.exit(1)
  }
    // choose source: prefer a raster favicon.png if present so we match its pixels exactly
    const src = fs.existsSync(pngPath) ? pngPath : svgPath
    console.log('Using source for icon generation:', src)

  for (const size of sizes){
    const out = path.join(outDir, `icon-${size}.png`)
    // use 'cover' so the rounded rect and text scale to fill the square canvas like the SVG appearance
    // render with 'contain' and flatten background so the composition remains centered
      await sharp(src)
      .resize(size, size, { fit: 'contain', position: 'centre' })
      .flatten({ background: '#0ea5a4' })
      .png({ quality: 90 })
      .toFile(out)
    console.log('Generated', out)
  }

    // generate splash images
    for (const s of splashSizes) {
      const out = path.join(outDir, `splash-${s.w}x${s.h}.png`)
      // fill the splash canvas and crop overflow so the rounded rect fills the width (matches the SVG look)
        await sharp(src)
        .resize(s.w, s.h, { fit: 'cover', position: 'centre' })
        .png({ quality: 90 })
        .toFile(out)
      console.log('Generated', out)
    }

    // generate screenshots (wide + portrait) used by PWA install UI checks
    for (const v of screenshotVariants) {
      const out = path.join(outDir, v.name)
      await sharp(src)
        .resize(v.w, v.h, { fit: 'cover', position: 'centre' })
        .png({ quality: 90 })
        .toFile(out)
      console.log('Generated', out)
    }

  // update manifest
  const manifestPath = path.join(outDir, 'manifest.json')
  if (!fs.existsSync(manifestPath)){
    console.error('manifest.json not found at', manifestPath)
    process.exit(1)
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  manifest.icons = [
    { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any maskable' }
  ]
  // add a convenience (non-standard) list of splash screens for the project to reference
  manifest.splash_screens = splashSizes.map(s => ({ src: `/splash-${s.w}x${s.h}.png`, sizes: `${s.w}x${s.h}` }))
  manifest.screenshots = [
    { src: '/screenshot-wide.png', sizes: '1280x720', type: 'image/png', form_factor: 'wide' },
    { src: '/screenshot-portrait.png', sizes: '720x1280', type: 'image/png' }
  ]
  // ensure theme/background are set
  manifest.theme_color = manifest.theme_color || '#0ea5a4'
  manifest.background_color = manifest.background_color || '#ffffff'
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2))
  console.log('manifest.json updated')
}

run().catch(err => { console.error(err); process.exit(1) })
