import type {
  ControllerDetectionResult,
  ControllerFamily,
  ControllerModel,
  GamepadSourceDeviceInfo,
} from '../types.js'
import { extractVidPidFromGuid } from '../db/parser.js'
import {
  VENDOR_MICROSOFT,
  VENDOR_SONY,
  VENDOR_NINTENDO,
  VENDOR_8BITDO,
  VENDOR_BEITONG,
  VENDOR_HORI,
  VENDOR_PXN,
  VENDOR_SHANWAN,
  SONY_PIDS,
  MICROSOFT_PIDS,
  NINTENDO_PIDS,
  DOMESTIC_BRAND_PATTERNS,
} from './vendor-ids.js'

/**
 * Detects controller family, model, brand, and confidence from device metadata.
 */
export function detectController(device: GamepadSourceDeviceInfo | null | undefined): ControllerDetectionResult {
  if (!device) {
    return {
      family: 'generic',
      model: 'generic',
      confidence: 'fallback',
      displayName: '未连接手柄 (No Gamepad)',
      brandLabel: 'Generic',
      hasMapping: false,
      isDomestic: false,
    }
  }

  const name = (device.name || '').trim()
  const guid = device.guid || ''

  // 1. Resolve Vendor ID & Product ID
  let vendorId = device.vendorId
  let productId = device.productId

  if ((vendorId === undefined || productId === undefined) && guid) {
    const extracted = extractVidPidFromGuid(guid)
    if (extracted.vendorId !== undefined) vendorId = extracted.vendorId
    if (extracted.productId !== undefined) productId = extracted.productId
  }

  // 2. Exact Vendor & Product ID Match: Sony
  if (vendorId === VENDOR_SONY) {
    if (productId !== undefined && SONY_PIDS[productId]) {
      const info = SONY_PIDS[productId]
      return {
        family: 'playstation',
        model: info.model,
        confidence: 'exact',
        displayName: info.name,
        brandLabel: 'Sony PlayStation',
        vendorId,
        productId,
        guid,
        hasMapping: Boolean(device.mapping),
        isDomestic: false,
      }
    }
    // Generic Sony
    const isPs5 = /dualsense|ps5/i.test(name)
    const isPs4 = /dualshock\s*4|ps4/i.test(name)
    return {
      family: 'playstation',
      model: isPs5 ? 'ps5' : isPs4 ? 'ps4' : 'ps5',
      confidence: 'vendor',
      displayName: name || 'PlayStation Controller',
      brandLabel: 'Sony PlayStation',
      vendorId,
      productId,
      guid,
      hasMapping: Boolean(device.mapping),
      isDomestic: false,
    }
  }

  // 3. Exact Vendor & Product ID Match: Microsoft Xbox
  if (vendorId === VENDOR_MICROSOFT) {
    if (productId !== undefined && MICROSOFT_PIDS[productId]) {
      const info = MICROSOFT_PIDS[productId]
      return {
        family: 'xbox',
        model: info.model,
        confidence: 'exact',
        displayName: info.name,
        brandLabel: 'Microsoft Xbox',
        vendorId,
        productId,
        guid,
        hasMapping: Boolean(device.mapping),
        isDomestic: false,
      }
    }
    // Generic Microsoft Xbox
    return {
      family: 'xbox',
      model: 'xboxSeries',
      confidence: 'vendor',
      displayName: name || 'Xbox Controller',
      brandLabel: 'Microsoft Xbox',
      vendorId,
      productId,
      guid,
      hasMapping: Boolean(device.mapping),
      isDomestic: false,
    }
  }

  // 4. Exact Vendor & Product ID Match: Nintendo
  if (vendorId === VENDOR_NINTENDO) {
    if (productId !== undefined && NINTENDO_PIDS[productId]) {
      const info = NINTENDO_PIDS[productId]
      return {
        family: 'nintendo',
        model: info.model,
        confidence: 'exact',
        displayName: info.name,
        brandLabel: 'Nintendo Switch',
        vendorId,
        productId,
        guid,
        hasMapping: Boolean(device.mapping),
        isDomestic: false,
      }
    }
    return {
      family: 'nintendo',
      model: 'switchPro',
      confidence: 'vendor',
      displayName: name || 'Nintendo Switch Controller',
      brandLabel: 'Nintendo Switch',
      vendorId,
      productId,
      guid,
      hasMapping: Boolean(device.mapping),
      isDomestic: false,
    }
  }

  // 5. Domestic Brands by Known Vendor ID
  if (vendorId === VENDOR_8BITDO || vendorId === VENDOR_BEITONG || vendorId === VENDOR_PXN || vendorId === VENDOR_SHANWAN) {
    const brandName =
      vendorId === VENDOR_8BITDO
        ? '8BitDo 八位堂'
        : vendorId === VENDOR_BEITONG
        ? 'Beitong 北通'
        : vendorId === VENDOR_PXN
        ? 'PXN 莱仕达'
        : 'ShanWan'

    const isSwitch = /switch/i.test(name)
    const isPs = /playstation|ps[345]/i.test(name)

    return {
      family: isSwitch ? 'nintendo' : isPs ? 'playstation' : 'xbox',
      model: 'domestic',
      confidence: 'vendor',
      displayName: name || `${brandName} Controller`,
      brandLabel: brandName,
      vendorId,
      productId,
      guid,
      hasMapping: Boolean(device.mapping),
      isDomestic: true,
    }
  }

  // 6. Name Inspection Heuristics (including Domestic Brands)
  for (const { pattern, brand } of DOMESTIC_BRAND_PATTERNS) {
    if (pattern.test(name)) {
      const isSwitch = /switch/i.test(name)
      const isPs = /playstation|ps[345]/i.test(name)
      return {
        family: isSwitch ? 'nintendo' : isPs ? 'playstation' : 'xbox',
        model: 'domestic',
        confidence: 'name',
        displayName: name,
        brandLabel: brand,
        vendorId,
        productId,
        guid,
        hasMapping: Boolean(device.mapping),
        isDomestic: true,
      }
    }
  }

  // Name Inspection for First-Party Families
  if (/dualsense|dualshock|playstation|ps[345]|sony/i.test(name)) {
    const isPs5 = /dualsense|ps5/i.test(name)
    return {
      family: 'playstation',
      model: isPs5 ? 'ps5' : 'ps4',
      confidence: 'name',
      displayName: name || 'PlayStation Controller',
      brandLabel: 'Sony PlayStation',
      vendorId,
      productId,
      guid,
      hasMapping: Boolean(device.mapping),
      isDomestic: false,
    }
  }

  if (/switch pro|joy-con|joycon|nintendo/i.test(name)) {
    return {
      family: 'nintendo',
      model: 'switchPro',
      confidence: 'name',
      displayName: name || 'Nintendo Switch Pro Controller',
      brandLabel: 'Nintendo Switch',
      vendorId,
      productId,
      guid,
      hasMapping: Boolean(device.mapping),
      isDomestic: false,
    }
  }

  if (/xbox|x-box|xinput|microsoft/i.test(name)) {
    return {
      family: 'xbox',
      model: 'xboxSeries',
      confidence: 'name',
      displayName: name || 'Xbox Compatible Controller',
      brandLabel: 'Microsoft Xbox',
      vendorId,
      productId,
      guid,
      hasMapping: Boolean(device.mapping),
      isDomestic: false,
    }
  }

  // 7. SDL Device Type Tag Fallback
  if (device.type) {
    const t = device.type.toLowerCase()
    if (t.includes('ps5') || t.includes('ps4') || t.includes('ps3')) {
      return {
        family: 'playstation',
        model: t.includes('ps5') ? 'ps5' : 'ps4',
        confidence: 'vendor',
        displayName: name || 'PlayStation Controller',
        brandLabel: 'Sony PlayStation',
        vendorId,
        productId,
        guid,
        hasMapping: Boolean(device.mapping),
        isDomestic: false,
      }
    }
    if (t.includes('nintendo') || t.includes('switch')) {
      return {
        family: 'nintendo',
        model: 'switchPro',
        confidence: 'vendor',
        displayName: name || 'Nintendo Switch Controller',
        brandLabel: 'Nintendo Switch',
        vendorId,
        productId,
        guid,
        hasMapping: Boolean(device.mapping),
        isDomestic: false,
      }
    }
    if (t.includes('xbox')) {
      return {
        family: 'xbox',
        model: 'xboxSeries',
        confidence: 'vendor',
        displayName: name || 'Xbox Controller',
        brandLabel: 'Microsoft Xbox',
        vendorId,
        productId,
        guid,
        hasMapping: Boolean(device.mapping),
        isDomestic: false,
      }
    }
  }

  // 8. General Third-Party / Domestic Fallback to Xbox Shape
  return {
    family: 'xbox',
    model: 'generic',
    confidence: 'fallback',
    displayName: name || '通用游戏手柄 (Generic Gamepad)',
    brandLabel: '通用 / 国产手柄 (Xbox 模式)',
    vendorId,
    productId,
    guid,
    hasMapping: Boolean(device.mapping),
    isDomestic: true,
  }
}
