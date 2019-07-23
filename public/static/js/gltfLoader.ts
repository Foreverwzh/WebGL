import { Mesh } from './mesh'
import { VertexAttribute, Geometry } from './geometry'
import { Material } from './material'
import { Group } from './group'
import axios from 'axios'

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

export class GLTFLoader {
  public gltf: GLTF
  public bufferData: any

  load (data: GLTF): Group {
    this.gltf = data
    this.bufferData = {}
    const gltf = this.gltf
    const currentScene = gltf.scene
    const nodesIndices = gltf.scenes[currentScene].nodes
    const meshs = new Group()
    nodesIndices.forEach(index => {
      const node = gltf.nodes[index]
      const meshIndex = node.mesh
      if (typeof meshIndex === 'number') {
        const mesh = this.createMesh(gltf.meshes[meshIndex])
        mesh.parent = mesh
        meshs.add(mesh)
      }
    })
    return meshs

  }

  createMesh (info): Group {
    const mesh = new Group()
    info.primitives.forEach(primitive => {
      const geometry = this.createGeometry(primitive)
      const material = this.createMaterial(primitive)
      const submesh = new Mesh(geometry, material)
      submesh.parent = mesh
      mesh.add(submesh)
    })
    return mesh
  }

  createGeometry (primitive): Geometry {
    const attrs = primitive.attributes
    const vertices = this.getBufferData(attrs.POSITION)
    const nomals = this.getBufferData(attrs.NORMAL)
    const coords = this.getBufferData(attrs.TEXCOORD_0)
    const geometry = new Geometry(vertices, nomals, coords)
    return geometry
  }

  getBufferData (accessorIndex: number) {
    if (typeof accessorIndex !== 'number') return {}
    const accessor = this.gltf.accessors[accessorIndex]
    const bufferView = this.gltf.bufferViews[accessor.bufferView]
    const bufferIndex = bufferView.buffer
    let data
    if (this.bufferData[bufferIndex]) {
      data = this.bufferData[bufferIndex]
    } else {
      const buffer = this.gltf.buffers[bufferIndex]
      const dataUriRegex = /^data:(.*?)\;(base64)?,(.*)$/
      const dataUriRegexResult = dataUriRegex.exec(buffer.uri)
      if (dataUriRegexResult === null) {
        axios.get(buffer.uri).then(res => {
          this.bufferData[bufferIndex] = res.data
          data = res.data
        }).catch(err => {
          console.error(`load ${buffer.uri} error: ${err}`)
        })
      } else {
        data = this.decodeDataUri(buffer.uri, 'arraybuffer')
      }
      this.bufferData[bufferIndex] = data
    }
    return {
      data: data,
      type: this.getComponentType(accessor.componentType),
      normalized: accessor.normalized || false,
      offset: bufferView.byteOffset || 0,
      stride: bufferView.byteStride,
      target: this.getTargetType(bufferView.target || 34962),
      size: this.getSize(accessor.type),
      count: accessor.count
    }
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

  createMaterial (primitive): Material {
    const material = new Material()
    return material
  }

  getComponentType (num: number): string {
    let str: string
    switch (num) {
      case 5120:
        str = 'BYTE'
        break
      case 5121:
        str = 'UNSIGNED_BYTE'
        break
      case 5122:
        str = 'SHORT'
        break
      case 5123:
        str = 'UNSIGNED_SHORT'
        break
      case 5125:
        str = 'UNSIGNED_INT'
        break
      case 5126:
        str = 'FLOAT'
        break
      default:
        str = 'FlOAT'
    }
    return str
  }

  getTargetType (num: number): string {
    let str: string
    switch (num) {
      case 34962:
        str = 'ARRAY_BUFFER'
        break
      case 34963:
        str = 'ELEMENT_ARRAY_BUFFER'
        break
      default:
        str = 'ARRAY_BUFFER'
    }
    return str
  }

  getSize (str: string): number {
    let num: number
    switch (str) {
      case 'SCALAR':
        num = 1
        break
      case 'VEC2':
        num = 2
        break
      case 'VEC3':
        num = 3
        break
      case 'VEC4':
        num = 4
        break
      case 'MAT2':
        num = 4
        break
      case 'MAT3':
        num = 9
        break
      case 'MAT4':
        num = 16
        break
      default:
        num = 3
    }
    return num
  }
}
