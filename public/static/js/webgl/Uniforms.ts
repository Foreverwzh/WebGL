export class Uniforms {

  constructor (gl: WebGLRenderingContext, program: WebGLProgram) {
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(program, i)
      const addr = gl.getUniformLocation(program, info.name)
      this.parseUniform(info, addr)
    }
  }

  parseUniform (info: WebGLActiveInfo, addr: WebGLUniformLocation) {
    console.log(info)
    console.log(addr)
  }
}
