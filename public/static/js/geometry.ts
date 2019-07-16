import { mat4, vec3 } from 'gl-matrix'

export class Geometry {
  public vertices: number[]
  public normals: number[]
  public textureCoords: number[]
  public color: number[]
  public Model: mat4
  public position: vec3
  public texture: any

  constructor (vertices: number[], normals: number[], coords: number[]) {
    this.vertices = vertices
    this.normals = normals
    this.textureCoords = coords
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

}
