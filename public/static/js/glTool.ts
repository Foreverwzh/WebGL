export function isPowerOf2 (value: number) {
  return (value & (value - 1)) === 0
}

export function getTargetType (num: number): string {
  let str: string
  switch (num) {
    case 34962:
      str = 'ARRAY_BUFFER'
      break
    case 34963:
      str = 'ELEMENT_ARRAY_BUFFER'
      break
    default:
      str = 'ARRAY_BUFFER'
  }
  return str
}

export function arrayBufferToImageURL (imgData: ArrayBuffer, type: string = 'image/jpeg') {
  const arrayBufferView = new Uint8Array(imgData)
  const blob = new Blob([ arrayBufferView ], { type: type })
  const imageUrl = URL.createObjectURL(blob)
  return imageUrl
}
