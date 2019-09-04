import { mat4, vec3, vec4 } from 'gl-matrix'
/**
 *
 *
 * @export
 * @interface VertexAttribute
 */
export interface VertexAttribute {
  name?: string
  data: ArrayBuffer
  componentType: number
  size: number
  normalized: boolean
  stride: number
  offset: number
  target: number
  buffer?: WebGLBuffer
  count: number
}

export interface IndicesAttribute {
  name?: string
  data: ArrayBuffer
  componentType: number
  offset: number
  target: number
  count: number
  buffer?: WebGLBuffer
}
/**
 *
 *
 * @export
 * @class Geometry
 */
export class Geometry {
  public name: string = ''
  public vertices: VertexAttribute
  public normals: VertexAttribute
  public textureCoords: VertexAttribute | null
  public tangent: VertexAttribute | null
  public color: VertexAttribute | null
  public count: number
  public mode: number = 4
  public indices: IndicesAttribute
/**
 * Creates an instance of Geometry.
 * @param {*} vertices
 * @param {*} normals
 * @param {*} textureCoords
 * @param {number[]} [indices]
 * @memberof Geometry
 */
  constructor (vertices?: any, normals?: any, textureCoords?: any, tangent?: any, color?: any, indices?: any) {
    this.vertices = vertices && this._initVertexAttribute(vertices, 'Vertex')
    this.normals = normals && this._initVertexAttribute(normals, 'Normal')
    this.textureCoords = textureCoords && this._initVertexAttribute(textureCoords, 'TextureCoord')
    this.tangent = tangent && this._initVertexAttribute(tangent, 'TextureCoord')
    this.color = color && this._initVertexAttribute(color, 'TextureCoord')
    this.indices = indices && indices
    if (this.indices) {
      this.count = this.indices.count
    } else {
      this.count = this.vertices && this.vertices.count
    }
  }

  private _initVertexAttribute (obj: any, name?: string): VertexAttribute {
    const opt = {
      name: obj.name || '',
      data: obj.data || new ArrayBuffer(0),
      componentType: obj.componentType || 5126,
      size: obj.size || (name === 'TextureCoord' ? 2 : 3),
      normalized: obj.normalized || false,
      stride: obj.stride || 0,
      offset: obj.offset || 0,
      target: obj.target || 34962,
      count: obj.count || null
    }
    opt.count = obj.count || (opt.data.length / opt.size)
    return opt
  }
}
