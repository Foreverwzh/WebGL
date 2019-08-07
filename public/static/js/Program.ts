import { Object3D } from './Object3d'
import ShaderLib from './shaders/ShaderLib'
import { Mesh } from './Mesh'
import { Material } from './Material'
import { ShaderChunk } from './shaders/ShaderChunk'

export class Program {
  public vertexShader: WebGLShader
  public fragmentShader: WebGLShader
  public program: WebGLProgram
  public code: string
  public usedNum: number = 1
  constructor (gl: WebGLRenderingContext, object: Mesh) {
    object.program = this
    const material = object.material
    const shader = ShaderLib[material.type] || ShaderLib.standard
    this.program = gl.createProgram()
    const prefixVertex = [
      'precision highp float;',
      'precision highp int;',

      // '#define SHADER_NAME ' + shader.name,

      // customDefines,

      // parameters.supportsVertexTextures ? '#define VERTEX_TEXTURES' : '',

      // '#define GAMMA_FACTOR ' + gammaFactorDefine,

      // '#define MAX_BONES ' + parameters.maxBones,
      // ( parameters.useFog && parameters.fog ) ? '#define USE_FOG' : '',
      // ( parameters.useFog && parameters.fogExp ) ? '#define FOG_EXP2' : '',

      // parameters.map ? '#define USE_MAP' : '',
      // parameters.envMap ? '#define USE_ENVMAP' : '',
      // parameters.envMap ? '#define ' + envMapModeDefine : '',
      // parameters.lightMap ? '#define USE_LIGHTMAP' : '',
      // parameters.aoMap ? '#define USE_AOMAP' : '',
      material.emissiveTexture ? '#define USE_EMISSIVEMAP' : '',
      // parameters.bumpMap ? '#define USE_BUMPMAP' : '',
      material.normalTexture ? '#define USE_NORMALMAP' : '',
      // ( parameters.normalMap && parameters.objectSpaceNormalMap ) ? '#define OBJECTSPACE_NORMALMAP' : '',
      // parameters.displacementMap && parameters.supportsVertexTextures ? '#define USE_DISPLACEMENTMAP' : '',
      // parameters.specularMap ? '#define USE_SPECULARMAP' : '',
      material.metalRoughnessTexture ? '#define USE_ROUGHNESSMAP' : '',
      material.metalRoughnessTexture ? '#define USE_METALNESSMAP' : '',
      // parameters.alphaMap ? '#define USE_ALPHAMAP' : '',

      // parameters.vertexTangents ? '#define USE_TANGENT' : '',
      // parameters.vertexColors ? '#define USE_COLOR' : '',

      // parameters.flatShading ? '#define FLAT_SHADED' : '',

      // parameters.skinning ? '#define USE_SKINNING' : '',
      // parameters.useVertexTexture ? '#define BONE_TEXTURE' : '',

      // parameters.morphTargets ? '#define USE_MORPHTARGETS' : '',
      // parameters.morphNormals && parameters.flatShading === false ? '#define USE_MORPHNORMALS' : '',
      material.doubleSided ? '#define DOUBLE_SIDED' : '',
      // parameters.flipSided ? '#define FLIP_SIDED' : '',

      // parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
      // parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

      // parameters.sizeAttenuation ? '#define USE_SIZEATTENUATION' : '',

      // parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
      // parameters.logarithmicDepthBuffer && ( capabilities.isWebGL2 || extensions.get( 'EXT_frag_depth' ) ) ? '#define USE_LOGDEPTHBUF_EXT' : '',

      'uniform mat4 modelMatrix;',
      'uniform mat4 modelViewMatrix;',
      'uniform mat4 projectionMatrix;',
      'uniform mat4 viewMatrix;',
      'uniform mat3 normalMatrix;',
      'uniform vec3 cameraPosition;',

      'attribute vec3 position;',
      'attribute vec3 normal;',
      'attribute vec2 uv;',

      '#ifdef USE_TANGENT',

      '	attribute vec4 tangent;',

      '#endif',

      '#ifdef USE_COLOR',

      '	attribute vec3 color;',

      '#endif',

      '#ifdef USE_MORPHTARGETS',

      '	attribute vec3 morphTarget0;',
      '	attribute vec3 morphTarget1;',
      '	attribute vec3 morphTarget2;',
      '	attribute vec3 morphTarget3;',

      '	#ifdef USE_MORPHNORMALS',

      '		attribute vec3 morphNormal0;',
      '		attribute vec3 morphNormal1;',
      '		attribute vec3 morphNormal2;',
      '		attribute vec3 morphNormal3;',

      '	#else',

      '		attribute vec3 morphTarget4;',
      '		attribute vec3 morphTarget5;',
      '		attribute vec3 morphTarget6;',
      '		attribute vec3 morphTarget7;',

      '	#endif',

      '#endif',

      '#ifdef USE_SKINNING',

      '	attribute vec4 skinIndex;',
      '	attribute vec4 skinWeight;',

      '#endif',

      '\n'
    ].filter(str => str !== '').join('\n')

    const prefixFragment = [

      // customExtensions,

      'precision highp float;',
      'precision highp int;',

      // '#define SHADER_NAME ' + shader.name,

      // customDefines,

      // parameters.alphaTest ? '#define ALPHATEST ' + parameters.alphaTest + ( parameters.alphaTest % 1 ? '' : '.0' ) : '', // add '.0' if integer

      // '#define GAMMA_FACTOR ' + gammaFactorDefine,

      // ( parameters.useFog && parameters.fog ) ? '#define USE_FOG' : '',
      // ( parameters.useFog && parameters.fogExp ) ? '#define FOG_EXP2' : '',

      // parameters.map ? '#define USE_MAP' : '',
      // parameters.matcap ? '#define USE_MATCAP' : '',
      // parameters.envMap ? '#define USE_ENVMAP' : '',
      // parameters.envMap ? '#define ' + envMapTypeDefine : '',
      // parameters.envMap ? '#define ' + envMapModeDefine : '',
      // parameters.envMap ? '#define ' + envMapBlendingDefine : '',
      // parameters.lightMap ? '#define USE_LIGHTMAP' : '',
      // parameters.aoMap ? '#define USE_AOMAP' : '',
      material.emissiveTexture ? '#define USE_EMISSIVEMAP' : '',
      // parameters.bumpMap ? '#define USE_BUMPMAP' : '',
      material.normalTexture ? '#define USE_NORMALMAP' : '',
      // ( parameters.normalMap && parameters.objectSpaceNormalMap ) ? '#define OBJECTSPACE_NORMALMAP' : '',
      // parameters.specularMap ? '#define USE_SPECULARMAP' : '',
      material.metalRoughnessTexture ? '#define USE_ROUGHNESSMAP' : '',
      material.metalRoughnessTexture ? '#define USE_METALNESSMAP' : '',
      // parameters.alphaMap ? '#define USE_ALPHAMAP' : '',

      // parameters.vertexTangents ? '#define USE_TANGENT' : '',
      // parameters.vertexColors ? '#define USE_COLOR' : '',

      // parameters.gradientMap ? '#define USE_GRADIENTMAP' : '',

      // parameters.flatShading ? '#define FLAT_SHADED' : '',

      material.doubleSided ? '#define DOUBLE_SIDED' : '',
      // parameters.flipSided ? '#define FLIP_SIDED' : '',

      // parameters.shadowMapEnabled ? '#define USE_SHADOWMAP' : '',
      // parameters.shadowMapEnabled ? '#define ' + shadowMapTypeDefine : '',

      // parameters.premultipliedAlpha ? '#define PREMULTIPLIED_ALPHA' : '',

      // parameters.physicallyCorrectLights ? '#define PHYSICALLY_CORRECT_LIGHTS' : '',

      // parameters.logarithmicDepthBuffer ? '#define USE_LOGDEPTHBUF' : '',
      // parameters.logarithmicDepthBuffer && ( capabilities.isWebGL2 || extensions.get( 'EXT_frag_depth' ) ) ? '#define USE_LOGDEPTHBUF_EXT' : '',

      // parameters.envMap && ( capabilities.isWebGL2 || extensions.get( 'EXT_shader_texture_lod' ) ) ? '#define TEXTURE_LOD_EXT' : '',

      'uniform mat4 viewMatrix;',
      'uniform vec3 cameraPosition;',

      // ( parameters.toneMapping !== NoToneMapping ) ? '#define TONE_MAPPING' : '',
      // ( parameters.toneMapping !== NoToneMapping ) ? ShaderChunk[ 'tonemapping_pars_fragment' ] : '', // this code is required here because it is used by the toneMapping() function defined below
      // ( parameters.toneMapping !== NoToneMapping ) ? getToneMappingFunction( 'toneMapping', parameters.toneMapping ) : '',

      // parameters.dithering ? '#define DITHERING' : '',

      // ( parameters.outputEncoding || parameters.mapEncoding || parameters.matcapEncoding || parameters.envMapEncoding || parameters.emissiveMapEncoding ) ?
      //   ShaderChunk[ 'encodings_pars_fragment' ] : '', // this code is required here because it is used by the various encoding/decoding function defined below
      // parameters.mapEncoding ? getTexelDecodingFunction( 'mapTexelToLinear', parameters.mapEncoding ) : '',
      // parameters.matcapEncoding ? getTexelDecodingFunction( 'matcapTexelToLinear', parameters.matcapEncoding ) : '',
      // parameters.envMapEncoding ? getTexelDecodingFunction( 'envMapTexelToLinear', parameters.envMapEncoding ) : '',
      // parameters.emissiveMapEncoding ? getTexelDecodingFunction( 'emissiveMapTexelToLinear', parameters.emissiveMapEncoding ) : '',
      // parameters.outputEncoding ? getTexelEncodingFunction( 'linearToOutputTexel', parameters.outputEncoding ) : '',

      // parameters.depthPacking ? '#define DEPTH_PACKING ' + material.depthPacking : '',

      '\n'

    ].filter(str => str !== '').join('\n')

    const parameters = getParameters(material)
    this.code = getProgramCode(material, parameters)
    let vs_code = shader.vertexShader
    let fs_code = shader.fragmentShader
    console.log(fs_code)
    vs_code = this.parseIncludes(vs_code)
    vs_code = this.replaceLightNums(vs_code, parameters)
    vs_code = this.replaceClippingPlaneNums(vs_code, parameters)
    vs_code = this.unrollLoops(vs_code)
    vs_code = prefixVertex + vs_code

    fs_code = this.parseIncludes(fs_code)
    fs_code = this.replaceLightNums(fs_code, parameters)
    fs_code = this.replaceClippingPlaneNums(fs_code, parameters)
    fs_code = this.unrollLoops(fs_code)
    fs_code = prefixFragment + fs_code

    console.log(fs_code)
    this.vertexShader = this.WebGLShader(gl, gl.VERTEX_SHADER, vs_code)
    this.fragmentShader = this.WebGLShader(gl, gl.FRAGMENT_SHADER, fs_code)
    gl.attachShader(this.program, this.vertexShader)
    gl.attachShader(this.program, this.fragmentShader)
  }

  WebGLShader (gl: WebGLRenderingContext, type: number, str: string) {
    const shader = gl.createShader(type)
    gl.shaderSource(shader, str)
    gl.compileShader(shader)
    return shader
  }

  parseIncludes (str: string) {
    const _this = this
    let pattern = /^[ \t]*#include +<([\w\d./]+)>/gm
    function replace (match, include) {
      let replace = ShaderChunk[ include ]
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
      for (let i = parseInt(start, 10); i < parseInt(end, 10); i ++) {
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

  replaceClippingPlaneNums (str: string, parameters) {
    return str
      .replace(/NUM_CLIPPING_PLANES/g, parameters.numClippingPlanes)
      .replace(/UNION_CLIPPING_PLANES/g, (parameters.numClippingPlanes - parameters.numClipIntersection).toString())
  }

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
    numDirLights: 1,
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
