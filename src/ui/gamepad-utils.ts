/**
 * 手柄按键别名与组合键工具
 */

export const BUTTON_NAME_MAP: Record<string, { label: string; name: string }> = {
  Button0: { label: 'Button0', name: 'A / ✕' },
  Button1: { label: 'Button1', name: 'B / ○' },
  Button2: { label: 'Button2', name: 'X / □' },
  Button3: { label: 'Button3', name: 'Y / △' },
  Button4: { label: 'Button4', name: 'LB / L1' },
  Button5: { label: 'Button5', name: 'RB / R1' },
  Button6: { label: 'Button6', name: 'LT / L2' },
  Button7: { label: 'Button7', name: 'RT / R2' },
  Button8: { label: 'Button8', name: 'Back / Share' },
  Button9: { label: 'Button9', name: 'Start / Options' },
  Button10: { label: 'Button10', name: 'L3 (左摇杆下压)' },
  Button11: { label: 'Button11', name: 'R3 (右摇杆下压)' },
  Button12: { label: 'Button12', name: '十字键 ↑' },
  Button13: { label: 'Button13', name: '十字键 ↓' },
  Button14: { label: 'Button14', name: '十字键 ←' },
  Button15: { label: 'Button15', name: '十字键 →' },
  Button16: { label: 'Button16', name: 'Home / 指南键' },
}

export function formatGamepadKey(key: string, locale: 'zh' | 'en' = 'zh'): { key: string; name: string } {
  if (BUTTON_NAME_MAP[key]) {
    return {
      key,
      name: BUTTON_NAME_MAP[key].name,
    }
  }
  const axisMatch = key.match(/^Axis\s*(\d+)\s*([+-])$/i)
  if (axisMatch) {
    const num = axisMatch[1]
    const dir = axisMatch[2]
    return {
      key,
      name: locale === 'zh' ? `摇杆轴 Axis ${num} (${dir})` : `Stick Axis ${num} (${dir})`,
    }
  }
  return { key, name: key }
}

export const COMMON_COMBO_PRESETS = [
  { labelZh: '双肩键 (LB + RB)', labelEn: 'Bumpers (LB + RB)', keys: ['Button4', 'Button5'] },
  { labelZh: '双扳机 (LT + RT)', labelEn: 'Triggers (LT + RT)', keys: ['Button6', 'Button7'] },
  { labelZh: '肩键 + A键 (LB + A)', labelEn: 'Bumper + A (LB + A)', keys: ['Button4', 'Button0'] },
  { labelZh: '双摇杆下压 (L3 + R3)', labelEn: 'Thumbsticks (L3 + R3)', keys: ['Button10', 'Button11'] },
  { labelZh: '截图专属键 (Share)', labelEn: 'Share Button', keys: ['Button8'] },
  { labelZh: '主触发键 (A / ✕)', labelEn: 'Button A / ✕', keys: ['Button0'] },
]
