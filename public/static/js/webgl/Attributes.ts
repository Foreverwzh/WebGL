export class Attributes {
  array: any[]
  map: any
  constructor (gl: WebGLRenderingContext, program: WebGLProgram) {
    this.array = []
    this.map = {}
    const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveAttrib(program, i)
      const addr = gl.getAttribLocation(program, info.name)
      this.parseAttribute(info, addr)
    }
  }

  parseAttribute (info: WebGLActiveInfo, addr: WebGLUniformLocation) {
    this.addAttribute({
      id: info.name,
      info: info,
      addr: addr
    })
  }

  addAttribute (attr) {
    this.array.push(attr)
    this.map[attr.id] = attr
  }
}
