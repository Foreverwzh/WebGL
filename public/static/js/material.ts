import { Texture, NormalTexture, OcclusionTexture, EmissiveTexture, AlbedoTexture, MetalRoughnessTexture } from './Texture'

export class Material {
  public name: string
  public albedoTexture: AlbedoTexture
  public normalTexture: NormalTexture
  public occlusionTexture: OcclusionTexture
  public emissiveTexture: EmissiveTexture
  public metalRoughnessTexture: MetalRoughnessTexture
  public alphaMode: string
  public transparent: boolean = false
  public doubleSided: boolean
  public alphaCutoff: number
  constructor (name?: string) {
    this.name = name || ''
    this.alphaMode = 'OPAQUE'
    this.doubleSided = false
    this.alphaCutoff = 0.5
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
}
