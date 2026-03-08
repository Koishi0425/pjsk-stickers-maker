// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

import { useState, useEffect, useCallback } from 'react'
import { HistoryItem, StickerConfig, HistoryHook } from '../types'

const STORAGE_KEY = 'sekai-stickers-history'
const MAX_HISTORY_ITEMS = 50
const THUMBNAIL_WIDTH = 148 // Half of canvas width for smaller storage
const THUMBNAIL_HEIGHT = 128 // Half of canvas height

/**
 * Hook for managing sticker creation history
 * Stores configuration snapshots with thumbnails in localStorage
 */
export function useHistory(): HistoryHook {
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const items = JSON.parse(stored) as HistoryItem[]
        setHistoryItems(items)
      }
    } catch (error) {
      console.error('Failed to load history:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Save history to localStorage whenever it changes
  const saveToStorage = useCallback((items: HistoryItem[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch (error) {
      console.error('Failed to save history:', error)
      // If storage is full, remove oldest items
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        const reducedItems = items.slice(-25) // Keep only last 25
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reducedItems))
        setHistoryItems(reducedItems)
      }
    }
  }, [])

  /**
   * Generate a thumbnail from canvas
   */
  const generateThumbnail = useCallback((canvas: HTMLCanvasElement): string => {
    const thumbnailCanvas = document.createElement('canvas')
    thumbnailCanvas.width = THUMBNAIL_WIDTH
    thumbnailCanvas.height = THUMBNAIL_HEIGHT

    const ctx = thumbnailCanvas.getContext('2d')
    if (!ctx) return ''

    // Draw scaled-down version
    ctx.drawImage(
      canvas,
      0, 0, canvas.width, canvas.height,
      0, 0, THUMBNAIL_WIDTH, THUMBNAIL_HEIGHT
    )

    // Convert to base64 with lower quality to save space
    return thumbnailCanvas.toDataURL('image/jpeg', 0.6)
  }, [])

  /**
   * Check if two configs are the same (excluding uploadedUrl)
   */
  const isSameConfig = useCallback((config1: StickerConfig, config2: StickerConfig): boolean => {
    return (
      config1.character === config2.character &&
      config1.customImage === config2.customImage &&
      config1.text === config2.text &&
      config1.fontSize === config2.fontSize &&
      config1.fontKey === config2.fontKey &&
      config1.position.x === config2.position.x &&
      config1.position.y === config2.position.y &&
      config1.rotate === config2.rotate &&
      config1.spaceSize === config2.spaceSize &&
      config1.letterSpacing === config2.letterSpacing &&
      config1.strokeWidth === config2.strokeWidth &&
      config1.strokeColor === config2.strokeColor &&
      config1.textColor === config2.textColor &&
      config1.curve === config2.curve &&
      config1.vertical === config2.vertical &&
      config1.textBehind === config2.textBehind
    )
  }, [])

  /**
   * Add a new history item (with smart deduplication)
   * If config exists, update timestamp and append URL (if new)
   */
  const addHistory = useCallback((
    config: StickerConfig,
    canvas: HTMLCanvasElement,
    uploadedUrl?: string
  ) => {
    setHistoryItems(prevItems => {
      // Check if same config already exists
      const existingIndex = prevItems.findIndex(item => isSameConfig(item.config, config))

      if (existingIndex !== -1) {
        // Config exists - update it
        const existingItem = prevItems[existingIndex]
        const updatedItem: HistoryItem = {
          ...existingItem,
          timestamp: Date.now(), // Update timestamp to move it to top
          thumbnail: generateThumbnail(canvas), // Regenerate thumbnail
        }

        // Append URL if it's new and not empty
        if (uploadedUrl && uploadedUrl !== existingItem.uploadedUrl) {
          updatedItem.uploadedUrl = uploadedUrl
        }

        // Remove old item and add updated one at the beginning
        const updatedItems = [
          updatedItem,
          ...prevItems.slice(0, existingIndex),
          ...prevItems.slice(existingIndex + 1)
        ]

        const trimmedItems = updatedItems.slice(0, MAX_HISTORY_ITEMS)
        saveToStorage(trimmedItems)
        return trimmedItems
      } else {
        // New config - add new item
        const newItem: HistoryItem = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          thumbnail: generateThumbnail(canvas),
          config: { ...config },
          uploadedUrl
        }

        const updatedItems = [newItem, ...prevItems]
        const trimmedItems = updatedItems.slice(0, MAX_HISTORY_ITEMS)

        saveToStorage(trimmedItems)
        return trimmedItems
      }
    })
  }, [generateThumbnail, saveToStorage, isSameConfig])

  /**
   * Load a history item's configuration
   */
  const loadHistory = useCallback((id: string): StickerConfig | null => {
    const item = historyItems.find(item => item.id === id)
    return item ? { ...item.config } : null
  }, [historyItems])

  /**
   * Delete a specific history item
   */
  const deleteHistory = useCallback((id: string) => {
    setHistoryItems(prevItems => {
      const updatedItems = prevItems.filter(item => item.id !== id)
      saveToStorage(updatedItems)
      return updatedItems
    })
  }, [saveToStorage])

  /**
   * Clear all history
   */
  const clearHistory = useCallback(() => {
    setHistoryItems([])
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return {
    historyItems,
    addHistory,
    loadHistory,
    deleteHistory,
    clearHistory
  }
}
