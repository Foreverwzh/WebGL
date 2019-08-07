/**
 * Uniform Utilities
 */

export function cloneUniforms (src) {

  let dst = {}

  for (let u in src) {

    dst[ u ] = {}

    for (let p in src[ u ]) {

      let property = src[ u ][ p ]

      if (property && (property.isColor ||
        property.isMatrix3 || property.isMatrix4 ||
        property.isVector2 || property.isVector3 || property.isVector4 ||
        property.isTexture)) {

        dst[ u ][ p ] = property.clone()

      } else if (Array.isArray(property)) {

        dst[ u ][ p ] = property.slice()

      } else {

        dst[ u ][ p ] = property

      }

    }

  }

  return dst

}

export function mergeUniforms (uniforms) {

  let merged = {}

  for (let u = 0; u < uniforms.length; u ++) {

    let tmp = cloneUniforms(uniforms[ u ])

    for (let p in tmp) {

      merged[ p ] = tmp[ p ]

    }

  }

  return merged

}

// Legacy

const UniformsUtils = { clone: cloneUniforms, merge: mergeUniforms }

export { UniformsUtils }
