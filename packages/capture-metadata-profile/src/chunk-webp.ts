/**
 * WebP RIFF Chunk Injector and Extractor for ISO XMP ('XMP ' chunk)
 */

export function isWebpBuffer(buffer: Buffer): boolean {
  if (buffer.length < 12) return false
  return (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  )
}

/**
 * Extracts XMP packet from a WebP buffer.
 */
export function extractXmpFromWebp(webpBuffer: Buffer): string | null {
  if (!isWebpBuffer(webpBuffer)) return null

  let offset = 12
  while (offset + 8 <= webpBuffer.length) {
    const fourCC = webpBuffer.toString('ascii', offset, offset + 4)
    const chunkSize = webpBuffer.readUInt32LE(offset + 4)
    const paddedSize = chunkSize + (chunkSize % 2)

    if (offset + 8 + chunkSize > webpBuffer.length) break

    if (fourCC === 'XMP ') {
      return webpBuffer.subarray(offset + 8, offset + 8 + chunkSize).toString('utf8')
    }

    offset += 8 + paddedSize
  }

  return null
}

/**
 * Creates a raw WebP XMP chunk.
 */
export function createWebpXmpChunk(xmpXml: string): Buffer {
  const xmpBytes = Buffer.from(xmpXml, 'utf8')
  const chunkSize = xmpBytes.length
  const paddedSize = chunkSize + (chunkSize % 2)
  const chunk = Buffer.alloc(8 + paddedSize)

  chunk.write('XMP ', 0, 4, 'ascii')
  chunk.writeUInt32LE(chunkSize, 4)
  xmpBytes.copy(chunk, 8)
  if (chunkSize % 2 !== 0) {
    chunk[8 + chunkSize] = 0 // padding byte
  }

  return chunk
}

/**
 * Injects XMP packet into a WebP buffer.
 */
export function injectXmpIntoWebp(webpBuffer: Buffer, xmpXml: string): Buffer {
  if (!isWebpBuffer(webpBuffer)) {
    throw new Error('Not a valid WebP buffer')
  }

  const xmpChunk = createWebpXmpChunk(xmpXml)
  const chunks: { fourCC: string; buf: Buffer }[] = []

  let offset = 12
  let vp8xIndex = -1

  while (offset + 8 <= webpBuffer.length) {
    const fourCC = webpBuffer.toString('ascii', offset, offset + 4)
    const chunkSize = webpBuffer.readUInt32LE(offset + 4)
    const paddedSize = chunkSize + (chunkSize % 2)
    const totalChunkBytes = 8 + paddedSize

    if (offset + totalChunkBytes > webpBuffer.length) {
      chunks.push({ fourCC: 'RAW', buf: webpBuffer.subarray(offset) })
      break
    }

    const chunkData = webpBuffer.subarray(offset, offset + totalChunkBytes)

    if (fourCC === 'VP8X') {
      vp8xIndex = chunks.length
      // Set the XMP flag (bit 2, value 4) in the VP8X header (byte 8 is start of payload)
      const vp8xCopy = Buffer.from(chunkData)
      vp8xCopy[8] = vp8xCopy[8] | 0x04 // set XMP bit
      chunks.push({ fourCC, buf: vp8xCopy })
    } else if (fourCC !== 'XMP ') {
      // Retain all non-XMP chunks (skip existing XMP)
      chunks.push({ fourCC, buf: chunkData })
    }

    offset += totalChunkBytes
  }

  // If there's already a VP8X chunk, append the XMP chunk at the end
  if (vp8xIndex !== -1) {
    chunks.push({ fourCC: 'XMP ', buf: xmpChunk })
  } else {
    // Basic WebP (VP8 or VP8L without VP8X). Insert VP8X at the beginning if possible or append.
    // For universal compatibility, append XMP chunk.
    chunks.push({ fourCC: 'XMP ', buf: xmpChunk })
  }

  const payloadBuffers = chunks.map((c) => c.buf)
  const totalPayloadSize = payloadBuffers.reduce((sum, b) => sum + b.length, 0)

  // Construct final RIFF container
  const header = Buffer.alloc(12)
  header.write('RIFF', 0, 4, 'ascii')
  header.writeUInt32LE(4 + totalPayloadSize, 4) // 4 for 'WEBP' + all chunk sizes
  header.write('WEBP', 8, 4, 'ascii')

  return Buffer.concat([header, ...payloadBuffers])
}
