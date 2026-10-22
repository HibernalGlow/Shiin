import { describe, it, expect } from 'vitest'
import {
  parseSdlMappingLine,
  extractVidPidFromGuid,
  findSdlMapping,
  mapSdlToStandard,
  mapStandardHardware,
  detectController,
  createEmptyGamepadState,
} from '../packages/gamepad-expressive/src/index.js'

describe('Gamepad Expressive — SDL Mapping Database & Parser', () => {
  it('parses standard SDL_GameControllerDB mapping lines', () => {
    const line =
      '030000005e040000120b000000010000,Xbox Wireless Controller,a:b0,b:b1,back:b6,dpdown:h0.4,dpleft:h0.8,dpright:h0.2,dpup:h0.1,guide:b10,leftshoulder:b4,leftstick:b8,lefttrigger:a2,leftx:a0,lefty:a1,rightshoulder:b5,rightstick:b9,righttrigger:a5,rightx:a3,righty:a4,start:b7,x:b2,y:b3,platform:Mac OS X,'

    const entry = parseSdlMappingLine(line)
    expect(entry).not.toBeNull()
    expect(entry?.guid).toBe('030000005e040000120b000000010000')
    expect(entry?.name).toBe('Xbox Wireless Controller')
    expect(entry?.platform).toBe('Mac OS X')
    expect(entry?.bindings.a).toBe('b0')
    expect(entry?.bindings.b).toBe('b1')
    expect(entry?.bindings.lefttrigger).toBe('a2')
  })

  it('extracts Vendor ID and Product ID from USB/Bluetooth GUID', () => {
    // 030000005e040000120b000000010000 -> 0x045e, 0x0b12 (Xbox Series)
    const xbox = extractVidPidFromGuid('030000005e040000120b000000010000')
    expect(xbox.vendorId).toBe(0x045e)
    expect(xbox.productId).toBe(0x0b12)

    // 030057564c050000e60c000000016800 -> 0x054c, 0x0ce6 (DualSense)
    const ps5 = extractVidPidFromGuid('030057564c050000e60c000000016800')
    expect(ps5.vendorId).toBe(0x054c)
    expect(ps5.productId).toBe(0x0ce6)
  })

  it('finds mappings in the bundled SDL database by GUID or name', () => {
    const byGuid = findSdlMapping({ guid: '030000005e040000120b000000010000' })
    expect(byGuid).not.toBeNull()
    expect(byGuid?.bindings.a).toBeDefined()

    const byName = findSdlMapping({ name: 'DualSense Wireless Controller' })
    expect(byName).not.toBeNull()
  })
})

describe('Gamepad Expressive — Controller Family Detection Rules', () => {
  it('identifies Sony PlayStation controllers by Vendor ID 0x054c', () => {
    const res = detectController({
      guid: '030057564c050000e60c000000016800',
      vendorId: 0x054c,
      productId: 0x0ce6,
      name: 'Wireless Controller',
    })
    expect(res.family).toBe('playstation')
    expect(res.model).toBe('ps5')
    expect(res.brandLabel).toContain('Sony')
  })

  it('identifies Microsoft Xbox controllers by Vendor ID 0x045e', () => {
    const res = detectController({
      guid: '030000005e040000120b000000010000',
      vendorId: 0x045e,
      productId: 0x0b12,
      name: 'Xbox Wireless Controller',
    })
    expect(res.family).toBe('xbox')
    expect(res.model).toBe('xboxSeries')
    expect(res.brandLabel).toContain('Xbox')
  })

  it('identifies Nintendo controllers by Vendor ID 0x057e', () => {
    const res = detectController({
      vendorId: 0x057e,
      productId: 0x2009,
      name: 'Pro Controller',
    })
    expect(res.family).toBe('nintendo')
    expect(res.model).toBe('switchPro')
    expect(res.brandLabel).toContain('Nintendo')
  })

  it('identifies domestic controllers (8BitDo, Beitong, Flydigi) and routes to Xbox shape by default', () => {
    const beitong = detectController({
      name: 'BETOP BTP-2185X PC/XBOX MODE',
    })
    expect(beitong.family).toBe('xbox')
    expect(beitong.isDomestic).toBe(true)

    const flydigi = detectController({
      name: 'Flydigi Vader 3 Pro (XInput)',
    })
    expect(flydigi.family).toBe('xbox')
    expect(flydigi.isDomestic).toBe(true)

    const eightBitDoSwitch = detectController({
      name: '8BitDo Ultimate Wireless (Switch Mode)',
    })
    expect(eightBitDoSwitch.family).toBe('nintendo')
  })

  it('falls back to Xbox shape for unknown/generic gamepads', () => {
    const unknown = detectController({
      name: 'USB Gamepad Joystick',
    })
    expect(unknown.family).toBe('xbox')
    expect(unknown.confidence).toBe('fallback')
  })
})

