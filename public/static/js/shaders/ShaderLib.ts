import { mergeUniforms } from './UniformsUtils'
import { UniformsLib } from './UniformsLib'
import { ShaderChunk } from './ShaderChunk'
import { vec3 } from 'gl-matrix'

export default {
  standard: {

    uniforms: mergeUniforms([
      UniformsLib.common,
      UniformsLib.emissivemap,
      UniformsLib.normalmap,
      UniformsLib.metalroughnessmap,
      UniformsLib.aomap,
      UniformsLib.envmap,
      UniformsLib.lights,
      {
        emissive: { value: vec3.fromValues(1.0, 1.0, 1.0) },
        roughness: { value: 1 },
        metalness: { value: 1 },
        reflectivity: { value: 1.0 },
        clearCoat: { value: 0 },
        clearCoatRoughness: { value: 0 }
      }
    ]),

    vertexShader: ShaderChunk.meshphysical_vert,
    fragmentShader: ShaderChunk.meshphysical_frag

  },

  // matcap: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.common,
  //     UniformsLib.bumpmap,
  //     UniformsLib.normalmap,
  //     UniformsLib.displacementmap,
  //     UniformsLib.fog,
  //     {
  //       matcap: { value: null }
  //     }
  //   ]),

  //   vertexShader: ShaderChunk.meshmatcap_vert,
  //   fragmentShader: ShaderChunk.meshmatcap_frag

  // },

  // points: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.points,
  //     UniformsLib.fog
  //   ]),

  //   vertexShader: ShaderChunk.points_vert,
  //   fragmentShader: ShaderChunk.points_frag

  // },

  // dashed: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.common,
  //     UniformsLib.fog,
  //     {
  //       scale: { value: 1 },
  //       dashSize: { value: 1 },
  //       totalSize: { value: 2 }
  //     }
  //   ]),

  //   vertexShader: ShaderChunk.linedashed_vert,
  //   fragmentShader: ShaderChunk.linedashed_frag

  // },

  depth: {

    uniforms: mergeUniforms([
      // UniformsLib.common,
      // UniformsLib.displacementmap
    ]),

    vertexShader: ShaderChunk.depth_vert,
    fragmentShader: ShaderChunk.depth_frag

  },

  // normal: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.common,
  //     UniformsLib.bumpmap,
  //     UniformsLib.normalmap,
  //     UniformsLib.displacementmap,
  //     {
  //       opacity: { value: 1.0 }
  //     }
  //   ]),

  //   vertexShader: ShaderChunk.normal_vert,
  //   fragmentShader: ShaderChunk.normal_frag

  // },

  // sprite: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.sprite,
  //     UniformsLib.fog
  //   ]),

  //   vertexShader: ShaderChunk.sprite_vert,
  //   fragmentShader: ShaderChunk.sprite_frag

  // },

  background: {
    uniforms: mergeUniforms([
      {
        skybox: { value: null }
      }
    ]),
    vertexShader: ShaderChunk.background_vert,
    fragmentShader: ShaderChunk.background_frag
  }

  // cube: {

  //   uniforms: {
  //     tCube: { value: null },
  //     tFlip: { value: - 1 },
  //     opacity: { value: 1.0 }
  //   },

  //   vertexShader: ShaderChunk.cube_vert,
  //   fragmentShader: ShaderChunk.cube_frag

  // },

  // equirect: {

  //   uniforms: {
  //     tEquirect: { value: null }
  //   },

  //   vertexShader: ShaderChunk.equirect_vert,
  //   fragmentShader: ShaderChunk.equirect_frag

  // },

  // distanceRGBA: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.common,
  //     UniformsLib.displacementmap,
  //     {
  //       referencePosition: { value: new Vector3() },
  //       nearDistance: { value: 1 },
  //       farDistance: { value: 1000 }
  //     }
  //   ]),

  //   vertexShader: ShaderChunk.distanceRGBA_vert,
  //   fragmentShader: ShaderChunk.distanceRGBA_frag

  // },

  // shadow: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.lights,
  //     UniformsLib.fog,
  //     {
  //       color: { value: new Color(0x00000) },
  //       opacity: { value: 1.0 }
  //     }
  //   ]),

  //   vertexShader: ShaderChunk.shadow_vert,
  //   fragmentShader: ShaderChunk.shadow_frag
  // }
}
