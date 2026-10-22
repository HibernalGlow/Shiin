/**
 * PNG Zero-Reencode Chunk Injector and Extractor for ISO XMP (iTXt chunk)
 */

import { PNG_ITXT_KEYWORD } from './constants.js'

// Standard CRC32 table for PNG chunk checksum verification and creation
const CRC_TABLE = new Uint32Array(256)
for (let n = 0; n < 256; n++) {
  let c = n
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  }
  CRC_TABLE[n] = c
}

export function computeCrc32(buf: Uint8Array, offset = 0, length = buf.length): number {
  let crc = 0xffffffff
  for (let i = offset; i < offset + length; i++) {
    crc = CRC_TABLE[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

const PNG_SIGNATURE = new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10])

export function isPngBuffer(buffer: Buffer): boolean {
  if (buffer.length < 8) return false
  for (let i = 0; i < 8; i++) {
    if (buffer[i] !== PNG_SIGNATURE[i]) return false
  }
  return true
}

/**
 * Creates a raw PNG iTXt chunk containing the XMP packet.
 */
export function createPngXmpChunk(xmpXml: string): Buffer {
  const keyword = Buffer.from(PNG_ITXT_KEYWORD, 'utf8')
  const xmpBytes = Buffer.from(xmpXml, 'utf8')

  // iTXt payload layout:
  // keyword (null-terminated) + compression_flag(0) + compression_method(0) +
  // lang_tag (null-terminated) + translated_keyword (null-terminated) + text
  const payloadLen = keyword.length + 1 + 1 + 1 + 1 + 1 + xmpBytes.length
  const chunkData = Buffer.alloc(payloadLen)

  let offset = 0
  keyword.copy(chunkData, offset)
  offset += keyword.length
  chunkData[offset++] = 0 // null terminator for keyword
  chunkData[offset++] = 0 // compression flag = 0 (uncompressed)
  chunkData[offset++] = 0 // compression method = 0
  chunkData[offset++] = 0 // null terminator for empty lang tag
  chunkData[offset++] = 0 // null terminator for empty translated keyword
  xmpBytes.copy(chunkData, offset)

  const chunkType = Buffer.from('iTXt', 'ascii')
  const totalLen = 4 + 4 + payloadLen + 4
  const chunk = Buffer.alloc(totalLen)

  // 1. Length (4 bytes)
  chunk.writeUInt32BE(payloadLen, 0)
  // 2. Type (4 bytes)
  chunkType.copy(chunk, 4)
  // 3. Data (payloadLen bytes)
  chunkData.copy(chunk, 8)
  // 4. CRC32 over Type + Data
  const crcBytes = Buffer.concat([chunkType, chunkData])
  const crc = computeCrc32(crcBytes)
  chunk.writeUInt32BE(crc, 8 + payloadLen)

  return chunk
}

/**
 * Injects XMP packet into a PNG buffer losslessly without touching pixel data.
 */
export function injectXmpIntoPng(pngBuffer: Buffer, xmpXml: string): Buffer {
  if (!isPngBuffer(pngBuffer)) {
    throw new Error('Not a valid PNG buffer')
  }

  const newChunk = createPngXmpChunk(xmpXml)
  const chunks: Buffer[] = []
  chunks.push(pngBuffer.subarray(0, 8)) // Signature

  let offset = 8
  let ihdrFound = false
  let inserted = false

  while (offset < pngBuffer.length) {
    if (offset + 8 > pngBuffer.length) break
    const length = pngBuffer.readUInt32BE(offset)
    const type = pngBuffer.toString('ascii', offset + 4, offset + 8)
    const totalChunkLength = 4 + 4 + length + 4

    if (offset + totalChunkLength > pngBuffer.length) {
      break
    }

    const currentChunk = pngBuffer.subarray(offset, offset + totalChunkLength)

    // Check if this is an existing XMP iTXt chunk; if so, skip it (we will replace it)
    let isExistingXmp = false
    if (type === 'iTXt' && length >= PNG_ITXT_KEYWORD.length + 1) {
      const kw = currentChunk.subarray(8, 8 + PNG_ITXT_KEYWORD.length).toString('utf8')
      if (kw === PNG_ITXT_KEYWORD) {
        isExistingXmp = true
      }
    }

    if (!isExistingXmp) {
      chunks.push(currentChunk)
    }

    if (type === 'IHDR') {
      ihdrFound = true
      // Insert new XMP chunk right after IHDR
      chunks.push(newChunk)
      inserted = true
    }

    offset += totalChunkLength
  }

  if (!inserted && ihdrFound) {
    chunks.splice(2, 0, newChunk)
  }

  return Buffer.concat(chunks)
}

/**
 * Extracts XMP packet from a PNG buffer.
 */
export function extractXmpFromPng(pngBuffer: Buffer): string | null {
  if (!isPngBuffer(pngBuffer)) return null

  let offset = 8
  while (offset < pngBuffer.length) {
    if (offset + 8 > pngBuffer.length) break
    const length = pngBuffer.readUInt32BE(offset)
    const type = pngBuffer.toString('ascii', offset + 4, offset + 8)
    const totalChunkLength = 4 + 4 + length + 4

    if (offset + totalChunkLength > pngBuffer.length) break

    if (type === 'iTXt') {
      const data = pngBuffer.subarray(offset + 8, offset + 8 + length)
      const nullIdx = data.indexOf(0)
      if (nullIdx !== -1) {
        const keyword = data.subarray(0, nullIdx).toString('utf8')
        if (keyword === PNG_ITXT_KEYWORD) {
          // Find the 5 header bytes after keyword: null, flag, method, null, null
          let textStart = nullIdx + 1 + 2
          // Skip lang tag
          while (textStart < data.length && data[textStart] !== 0) textStart++
          textStart++ // skip null
          // Skip translated keyword
          while (textStart < data.length && data[textStart] !== 0) textStart++
          textStart++ // skip null

          if (textStart <= data.length) {
            return data.subarray(textStart).toString('utf8')
          }
        }
      }
    }

    offset += totalChunkLength
  }

  return null
}
