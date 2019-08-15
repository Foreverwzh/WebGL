import { Object3D } from '../Object3d'
import ShaderLib from '../shaders/ShaderLib'
import { Mesh } from '../Mesh'
import { Material } from '../Material'
import { ShaderChunk } from '../shaders/ShaderChunk'
import { Uniforms } from './Uniforms'
import { Attributes } from './Attributes'

export class Program {
  public vertexShader: WebGLShader
  public fragmentShader: WebGLShader
  public program: WebGLProgram
  public code: string
  public usedNum: number = 1
  public gl: WebGLRenderingContext
  public cachedUniforms?: Uniforms
  public cachedAttributes?: Attributes

  constructor (gl: WebGLRenderingContext, object: Mesh) {
    this.gl = gl
    object.program = this
    const material = object.material
    const shader = material.shader
    if (!shader) {
      throw new Error('unknown material type')
    }
    material.onBeforeCompile(shader, this)
    this.program = gl.createProgram()
    gl.getExtension('OES_standard_derivatives')
    gl.getExtension('EXT_shader_texture_lod')
    const prefixVertex = [
      'precision highp float;',
      'precision highp int;',

      // '#define SHADER_NAME ' + shader.name,

      // customDefines,

      material.albedoTexture ? '#define USE_TEXTURE' : '',
      material.emissiveTexture ? '#define USE_EMISSIVEMAP' : '',
      material.normalTexture ? '#define USE_NORMALMAP' : '',
      material.metalRoughnessTexture ? '#define USE_METALROUGHNESSMAP' : '',
      // parameters.vertexTangents ? '#define USE_TANGENT' : '',
      // parameters.vertexColors ? '#define USE_COLOR' : '',

      // parameters.flatShading ? '#define FLAT_SHADED' : '',
      material.doubleSided ? '#define DOUBLE_SIDED' : '',
      // parameters.flipSided ? '#define FLIP_SIDED' : '',

      'uniform mat4 modelMatrix;',
      'uniform mat4 projectMatrix;',
      'uniform mat4 viewMatrix;',

      'attribute vec3 position;',
      'attribute vec3 normal;',
      'attribute vec2 uv;',
      '\n'
    ].filter(str => str !== '').join('\n')

    const prefixFragment = [
      // '#extension GL_EXT_shader_texture_lod : enable',
      // '#extension GL_OES_standard_derivatives : enable',
      // customExtensions,
      'precision highp float;',
      'precision highp int;',

      // '#define SHADER_NAME ' + shader.name,

      // customDefines,

      material.albedoTexture ? '#define USE_TEXTURE' : '',
      material.emissiveTexture ? '#define USE_EMISSIVEMAP' : '',
      material.normalTexture ? '#define USE_NORMALMAP' : '',
      material.metalRoughnessTexture ? '#define USE_METALROUGHNESSMAP' : '',
      // parameters.vertexTangents ? '#define USE_TANGENT' : '',
      // parameters.vertexColors ? '#define USE_COLOR' : '',
      // parameters.flatShading ? '#define FLAT_SHADED' : '',

      material.doubleSided ? '#define DOUBLE_SIDED' : '',
      // parameters.flipSided ? '#define FLIP_SIDED' : '',
      '\n'

    ].filter(str => str !== '').join('\n')

    const parameters = getParameters(material)
    this.code = getProgramCode(material, parameters)
    let vs_code = shader.vertexShader
    let fs_code = shader.fragmentShader
    vs_code = this.parseIncludes(vs_code)
    vs_code = this.replaceLightNums(vs_code, parameters)
    vs_code = this.unrollLoops(vs_code)
    vs_code = prefixVertex + vs_code

    fs_code = this.parseIncludes(fs_code)
    fs_code = this.replaceLightNums(fs_code, parameters)
    fs_code = this.unrollLoops(fs_code)
    fs_code = prefixFragment + fs_code
    // console.log(vs_code)
    // console.log(fs_code)
    this.vertexShader = this.WebGLShader(gl, gl.VERTEX_SHADER, vs_code)
    this.fragmentShader = this.WebGLShader(gl, gl.FRAGMENT_SHADER, fs_code)
    gl.attachShader(this.program, this.vertexShader)
    gl.attachShader(this.program, this.fragmentShader)
    gl.linkProgram(this.program)
    gl.deleteShader(this.vertexShader)
    gl.deleteShader(this.fragmentShader)
  }

