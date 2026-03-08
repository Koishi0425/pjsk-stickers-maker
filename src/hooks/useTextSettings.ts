// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useCallback, useEffect } from 'react'
import characters from '../characters.json'
import { Character, TextSettings, FontKey } from '../types'

const DEFAULT_FONT_KEY: FontKey = 'yuruka'
const CANVAS_WIDTH = 296
const CANVAS_HEIGHT = 256
const MAX_TEXT_WIDTH_RATIO = 0.9 // 文字最多占画布宽度的90%
const MAX_TEXT_HEIGHT_RATIO = 0.85 // 文字最多占画布高度的85%

// Type assertion for characters.json
const typedCharacters = characters as Character[]

/**
 * Hook for managing all text styling properties
 */
export function useTextSettings(character: number): TextSettings {
  const [text, setText] = useState<string>(typedCharacters[character].defaultText.text || '请输入文本')
  const [fontSize, setFontSize] = useState<number>(typedCharacters[character].defaultText.s)
  const [userSetFontSize, setUserSetFontSize] = useState<number>(typedCharacters[character].defaultText.s) // 用户设置的字号
  const [fontKey, setFontKey] = useState<FontKey>(DEFAULT_FONT_KEY)
  const [rotate, setRotate] = useState<number>(typedCharacters[character].defaultText.r)
  const [spaceSize, setSpaceSize] = useState<number>(25)
  const [letterSpacing, setLetterSpacing] = useState<number>(0)
  const [curve, setCurve] = useState<boolean>(false)
  const [vertical, setVertical] = useState<boolean>(false)
  const [textBehind, setTextBehind] = useState<boolean>(false)

  /**
   * 计算文字实际尺寸并自动调整字号
   */
  const calculateAndAdjustFontSize = useCallback(() => {
    if (!text || text.trim() === '') return

    // 创建临时 canvas 来测量文字
    const tempCanvas = document.createElement('canvas')
    const ctx = tempCanvas.getContext('2d')
    if (!ctx) return

    const fontStack: Record<FontKey, string> = {
      yuruka: 'YurukaStd, SSFangTangTi, sans-serif',
      fangtang: 'SSFangTangTi, sans-serif',
      system: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    }

    let adjustedFontSize = userSetFontSize
    const lines = text.split('\n')
    const maxLines = lines.length

    // 最多尝试调整10次
    for (let attempt = 0; attempt < 10; attempt++) {
      ctx.font = `${adjustedFontSize}px ${fontStack[fontKey]}`

      let exceedsWidth = false
      let exceedsHeight = false

      if (vertical) {
        // 竖排文字：检查高度和宽度
        const letterStep = adjustedFontSize + letterSpacing
        const lineStep = adjustedFontSize + spaceSize - 40
        const maxLineLength = Math.max(...lines.map(line => line.length))

        const totalHeight = maxLineLength * letterStep
        const totalWidth = maxLines * lineStep

        if (totalHeight > CANVAS_HEIGHT * MAX_TEXT_HEIGHT_RATIO) exceedsHeight = true
        if (totalWidth > CANVAS_WIDTH * MAX_TEXT_WIDTH_RATIO) exceedsWidth = true
      } else if (curve) {
        // 弧形文字：简化检查（弧形比较复杂，保守估计）
        const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / maxLines
        if (avgLineLength > 15) exceedsWidth = true // 弧形文字超过15个字就可能溢出
      } else {
        // 横排文字：检查每行宽度和总高度
        for (const line of lines) {
          let lineWidth = 0
          if (letterSpacing === 0) {
            lineWidth = ctx.measureText(line).width
          } else {
            for (let j = 0; j < line.length; j++) {
              lineWidth += ctx.measureText(line[j]).width + letterSpacing
            }
            lineWidth -= letterSpacing // 最后一个字不加间距
          }

          if (lineWidth > CANVAS_WIDTH * MAX_TEXT_WIDTH_RATIO) {
            exceedsWidth = true
            break
          }
        }

        const totalHeight = (maxLines - 1) * spaceSize + adjustedFontSize
        if (totalHeight > CANVAS_HEIGHT * MAX_TEXT_HEIGHT_RATIO) {
          exceedsHeight = true
        }
      }

      // 如果没有超出，使用这个字号
      if (!exceedsWidth && !exceedsHeight) {
        break
      }

      // 超出了，缩小字号
      adjustedFontSize = Math.max(10, adjustedFontSize - 2) // 最小10px

      // 如果已经到最小字号了，退出
      if (adjustedFontSize === 10) break
    }

    // 只有当计算出的字号小于用户设置的字号时才自动调整
    if (adjustedFontSize < userSetFontSize) {
      setFontSize(adjustedFontSize)
    } else {
      setFontSize(userSetFontSize)
    }
  }, [text, userSetFontSize, fontKey, letterSpacing, spaceSize, vertical, curve])

  // 监听文字内容、字间距、行间距、排版方式变化，自动调整字号
  useEffect(() => {
    calculateAndAdjustFontSize()
  }, [text, userSetFontSize, letterSpacing, spaceSize, vertical, curve, calculateAndAdjustFontSize])

  // 包装 setFontSize，记录用户手动设置的字号
  const handleSetFontSize = useCallback((size: number) => {
    setUserSetFontSize(size)
    setFontSize(size)
  }, [])

  const resetTextSettings = useCallback(
    (currentCharacter: number): void => {
      const char = typedCharacters[currentCharacter]
      setText(char.defaultText.text || '请输入文本')
      const defaultSize = char.defaultText.s
      setFontSize(defaultSize)
      setUserSetFontSize(defaultSize)
      setRotate(char.defaultText.r)
      setSpaceSize(25)
      setLetterSpacing(0)
      setCurve(false)
      setVertical(false)
      setFontKey(DEFAULT_FONT_KEY)
      setTextBehind(false)
    },
    []
  )

  return {
    text,
    setText,
    fontSize,
    setFontSize: handleSetFontSize,
    fontKey,
    setFontKey,
    rotate,
    setRotate,
    spaceSize,
    setSpaceSize,
    letterSpacing,
    setLetterSpacing,
    curve,
    setCurve,
    vertical,
    setVertical,
    textBehind,
    setTextBehind,
    resetTextSettings,
  }
}
