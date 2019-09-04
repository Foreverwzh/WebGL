
import * as util from './GLTool'
export interface Sampler {
  magFilter: number
  minFilter: number
  wrapS: number
  wrapT: number
}

interface TextureOption {
  name?: string
  url?: string| any[] | null
  sampler?: Sampler
  flipY?: boolean
  premultiplyAlpha?: boolean
  unpackAlignment?: number
  width?: number
  height?: number
}

export class Texture {
  public name: string
  public url: string| any[] | null = null
  public gltexture?: WebGLTexture
  public sampler: Sampler
  public flipY: boolean
  public premultiplyAlpha: boolean
  public unpackAlignment: number
  public width: number = 1
  public height: number = 1
  public isPowerOf2: boolean = true

  constructor (opt: TextureOption) {
    this.name = opt.name || ''
    this.url = opt.url || null
    this.sampler = opt.sampler || {
      magFilter: 9729,
      minFilter: 9729,
      wrapS: 10497,
      wrapT: 10497
    }
    this.flipY = opt.flipY || false
    this.premultiplyAlpha = opt.premultiplyAlpha || false
    this.unpackAlignment = opt.unpackAlignment || 4
    this.width = opt.width
    this.height = opt.height
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
    const level = 0
    const internalFormat = texture instanceof AlbedoTexture ? gl.RGBA : gl.RGB
    const width = 1
    const height = 1
    const border = 0
    const srcFormat = internalFormat
    const srcType = gl.UNSIGNED_BYTE
    const pixel = new Uint8Array([0, 0, 255, 255])
    texture.gltexture = gltexture
    texture.width = width
    texture.height = height
    if (texture.url === null) return
    if (Array.isArray(texture.url)) {
      if (texture.url.length === 6) {
        for (let i = 0; i < 6; i++) {
          gl.bindTexture(gl.TEXTURE_CUBE_MAP, gltexture)
          // gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, level, internalFormat, srcFormat, srcType, null)
          const url = texture.url[i]
          const image = new Image()
          image.onload = () => {
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY)
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha)
            gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment)
            gl.bindTexture(gl.TEXTURE_CUBE_MAP, gltexture)
            texture.width = image.width
            texture.height = image.height
            let isPowerOf2 = false
            if (util.isPowerOf2(image.width) && util.isPowerOf2(image.height)) {
              isPowerOf2 = true
            }
            gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X + i, level, internalFormat, srcFormat, srcType, image)
            this.setTextureParam(gl, gl.TEXTURE_CUBE_MAP, isPowerOf2)
          }
          image.src = url
        }
      }
    } else {
      gl.bindTexture(gl.TEXTURE_2D, gltexture)
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      width, height, border, srcFormat, srcType,
                      pixel)
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
        gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)
        this.setTextureParam(gl, gl.TEXTURE_2D, this.isPowerOf2)
      }
      image.src = texture.url
    }
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
  constructor (opt: TextureOption) {
    super(opt)
  }
}

export class EmissiveTexture extends Texture {
  public factor: number[]
  constructor (opt: TextureOption) {
    super(opt)
  }
}

export class OcclusionTexture extends Texture {
  constructor (opt: TextureOption) {
    super(opt)
  }
}

export class MetalRoughnessTexture extends Texture {
  public metalness: number = 1
  public roughness: number = 1

  constructor (opt: TextureOption) {
    super(opt)
  }
}

export class AlbedoTexture extends Texture {
  public baseColorFactor: number[]
  constructor (opt: TextureOption) {
    super(opt)
    this.baseColorFactor = [1, 1, 1, 1]
  }
}