describe('Gamepad Expressive — Input Standardization & Position Decoupling', () => {
  it('maps standard hardware layout buttons to physical positions', () => {
    // buttons: [South(A/✕), East(B/○), West(X/□), North(Y/△), L1, R1, L2, R2, ...]
    const rawButtons = new Array(18).fill(false)
    rawButtons[0] = true // South
    rawButtons[4] = true // L1
    rawButtons[6] = true // L2

    const rawAxes = [0.75, -0.25, 0, 0, 0.9, 0.1]

    const state = mapStandardHardware({ buttons: rawButtons, axes: rawAxes })

    expect(state.south).toBe(true)
    expect(state.east).toBe(false)
    expect(state.l1).toBe(true)
    expect(state.l2).toBe(true)
    expect(state.l2Value).toBeCloseTo(0.9, 2)
    expect(state.leftStick.x).toBeCloseTo(0.75, 2)
    expect(state.leftStick.y).toBeCloseTo(-0.25, 2)
  })

  it('maps raw buttons using custom SDL mapping entry', () => {
    // Custom mapping where south button is raw button 2, and east is raw button 1
    const mapping = parseSdlMappingLine(
      '03000000000000000000000000000000,Custom,a:b2,b:b1,leftx:a0,lefty:a1,lefttrigger:a4,'
    )
    expect(mapping).not.toBeNull()

    const rawButtons = [false, true, true, false] // b1=true, b2=true
    const rawAxes = [0.5, -0.5, 0, 0, 0.8]

    const state = mapSdlToStandard({ buttons: rawButtons, axes: rawAxes }, mapping)

    expect(state.south).toBe(true) // mapped from b2
    expect(state.east).toBe(true) // mapped from b1
    expect(state.west).toBe(false)
    expect(state.l2Value).toBeCloseTo(0.8, 2)
    expect(state.leftStick.x).toBeCloseTo(0.5, 2)
  })

  it('handles empty state creation gracefully', () => {
    const empty = createEmptyGamepadState()
    expect(empty.south).toBe(false)
    expect(empty.leftStick.x).toBe(0)
    expect(empty.l2Value).toBe(0)
    expect(empty.rawButtons).toEqual([])
  })
})

describe('Gamepad Expressive — React Visual Components', () => {
  it('renders GamepadButtonIcon with respective platform symbols', async () => {
    const React = await import('react')
    const { renderToString } = await import('react-dom/server')
    const { GamepadButtonIcon } = await import('../packages/gamepad-expressive/src/index.js')

    const xboxA = renderToString(React.createElement(GamepadButtonIcon, { button: 'south', family: 'xbox' }))
    expect(xboxA).toContain('A')
    expect(xboxA).toContain('gp-icon-xbox-a')

    const psCross = renderToString(React.createElement(GamepadButtonIcon, { button: 'south', family: 'playstation' }))
    expect(psCross).toContain('gp-icon-ps-cross')

    const switchB = renderToString(React.createElement(GamepadButtonIcon, { button: 'south', family: 'nintendo' }))
    expect(switchB).toContain('B')
    expect(switchB).toContain('gp-icon-ns-b')
  })

  it('renders ExpressiveGamepad for each of the three major controller families', async () => {
    const React = await import('react')
    const { renderToString } = await import('react-dom/server')
    const { ExpressiveGamepad, createEmptyGamepadState } = await import('../packages/gamepad-expressive/src/index.js')

    const state = createEmptyGamepadState()

    const xboxHtml = renderToString(
      React.createElement(ExpressiveGamepad, { state, family: 'xbox' })
    )
    expect(xboxHtml).toContain('gp-family-xbox')
    expect(xboxHtml).toContain('Xbox')

    const psHtml = renderToString(
      React.createElement(ExpressiveGamepad, { state, family: 'playstation' })
    )
    expect(psHtml).toContain('gp-family-playstation')
    expect(psHtml).toContain('PlayStation')

    const switchHtml = renderToString(
      React.createElement(ExpressiveGamepad, { state, family: 'nintendo' })
    )
    expect(switchHtml).toContain('gp-family-nintendo')
    expect(switchHtml).toContain('Nintendo')
  })

  it('renders ControllerTester card with live telemetry & raw signal inspector toggle', async () => {
    const React = await import('react')
    const { renderToString } = await import('react-dom/server')
    const { ControllerTester } = await import('../packages/gamepad-expressive/src/index.js')

    const html = renderToString(
      React.createElement(ControllerTester, {
        buttons: [true, false, false, false, false, false, true, false],
        axes: [0.3, -0.4, 0, 0, 0.85, 0],
        deviceInfo: {
          id: '0',
          name: 'DualSense Wireless Controller',
          guid: '030057564c050000e60c000000016800',
          vendorId: 0x054c,
          productId: 0x0ce6,
        },
        locale: 'zh',
      })
    )

    expect(html).toContain('DualSense Wireless Controller')
    expect(html).toContain('Sony PlayStation')
    expect(html).toContain('底层硬件原始信号矩阵')
  })
})
