import { vec3, vec2, mat4 } from 'gl-matrix'
import { ShadowTexture } from './Texture'

export class Light {
  public direction: vec3
  public color: vec3
  public shadow: boolean
  public shadowBias: number
  public shadowRadius: number
  public shadowMapSize: vec2
  public directionalShadowMatrix: mat4
  public shadowMap: ShadowTexture
  constructor (dir: vec3, color: vec3, shadow?: boolean, shadowBias?: number, shadowRadius?: number, shadowMapSize?: vec2) {
    this.direction = dir
    this.color = color
    this.shadow = shadow || false
    this.shadowBias = shadowBias || 0
    this.shadowRadius = shadowRadius || 1
    this.shadowMapSize = shadowMapSize || vec2.fromValues(512, 512)
    // this.directionalShadowMatrix
    this.shadowMap = new ShadowTexture({
      width: 1024,
      height: 1024
    })
  }
}

export class DirectionalLight extends Light {
  constructor (dir: vec3, color: vec3, shadow?: boolean, shadowBias?: number, shadowRadius?: number, shadowMapSize?: vec2) {
    super(dir, color, shadow, shadowBias, shadowRadius, shadowMapSize)
  }
}
