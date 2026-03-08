// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * Desaturate a color and reduce its lightness for background usage
 * @param hex - Hex color code (e.g., "#cf93d9")
 * @returns Desaturated hex color code
 */
export function desaturateColor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)

  const max = Math.max(r, g, b) / 255
  const min = Math.min(r, g, b) / 255
  let h: number,
    s: number,
    l = (max + min) / 2

  if (max === min) {
    h = s = 0
  } else {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

    if (max === r / 255) h = (g / 255 - b / 255) / d + (g < b ? 6 : 0)
    else if (max === g / 255) h = (b / 255 - r / 255) / d + 2
    else h = (r / 255 - g / 255) / d + 4
    h /= 6
  }

  s *= 0.15
  l = Math.max(0.12, l * 0.3)

  const hue2rgb = (p: number, q: number, t: number): number => {
    if (t < 0) t += 1
    if (t > 1) t -= 1
    if (t < 1 / 6) return p + (q - p) * 6 * t
    if (t < 1 / 2) return q
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
    return p
  }

  const q = l < 0.5 ? l * (1 + s) : l + s - l * s
  const p = 2 * l - q

  const r2 = Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
  const g2 = Math.round(hue2rgb(p, q, h) * 255)
  const b2 = Math.round(hue2rgb(p, q, h - 1 / 3) * 255)

  return `#${r2.toString(16).padStart(2, '0')}${g2.toString(16).padStart(2, '0')}${b2.toString(16).padStart(2, '0')}`
}
