export default `
GeometricContext geometry;

geometry.position = -vViewPosition;
geometry.normal = normal;
geometry.viewDir = normalize( vViewPosition );

IncidentLight directLight;

#if NUM_DIR_LIGHTS > 0

  DirectionalLight directionalLight;

  for(int i = 0; i < NUM_DIR_LIGHTS; i++){
    directionalLight = directionalLights[i];
    getDirectionalDirectLightIrradiance(directionalLight, directLight);

    #ifdef USE_SHADOWMAP
		directLight.color *= all( bvec2( directionalLight.shadow, directLight.visible ) ) ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

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

  #if defined( USE_ENVMAP ) && defined( PHYSICAL ) && defined( ENVMAP_TYPE_CUBE_UV )

		irradiance += getLightProbeIndirectIrradiance( /*lightProbe,*/ geometry, maxMipLevel );

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearCoatRadiance = vec3( 0.0 );

  #if defined( USE_ENVMAP )

    radiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry, Material_BlinnShininessExponent( material ), maxMipLevel );

    clearCoatRadiance += getLightProbeIndirectRadiance( /*specularLightProbe,*/ geometry, Material_ClearCoat_BlinnShininessExponent( material ), maxMipLevel );

  #endif
#endif

`
