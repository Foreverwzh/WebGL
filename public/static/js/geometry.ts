import { mat4, vec3 } from 'gl-matrix'
/**
 *
 *
 * @export
 * @interface VertexAttribute
 */
export interface VertexAttribute {
  name?: string
  data: number[]
  componentType: number
  size: number
  normalized: boolean
  stride: number
  offset: number
  target: number
  buffer?: any
  count?: number
}

export interface IndicesAttribute {
  name?: string
  data: number[]
  componentType: number
  offset: number
  target: number
  count?: number
  buffer?: any
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
  public textureCoords: VertexAttribute
  public color: number[]
  public Model: mat4
  public position: vec3
  public count: number
  public mode: number = 4
  public indices?: IndicesAttribute
/**
 * Creates an instance of Geometry.
 * @param {*} vertices
 * @param {*} normals
 * @param {*} textureCoords
 * @param {number[]} [indices]
 * @memberof Geometry
 */
  constructor (vertices: any, normals: any, textureCoords: any, indices?: any) {
    this.vertices = this._initVertexAttribute(vertices, 'Vertex')
    this.normals = this._initVertexAttribute(normals, 'Normal')
    this.textureCoords = this._initVertexAttribute(textureCoords, 'TextureCoord')
    if (indices) this.indices = indices
    if (this.indices) {
      this.count = this.indices.count || this.indices.data.length
    } else {
      this.count = this.vertices.count || (this.vertices.data.length / this.vertices.size)
    }
    this.color = [0, 0, 255, 255]
    this.Model = mat4.create()
    this.position = vec3.fromValues(0, 0, 0)
  }

  rotate (radius: number, vec: vec3) {
    mat4.rotate(this.Model, this.Model, radius, vec)
  }

  translate (vec: vec3) {
    mat4.translate(this.Model, this.Model, vec)
    vec3.add(this.position, this.position, vec)
  }

  setPosition (vec: vec3) {
    this.position = vec
    const temp = vec3.create()

  }

  private _initVertexAttribute (obj: any, name?: string): VertexAttribute {
    return {
      name: obj.name || '',
      data: obj.data || [],
      componentType: obj.componentType || 5126,
      size: obj.size || (name === 'TextureCoord' ? 2 : 3),
      normalized: obj.normalized || false,
      stride: obj.stride || 0,
      offset: obj.offset || 0,
      target: obj.target || 34962,
      count: obj.count || null
    }
  }
}
