// SPDX-License-Identifier: AGPL-3.0-only
// Copyright (C) 2026 The 25-ji-code-de Team

/**
 * Convert a base64 encoded image string to a Blob object
 * @param b64Data - Base64 encoded data (without the data:image prefix)
 * @param contentType - MIME type of the image
 * @param sliceSize - Size of slices for processing
 * @returns Blob object containing the image data
 */
export function b64toBlob(
  b64Data: string,
  contentType: string = 'image/png',
  sliceSize: number = 512
): Blob {
  const byteCharacters = atob(b64Data)
  const byteArrays: BlobPart[] = []
  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize)
    const byteNumbers = new Array(slice.length)
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    byteArrays.push(byteArray)
  }
  return new Blob(byteArrays, { type: contentType })
}
