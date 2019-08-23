export default /* glsl */`
#if defined( USE_TEXTURE ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( USE_SPECULARMAP ) || defined( USE_ALPHAMAP ) || defined( USE_EMISSIVEMAP ) || defined( USE_ROUGHNESSMAP ) || defined( USE_METALNESSMAP ) || defined( USE_METALROUGHNESSMAP )

	varying vec2 vUv;

#endif
`
