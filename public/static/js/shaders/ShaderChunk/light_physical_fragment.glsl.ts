export default `
PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * (1.0 - metalnessFactor);
material.specularRoughness = clamp( roughnessFactor, 0.04, 1.0 );
material.specularColor = mix( vec3( MAXIMUM_SPECULAR_COEFFICIENT * pow2( reflectivity ) ), diffuseColor.rgb, metalnessFactor );
material.clearCoat = saturate( clearCoat );
material.clearCoatRoughness = clamp( clearCoatRoughness, 0.04, 1.0 );
`
