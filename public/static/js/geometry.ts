import { mat4, vec3 } from 'gl-matrix'

export interface VertexAttribute {
  name?: string
  data: number[]
  type: string
  size: number
  normalized: boolean
  stride: number
  offset: number
  target: string
  buffer?: any
}

export class Geometry {
  public vertices: VertexAttribute
  public normals: VertexAttribute
  public textureCoords: VertexAttribute
  public color: number[]
  public Model: mat4
  public position: vec3
  public count: number

  constructor (vertices: any, normals: any, textureCoords: any) {
    this.vertices = this._initVertexAttribute(vertices, 'Vertex')
    this.normals = this._initVertexAttribute(normals, 'Normal')
    this.textureCoords = this._initVertexAttribute(textureCoords, 'TextureCoord')
    this.count = vertices.count || this.vertices.data.length / this.vertices.size
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

  private _initVertexAttribute (obj: any, name: string): VertexAttribute {
    return {
      name: name,
      data: obj.data || [],
      type: obj.type || 'FLOAT',
      size: obj.size || (name === 'TextureCoord' ? 2 : 3),
      normalized: obj.normalized || false,
      stride: obj.stride || 0,
      offset: obj.offset || 0,
      target: obj.target || 'ARRAY_BUFFER'
    }
  }

}
