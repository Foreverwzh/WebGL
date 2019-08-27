
import * as util from './GLTool'
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
  public flipY: boolean = false
  public premultiplyAlpha: boolean = false
  public unpackAlignment: number = 4
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

  loadTextureURL (gl: WebGLRenderingContext) {
    const texture = this
    const gltexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, gltexture)
    const level = 0
    const internalFormat = texture instanceof AlbedoTexture ? gl.RGBA : gl.RGB
    const width = 1
    const height = 1
    const border = 0
    const srcFormat = internalFormat
    const srcType = gl.UNSIGNED_BYTE
    const pixel = new Uint8Array([0, 0, 255, 255])
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      width, height, border, srcFormat, srcType,
                      pixel)
    texture.gltexture = gltexture
    texture.width = width,
    texture.height = height,
    texture.isPowerOf2 = false
    if (texture.url === null) return
    const image = new Image()
    image.onload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha)
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment)
      gl.bindTexture(gl.TEXTURE_2D, gltexture)
      texture.width = image.width
      texture.height = image.height
      if (util.isPowerOf2(image.width) && util.isPowerOf2(image.height)) {
        texture.isPowerOf2 = true
      }
      this.setTextureParam(gl, gl.TEXTURE_2D, this.isPowerOf2)
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)
    }
    image.src = texture.url
  }

  setTextureParam (gl: WebGLRenderingContext, textureType: number, supportsMips: boolean) {
    const texture = this
    if (supportsMips) {

      gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, texture.sampler.wrapS)
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, texture.sampler.wrapT)

      gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, texture.sampler.magFilter)
      gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, texture.sampler.minFilter)

    } else {

      gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

      gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, texture.sampler.magFilter)
      gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, texture.sampler.minFilter)

    }
  }

  getGLTexture (gl: WebGLRenderingContext) {
    if (this.gltexture) return this.gltexture
    this.loadTextureURL(gl)
    return this.gltexture
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
  public metalness: number = 1
  public roughness: number = 1

  constructor (name?: string) {
    super(name || '')
  }
}

export class AlbedoTexture extends Texture {
  public baseColorFactor: number[]
  constructor (name?: string) {
    super(name || '')
    this.baseColorFactor = [1, 1, 1, 1]
  }
}
