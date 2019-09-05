import { Mesh } from '../Mesh'
import { Geometry } from '../Geometry'
import { Material } from '../Material'
import { vec3 } from 'gl-matrix'
import { AlbedoTexture } from '../Texture'

export class Background extends Mesh {
  width: number
  height: number
  depth: number
  widthSegments: number
  heightSegments: number
  depthSegments: number
  color: number[] = [0, 0, 255, 255]
  constructor (geomertry?: Geometry, material?: Material) {
    super(geomertry, material)
    if (!this.material) {
      this.material = new Material({
        color: this.color
      })
    }
    if (!this.geometry) {
      this.geometry = new Geometry({
        data: [
          -1.0, 1.0, -1.0,
          -1.0, -1.0, -1.0,
          1.0, -1.0, -1.0,
          1.0, -1.0, -1.0,
          1.0, 1.0, -1.0,
          -1.0, 1.0, -1.0,

          -1.0, -1.0, 1.0,
          -1.0, -1.0, -1.0,
          -1.0, 1.0, -1.0,
          -1.0, 1.0, -1.0,
          -1.0, 1.0, 1.0,
          -1.0, -1.0, 1.0,

          1.0, -1.0, -1.0,
          1.0, -1.0, 1.0,
          1.0, 1.0, 1.0,
          1.0, 1.0, 1.0,
          1.0, 1.0, -1.0,
          1.0, -1.0, -1.0,

          -1.0, -1.0, 1.0,
          -1.0, 1.0, 1.0,
          1.0, 1.0, 1.0,
          1.0, 1.0, 1.0,
          1.0, -1.0, 1.0,
          -1.0, -1.0, 1.0,

          -1.0, 1.0, -1.0,
          1.0, 1.0, -1.0,
          1.0, 1.0, 1.0,
          1.0, 1.0, 1.0,
          -1.0, 1.0, 1.0,
          -1.0, 1.0, -1.0,

          -1.0, -1.0, -1.0,
          -1.0, -1.0, 1.0,
          1.0, -1.0, -1.0,
          1.0, -1.0, -1.0,
          -1.0, -1.0, 1.0,
          1.0, -1.0, 1.0].map(i => 100 * i)
      })
    }
  }

  setBackgroundMaterial (url: string[]) {
    this.material = new Material({
      type: 'background',
      albedoTexture: new AlbedoTexture({
        url: url
      })
    })
  }
}
