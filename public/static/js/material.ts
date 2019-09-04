import { Texture, NormalTexture, OcclusionTexture, EmissiveTexture, AlbedoTexture, MetalRoughnessTexture } from './Texture'
import { Program } from './webgl/Program'
import ShaderLib from './shaders/ShaderLib'
export interface Shader {
  name?: string,
  uniforms: any,
  vertexShader: string,
  fragmentShader: string
}

interface MaterialOption {
  name?: string
  type?: string
  albedoTexture?: AlbedoTexture
  normalTexture?: NormalTexture
  occlusionTexture?: OcclusionTexture
  emissiveTexture?: EmissiveTexture
  metalRoughnessTexture?: MetalRoughnessTexture
  alphaMode?: string
  transparent?: boolean
  doubleSided?: boolean
  alphaCutoff?: number
  physicallyCorrectLights?: boolean
  color?: number[]
}

export class Material {
  public name: string
  public type: string
  public albedoTexture?: AlbedoTexture
  public normalTexture?: NormalTexture
  public occlusionTexture?: OcclusionTexture
  public emissiveTexture?: EmissiveTexture
  public metalRoughnessTexture?: MetalRoughnessTexture
  public alphaMode: string
  public transparent: boolean = false
  public doubleSided: boolean
  public alphaCutoff: number
  public shader: Shader
  public physicallyCorrectLights: boolean
  public color: number[]
  constructor (option: MaterialOption) {
    let opt = option
    if (!opt) {
      opt = {}
    }
    this.type = opt.type || 'standard'
    this.shader = ShaderLib[this.type]
    this.name = opt.name || ''
    this.alphaMode = 'OPAQUE'
    this.doubleSided = false
    this.alphaCutoff = 0.5
    this.physicallyCorrectLights = opt.physicallyCorrectLights || false
    this.albedoTexture = opt.albedoTexture || null
    this.normalTexture = opt.normalTexture || null
    this.occlusionTexture = opt.occlusionTexture || null
    this.emissiveTexture = opt.emissiveTexture || null
    this.metalRoughnessTexture = opt.metalRoughnessTexture || null
  }

  addAlbedoTexture (texture: AlbedoTexture) {
    this.albedoTexture = texture
  }

  addNormalTexture (texture: NormalTexture) {
    this.normalTexture = texture
  }

  addOcclusionTexture (texture: OcclusionTexture) {
    this.occlusionTexture = texture
  }

  addEmissiveTexture (texture: EmissiveTexture) {
    this.emissiveTexture = texture
  }

  addMetalRoughnessTexture (texture: MetalRoughnessTexture) {
    this.metalRoughnessTexture = texture
  }

  onBeforeCompile (shader: Shader, program: Program) { }
}
