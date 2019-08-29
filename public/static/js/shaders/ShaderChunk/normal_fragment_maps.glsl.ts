export default /* glsl */`
#ifdef USE_NORMALMAP

	normal = perturbNormal2Arb( -vViewPosition, normal );

#endif
`
