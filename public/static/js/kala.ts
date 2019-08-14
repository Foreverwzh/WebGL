import { Camera } from './Camera'
import * as util from './GLTool'
import { mat4 } from 'gl-matrix'
import { Mesh } from './Mesh'
import { Geometry, VertexAttribute, IndicesAttribute } from './Geometry'
import { Material } from './Material'
import { Object3D } from './Object3d'
import { Program, hasCached } from './webgl/Program'
import { NormalTexture, AlbedoTexture, EmissiveTexture, OcclusionTexture, MetalRoughnessTexture } from './Texture'
import { Attributes } from './webgl/Attributes'
import { Uniforms } from './webgl/Uniforms'

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
  tangent: number
  color: number
}

interface UniformLocations {
  projection: WebGLUniformLocation
  model: WebGLUniformLocation
  view: WebGLUniformLocation
  albedoMap: WebGLUniformLocation
  normalMap: WebGLUniformLocation
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
  public MetalRoughnessTexture = MetalRoughnessTexture
  public NormalTexture = NormalTexture
  public AlbedoTexture = AlbedoTexture
  public EmissiveTexture = EmissiveTexture
  public OcclusionTexture = OcclusionTexture
  public util = util

  public gl: WebGLRenderingContext
  public camera: Camera
  public objects: any[] = []
  public projectMatrix: mat4
  public view: any
  public lastRenderTime: Date | null = null
  public deltaTime: number = 0
  public pointerLock: boolean = false
  public programs: Program[] = []
  public programInfo: ProgramInfo
  public shaders: any = {}
  public MAX_TEXTURE: number = 16

  public constructor (canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl')
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    this.projectMatrix = this.initProjectMatrix()
    this.camera = new Camera(this)
    this.view = this.camera.getViewMatrix()
    this.fullScreen()
  }

  public initProjectMatrix (): mat4 {
    const gl = this.gl
    const fieldOfView = 45 * Math.PI / 180
    const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight
    const zNear = 0.1
    const zFar = 100.0
    const projectMatrix = mat4.create()
    mat4.perspective(projectMatrix,
            fieldOfView,
            aspect,
            zNear,
            zFar)
    return projectMatrix
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
        textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
        tangent: gl.getAttribLocation(shaderProgram, 'aTangent'),
        color: gl.getAttribLocation(shaderProgram, 'aColor')
      },
      uniformLocations: {
        projection: gl.getUniformLocation(shaderProgram, 'uProjection'),
        model: gl.getUniformLocation(shaderProgram, 'uModel'),
        view: gl.getUniformLocation(shaderProgram, 'uView'),
        albedoMap: gl.getUniformLocation(shaderProgram, 'albedoMap'),
        normalMap: gl.getUniformLocation(shaderProgram, 'normalMap')
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
    if (!attr) return null
    if (attr.buffer) {
      return attr.buffer
    }
    const gl = this.gl
    const dataBuffer = gl.createBuffer()
    gl.bindBuffer(attr.target, dataBuffer)
    if (!WEBGL_COMPONENT_TYPES[attr.componentType]) {
      console.error(`No such componentType: ${attr.componentType}`)
      return false
    }
    const typedArr = new WEBGL_COMPONENT_TYPES[attr.componentType](attr.data)
    gl.bufferData(attr.target, typedArr, gl.STATIC_DRAW)
    gl.bindBuffer(attr.target, null)
    attr.buffer = dataBuffer
    return dataBuffer
  }

