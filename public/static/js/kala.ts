import { Camera } from './Camera'
import * as util from './GLTool'
import { mat4, vec3 } from 'gl-matrix'
import { Mesh } from './Mesh'
import { Geometry, VertexAttribute, IndicesAttribute } from './Geometry'
import { Material } from './Material'
import { Object3D } from './Object3d'
import { Program, hasCached } from './webgl/Program'
import { NormalTexture, AlbedoTexture, EmissiveTexture, OcclusionTexture, MetalRoughnessTexture } from './Texture'
import { Attributes } from './webgl/Attributes'
import { Uniforms, SingleUniform, StructuredUniform } from './webgl/Uniforms'
import { Light, DirectionalLight } from './Light'
import { Scene } from './Scene'

const WEBGL_COMPONENT_TYPES = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
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
  public shaders: any = {}
  public MAX_TEXTURE: number = 16
  public textureUnits: number = 0
  public activedProgram?: Program
  public directionalLights: (DirectionalLight)[] = []

  public constructor (canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext('webgl')
    this.gl.clearColor(0.0, 0.0, 0.0, 1.0)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    this.projectMatrix = this.initProjectMatrix()
    this.camera = new Camera(this)
    this.view = this.camera.getViewMatrix()
    this.directionalLights.push(new DirectionalLight(vec3.fromValues(1, 1, 1), vec3.fromValues(1, 1, 1)))
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

  renderObject (obj: Object3D | Scene | Mesh, matrix: mat4) {
    const needsUpdate = obj.matrixWorldNeedsUpdate
    if (needsUpdate) {
      obj.updateMatrix()
      obj.updateMatrixWorld(matrix)
      matrix = obj.modelMatrix
      obj.matrixWorldNeedsUpdate = false
    }
    if (obj instanceof Object3D) {
      for (let c of obj.children) {
        if (needsUpdate) {
          c.matrixWorldNeedsUpdate = true
        }
        this.renderObject(c, matrix)
      }
      if (obj instanceof Mesh) {
        this.renderMesh(obj)
      }
      return
    }
  }

  renderMesh (mesh: Mesh) {
    this.textureUnits = 0

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
    if (this.activedProgram !== mesh.program) {
      gl.useProgram(program)
      this.activedProgram = mesh.program
    }
    const uniforms = mesh.program.getUniforms()
    const attrs = mesh.program.getAttributes()
    // return
    const vertexBuffer = this.initBufferData(mesh.geometry.vertices)
    const normalBuffer = this.initBufferData(mesh.geometry.normals)
    const texcoordBuffer = this.initBufferData(mesh.geometry.textureCoords)
    const tangentBuffer = this.initBufferData(mesh.geometry.tangent)
    const colorBuffer = this.initBufferData(mesh.geometry.color)
    if (vertexBuffer) {
      gl.bindBuffer(mesh.geometry.vertices.target, vertexBuffer)
      gl.vertexAttribPointer(
                attrs.map.position.addr,
                mesh.geometry.vertices.size,
                mesh.geometry.vertices.componentType,
                mesh.geometry.vertices.normalized,
                mesh.geometry.vertices.stride,
                mesh.geometry.vertices.offset)
      gl.enableVertexAttribArray(attrs.map.position.addr)
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
    //   gl.enableVertexAttribArray(attrs.map.normal.addr)
    // }
    if (texcoordBuffer) {
      gl.bindBuffer(mesh.geometry.textureCoords.target, texcoordBuffer)
      gl.vertexAttribPointer(
                attrs.map.uv.addr,
                mesh.geometry.textureCoords.size,
                mesh.geometry.textureCoords.componentType,
                mesh.geometry.textureCoords.normalized,
                mesh.geometry.textureCoords.stride,
                mesh.geometry.textureCoords.offset)
      gl.enableVertexAttribArray(attrs.map.uv.addr)
    }
    // if (tangentBuffer) {
    //   gl.bindBuffer(mesh.geometry.tangent.target, tangentBuffer)
    //   gl.vertexAttribPointer(
    //             this.programInfo.attribLocations.tangent,
    //             mesh.geometry.tangent.size,
    //             mesh.geometry.tangent.componentType,
    //             mesh.geometry.tangent.normalized,
    //             mesh.geometry.tangent.stride,
    //             mesh.geometry.tangent.offset)
    //   gl.enableVertexAttribArray(attrs.map.tangent.addr)
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
    const uniformList = mesh.material.shader.uniforms
    gl.uniformMatrix4fv(uniforms.map.projectMatrix.addr, false, this.projectMatrix)
    gl.uniformMatrix4fv(uniforms.map.modelMatrix.addr, false, mesh.modelMatrix)
    gl.uniformMatrix4fv(uniforms.map.viewMatrix.addr, false, this.view)
    const normalTexture = mesh.material.normalTexture
    if (normalTexture) {
      let gltexture
      gltexture = normalTexture.getGLTexture(gl)
      uniformList.normalMap.value = this.textureUnits
      uniformList.normalMap.gltexture = gltexture
      this.textureUnits++
    }
    const albedoTexture = mesh.material.albedoTexture
    if (albedoTexture) {
      let gltexture
      gltexture = albedoTexture.getGLTexture(gl)
      uniformList.texture.value = this.textureUnits
      uniformList.texture.gltexture = gltexture
      this.textureUnits++
    }
    const occlusionTexture = mesh.material.occlusionTexture
    if (occlusionTexture) {
      let gltexture
      gltexture = occlusionTexture.getGLTexture(gl)
      uniformList.aoMap.value = this.textureUnits
      uniformList.aoMap.gltexture = gltexture
      this.textureUnits++
    }
    const metalRoughnessTexture = mesh.material.metalRoughnessTexture
    if (metalRoughnessTexture) {
      let gltexture
      gltexture = metalRoughnessTexture.getGLTexture(gl)
      uniformList.metalroughnessMap.value = this.textureUnits
      uniformList.metalroughnessMap.gltexture = gltexture
      this.textureUnits++
    }
    const emissiveTexture = mesh.material.emissiveTexture
    if (emissiveTexture) {
      let gltexture
      gltexture = emissiveTexture.getGLTexture(gl)
      uniformList.emissiveMap.value = this.textureUnits
      uniformList.emissiveMap.gltexture = gltexture
      uniformList.emissive.value = emissiveTexture.factor
      this.textureUnits++
    }
    for (let i = 0; i < this.directionalLights.length; i++) {
      const light = this.directionalLights[i]
      uniformList.directionalLights.value[`directionalLights[${i}].direction`] = {
        value: light.direction
      }
      uniformList.directionalLights.value[`directionalLights[${i}].color`] = {
        value: light.color
      }
    }
    for (let u of uniforms.array) {
      const v = uniformList[u.id]
      if (uniformList[u.id]) {
        if (u instanceof SingleUniform) {
          if (v.gltexture) {
            u.setValue(gl, v.value, v.gltexture)
          } else {
            u.setValue(gl, v.value)
          }
        } else if (u instanceof StructuredUniform) {
          u.setValue(gl, v.value)
        }
      }
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
    gl.clearColor(0.1, 0.1, 0.1, 1.0)
    gl.clearDepth(1.0)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    this.projectMatrix = this.initProjectMatrix()
    this.view = this.camera.getViewMatrix()
    for (let obj of this.objects) {
      const matrix = mat4.create()
      mat4.identity(matrix)
      this.renderObject(obj, matrix)
    }
  }
}
