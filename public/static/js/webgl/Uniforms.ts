import { vec2, vec3, vec4, mat2, mat3, mat4 } from 'gl-matrix'
import { AlbedoTexture, EmissiveTexture, OcclusionTexture, MetalRoughnessTexture, Texture } from '../Texture'

export class Uniforms {
  array: (SingleUniform | PureArrayUniform | StructuredUniform)[]
  map: any
  gl: WebGLRenderingContext
  constructor (gl: WebGLRenderingContext, program: WebGLProgram) {
    this.array = []
    this.map = {}
    this.gl = gl
    const n = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS)
    for (let i = 0; i < n; i++) {
      const info = gl.getActiveUniform(program, i)
      const addr = gl.getUniformLocation(program, info.name)
      this.parseUniform(info, addr)
    }
  }

  parseUniform (info: WebGLActiveInfo, addr: WebGLUniformLocation) {
    // console.log(info)
    const name = info.name
    const len = name.length
    const reg = /([\w\d_]+)(\])?(\[|\.)?/g
    const match = reg.exec(name)
    const matchend = reg.lastIndex
    let id: any = match[1]
    const idIsIndex = match[2] === ']'
    const subscript = match[3]

    if (idIsIndex) id = id | 0
    // if (id === 'lightProbe' || id === 'directionalLights') {
    //   console.log(match)
    // }
    if (subscript === undefined || subscript === '[' && matchend + 2 === len) {
      this.addUniform(this, subscript === undefined ?
        new SingleUniform(id, info, addr) :
        new PureArrayUniform(id, info, addr))
    } else {
      let map = this.map
      let next = map[ id ]
      if (next === undefined) {
        next = new StructuredUniform(id)
        this.addUniform(this, next)
      }
      id = name
      this.addUniform(next, subscript === undefined ?
        new SingleUniform(id, info, addr) :
        new PureArrayUniform(id, info, addr))
    }
  }

  addUniform (container, uniform: SingleUniform | PureArrayUniform | StructuredUniform) {
    container.array.push(uniform)
    container.map[uniform.id] = uniform
  }

  setValue (values: any) {
    for (let i = 0, len = this.array.length; i < len; i++) {
      const u = this.array[i]
      const v = values[u.id]
      if (v && v.needsUpdate !== false) {
        u.setValue(this.gl, v)
      }
    }
  }
}

export class SingleUniform {
  id: string
  info: WebGLActiveInfo
  addr: WebGLUniformLocation
  setValue: Function
  cache: any
  constructor (id: string, info: WebGLActiveInfo, addr: WebGLUniformLocation) {
    this.id = id
    this.info = info
    this.addr = addr
    this.cache = null
    this.setValue = this.getSingleUniformSetter(info.type)
  }

  getSingleUniformSetter (type: number) {
    switch (type) {
      case 5126: return this.setValueV1f // FLOAT
      case 35664: return this.setValueV2fv // _VEC2
      case 35665: return this.setValueV3fv // _VEC3
      case 35666: return this.setValueV4fv // _VEC4

      case 35674: return this.setValueM2 // _MAT2
      case 35675: return this.setValueM3 // _MAT3
      case 35676: return this.setValueM4 // _MAT4

      case 35678: case 36198: return this.setValueT1 // SAMPLER_2D, SAMPLER_EXTERNAL_OES
      case 35679: return this.setValueT3D1 // SAMPLER_3D
      case 35680: return this.setValueT6 // SAMPLER_CUBE
      case 36289: return this.setValueT2DArray1 // SAMPLER_2D_ARRAY

      case 5124: case 35670: return this.setValueV1i // INT, BOOL
      case 35667: case 35671: return this.setValueV2i // _VEC2
      case 35668: case 35672: return this.setValueV3i // _VEC3
      case 35669: case 35673: return this.setValueV4i // _VEC4
    }
    return () => {}
  }

  setValueV1f (gl: WebGLRenderingContext, v: number) {
    if (this.cache === v) return
    gl.uniform1f(this.addr, v)
    this.cache = v
  }

  setValueV2fv (gl: WebGLRenderingContext, v: vec2) {
    if (this.cache && vec2.equals(this.cache, v)) return
    gl.uniform2fv(this.addr, v)
    this.cache = vec2.copy(vec2.create(), v)
  }

  setValueV3fv (gl: WebGLRenderingContext, v: vec3) {
    if (this.cache && vec3.equals(this.cache, v)) return
    gl.uniform3fv(this.addr, v)
    this.cache = vec3.copy(vec3.create(), v)
  }

  setValueV4fv (gl: WebGLRenderingContext, v: vec4) {
    if (this.cache && vec4.equals(this.cache, v)) return
    gl.uniform4fv(this.addr, v)
    this.cache = vec4.copy(vec4.create(), v)
  }

  setValueM2 (gl: WebGLRenderingContext, v: mat2) {
    if (this.cache && mat2.equals(this.cache, v)) return
    gl.uniformMatrix2fv(this.addr, false, v)
    this.cache = mat2.copy(mat2.create(), v)
  }

  setValueM3 (gl: WebGLRenderingContext, v: mat3) {
    if (this.cache && mat3.equals(this.cache, v)) return
    gl.uniformMatrix3fv(this.addr, false, v)
    this.cache = mat3.copy(mat3.create(), v)
  }

  setValueM4 (gl: WebGLRenderingContext, v: mat4) {
    if (this.cache && mat4.equals(this.cache, v)) return
    gl.uniformMatrix4fv(this.addr, false, v)
    this.cache = mat4.copy(mat4.create(), v)
  }

  setValueT1 (gl: WebGLRenderingContext, unit: number, gltexture: WebGLTexture) {
    if (this.cache !== unit) {
      gl.uniform1i(this.addr, unit)
      this.cache = unit
    }
    gl.activeTexture(gl.TEXTURE0 + unit)
    gl.bindTexture(gl.TEXTURE_2D, gltexture)
  }

