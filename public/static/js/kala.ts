import { Camera } from './camera'
import { isPowerOf2, getComponentType } from './glTool'
import { mat4 } from 'gl-matrix'
import { Mesh } from './mesh'
import { Geometry, VertexAttribute, IndicesAttribute } from './geometry'
import { Material } from './material'
import { Group } from './group'

interface AttribLocations {
  vertexPosition: any
  vertexNormal: any
  textureCoord: any
}

interface UniformLocations {
  projection: any
  model: any
  view: any
  normalMatrix: any
  uSampler: any
}

interface ProgramInfo {
  program: any
  attribLocations: AttribLocations
  uniformLocations: UniformLocations
}

export class Kala {
  public gl: any
  public camera: Camera
  public objects: any[] = []
  public scene: mat4
  public view: any
  public Mesh = Mesh
  public Geometry = Geometry
  public Material = Material
  public lastRenderTime: Date | null = null
  public deltaTime: number = 0
  public pointerLock: boolean = false
  public programInfo: ProgramInfo

  public constructor (canvas: any) {
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

  loadShader (type: any, source: string) {
    const gl = this.gl

    const shader = gl.createShader(type)
    gl.shaderSource(shader, source)
    gl.compileShader(shader)
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
      gl.deleteShader(shader)
      return null
    }
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

    const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource)
    const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource)

    if (!vertexShader || !fragmentShader) {
      return false
    }

    const shaderProgram = gl.createProgram()
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
        normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
        uSampler: gl.getUniformLocation(shaderProgram, 'uSampler')
      }
    }
    return shaderProgram
  }

  addCamera () {
    this.camera = new Camera(this.gl)
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
    // const typeStr = getComponentType(attr.componentType)
    let typedArr
    switch (attr.componentType) {
      case 5120:
        typedArr = new Int8Array(attr.data)
        break
      case 5121:
        typedArr = new Uint8Array(attr.data)
        break
      case 5122:
        typedArr = new Int16Array(attr.data)
        break
      case 5123:
        typedArr = new Uint16Array(attr.data)
        break
      case 5125:
        typedArr = new Uint16Array(attr.data)
        break
      case 5126:
        typedArr = new Float32Array(attr.data)
        break
      default:
        typedArr = new Float32Array(attr.data)
    }
    gl.bufferData(attr.target, typedArr, gl.STATIC_DRAW)
    gl.bindBuffer(attr.target, null)
    attr.buffer = dataBuffer
    return dataBuffer
  }

  loadTexture (url: string) {
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
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                      srcFormat, srcType, image)
      if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
        gl.generateMipmap(gl.TEXTURE_2D)
      } else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
      }
    }
    image.src = url
    return texture
  }

  renderObject (obj) {
    if (obj.constructor === Group) {
      obj.children.forEach(c => {
        this.renderObject(c)
      })
      return
    }
    if (obj.constructor === Mesh) {
      this.renderMesh(obj)
    }
  }

  renderMesh (mesh: Mesh) {
    const gl = this.gl
    const vertexBuffer = this.initBufferData(mesh.geometry.vertices)
    const normalBuffer = this.initBufferData(mesh.geometry.normals)
    const texcoordBuffer = this.initBufferData(mesh.geometry.textureCoords)
    const indexBuffer = this.initBufferData(mesh.geometry.indices)
    const normalMatrix = mat4.create()
    mat4.invert(normalMatrix, mesh.geometry.Model)
    mat4.transpose(normalMatrix, normalMatrix)
    {
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
    if (mesh.geometry.normals.data.length > 0) {
      gl.bindBuffer(mesh.geometry.normals.target, normalBuffer)
      gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexNormal,
                mesh.geometry.normals.size,
                mesh.geometry.normals.componentType,
                mesh.geometry.normals.normalized,
                mesh.geometry.normals.stride,
                mesh.geometry.normals.offset)
      gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexNormal)
    }
    if (mesh.geometry.textureCoords.data.length > 0) {
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
    gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projection,
            false,
            this.scene)
    gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.model,
            false,
            mesh.geometry.Model)
    gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.normalMatrix,
            false,
            normalMatrix)
    gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.view,
            false,
            this.view)
    gl.activeTexture(gl.TEXTURE0)

    gl.bindTexture(gl.TEXTURE_2D, mesh.material.textures[0] || this.loadTexture(''))

    gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0)

    {
      const offset = 0
      const vertexCount = mesh.geometry.count
      if (mesh.geometry.indices) {
        gl.bindBuffer(mesh.geometry.indices.target, indexBuffer)
        gl.drawElements(gl.TRIANGLES, vertexCount, mesh.geometry.indices.componentType, mesh.geometry.indices.offset)
      } else {
        gl.drawArrays(gl.TRIANGLES, offset, vertexCount)
      }
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
        elem.requestPointerLock = elem.requestPointerLock ||
                    elem.mozRequestPointerLock ||
                    elem.webkitRequestPointerLock
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
    elem.requestFullscreen = elem.requestFullscreen ||
            elem.mozRequestFullscreen ||
            elem.mozRequestFullScreen ||
            elem.webkitRequestFullscreen
    elem.addEventListener('click', () => {
      elem.requestFullscreen()
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
    gl.clearColor(0.0, 0.0, 0.0, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    this.scene = this.initScene()
    this.view = this.camera.getViewMatrix()

    gl.useProgram(this.programInfo.program)
    this.objects.forEach(obj => {
      this.renderObject(obj)
    })
  }
}
