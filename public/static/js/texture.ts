
export interface Sampler {
  magFilter: number
  minFilter: number
  wrapS: number
  wrapT: number
}

export class Texture {
  public name: string
  public url: string | null = null
  public gltexture?: WebGLTexture
  public sampler: Sampler
  public flipY: boolean = true
  public premultiplyAlpha: boolean = true
  public unpackAlignment: boolean = true
  public width: number = 1
  public height: number = 1
  public isPowerOf2: boolean = true

  constructor (name?: string) {
    this.name = name || ''
    this.sampler = {
      magFilter: 9729,
      minFilter: 9729,
      wrapS: 10497,
      wrapT: 10497
    }
  }

  setSampler (opt: Sampler) {
    this.sampler = {
      magFilter: opt.magFilter || 9729,
      minFilter: opt.minFilter || 9729,
      wrapS: opt.wrapS || 10497,
      wrapT: opt.wrapT || 10497
    }
  }
}

export class NormalTexture extends Texture {
  constructor (name?: string) {
    super(name || '')
  }
}

export class EmissiveTexture extends Texture {
  public factor: number[]
  constructor (name?: string) {
    super(name || '')
  }
}

export class OcclusionTexture extends Texture {
  constructor (name?: string) {
    super(name || '')
  }
}

export class MetalRoughnessTexture extends Texture {
  public metallicFactor: number
  public roughnessFactor: number

  constructor (name?: string) {
    super(name || '')
    this.metallicFactor = 1
    this.roughnessFactor = 1
  }
}

export class AlbedoTexture extends Texture {
  public baseColorFactor: number[]
  constructor (name?: string) {
    super(name || '')
    this.baseColorFactor = [1, 1, 1, 1]
  }
}