  setValueT3D1 () {

  }

  setValueT6 () {

  }

  setValueT2DArray1 () {

  }

  setValueV1i (gl: WebGLRenderingContext, v: number) {
    if (this.cache === v) return
    gl.uniform1i(this.addr, v)
    this.cache = v
  }

  setValueV2i (gl: WebGLRenderingContext, v: vec2) {
    if (this.cache && this.cache instanceof vec2 && vec2.equals(this.cache, v)) return
    gl.uniform2iv(this.addr, new Int32Array(v.values()))
    this.cache = vec2.copy(vec2.create(), v)
  }

  setValueV3i (gl: WebGLRenderingContext, v: vec3) {
    if (this.cache && this.cache instanceof vec3 && vec3.equals(this.cache, v)) return
    gl.uniform2iv(this.addr, new Int32Array(v.values()))
    this.cache = vec3.copy(vec3.create(), v)
  }

  setValueV4i (gl: WebGLRenderingContext, v: vec4) {
    if (this.cache && this.cache instanceof vec4 && vec4.equals(this.cache, v)) return
    gl.uniform2iv(this.addr, new Int32Array(v.values()))
    this.cache = vec4.copy(vec4.create(), v)
  }
}

export class PureArrayUniform {
  id: string
  info: WebGLActiveInfo
  addr: WebGLUniformLocation
  setValue: Function
  cache: null | number | vec2 | vec3 | vec4 | mat2 | mat3 | mat4
  constructor (id: string, info: WebGLActiveInfo, addr: WebGLUniformLocation) {
    this.id = id
    this.info = info
    this.addr = addr
    this.cache = null
    this.setValue = this.getPureArraySetter(info.type)
  }

  getPureArraySetter (type: number) {
    switch (type) {
      case 5126: return this.setValueV1fArray // FLOAT
      case 35664: return this.setValueV2fArray // _VEC2
      case 35665: return this.setValueV3fArray // _VEC3
      case 35666: return this.setValueV4fArray // _VEC4

      case 35674: return this.setValueM2Array // _MAT2
      case 35675: return this.setValueM3Array // _MAT3
      case 35676: return this.setValueM4Array // _MAT4

      case 35678: return this.setValueT1Array // SAMPLER_2D
      case 35680: return this.setValueT6Array // SAMPLER_CUBE

      case 5124: case 35670: return this.setValueV1iArray // INT, BOOL
      case 35667: case 35671: return this.setValueV2iArray // _VEC2
      case 35668: case 35672: return this.setValueV3iArray // _VEC3
      case 35669: case 35673: return this.setValueV4iArray // _VEC4
    }
  }

  setValueV1fArray (gl: WebGLRenderingContext, v: number) {
    gl.uniform1f(this.addr, v)
  }

  setValueV2fArray (gl: WebGLRenderingContext, v: number[][]) {
    const data = this.flatten(v, this.info.size, 2)
    gl.uniform2fv(this.addr, data)
  }

  setValueV3fArray (gl: WebGLRenderingContext, v: number[][]) {
    const data = this.flatten(v, this.info.size, 3)
    gl.uniform3fv(this.addr, data)
  }

  setValueV4fArray (gl: WebGLRenderingContext, v: number[][]) {
    const data = this.flatten(v, this.info.size, 4)
    gl.uniform4fv(this.addr, data)
  }

  setValueM2Array (gl: WebGLRenderingContext, v: number[][]) {
    const data = this.flatten(v, this.info.size, 4)
    gl.uniformMatrix2fv(this.addr, false, data)
  }

  setValueM3Array (gl: WebGLRenderingContext, v: number[][]) {
    const data = this.flatten(v, this.info.size, 9)
    gl.uniformMatrix3fv(this.addr, false, data)
  }

  setValueM4Array (gl: WebGLRenderingContext, v: number[][]) {
    const data = this.flatten(v, this.info.size, 16)
    gl.uniformMatrix4fv(this.addr, false, data)
  }

  setValueT1Array (gl: WebGLRenderingContext, v: number[][]) {

  }

  setValueT6Array (gl: WebGLRenderingContext, v: number[][]) {

  }

  setValueV1iArray (gl: WebGLRenderingContext, v: number[][]) {

  }

  setValueV2iArray (gl: WebGLRenderingContext, v: number[][]) {

  }

  setValueV3iArray (gl: WebGLRenderingContext, v: number[][]) {

  }

  setValueV4iArray (gl: WebGLRenderingContext, v: number[][]) {

  }

  flatten (array, nBlocks, blockSize) {

    let firstElem = array[ 0 ]

    if (firstElem <= 0 || firstElem > 0) return array

    let n = nBlocks * blockSize

    let r = new Float32Array(n)

    if (nBlocks !== 0) {

      for (let i = 0, offset = 0; i !== nBlocks; ++ i) {

        offset += blockSize
        r[offset] = array[i][0]
        r[offset + 1] = array[i][1]
        r[offset + 2] = array[i][2]
      }

    }

    return r

  }
}

export class StructuredUniform {
  array: (SingleUniform | PureArrayUniform)[]
  map: any
  id: string
  constructor (id: string) {
    this.id = id
    this.array = []
    this.map = {}
  }

  setValue (gl: WebGLRenderingContext, value) {
    for (let i = 0, n = this.array.length; i < n; i++) {
      const u = this.array[i]
      if (value[u.id]) {
        if (value[u.id].gltexture) {
          u.setValue(gl, value[u.id].value, value[u.id].gltexture)
        } else {
          u.setValue(gl, value[u.id].value)
        }
      }
    }
  }
}
