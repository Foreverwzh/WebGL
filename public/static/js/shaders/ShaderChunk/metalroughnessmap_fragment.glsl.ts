export default /* glsl */`
#ifdef USE_METALROUGHNESSMAP

	vec3 metalroughness = normalize(texture2D( metalroughnessMap, vUv ).xyz * 2.0 - 1.0);
	float metallic = metalroughness.r;
	float roughness = metalroughness.g;
#endif
`
