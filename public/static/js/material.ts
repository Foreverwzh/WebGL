import { Texture, NormalTexture, PBRTexture } from './texture'

export class Material {
  public name: string
  public albedoMap: Texture
  public normalMap: Texture
  public alphaMode: string
  public doubleSided: boolean
  public alphaCutoff: number
  constructor (name?: string) {
    this.name = name || ''
    this.alphaMode = 'OPAQUE'
    this.doubleSided = false
    this.alphaCutoff = 0.5
  }

  addAlbedoMap (texture: PBRTexture) {
    this.albedoMap = texture
  }

  addNormalMap (texture: NormalTexture) {
    this.normalMap = texture
  }
}
