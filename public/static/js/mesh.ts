import { Geometry } from './geometry'
import { Material } from './material'
export class Mesh {
  public geometry: Geometry
  public material: Material
  public readonly type: string = 'Mesh'
  public readonly isMesh: boolean = true

  constructor (geometry: Geometry, material: Material) {
    this.geometry = geometry
    this.material = material
  }
}
