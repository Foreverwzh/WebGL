export default /* glsl */`
#if defined( USE_ENVMAP ) || defined( PHYSICAL )
	uniform float reflectivity;
	uniform float envMapIntensity;
#endif

#ifdef USE_ENVMAP

	uniform samplerCube envMap;
	uniform float flipEnvMap;
	uniform int maxMipLevel;

	uniform float refractionRatio;

#endif
`
