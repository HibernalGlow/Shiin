/**
 * Known Vendor IDs (VID) & Product IDs (PID) for Gamepads
 */

export const VENDOR_MICROSOFT = 0x045e
export const VENDOR_SONY = 0x054c
export const VENDOR_NINTENDO = 0x057e

// Major Third-Party & Domestic Brands
export const VENDOR_8BITDO = 0x2dc8
export const VENDOR_BEITONG = 0x20bc
export const VENDOR_HORI = 0x0f0d
export const VENDOR_LOGITECH = 0x046d
export const VENDOR_RAZER = 0x1532
export const VENDOR_STEELSERIES = 0x1038
export const VENDOR_POWERA = 0x24c6
export const VENDOR_PDP = 0x0e6f
export const VENDOR_PXN = 0x0e8f
export const VENDOR_SHANWAN = 0x2563

/**
 * Sony PlayStation Product IDs
 */
export const SONY_PIDS: Record<number, { model: 'ps5' | 'ps4' | 'ps3'; name: string }> = {
  // DualSense & Edge (PS5)
  0x0ce6: { model: 'ps5', name: 'DualSense Wireless Controller' },
  0x0df2: { model: 'ps5', name: 'DualSense Edge Wireless Controller' },

  // DualShock 4 (PS4)
  0x05c4: { model: 'ps4', name: 'DualShock 4 Wireless Controller (Gen 1)' },
  0x09cc: { model: 'ps4', name: 'DualShock 4 Wireless Controller (Gen 2)' },
  0x0ba0: { model: 'ps4', name: 'DualShock 4 USB Wireless Adaptor' },

  // DualShock 3 (PS3)
  0x0268: { model: 'ps3', name: 'PlayStation 3 Controller' },
}

/**
 * Microsoft Xbox Product IDs
 */
export const MICROSOFT_PIDS: Record<number, { model: 'xboxSeries' | 'xboxOne' | 'xbox360' | 'xboxElite'; name: string }> = {
  // Xbox Series X/S
  0x0b12: { model: 'xboxSeries', name: 'Xbox Wireless Controller (Series X/S BLE)' },
  0x0b13: { model: 'xboxSeries', name: 'Xbox Wireless Controller (Series X/S USB)' },

  // Xbox Elite Series 2
  0x0b00: { model: 'xboxElite', name: 'Xbox Elite Wireless Controller Series 2 (USB)' },
  0x0b05: { model: 'xboxElite', name: 'Xbox Elite Wireless Controller Series 2 (BLE)' },

  // Xbox One
  0x02d1: { model: 'xboxOne', name: 'Xbox One Controller' },
  0x02dd: { model: 'xboxOne', name: 'Xbox One Controller (Covert Forces)' },
  0x02e3: { model: 'xboxElite', name: 'Xbox One Elite Controller' },
  0x02ea: { model: 'xboxOne', name: 'Xbox One S Controller (USB)' },
  0x02fd: { model: 'xboxOne', name: 'Xbox One S Controller (BLE)' },

  // Xbox 360
  0x028e: { model: 'xbox360', name: 'Xbox 360 Controller' },
  0x028f: { model: 'xbox360', name: 'Xbox 360 Wireless Controller' },
  0x0719: { model: 'xbox360', name: 'Xbox 360 Wireless Receiver' },
}

/**
 * Nintendo Product IDs
 */
export const NINTENDO_PIDS: Record<number, { model: 'switchPro' | 'joyconLeft' | 'joyconRight' | 'joyconGrip'; name: string }> = {
  0x2009: { model: 'switchPro', name: 'Nintendo Switch Pro Controller' },
  0x2006: { model: 'joyconLeft', name: 'Nintendo Switch Joy-Con (L)' },
  0x2007: { model: 'joyconRight', name: 'Nintendo Switch Joy-Con (R)' },
  0x200e: { model: 'joyconGrip', name: 'Nintendo Switch Joy-Con Grip' },
}

/**
 * Known Domestic Brands & Patterns
 */
export const DOMESTIC_BRAND_PATTERNS = [
  { pattern: /8bitdo|八位堂/i, brand: '8BitDo 八位堂' },
  { pattern: /beitong|betop|北通/i, brand: 'Beitong 北通' },
  { pattern: /flydigi|飞智/i, brand: 'Flydigi 飞智' },
  { pattern: /gamesir|盖世小鸡|小鸡/i, brand: 'GameSir 盖世小鸡' },
  { pattern: /machenike|机械师/i, brand: 'Machenike 机械师' },
  { pattern: /gulikit|谷粒/i, brand: 'GuliKit 谷粒' },
  { pattern: /thunderobot|雷神/i, brand: 'Thunderobot 雷神' },
  { pattern: /pxn|莱仕达/i, brand: 'PXN 莱仕达' },
  { pattern: /easysmx/i, brand: 'EasySMX' },
  { pattern: /dobe/i, brand: 'DOBE' },
  { pattern: /ipega/i, brand: 'iPega' },
]
