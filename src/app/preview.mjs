import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { exec, execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)
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

let coreModPromise = null
function getCore() {
  if (!coreModPromise) {
    coreModPromise = import('../../lib/core.mjs').catch(() => null)
  }
  return coreModPromise
}

function readJsonBody(req) {
  return new Promise((resolve) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
    })
    req.on('end', () => {
      if (!raw) return resolve({})
      try {
        resolve(JSON.parse(raw))
      } catch {
        resolve({})
      }
    })
  })
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(data))
}

const server = http.createServer(async (req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url?.split('?')[0] || '/index.html'

  // 提供本地桥接 API，使 Web 预览模式下打开目录、检测权限和实测截图同样可用
  if (urlPath.startsWith('/api/')) {
    const core = await getCore()
    const body = req.method === 'POST' ? await readJsonBody(req) : {}

    if (urlPath === '/api/open-folder') {
      const targetPath = core?.resolveScreenshotSaveDir
        ? core.resolveScreenshotSaveDir(body.path)
        : path.resolve(process.cwd(), 'screenshots')
      try {
        if (!fs.existsSync(targetPath)) {
          fs.mkdirSync(targetPath, { recursive: true })
        }
        const stat = fs.statSync(targetPath)
        const args = stat.isFile() ? ['-R', targetPath] : [targetPath]
        await execFileAsync('/usr/bin/open', args)
        return sendJson(res, 200, { ok: true, path: targetPath })
      } catch (err) {
        return sendJson(res, 200, { ok: false, path: targetPath, error: err?.message || String(err) })
      }
    }

    if (urlPath === '/api/select-folder') {
      if (process.platform === 'darwin') {
        try {
          const { stdout } = await execFileAsync('/usr/bin/osascript', [
            '-e',
            'POSIX path of (choose folder with prompt "请选择截图保存目录 / Select Screenshot Folder")',
          ])
          return sendJson(res, 200, { path: stdout.trim() || null })
        } catch {
          return sendJson(res, 200, { path: null })
        }
      }
      return sendJson(res, 200, { path: null })
    }

    if (urlPath === '/api/open-preference') {
      const pane = body.pane || 'screen'
      const urlMap = {
        screen: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ScreenCapture',
        accessibility: 'x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility',
        input: 'x-apple.systempreferences:com.apple.preference.security?Privacy_ListenEvent',
        files: 'x-apple.systempreferences:com.apple.preference.security?Privacy_AllFiles',
      }
      exec(`open "${urlMap[pane] || urlMap.screen}"`)
      return sendJson(res, 200, { ok: true })
    }

    if (urlPath === '/api/permissions' || urlPath === '/api/request-permission') {
      const dirCheck = core?.testDirectoryAccess
        ? core.testDirectoryAccess(body.path)
        : { ok: true, resolvedPath: path.resolve(process.cwd(), 'screenshots'), writable: true }
      let screenCapture = false
      try {
        if (core?.captureMacScreenNative) {
          const buf = await core.captureMacScreenNative({ format: 'jpg' })
          screenCapture = Boolean(buf && buf.length > 0)
        }
      } catch {}

      let wins = []
      let activeWin = null
      try {
        wins = core?.getCaptureWindows ? await core.getCaptureWindows() : []
        activeWin = core?.getActiveWindowInfo ? await core.getActiveWindowInfo() : null
      } catch {}

      const accessibility = wins.length > 0 || Boolean(activeWin?.title)
      return sendJson(res, 200, {
        isMac: process.platform === 'darwin',
        platform: process.platform,
        screenCapture,
        screenCaptureStatus: screenCapture ? 'granted' : 'denied',
        accessibility,
        inputMonitoring: accessibility,
        folderAccess: dirCheck.ok,
        resolvedSavePath: dirCheck.resolvedPath,
        folderError: dirCheck.error,
        windowRecognition: accessibility,
        detectedWindowsCount: wins.length,
        activeWindowTitle: activeWin?.title || '',
        gamepadAccess: true,
        detectedGamepadsCount: 0,
        allGranted: Boolean(screenCapture && accessibility && dirCheck.ok),
        checkedAt: Date.now(),
      })
    }

    if (urlPath === '/api/test-screenshot' || urlPath === '/api/capture') {
      if (!core?.performScreenshot) {
        return sendJson(res, 200, { ok: false, granted: false, error: 'Core not built' })
      }
      const startTime = Date.now()
      const cfg = { ...(core.DEFAULT_CONFIG || {}), ...(body.config || {}) }
      const cap = await core.performScreenshot(cfg)
      const latencyMs = Date.now() - startTime
      let previewDataUrl = ''
      if (cap.ok && cap.filePath && fs.existsSync(cap.filePath)) {
        try {
          const buf = fs.readFileSync(cap.filePath)
          const mime = cap.format === 'png' ? 'image/png' : 'image/jpeg'
          previewDataUrl = `data:${mime};base64,${buf.toString('base64')}`
        } catch {}
      }
      return sendJson(res, 200, {
        ...cap,
        granted: Boolean(cap.ok),
        previewDataUrl,
        latencyMs,
      })
    }

    if (urlPath === '/api/screens') {
      const list = core?.getScreenDisplays ? await core.getScreenDisplays() : []
      return sendJson(res, 200, list)
    }

    if (urlPath === '/api/windows') {
      const list = core?.getCaptureWindows ? await core.getCaptureWindows() : []
      return sendJson(res, 200, list)
    }

    return sendJson(res, 404, { ok: false })
  }

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
