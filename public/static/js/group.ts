export class Group {
  public children: any[]
  public parent: Group | null
  public name: string
  public rotation?: number[]
  public translation?: number[]
  public scale?: number[]
  constructor (name?: string) {
    this.parent = null
    this.name = name || ''
    this.children = []
  }

  add (obj: any) {
    this.children.push(obj)
    obj.parent = this
  }

}

export class Scene extends Group {
  constructor (name?: string) {
    super(name || '')
  }
}
