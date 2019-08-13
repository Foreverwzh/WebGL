export default /* glsl */`
#ifdef USE_MAP

	vec4 texelColor = texture2D( map, vUv );

	diffuseColor *= texelColor;

#endif
`
