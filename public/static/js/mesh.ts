import { Geometry } from './geometry'
import { Material } from './material'
export class Mesh {
  public name: string = ''
  public geometry: Geometry
  public material: Material
  public parent: any

  constructor (geometry: Geometry, material: Material) {
    this.parent = null
    this.geometry = geometry
    this.material = material
  }
}
