import { Mesh } from './mesh'
import { VertexAttribute, Geometry } from './geometry'
import { Material } from './material'
import { Group } from './group'
import { Texture, NormalTexture, EmissiveTexture, OcclusionTexture, AlbedoTexture } from './texture'
import { arrayBufferToImageURL } from './glTool'
import axios from 'axios'
import * as Path from 'path'

interface GLTF {
  accessors: any[]
  asset: any[]
  bufferViews: any[]
  buffers: any[]
  images: any[]
  materials: any[]
  meshes: any[]
  nodes: any[]
  samplers: any[]
  scene: number
  scenes: any[]
  textures: any[]
}

const WEBGL_CONSTANTS = {
  FLOAT: 5126,
  FLOAT_MAT3: 35675,
  FLOAT_MAT4: 35676,
  FLOAT_VEC2: 35664,
  FLOAT_VEC3: 35665,
  FLOAT_VEC4: 35666,
  LINEAR: 9729,
  REPEAT: 10497,
  SAMPLER_2D: 35678,
  POINTS: 0,
  LINES: 1,
  LINE_LOOP: 2,
  LINE_STRIP: 3,
  TRIANGLES: 4,
  TRIANGLE_STRIP: 5,
  TRIANGLE_FAN: 6,
  UNSIGNED_BYTE: 5121,
  UNSIGNED_SHORT: 5123
}

const WEBGL_COMPONENT_TYPES = {
  5120: Int8Array,
  5121: Uint8Array,
  5122: Int16Array,
  5123: Uint16Array,
  5125: Uint32Array,
  5126: Float32Array
}

const WEBGL_TYPE_SIZES = {
  'SCALAR': 1,
  'VEC2': 2,
  'VEC3': 3,
  'VEC4': 4,
  'MAT2': 4,
  'MAT3': 9,
  'MAT4': 16
}

const ATTRIBUTES = {
  POSITION: 'position',
  NORMAL: 'normal',
  TANGENT: 'tangent',
  TEXCOORD_0: 'uv',
  TEXCOORD_1: 'uv2',
  COLOR_0: 'color',
  WEIGHTS_0: 'skinWeight',
  JOINTS_0: 'skinIndex'
}

const PATH_PROPERTIES = {
  scale: 'scale',
  translation: 'position',
  rotation: 'quaternion',
  weights: 'morphTargetInfluences'
}

export class GLTFLoader {
  public gltf: GLTF
  public sourceURL: string
  public bufferData: any

  async load (url: string) {
    this.sourceURL = url
    const res = await axios.get(url)
    this.gltf = res.data
    console.log(this.gltf)
    this.bufferData = {}
    const gltf = this.gltf
    await this.loadAllBuffer()
    const meshs = new Group()
    gltf.nodes.forEach(node => {
      const meshIndex = node.mesh
      if (typeof meshIndex === 'number') {
        const mesh = this.createMesh(gltf.meshes[meshIndex])
        mesh.parent = mesh
        meshs.add(mesh)
      }
    })
    return meshs
  }

  async loadAllBuffer () {
    const bfs_info = this.gltf.buffers
    for (let i = 0; i < bfs_info.length; i++) {
      const buffer = bfs_info[i]
      const dataUriRegex = /^data:(.*?)\;(base64)?,(.*)$/
      const dataUriRegexResult = dataUriRegex.exec(buffer.uri)
      let data
      if (dataUriRegexResult === null) {
        const res = await axios.get(Path.resolve(this.sourceURL, `./../${buffer.uri}`), {
          responseType: 'arraybuffer'
        })
        const buf = res.data
        if (typeof buf === 'string') {
          const array_buffer = new Uint8Array(buf.length)
          for (let i = 0; i < buf.length; i ++) {
            array_buffer[ i ] = buf.charCodeAt(i) & 0xff
          }
          data = array_buffer.buffer
        } else {
          data = buf
        }
      } else {
        data = this.decodeDataUri(buffer.uri, 'arraybuffer')
      }
      this.bufferData[i] = data
    }
  }

  createMesh (info: any): Group {
    const mesh = new Group(info.name)
    info.primitives.forEach((primitive: any) => {
      const geometry = this.createGeometry(primitive)
      const material = this.createMaterial(primitive)
      const submesh = new Mesh(geometry, material)
      submesh.parent = mesh
      mesh.add(submesh)
    })
    return mesh
  }

  createGeometry (primitive: any): Geometry {
    const attrs = primitive.attributes
    const vertices = this.dataAttribute(attrs.POSITION)
    const nomals = this.dataAttribute(attrs.NORMAL)
    const coords = this.dataAttribute(attrs.TEXCOORD_0)
    const indices = this.getIndices(primitive.indices)
    const geometry = new Geometry(vertices, nomals, coords, indices)
    geometry.mode = primitive.mode
    return geometry
  }

  dataAttribute (accessorIndex: number | undefined) {
    if (typeof accessorIndex !== 'number') return {}
    const accessor = this.gltf.accessors[accessorIndex]
    const bufferView = this.gltf.bufferViews[accessor.bufferView]
    const bufferIndex = bufferView.buffer
    const data = this.getBufferData(bufferIndex)
    return {
      name: accessor.name,
      data: data,
      componentType: accessor.componentType,
      normalized: accessor.normalized || false,
      offset: (accessor.byteOffset || 0) + (bufferView.byteOffset || 0),
      stride: bufferView.byteStride,
      target: bufferView.target,
      size: WEBGL_TYPE_SIZES[accessor.type],
      count: accessor.count
    }
  }

