export class Group {
  public children: any[]
  public parent: Group | null
  public name: string
  constructor () {
    this.parent = null
    this.name = ''
    this.children = []
  }

  add (obj: any) {
    this.children.push(obj)
  }
}