  loadTextureURL (texture: NormalTexture | AlbedoTexture | EmissiveTexture | OcclusionTexture) {
    const gl = this.gl
    const gltexture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, gltexture)
    const level = 0
    const internalFormat = texture instanceof AlbedoTexture ? gl.RGBA : gl.RGB
    const width = 1
    const height = 1
    const border = 0
    const srcFormat = internalFormat
    const srcType = gl.UNSIGNED_BYTE
    const pixel = new Uint8Array([0, 0, 255, 255])
    gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      width, height, border, srcFormat, srcType,
                      pixel)
    texture.gltexture = gltexture
    texture.width = width,
    texture.height = height,
    texture.isPowerOf2 = false
    if (texture.url === null) return
    const image = new Image()
    image.onload = () => {
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, texture.flipY)
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, texture.premultiplyAlpha)
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, texture.unpackAlignment)
      gl.bindTexture(gl.TEXTURE_2D, gltexture)
      texture.width = image.width
      texture.height = image.height
      if (util.isPowerOf2(image.width) && util.isPowerOf2(image.height)) {
        texture.isPowerOf2 = true
      }
      // this.setTextureParam(sampler, imgInfo.isPowerOf2)
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image)
    }
    image.src = texture.url
  }

  setTextureParam (textureType: number, texture: NormalTexture | AlbedoTexture | EmissiveTexture | OcclusionTexture, supportsMips: boolean) {
    const gl = this.gl
    if (supportsMips) {

      gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, texture.sampler.wrapS)
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, texture.sampler.wrapT)

      gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, texture.sampler.magFilter)
      gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, texture.sampler.minFilter)

    } else {

      gl.texParameteri(textureType, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
      gl.texParameteri(textureType, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)

      gl.texParameteri(textureType, gl.TEXTURE_MAG_FILTER, texture.sampler.magFilter)
      gl.texParameteri(textureType, gl.TEXTURE_MIN_FILTER, texture.sampler.minFilter)

    }
  }

  renderObject (obj, matrix: mat4) {
    if (obj.translation) {
      mat4.translate(matrix, matrix, obj.translation)
    }
    if (obj.rotation) {
      mat4.rotate(matrix, matrix, obj.rotation[3], obj.rotation.slice(0, 3))
    }
    if (obj.scale) {
      mat4.scale(matrix, matrix, obj.scale)
    }
    if (obj instanceof Object3D) {
      for (let c of obj.children) {
        this.renderObject(c, matrix)
      }
      if (obj instanceof Mesh) {
        this.renderMesh(obj, matrix)
      }
      return
    }
  }

  renderMesh (mesh: Mesh, matrix: mat4) {
    const gl = this.gl
    if (!mesh.program) {
      const cache_p = hasCached(mesh.material, this.programs)
      if (cache_p) {
        mesh.program = cache_p
        cache_p.usedNum ++
      } else {
        mesh.program = new Program(gl, mesh)
        this.programs.push(mesh.program)
      }
    }
    const program = mesh.program.program
    gl.useProgram(program)
    const uniforms = mesh.program.getUniforms()
    const attrs = mesh.program.getAttributes()
    // return
    const vertexBuffer = this.initBufferData(mesh.geometry.vertices)
    const normalBuffer = this.initBufferData(mesh.geometry.normals)
    const texcoordBuffer = this.initBufferData(mesh.geometry.textureCoords)
    const tangentBuffer = this.initBufferData(mesh.geometry.tangent)
    const colorBuffer = this.initBufferData(mesh.geometry.color)
    if (mesh.matrixWorldNeedsUpdate) {
      mesh.matrixWorld = matrix
      mesh.updateMatrixWorld()
      mesh.matrixWorldNeedsUpdate = false
    }
    if (vertexBuffer) {
      gl.bindBuffer(mesh.geometry.vertices.target, vertexBuffer)
      gl.vertexAttribPointer(
                attrs.map.position,
                mesh.geometry.vertices.size,
                mesh.geometry.vertices.componentType,
                mesh.geometry.vertices.normalized,
                mesh.geometry.vertices.stride,
                mesh.geometry.vertices.offset)
      gl.enableVertexAttribArray(attrs.map.position)
    }
    // if (normalBuffer) {
    //   gl.bindBuffer(mesh.geometry.normals.target, normalBuffer)
    //   gl.vertexAttribPointer(
    //             attrs.map.normal,
    //             mesh.geometry.normals.size,
    //             mesh.geometry.normals.componentType,
    //             mesh.geometry.normals.normalized,
    //             mesh.geometry.normals.stride,
    //             mesh.geometry.normals.offset)
    //   gl.enableVertexAttribArray(attrs.map.normal)
    // }
    // if (texcoordBuffer) {
    //   gl.bindBuffer(mesh.geometry.textureCoords.target, texcoordBuffer)
    //   gl.vertexAttribPointer(
    //             attrs.map.uv,
    //             mesh.geometry.textureCoords.size,
    //             mesh.geometry.textureCoords.componentType,
    //             mesh.geometry.textureCoords.normalized,
    //             mesh.geometry.textureCoords.stride,
    //             mesh.geometry.textureCoords.offset)
    //   gl.enableVertexAttribArray(
    //             attrs.map.uv)
    // }
    // if (tangentBuffer) {
    //   gl.bindBuffer(mesh.geometry.tangent.target, tangentBuffer)
    //   gl.vertexAttribPointer(
    //             this.programInfo.attribLocations.tangent,
    //             mesh.geometry.tangent.size,
    //             mesh.geometry.tangent.componentType,
    //             mesh.geometry.tangent.normalized,
    //             mesh.geometry.tangent.stride,
    //             mesh.geometry.tangent.offset)
    //   gl.enableVertexAttribArray(
    //             this.programInfo.attribLocations.tangent)
    // }
    // if (colorBuffer) {
    //   gl.bindBuffer(mesh.geometry.color.target, colorBuffer)
    //   gl.vertexAttribPointer(
    //             this.programInfo.attribLocations.color,
    //             mesh.geometry.color.size,
    //             mesh.geometry.color.componentType,
    //             mesh.geometry.color.normalized,
    //             mesh.geometry.color.stride,
    //             mesh.geometry.color.offset)
    //   gl.enableVertexAttribArray(
    //             this.programInfo.attribLocations.color)
    // }
    gl.uniformMatrix4fv(uniforms.map.projectMatrix.addr, false, this.projectMatrix)
    gl.uniformMatrix4fv(uniforms.map.modelMatrix.addr, false, mesh.modelMatrix)
    gl.uniformMatrix4fv(uniforms.map.viewMatrix.addr, false, this.view)

    // const normalTexture = mesh.material.normalTexture
    // if (normalTexture) {
    //   let gltexture
    //   if (normalTexture.gltexture) {
    //     gltexture = normalTexture.gltexture
    //   } else {
    //     this.loadTextureURL(normalTexture)
    //     gltexture = normalTexture.gltexture
    //   }
    //   gl.activeTexture(gl.TEXTURE0)
    //   gl.bindTexture(gl.TEXTURE_2D, gltexture)
    //   const supportsMips = normalTexture.isPowerOf2
    //   this.setTextureParam(gl.TEXTURE_2D, normalTexture, supportsMips)
    //   gl.uniform1i(this.programInfo.uniformLocations.normalMap, 0)
    // }
    // const albedoTexture = mesh.material.albedoTexture
    // if (albedoTexture) {
    //   let gltexture
    //   if (albedoTexture.gltexture) {
    //     gltexture = albedoTexture.gltexture
    //   } else {
    //     this.loadTextureURL(albedoTexture)
    //     gltexture = albedoTexture.gltexture
    //   }
    //   gl.activeTexture(gl.TEXTURE0)
    //   gl.bindTexture(gl.TEXTURE_2D, gltexture)
    //   const supportsMips = albedoTexture.isPowerOf2
    //   this.setTextureParam(gl.TEXTURE_2D, albedoTexture, supportsMips)
    //   gl.uniform1i(this.programInfo.uniformLocations.albedoMap, 0)
    // }

    const offset = 0
    const vertexCount = mesh.geometry.count
    if (mesh.geometry.indices) {
      const indexBuffer = this.initBufferData(mesh.geometry.indices)
      gl.bindBuffer(mesh.geometry.indices.target, indexBuffer)
      // gl.getExtension('OES_element_index_uint')
      gl.drawElements(mesh.geometry.mode, vertexCount, mesh.geometry.indices.componentType, mesh.geometry.indices.offset)
    } else {
      gl.drawArrays(mesh.geometry.mode, offset, vertexCount)
    }
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
    gl.clearColor(0.2, 0.4, 0.6, 0.6)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    this.projectMatrix = this.initProjectMatrix()
    this.view = this.camera.getViewMatrix()

    // gl.useProgram(this.programInfo.program)
    for (let obj of this.objects) {
      const matrix = mat4.create()
      this.renderObject(obj, matrix)
    }
  }
}
