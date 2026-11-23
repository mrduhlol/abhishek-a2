import { readFile, readdir, writeFile } from 'node:fs/promises'
import { basename, extname } from 'node:path'

const dist = new URL('../dist/', import.meta.url)
const output = new URL('../portfolio.html', import.meta.url)
const iconDirectory = new URL('project-icons/', dist)
const mimeTypes = { '.png': 'image/png', '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.webp': 'image/webp' }

async function asDataUrl(file) {
  const mime = mimeTypes[extname(file.pathname)]
  if (!mime) throw new Error(`Unsupported asset: ${file.pathname}`)
  const data = await readFile(file)
  if (!data.length) throw new Error(`Empty asset: ${file.pathname}`)
  return `data:${mime};base64,${data.toString('base64')}`
}

const html = await readFile(new URL('index.html', dist), 'utf8')
const scriptTag = html.match(/<script type="module"[^>]* src="([^"]+)"[^>]*><\/script>/)
const styleTag = html.match(/<link rel="stylesheet"[^>]* href="([^"]+)"[^>]*>/)
const iconTag = html.match(/<link rel="icon"[^>]*>/)
if (!scriptTag || !styleTag || !iconTag) throw new Error('Expected a portfolio build in dist. Run npm run build first.')

const script = await readFile(new URL(`assets/${basename(scriptTag[1])}`, dist), 'utf8')
let style = await readFile(new URL(`assets/${basename(styleTag[1])}`, dist), 'utf8')
const fontUrls = new Set(Array.from(style.matchAll(/url\(([^)'"\s]*\/fonts\/[^)]+)\)/g), match => match[1]))
for (const url of fontUrls) {
  const data = await asDataUrl(new URL(`fonts/${basename(url)}`, dist))
  style = style.replaceAll(`url(${url})`, `url(${data})`)
}

const names = await readdir(iconDirectory)
const icons = Object.fromEntries(await Promise.all(names.map(async name => [name, await asDataUrl(new URL(name, iconDirectory))])))
const favicon = await asDataUrl(new URL('favicon.svg', dist))
const standalone = html
  .replace(iconTag[0], () => `<link rel="icon" href="${favicon}">`)
  .replace(styleTag[0], () => `<style>${style}</style>`)
  .replace(scriptTag[0], '')
  .replace('</body>', () => `<script id="portfolio-icons" type="application/json">${JSON.stringify(icons)}</script>\n    <script type="module">${script.replace(/<\/script/gi, '<\\/script')}</script>\n  </body>`)

await writeFile(output, standalone)
console.log(`Exported ${output.pathname}`)
