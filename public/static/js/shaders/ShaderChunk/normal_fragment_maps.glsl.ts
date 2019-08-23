export default /* glsl */`
#ifdef USE_NORMALMAP

	vec3 normal = normalize(texture2D( normalMap, vUv ).xyz * 2.0 - 1.0);

#endif
`