  WebGLShader (gl: WebGLRenderingContext, type: number, str: string) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, str)
    gl.compileShader(shader)
    const info = gl.getShaderInfoLog(shader)
    if (info.length > 0) {
      throw info
    }
    return shader
  }

  parseIncludes (str: string) {
    const _this = this
    let pattern = /^[ \t]*#include +<([\w\d./]+)>/gm
    function replace (match, include) {
      let replace = ShaderChunk[include]
      if (replace === undefined) {
        throw new Error('Can not resolve #include <' + include + '>')
      }
      return _this.parseIncludes(replace)
    }
    return str.replace(pattern, replace)
  }

  unrollLoops (str: string) {
    let pattern = /#pragma unroll_loop[\s]+?for \( int i \= (\d+)\; i < (\d+)\; i \+\+ \) \{([\s\S]+?)(?=\})\}/g
    function replace (match, start, end, snippet) {
      let unroll = ''
      for (let i = parseInt(start, 10); i < parseInt(end, 10); i++) {
        unroll += snippet.replace(/\[ i \]/g, '[ ' + i + ' ]')
      }
      return unroll
    }
    return str.replace(pattern, replace)

  }

  replaceLightNums (str: string, parameters) {
    return str
      .replace(/NUM_DIR_LIGHTS/g, parameters.numDirLights)
      .replace(/NUM_SPOT_LIGHTS/g, parameters.numSpotLights)
      .replace(/NUM_RECT_AREA_LIGHTS/g, parameters.numRectAreaLights)
      .replace(/NUM_POINT_LIGHTS/g, parameters.numPointLights)
      .replace(/NUM_HEMI_LIGHTS/g, parameters.numHemiLights)
  }

  getUniforms () {
    if (this.cachedUniforms === undefined) {
      this.cachedUniforms = new Uniforms(this.gl, this.program)
    }
    return this.cachedUniforms
  }

  getAttributes () {
    if (this.cachedAttributes === undefined) {
      this.cachedAttributes = new Attributes(this.gl, this.program)
    }
    return this.cachedAttributes
  }

  // getEncodingComponents (encoding) {

  //   switch (encoding) {

  //     case 'LinearEncoding':
  //       return ['Linear', '( value )']
  //     case 'sRGBEncoding':
  //       return ['sRGB', '( value )']
  //     case 'RGBEEncoding':
  //       return ['RGBE', '( value )']
  //     case 'RGBM7Encoding':
  //       return ['RGBM', '( value, 7.0 )']
  //     case 'RGBM16Encoding':
  //       return ['RGBM', '( value, 16.0 )']
  //     case 'RGBDEncoding':
  //       return ['RGBD', '( value, 256.0 )']
  //     case 'GammaEncoding':
  //       return ['Gamma', '( value, float( GAMMA_FACTOR ) )']
  //     default:
  //       throw new Error('unsupported encoding: ' + encoding)

  //   }

  // }

  // getTexelDecodingFunction (functionName, encoding) {

  //   let components = this.getEncodingComponents(encoding)
  //   return 'vec4 ' + functionName + '( vec4 value ) { return ' + components[ 0 ] + 'ToLinear' + components[ 1 ] + '; }'

  // }

  // getTexelEncodingFunction (functionName, encoding) {

  //   let components = this.getEncodingComponents(encoding)
  //   return 'vec4 ' + functionName + '( vec4 value ) { return LinearTo' + components[ 0 ] + components[ 1 ] + '; }'

  // }

}
function getProgramCode (material: Material, parameters: any) {
  const code = []
  for (let key in parameters) {
    code.push(parameters[key])
  }
  return code.join()
}

function getParameters (material: Material) {
  return {
    type: material.type,
    albedoTexture: !!material.albedoTexture,
    normalTexture: !!material.normalTexture,
    emissiveTexture: !!material.emissiveTexture,
    metalRoughnessTexture: !!material.metalRoughnessTexture,
    occlusionTexture: !!material.occlusionTexture,
    doubleSided: !!material.doubleSided,
    numDirLights: 0,
    numSpotLights: 0,
    numRectAreaLights: 0,
    numPointLights: 0,
    numHemiLights: 0,
    numClippingPlanes: 0,
    numClipIntersection: 0
  }
}

export function hasCached (material, programs: Program[]) {
  const parameters = getParameters(material)
  const code = getProgramCode(material, parameters)
  for (let p of programs) {
    if (p.code === code) {
      return p
    }
  }
  return false
}
