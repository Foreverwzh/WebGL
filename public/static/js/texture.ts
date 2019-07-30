
export interface Sampler {
  magFilter: number
  minFilter: number
  wrapS: number
  wrapT: number
}

export class Texture {
  public name: string
  public source: ArrayBuffer | string
  public gltexture?: WebGLTexture
  public sampler?: Sampler

  constructor (name?: string) {
    this.name = name || ''
    this.source = ''
  }

  setSampler (opt: any) {
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

export class AlbedoTexture extends Texture {
  public baseColorFactor: number[]
  public metallicFactor: number
  public roughnessFactor: number

  constructor (name?: string) {
    super(name || '')
    this.baseColorFactor = [1, 1, 1, 1]
    this.metallicFactor = 1
    this.roughnessFactor = 1
  }
}