  getBufferData (bufferIndex: number) {
    return this.bufferData[bufferIndex]
  }

  decodeDataUriText (isBase64: boolean, data: string): string {
    const result = decodeURIComponent(data)
    if (isBase64) {
      return atob(result)
    }
    return result
  }

  decodeDataUriArrayBuffer (isBase64: boolean, data: string): ArrayBuffer {
    const byteString = this.decodeDataUriText(isBase64, data)
    const buffer = new ArrayBuffer(byteString.length)
    let view = new Uint8Array(buffer)
    for (let i = 0; i < byteString.length; i++) {
      view[i] = byteString.charCodeAt(i)
    }
    return buffer
  }

  decodeDataUri (uri: string, responseType: string) {
    const dataUriRegex = /^data:(.*?)\;(base64)?,(.*)$/
    const dataUriRegexResult = dataUriRegex.exec(uri)
    const mimeType = dataUriRegexResult[1]
    const isBase64 = !!dataUriRegexResult[2]
    const data = dataUriRegexResult[3]

    switch (responseType) {
      case '':
      case 'text':
        return this.decodeDataUriText(isBase64, data)
      case 'arraybuffer':
        return this.decodeDataUriArrayBuffer(isBase64, data)
      case 'blob':
        let buffer = this.decodeDataUriArrayBuffer(isBase64, data)
        return new Blob([buffer], {
          type : mimeType
        })
      // case 'document':
      //   let parser = new DOMParser()
      //   return parser.parseFromString(this.decodeDataUriText(isBase64, data), mimeType)
      // case 'json':
      //   return JSON.parse(this.decodeDataUriText(isBase64, data))
      default:
        throw new Error('Unhandled responseType: ' + responseType)
    }
  }

  createMaterial (primitive: any): Material {
    const material = new Material()
    const materialIndex = primitive.material
    if (typeof materialIndex !== 'number') return material
    const materialInfo = this.gltf.materials[materialIndex]
    material.name = materialInfo.name || ''
    material.alphaMode = materialInfo.alphaMode || 'OPAQUE'
    if (material.alphaMode === 'BLEND') {
      material.transparent = true
    } else {
      material.transparent = false
      if (material.alphaMode === 'MASK') {
        material.alphaCutoff = materialInfo.alphaCutoff !== undefined ? materialInfo.alphaCutoff : 0.5
      }
    }
    if (materialInfo.normalTexture && typeof materialInfo.normalTexture.index === 'number') {
      const texture = this.createTexture(this.gltf.textures[materialInfo.normalTexture.index], 'normal')
      material.addNormalTexture(texture)
    }
    if (materialInfo.emissiveTexture && typeof materialInfo.emissiveTexture.index === 'number') {
      const texture = this.createTexture(this.gltf.textures[materialInfo.emissiveTexture.index], 'emissive')
      material.addEmissiveTexture(texture)
    }
    if (materialInfo.occlusionTexture && typeof materialInfo.occlusionTexture.index === 'number') {
      const texture = this.createTexture(this.gltf.textures[materialInfo.occlusionTexture.index], 'occlusion')
      material.addOcclusionTexture(texture)
    }
    if (materialInfo.pbrMetallicRoughness && materialInfo.pbrMetallicRoughness.baseColorTexture) {
      const texture: AlbedoTexture = this.createTexture(this.gltf.textures[materialInfo.pbrMetallicRoughness.baseColorTexture.index], 'pbr')
      texture.baseColorFactor = materialInfo.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1]
      texture.roughnessFactor = materialInfo.pbrMetallicRoughness.roughnessFactor || 1
      texture.metallicFactor = materialInfo.metallicFactor || 1
      material.addAlbedoTexture(texture)
    }
    return material
  }

  getIndices (accessorIndex: number | undefined) {
    if (typeof accessorIndex !== 'number') return null
    const accessor = this.gltf.accessors[accessorIndex]
    const bufferView = this.gltf.bufferViews[accessor.bufferView]
    if (bufferView.target !== 34963) return null
    const bufferIndex = bufferView.buffer
    const data = this.getBufferData(bufferIndex)

    return {
      data: data,
      componentType: accessor.componentType,
      offset: (accessor.byteOffset || 0) + (bufferView.byteOffset || 0),
      target: bufferView.target,
      size: WEBGL_TYPE_SIZES[accessor.type],
      count: accessor.count
    }
  }

  createTexture (texInfo: any, type: string) {
    let texture
    switch (type) {
      case 'normal':
        texture = new NormalTexture(texInfo.name)
        break
      case 'emissive':
        texture = new EmissiveTexture(texInfo.name)
        break
      case 'occlusion':
        texture = new OcclusionTexture(texInfo.name)
        break
      case 'pbr':
        texture = new AlbedoTexture(texInfo.name)
        break
    }
    if (typeof texInfo.source !== 'number') return texture
    const source = this.gltf.images[texInfo.source]
    if (source.uri) {
      texture.source = Path.resolve(this.sourceURL, `./../${source.uri}`)
    } else {
      const bufferView = this.gltf.bufferViews[source.bufferView]
      const bufferIndex = bufferView.buffer
      const data = this.getBufferData(bufferIndex)
      const imgData: ArrayBuffer = data.slice(bufferView.byteOffset || 0, (bufferView.byteOffset || 0) + (bufferView.byteLength || 0))
      const imageUrl = arrayBufferToImageURL(imgData, source.mimeType)
      texture.source = imageUrl
    }
    if (typeof texInfo.sampler !== 'number') return texture
    const sampler = this.gltf.samplers[texInfo.sampler]
    texture.setSampler(sampler)
    return texture
  }
}
