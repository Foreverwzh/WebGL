export default `
GeometricContext geometry;

geometry.position = - vMVPosition.xyz;
geometry.normal = normal;
geometry.viewDir = normalize( vMVPosition.xyz );

IncidentLight directLight;
ReflectedLight reflectedLight;

#if NUM_DIR_LIGHTS > 0

  DirectionalLight directionalLight;

  for(int i = 0; i < NUM_DIR_LIGHTS; i++){
    directionalLight = directionalLights[i];
    getDirectionalDirectLightIrradiance(directionalLight, directLight);
    RE_Direct(directLight, geometry, material, reflectedLight);
  }

#endif
#if defined( RE_IndirectDiffuse )

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	irradiance += getLightProbeIrradiance( lightProbe, geometry );

	#if ( NUM_HEMI_LIGHTS > 0 )

		#pragma unroll_loop
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry );

		}

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearCoatRadiance = vec3( 0.0 );

#endif
`
