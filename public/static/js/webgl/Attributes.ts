export class Attributes {

  constructor (gl: WebGLRenderingContext, program: WebGLProgram) {
    const n = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES)
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveAttrib(program, i)
      const addr = gl.getAttribLocation(program, info.name)
      this.parseAttribute(info, addr)
    }
  }

  parseAttribute (info: WebGLActiveInfo, addr: WebGLUniformLocation) {
    console.log(info)
    console.log(addr)
  }
}
