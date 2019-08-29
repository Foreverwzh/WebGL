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
  }

  setBackgroundMaterial (gl: WebGLRenderingContext, slot: number, url: string[]) {
    this.material = new Material({
      albedoTexture: new AlbedoTexture({
        url: url
      })
    })
  }
}
