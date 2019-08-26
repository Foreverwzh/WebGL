export default `
#ifdef USE_AO

  float ambientOcclusion = ( texture2D( aoMap, vUv ).r - 1.0 ) * aoMapIntensity + 1.0;
  reflectedLight.indirectDiffuse *= ambientOcclusion;

  #if defined( USE_ENVMAP ) && defined( PHYSICAL )

		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );

		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.specularRoughness );

	#endif

#endif
`
