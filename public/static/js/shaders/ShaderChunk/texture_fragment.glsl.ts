export default /* glsl */`
#ifdef USE_TEXTURE

	vec4 texelColor = texture2D( texture, vUv );
	texelColor = sRGBToLinear(texelColor);
	diffuseColor *= texelColor;

#endif
`
