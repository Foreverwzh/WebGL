import { mergeUniforms } from './UniformsUtils'
import { UniformsLib } from './UniformsLib'
import { ShaderChunk } from './ShaderChunk'

export default {
  // basic: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.common,
  //     UniformsLib.specularmap,
  //     UniformsLib.envmap,
  //     UniformsLib.aomap,
  //     UniformsLib.lightmap,
  //     UniformsLib.fog
  //   ]),

  //   vertexShader: ShaderChunk.meshbasic_vert,
  //   fragmentShader: ShaderChunk.meshbasic_frag

  // },

  // lambert: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.common,
  //     UniformsLib.specularmap,
  //     UniformsLib.envmap,
  //     UniformsLib.aomap,
  //     UniformsLib.lightmap,
  //     UniformsLib.emissivemap,
  //     UniformsLib.fog,
  //     UniformsLib.lights,
  //     {
  //       emissive: { value: new Color(0x000000) }
  //     }
  //   ]),

  //   vertexShader: ShaderChunk.meshlambert_vert,
  //   fragmentShader: ShaderChunk.meshlambert_frag

  // },

  // phong: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.common,
  //     UniformsLib.specularmap,
  //     UniformsLib.envmap,
  //     UniformsLib.aomap,
  //     UniformsLib.lightmap,
  //     UniformsLib.emissivemap,
  //     UniformsLib.bumpmap,
  //     UniformsLib.normalmap,
  //     UniformsLib.displacementmap,
  //     UniformsLib.gradientmap,
  //     UniformsLib.fog,
  //     UniformsLib.lights,
  //     {
  //       emissive: { value: new Color(0x000000) },
  //       specular: { value: new Color(0x111111) },
  //       shininess: { value: 30 }
  //     }
  //   ]),

  //   vertexShader: ShaderChunk.meshphong_vert,
  //   fragmentShader: ShaderChunk.meshphong_frag

  // },

  standard: {

    uniforms: mergeUniforms([
      UniformsLib.common,
      UniformsLib.envmap,
      UniformsLib.emissivemap,
      UniformsLib.normalmap,
      UniformsLib.roughnessmap,
      UniformsLib.metalnessmap,
      {
        emissive: { value: [0, 0, 0] },
        roughness: { value: 0.5 },
        metalness: { value: 0.5 }
      }
    ]),

    vertexShader: ShaderChunk.meshphysical_vert,
    fragmentShader: ShaderChunk.meshphysical_frag

  }

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

  // depth: {

  //   uniforms: mergeUniforms([
  //     UniformsLib.common,
  //     UniformsLib.displacementmap
  //   ]),

  //   vertexShader: ShaderChunk.depth_vert,
  //   fragmentShader: ShaderChunk.depth_frag

  // },

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

  // background: {

  //   uniforms: {
  //     uvTransform: { value: new Matrix3() },
  //     t2D: { value: null }
  //   },

  //   vertexShader: ShaderChunk.background_vert,
  //   fragmentShader: ShaderChunk.background_frag

  // },

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
