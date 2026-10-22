/**
 * JPEG Zero-Reencode Segment Injector and Extractor for ISO XMP (APP1 marker)
 */

import { JPEG_APP1_XMP_SIGNATURE } from './constants.js'

export function isJpegBuffer(buffer: Buffer): boolean {
  if (buffer.length < 4) return false
  return buffer[0] === 0xff && buffer[1] === 0xd8
}

/**
 * Creates a raw JPEG APP1 segment containing the XMP packet.
 */
export function createJpegXmpSegment(xmpXml: string): Buffer {
  const sig = Buffer.from(JPEG_APP1_XMP_SIGNATURE, 'ascii')
  const xmpBytes = Buffer.from(xmpXml, 'utf8')

  const payloadLen = sig.length + xmpBytes.length
  const segmentLen = 2 + payloadLen // includes the 2 bytes of length itself

  if (segmentLen > 0xffff) {
    throw new Error('XMP packet exceeds maximum JPEG segment size of 65535 bytes')
  }

  const segment = Buffer.alloc(2 + segmentLen)
  // 1. Marker: 0xFF 0xE1
  segment[0] = 0xff
  segment[1] = 0xe1
  // 2. Length (2 bytes, big endian)
  segment.writeUInt16BE(segmentLen, 2)
  // 3. Signature: "http://ns.adobe.com/xap/1.0/\0"
  sig.copy(segment, 4)
  // 4. XMP XML data
  xmpBytes.copy(segment, 4 + sig.length)

  return segment
}

/**
 * Injects XMP packet into a JPEG buffer losslessly without touching compressed DCT scan data.
 */
export function injectXmpIntoJpeg(jpegBuffer: Buffer, xmpXml: string): Buffer {
  if (!isJpegBuffer(jpegBuffer)) {
    throw new Error('Not a valid JPEG buffer')
  }

  const newSegment = createJpegXmpSegment(xmpXml)
  const segments: Buffer[] = []
  segments.push(jpegBuffer.subarray(0, 2)) // SOI (0xFF, 0xD8)

  let offset = 2
  let inserted = false

  while (offset < jpegBuffer.length) {
    if (jpegBuffer[offset] !== 0xff) {
      // Something unexpected, or raw entropy data (SOS)
      segments.push(jpegBuffer.subarray(offset))
      break
    }

    const marker = jpegBuffer[offset + 1]
    if (marker === 0xd9) {
      // EOI (End of Image)
      segments.push(jpegBuffer.subarray(offset))
      break
    }

    if (marker === 0xda) {
      // SOS (Start of Scan) - entropy scan follows
      if (!inserted) {
        segments.push(newSegment)
        inserted = true
      }
      segments.push(jpegBuffer.subarray(offset))
      break
    }

    // Variable length marker
    if (offset + 4 > jpegBuffer.length) {
      segments.push(jpegBuffer.subarray(offset))
      break
    }

    const segmentLen = jpegBuffer.readUInt16BE(offset + 2)
    const fullLen = 2 + segmentLen

    if (offset + fullLen > jpegBuffer.length) {
      segments.push(jpegBuffer.subarray(offset))
      break
    }

    // Check if this is an existing XMP APP1 segment
    let isExistingXmp = false
    if (marker === 0xe1 && segmentLen >= 2 + JPEG_APP1_XMP_SIGNATURE.length) {
      const sig = jpegBuffer.subarray(offset + 4, offset + 4 + JPEG_APP1_XMP_SIGNATURE.length).toString('ascii')
      if (sig === JPEG_APP1_XMP_SIGNATURE) {
        isExistingXmp = true
      }
    }

    if (!isExistingXmp) {
      segments.push(jpegBuffer.subarray(offset, offset + fullLen))
    }

    // If marker was APP0 (JFIF), insert our APP1 right after APP0
    if (marker === 0xe0 && !inserted) {
      segments.push(newSegment)
      inserted = true
    }

    offset += fullLen
  }

  if (!inserted) {
    // Insert right after SOI
    segments.splice(1, 0, newSegment)
  }

  return Buffer.concat(segments)
}

/**
 * Extracts XMP packet from a JPEG buffer.
 */
export function extractXmpFromJpeg(jpegBuffer: Buffer): string | null {
  if (!isJpegBuffer(jpegBuffer)) return null

  let offset = 2
  while (offset < jpegBuffer.length) {
    if (jpegBuffer[offset] !== 0xff) break
    const marker = jpegBuffer[offset + 1]

    if (marker === 0xd9 || marker === 0xda) break

    if (offset + 4 > jpegBuffer.length) break
    const segmentLen = jpegBuffer.readUInt16BE(offset + 2)
    const fullLen = 2 + segmentLen

    if (offset + fullLen > jpegBuffer.length) break

    if (marker === 0xe1 && segmentLen >= 2 + JPEG_APP1_XMP_SIGNATURE.length) {
      const sig = jpegBuffer.subarray(offset + 4, offset + 4 + JPEG_APP1_XMP_SIGNATURE.length).toString('ascii')
      if (sig === JPEG_APP1_XMP_SIGNATURE) {
        const xmpBytes = jpegBuffer.subarray(offset + 4 + JPEG_APP1_XMP_SIGNATURE.length, offset + fullLen)
        return xmpBytes.toString('utf8')
      }
    }

    offset += fullLen
  }

  return null
}
