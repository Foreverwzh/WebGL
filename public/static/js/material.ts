export class Material {
  public readonly type: string = 'Material'
  public readonly isMaterial: boolean = true
  public textures: string[]
  constructor () {
    this.textures = []
  }

  addTexture (texture: any) {
    this.textures.push(texture)
  }
}
