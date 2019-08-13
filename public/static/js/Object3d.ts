import { mat4, vec3, vec4, quat } from 'gl-matrix'
import { Program } from './webgl/Program'
export class Object3D {
  public children: any[]
  public parent: Object3D | null
  public name: string
  public rotation: quat
  public position: vec3
  public scale: vec3
  public modelMatrix: mat4
  public matrix: mat4
  public matrixWorld: mat4
  public matrixWorldNeedsUpdate: boolean
  public program: Program
  constructor (name?: string) {
    this.name = name || ''
    this.children = []
    this.position = vec3.fromValues(0, 0, 0)
    this.scale = vec3.fromValues(1, 1, 1)
    this.rotation = quat.fromValues(0, 0, 0, 0)
    this.parent = null
    this.modelMatrix = mat4.create()
    this.matrix = mat4.create()
    mat4.identity(this.matrix)
    this.matrixWorldNeedsUpdate = true
  }

  add (obj: any) {
    this.children.push(obj)
    obj.parent = this
  }

  rotate (v: quat) {
    const temp = mat4.create()
    mat4.fromQuat(temp, v)
    mat4.multiply(this.matrix, this.matrix, temp)
    mat4.getRotation(this.rotation, this.matrix)
  }

  translate (v: vec3) {
    mat4.translate(this.matrix, this.matrix, v)
    mat4.getTranslation(this.position, this.matrix)
  }

  setPosition (v: vec3) {
    this.position = v
    this.updateMatrix()
  }

  setScale (v: vec3) {
    this.scale = v
    this.updateMatrix()
  }

  updateMatrix () {
    mat4.fromRotationTranslationScale(this.matrix, this.rotation, this.position, this.scale)
  }

  updateMatrixWorld () {
    mat4.multiply(this.modelMatrix, this.matrixWorld, this.matrix)
  }

}
