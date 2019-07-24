export function isPowerOf2 (value: number) {
  return (value & (value - 1)) === 0
}

export function getComponentType (num: number): string {
  let str: string
  switch (num) {
    case 5120:
      str = 'BYTE'
      break
    case 5121:
      str = 'UNSIGNED_BYTE'
      break
    case 5122:
      str = 'SHORT'
      break
    case 5123:
      str = 'UNSIGNED_SHORT'
      break
    case 5125:
      str = 'UNSIGNED_INT'
      break
    case 5126:
      str = 'FLOAT'
      break
    default:
      str = 'FlOAT'
  }
  return str
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
