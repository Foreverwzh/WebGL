import { Object3D } from './Object3d'

export class Scene extends Object3D {
  constructor (name?: string) {
    super(name || '')
  }
}
