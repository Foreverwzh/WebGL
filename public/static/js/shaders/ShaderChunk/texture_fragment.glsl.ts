export default /* glsl */`
#ifdef USE_TEXTURE

	vec4 baseColor = texture2D( texture, vUv );

	diffuseColor *= baseColor;

#endif
`
