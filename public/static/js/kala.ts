import { Camera } from './camera'
import * as util from './glTool'
import { mat4 } from 'gl-matrix'
import { Mesh } from './mesh'
import { Geometry, VertexAttribute, IndicesAttribute } from './geometry'
import { Material } from './material'
import { Group } from './group'
import { Sampler, Texture, NormalTexture, AlbedoTexture } from './texture'

const WEBGL_COMPONENT_TYPES = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}

interface AttribLocations {
  vertexPosition: number
  vertexNormal: number
  textureCoord: number
}

interface UniformLocations {
  projection: WebGLUniformLocation
  model: WebGLUniformLocation
  view: WebGLUniformLocation
  albedoMap: WebGLUniformLocation
}

interface ProgramInfo {
  program: WebGLProgram
  attribLocations: AttribLocations
  uniformLocations: UniformLocations
}

export class Kala {
  public Mesh = Mesh
  public Geometry = Geometry
  public Material = Material
  public Texture = Texture
  public NormalTexture = NormalTexture
  public AlbedoTexture = AlbedoTexture
  public util = util

  public gl: WebGLRenderingContext
  public camera: Camera
  public objects: any[] = []
  public scene: mat4
  public view: any
  public lastRenderTime: Date | null = null
  public deltaTime: number = 0
  public pointerLock: boolean = false
  public programInfo: ProgramInfo
  public shaders: any = {}
  public MAX_TEXTURE: number = 16

  public constructor (canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl')
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    this.scene = this.initScene()
    this.camera = new Camera(this)
    this.view = this.camera.getViewMatrix()
    this.fullScreen()
  }

  public initScene (): mat4 {
    const gl = this.gl
    const fieldOfView = 45 * Math.PI / 180
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0
    const scene = mat4.create()
    mat4.perspective(scene,
            fieldOfView,
            aspect,
            zNear,
            zFar)
    return scene
  }

  loadShader (type: number, source: string, name: string) {
    if (this.shaders[name]) return this.shaders[name]
    const gl = this.gl
    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
    this.shaders[name] = shader
    return shader
  }

