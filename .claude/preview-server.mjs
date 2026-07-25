// Minimal static file server for previewing the built Quartz site in public/.
// Dev-only helper: public/ is gitignored build output.
import { createServer } from "node:http"
import { createReadStream, statSync } from "node:fs"
import { extname, join, normalize } from "node:path"

const root = new URL("../public/", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1")
const port = Number(process.env.PORT || 8080)

const types = {
  ".html": "text/html; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".xml": "application/xml; charset=utf-8",
}

const resolve = (pathname) => {
  const decoded = decodeURIComponent(pathname.split("?")[0])
  const candidate = join(root, normalize(decoded).replace(/^(\.\.[/\\])+/, ""))
  for (const attempt of [candidate, candidate + ".html", join(candidate, "index.html")]) {
    try {
      if (statSync(attempt).isFile()) return attempt
    } catch {}
  }
  return null
}

createServer((req, res) => {
  const file = resolve(req.url || "/")
  if (!file) {
    res.writeHead(404, { "content-type": "text/plain; charset=utf-8" })
    res.end("404")
    return
  }
  res.writeHead(200, {
    "content-type": types[extname(file).toLowerCase()] || "application/octet-stream",
    "cache-control": "no-store",
  })
  createReadStream(file).pipe(res)
}).listen(port, "127.0.0.1", () => {
  console.log(`preview server on http://127.0.0.1:${port}`)
})
