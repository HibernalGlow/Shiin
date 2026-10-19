import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec } from 'node:child_process'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '../../dist/ui')

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
}

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url?.split('?')[0] || '/index.html'
  const filePath = path.join(root, urlPath)

  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase()
    res.writeHead(200, { 'Content-Type': MIME_TYPES[ext] || 'application/octet-stream' })
    fs.createReadStream(filePath).pipe(res)
  } else {
    // SPA 回退
    const indexPath = path.join(root, 'index.html')
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    fs.createReadStream(indexPath).pipe(res)
  }
})

const PORT = 3800
server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`
  console.log(`🌐 Shiin React Web 预览已就绪: ${url}`)
  exec(`open ${url}`)
})
