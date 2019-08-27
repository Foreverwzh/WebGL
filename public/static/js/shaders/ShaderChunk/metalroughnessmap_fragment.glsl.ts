export default /* glsl */`
float metalnessFactor = metalness;
float roughnessFactor = roughness;
#ifdef USE_METALROUGHNESSMAP

	vec4 metalroughness = texture2D( metalroughnessMap, vUv );
	metalnessFactor *= metalroughness.b;
	roughnessFactor *= metalroughness.g;
#endif
`
