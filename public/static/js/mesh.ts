import { Geometry } from './Geometry'
import { Material } from './Material'
import { Object3D } from './Object3d'
export class Mesh extends Object3D {
  public geometry: Geometry
  public material: Material

  constructor (geometry?: Geometry, material?: Material) {
    super()
    this.geometry = geometry
    this.material = material
  }

  setGeometry (geometry: Geometry) {
    this.geometry = geometry
  }

  setMaterial (material: Material) {
    this.material = material
  }
}
