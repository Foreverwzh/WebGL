import { vec3 } from 'gl-matrix'

export class Light {
  public direction: vec3
  public color: vec3
  constructor (dir: vec3, color: vec3) {
    this.direction = dir
    this.color = color
  }
}

export class DirectionalLight extends Light {
  constructor (dir: vec3, color: vec3) {
    super(dir, color)
  }
}
