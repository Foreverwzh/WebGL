export class Group {
  public children: any[]
  public parent: Group | null
  public name: string
  constructor (name?: string) {
    this.parent = null
    this.name = name || ''
    this.children = []
  }

  add (obj: any) {
    this.children.push(obj)
  }
}
