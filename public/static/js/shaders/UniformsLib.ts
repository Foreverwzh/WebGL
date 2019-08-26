import { mat3, vec2, vec4, vec3 } from 'gl-matrix'

const UniformsLib = {

  common: {

    diffuse: { value: [238, 238, 238] },
    opacity: { value: 1.0 },

    texture: { value: null },
    uvTransform: { value: mat3.create() },

    alphaMap: { value: null }

  },

  specularmap: {

    specularMap: { value: null }

  },

  envmap: {

    envMap: { value: null },
    flipEnvMap: { value: - 1 },
    reflectivity: { value: 1.0 },
    refractionRatio: { value: 0.98 },
    maxMipLevel: { value: 0 }

  },

  aomap: {

    aoMap: { value: null },
    aoMapIntensity: { value: 1 }

  },

  lightmap: {

    lightMap: { value: null },
    lightMapIntensity: { value: 1 }

  },

  emissivemap: {

    emissiveMap: { value: null }

  },

  bumpmap: {

    bumpMap: { value: null },
    bumpScale: { value: 1 }

  },

  normalmap: {

    normalMap: { value: null },
    normalScale: { value: vec2.fromValues(1, 1) }

  },

  displacementmap: {

    displacementMap: { value: null },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }

  },

  roughnessmap: {

    roughnessMap: { value: null }

  },

  metalnessmap: {

    metalnessMap: { value: null }

  },

  metalroughnessmap: {

    metalroughnessMap: { value: null }

  },

  lights: {

    ambientLightColor: { value: vec3.fromValues(0.03, 0.03, 0.03) },

    lightProbe: { value: vec3.fromValues(1, 1, 1) },

    directionalLights: { value: {}, properties: {
      direction: {},
      color: {},

      shadow: {},
      shadowBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },

    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },

    spotLights: { value: [], properties: {
      color: {},
      position: {},
      direction: {},
      distance: {},
      coneCos: {},
      penumbraCos: {},
      decay: {},

      shadow: {},
      shadowBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },

    spotShadowMap: { value: [] },
    spotShadowMatrix: { value: [] },

    pointLights: { value: [], properties: {
      color: {},
      position: {},
      decay: {},
      distance: {},

      shadow: {},
      shadowBias: {},
      shadowRadius: {},
      shadowMapSize: {},
      shadowCameraNear: {},
      shadowCameraFar: {}
    } },

    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },

    hemisphereLights: { value: [], properties: {
      direction: {},
      skyColor: {},
      groundColor: {}
    } },

    // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
    rectAreaLights: { value: [], properties: {
      color: {},
      position: {},
      width: {},
      height: {}
    } }

  },

  points: {

    diffuse: { value: [238, 238, 238] },
    opacity: { value: 1.0 },
    size: { value: 1.0 },
    scale: { value: 1.0 },
    texture: { value: null },
    uvTransform: { value: mat3.create() }

  },

  sprite: {

    diffuse: { value: [238, 238, 238] },
    opacity: { value: 1.0 },
    center: { value: vec2.fromValues(0.5, 0.5) },
    rotation: { value: 0.0 },
    texture: { value: null },
    uvTransform: { value: mat3.create() }

  }

}

export { UniformsLib }