  initShaderProgram (vsSource: string, fsSource: string) {
    const gl = this.gl

    if (!vsSource) {
      console.error('Empty VertexShader Source')
      return false
    }

    if (!fsSource) {
      console.error('Empty FragmentShader Source')
      return false
    }

    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource, 'vs_normal')
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource, 'fs_normal')

    if (!vertexShader || !fragmentShader) {
      return false
    }

    const shaderProgram = gl.createProgram()
    if (!shaderProgram) {
      console.error('Unable to create Program')
      return null
    }
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
      console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram))
      return null
    }
    this.programInfo = {
      program: shaderProgram,
      attribLocations: {
        vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord')
      },
      uniformLocations: {
        projection: gl.getUniformLocation(shaderProgram, 'uProjection'),
        model: gl.getUniformLocation(shaderProgram, 'uModel'),
        view: gl.getUniformLocation(shaderProgram, 'uView'),
        albedoMap: gl.getUniformLocation(shaderProgram, 'albedoMap')
      }
    }
    return shaderProgram
  }
  addCamera () {
    this.camera = new Camera(this)
    this.camera.kala = this
    return this.camera
  }
  add (obj: any) {
    this.objects.push(obj)
  }

  initBufferData (attr: VertexAttribute | IndicesAttribute) {
    if (attr.buffer) {
      return attr.buffer
    }
    const gl = this.gl
    const dataBuffer = gl.createBuffer()
    gl.bindBuffer(attr.target, dataBuffer)
    const typedArr = new WEBGL_COMPONENT_TYPES[attr.componentType](attr.data)
    gl.bufferData(attr.target, typedArr, gl.STATIC_DRAW)
    gl.bindBuffer(attr.target, null)
    attr.buffer = dataBuffer
    return dataBuffer
  }

  loadTextureURL (url: string, sampler?: Sampler) {
    const gl = this.gl
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    const level = 0
    const internalFormat = gl.RGBA
    const width = 1
    const height = 1
    const border = 0
    const srcFormat = gl.RGBA
    const srcType = gl.UNSIGNED_BYTE
    const pixel = new Uint8Array([0, 0, 255, 255])
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      width, height, border, srcFormat, srcType,
                      pixel)
    if (!url) return texture
    const image = new Image()
    image.onload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      this.setTextureParam(image.width, image.height, sampler)
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)
    }
    image.src = url
    return texture
  }

  loadTextureArrayBuffer (buffer: Uint8Array, sampler?: Sampler, width?: number, height?: number) {
    const gl = this.gl
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    const w = width || 1
    const h = height || 1
    this.setTextureParam(w, h, sampler)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, buffer)
    return texture
  }

  setTextureParam (width, height, sampler) {
    const gl = this.gl
    if (sampler) {
      if (util.isPowerOf2(width) && util.isPowerOf2(height)) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, sampler.wrapS)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, sampler.wrapT)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, sampler.minFilter)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, sampler.magFilter)
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      }
    } else {
      if (util.isPowerOf2(width) && util.isPowerOf2(height)) {
        gl.generateMipmap(gl.TEXTURE_2D)
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
      }
    }
  }

  renderObject (obj) {
    if (obj instanceof Group) {
      for (let c of obj.children) {
        this.renderObject(c)
      }
      return
    }
    if (obj instanceof Mesh) {
      this.renderMesh(obj)
    }
  }

  renderMesh (mesh: Mesh) {
    const gl = this.gl
    const vertexBuffer = this.initBufferData(mesh.geometry.vertices)
    const normalBuffer = this.initBufferData(mesh.geometry.normals)
    const texcoordBuffer = this.initBufferData(mesh.geometry.textureCoords)
    const normalMatrix = mat4.create()
    mat4.invert(normalMatrix, mesh.geometry.Model)
    mat4.transpose(normalMatrix, normalMatrix)
    if (vertexBuffer) {
      gl.bindBuffer(mesh.geometry.vertices.target, vertexBuffer)
      gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                mesh.geometry.vertices.size,
                mesh.geometry.vertices.componentType,
                mesh.geometry.vertices.normalized,
                mesh.geometry.vertices.stride,
                mesh.geometry.vertices.offset)
      gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexPosition)
    }
    // if (normalBuffer) {
    //   gl.bindBuffer(mesh.geometry.normals.target, normalBuffer)
    //   gl.vertexAttribPointer(
    //             this.programInfo.attribLocations.vertexNormal,
    //             mesh.geometry.normals.size,
    //             mesh.geometry.normals.componentType,
    //             mesh.geometry.normals.normalized,
    //             mesh.geometry.normals.stride,
    //             mesh.geometry.normals.offset)
    //   gl.enableVertexAttribArray(
    //             this.programInfo.attribLocations.vertexNormal)
    // }
    if (texcoordBuffer) {
      gl.bindBuffer(mesh.geometry.textureCoords.target, texcoordBuffer)
      gl.vertexAttribPointer(
                this.programInfo.attribLocations.textureCoord,
                mesh.geometry.textureCoords.size,
                mesh.geometry.textureCoords.componentType,
                mesh.geometry.textureCoords.normalized,
                mesh.geometry.textureCoords.stride,
                mesh.geometry.textureCoords.offset)
      gl.enableVertexAttribArray(
                this.programInfo.attribLocations.textureCoord)
    }
    gl.uniformMatrix4fv(this.programInfo.uniformLocations.projection, false, this.scene)
    gl.uniformMatrix4fv(this.programInfo.uniformLocations.model, false, mesh.geometry.Model)
    gl.uniformMatrix4fv(this.programInfo.uniformLocations.view, false, this.view)

    let albedoMap = mesh.material.albedoTexture
    // if (texture instanceof NormalTexture) {
    //   gl.uniform1i(this.programInfo.uniformLocations.normalTextureIndex, index)
    // }
    if (albedoMap) {
      let gltexture
      if (albedoMap.gltexture) {
        gltexture = albedoMap.gltexture
      } else if (albedoMap.source) {
        if (albedoMap.source instanceof Uint8Array) {
          gltexture = this.loadTextureArrayBuffer(albedoMap.source, albedoMap.sampler)
        } else if (typeof albedoMap.source === 'string') {
          gltexture = this.loadTextureURL(albedoMap.source || '', albedoMap.sampler)
        } else {
          gltexture = this.loadTextureURL('', albedoMap.sampler)
        }
        albedoMap.gltexture = gltexture
      }
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, gltexture)
      gl.uniform1i(this.programInfo.uniformLocations.albedoMap, 0)
    }

    const offset = 0
    const vertexCount = mesh.geometry.count
    if (mesh.geometry.indices) {
      const indexBuffer = this.initBufferData(mesh.geometry.indices)
      gl.bindBuffer(mesh.geometry.indices.target, indexBuffer)
      gl.drawElements(mesh.geometry.mode, vertexCount, mesh.geometry.indices.componentType, mesh.geometry.indices.offset)
    } else {
      gl.drawArrays(mesh.geometry.mode, offset, vertexCount)
    }
    gl.bindTexture(gl.TEXTURE_2D, null)
    gl.bindBuffer(gl.ARRAY_BUFFER, null)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null)
  }

  fullScreen () {
    const elem = this.gl.canvas
    const _this = this
    document.addEventListener('fullscreenchange', fullscreenChange, false)
    document.addEventListener('pointerlockchange', pointerLockChange, false)
    document.addEventListener('pointerlockerror', pointerLockError, false)
    function fullscreenChange () {
      if (document.fullscreenElement === elem) {
        elem.requestPointerLock()
      }
    }
    function pointerLockChange () {
      if (document.pointerLockElement === elem) {
        _this.pointerLock = true
      } else {
        _this.pointerLock = false
      }
    }
    function pointerLockError () {
      _this.pointerLock = false
    }
    elem.addEventListener('click', () => {
      elem.requestFullscreen().then().catch(e => console.log(e))
    }, false)

  }

  render () {
    if (!this.camera) {
      console.error('Please add a camera before rendering.')
      return false
    }
    const now = new Date()
    if (!this.lastRenderTime) {
      this.lastRenderTime = now
    } else {
      this.deltaTime = now.getTime() - this.lastRenderTime.getTime()
      this.lastRenderTime = now
    }
    this.camera.deltaTime = this.deltaTime * 0.001
    for (const k of this.camera.keyDown) {
      this.camera.ProcessKeyAction(k)
    }
    const gl = this.gl
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
    gl.clearColor(1.0, 1.0, 1.0, 0.6)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    this.scene = this.initScene()
    this.view = this.camera.getViewMatrix()

    gl.useProgram(this.programInfo.program)
    for (let obj of this.objects) {
      this.renderObject(obj)
    }
  }
}
