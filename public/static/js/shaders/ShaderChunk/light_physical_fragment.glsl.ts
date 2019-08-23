export default `
PhysicalMaterial material;
material.ambientColor = baseColor * ambientOcclusion * vec4(ambientLightColor, 1.0);
material.diffuseColor = diffuseColor * (1.0 - metallic);
material.specularRoughness = clamp( roughness, 0.04, 1.0 );
material.specularColor = vec4(mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metallic ), 1.0);
material.clearCoat = saturate( clearCoat );
material.clearCoatRoughness = clamp( clearCoatRoughness, 0.04, 1.0 );
`
