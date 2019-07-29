import { Mesh } from './mesh'
import { VertexAttribute, Geometry } from './geometry'
import { Material } from './material'
import { Group } from './group'
import { Texture, NormalTexture, EmissiveTexture, OcclusionTexture, PBRTexture } from './texture'
import { arrayBufferToImageURL } from './glTool'
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
    const mesh = new Group(info.name)
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
    const vertices = this.dataAttribute(attrs.POSITION)
    const nomals = this.dataAttribute(attrs.NORMAL)
    const coords = this.dataAttribute(attrs.TEXCOORD_0)
    const indices = this.getIndices(primitive.indices)
    const geometry = new Geometry(vertices, nomals, coords, indices)
    return geometry
  }

  dataAttribute (accessorIndex: number) {
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
      offset: accessor.byteOffset + bufferView.byteOffset,
      stride: bufferView.byteStride,
      target: bufferView.target,
      size: this.getSize(accessor.type),
      count: accessor.count
    }
  }

  getBufferData (bufferIndex: number) {
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
    return data
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
    const materialIndex = primitive.material
    if (typeof materialIndex !== 'number') return material
    const materialInfo = this.gltf.materials[materialIndex]
    material.name = materialInfo.name || ''
    // if (materialInfo.normalTexture && typeof materialInfo.normalTexture.index === 'number') {
    //   const texture = this.createTexture(this.gltf.textures[materialInfo.normalTexture.index], 'normal')
    //   material.addTexture(texture)
    // }
    // if (materialInfo.emissiveTexture && typeof materialInfo.emissiveTexture.index === 'number') {
    //   const texture = this.createTexture(this.gltf.textures[materialInfo.emissiveTexture.index], 'emissive')
    //   material.addTexture(texture)
    // }
    // if (materialInfo.occlusionTexture && typeof materialInfo.occlusionTexture.index === 'number') {
    //   const texture = this.createTexture(this.gltf.textures[materialInfo.occlusionTexture.index], 'occlusion')
    //   material.addTexture(texture)
    // }
    if (materialInfo.pbrMetallicRoughness && materialInfo.pbrMetallicRoughness.baseColorTexture) {
      const texture: PBRTexture = this.createTexture(this.gltf.textures[materialInfo.pbrMetallicRoughness.baseColorTexture.index], 'pbr')
      texture.baseColorFactor = materialInfo.pbrMetallicRoughness.baseColorFactor || [1, 1, 1, 1]
      texture.roughnessFactor = materialInfo.pbrMetallicRoughness.roughnessFactor || 1
      texture.metallicFactor = materialInfo.metallicFactor || 1
      material.addAlbedoMap(texture)
    }
    return material
  }

  getIndices (accessorIndex: number) {
    if (typeof accessorIndex !== 'number') return null
    const accessor = this.gltf.accessors[accessorIndex]
    const bufferView = this.gltf.bufferViews[accessor.bufferView]
    if (bufferView.target !== 34963) return null
    const bufferIndex = bufferView.buffer
    const data = this.getBufferData(bufferIndex)

    return {
      data: data,
      componentType: accessor.componentType,
      offset: accessor.byteOffset + bufferView.byteOffset,
      target: bufferView.target,
      size: this.getSize(accessor.type),
      count: accessor.count
    }
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

  createTexture (texInfo, type) {
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
        texture = new PBRTexture(texInfo.name)
        break
      default:
        texture = new Texture(texInfo.name)
    }
    if (typeof texInfo.source !== 'number') return texture
    const source = this.gltf.images[texInfo.source]
    const bufferView = this.gltf.bufferViews[source.bufferView]
    const bufferIndex = bufferView.buffer
    const data = this.getBufferData(bufferIndex)
    const imgData: ArrayBuffer = data.slice(bufferView.byteOffset, bufferView.byteOffset + bufferView.byteLength)
    const imageUrl = arrayBufferToImageURL(imgData, source.mimeType)
    texture.source = imageUrl
    // texture.source = new Uint8Array(imgData)
    if (typeof texInfo.sampler !== 'number') return texture
    const sampler = this.gltf.samplers[texInfo.sampler]
    texture.setSampler(sampler)
    return texture
  }
}
