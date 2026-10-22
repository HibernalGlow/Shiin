import type { SdlMappingEntry } from '../types.js'

/**
 * Parses a single line from an SDL_GameControllerDB mapping file.
 * Format: <guid>,<name>,[binding:target,...]
 *
 * Example:
 * 030000005e040000120b000000010000,Xbox Wireless Controller,a:b0,b:b1,back:b6,dpdown:h0.4,dpleft:h0.8,dpright:h0.2,dpup:h0.1,guide:b10,leftshoulder:b4,leftstick:b8,lefttrigger:a2,leftx:a0,lefty:a1,rightshoulder:b5,rightstick:b9,righttrigger:a5,rightx:a3,righty:a4,start:b7,x:b2,y:b3,platform:Mac OS X,
 */
export function parseSdlMappingLine(line: string): SdlMappingEntry | null {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return null

  // Split by commas, handling potential quoted strings if present
  const parts = trimmed.split(',')
  if (parts.length < 3) return null

  const guid = parts[0].trim()
  const name = parts[1].trim()
  const bindings: Record<string, string> = {}
  let platform: string | undefined

  for (let i = 2; i < parts.length; i++) {
    const item = parts[i].trim()
    if (!item) continue
    const colonIdx = item.indexOf(':')
    if (colonIdx === -1) continue

    const key = item.slice(0, colonIdx).trim()
    const target = item.slice(colonIdx + 1).trim()

    if (key === 'platform') {
      platform = target
    } else {
      bindings[key] = target
    }
  }

  return {
    guid,
    name,
    platform,
    bindings,
    rawLine: trimmed,
  }
}

/**
 * Parses multiple lines of an SDL GameController database string.
 */
export function parseSdlDatabase(dbText: string): SdlMappingEntry[] {
  const lines = dbText.split(/\r?\n/)
  const results: SdlMappingEntry[] = []

  for (const line of lines) {
    const entry = parseSdlMappingLine(line)
    if (entry) results.push(entry)
  }

  return results
}

/**
 * Extracts Vendor ID and Product ID from an SDL GUID if present.
 * SDL GUID encoding on USB/Bluetooth commonly puts VID at bytes 4-5 and PID at bytes 8-9 (little-endian hex).
 */
export function extractVidPidFromGuid(guid: string): { vendorId?: number; productId?: number } {
  if (!guid || guid.length < 16) return {}

  const clean = guid.toLowerCase()

  // Standard SDL2 / SDL3 USB GUID format:
  // e.g. 030000005e040000120b000000010000 -> VID is "5e04" (0x045e), PID is "120b" (0x0b12)
  // or 030057564c050000e60c000000016800 -> VID is "4c05" (0x054c), PID is "e60c" (0x0ce6)
  try {
    const vidHex = clean.slice(8, 12)
    const pidHex = clean.slice(16, 20)

    if (vidHex && pidHex) {
      // Little-endian byte swap: e.g. "5e04" -> "04" + "5e" = 0x045e
      const vidSwapped = vidHex.slice(2, 4) + vidHex.slice(0, 2)
      const pidSwapped = pidHex.slice(2, 4) + pidHex.slice(0, 2)

      const vendorId = parseInt(vidSwapped, 16)
      const productId = parseInt(pidSwapped, 16)

      if (!isNaN(vendorId) && !isNaN(productId) && vendorId > 0) {
        return { vendorId, productId }
      }
    }
  } catch {}

  return {}
}
