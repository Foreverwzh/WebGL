export class Material {
  public textures: string[]
  constructor () {
    this.textures = []
  }

  addTexture (texture: any) {
    this.textures.push(texture)
  }
}
