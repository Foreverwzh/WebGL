export default `
struct PhysicalMaterial
{
  vec4 diffuseColor;
  vec4 specularColor;
  float specularRoughness;

  float clearCoat;
	float clearCoatRoughness;
};

#define MAXIMUM_SPECULAR_COEFFICIENT 0.16
#define DEFAULT_SPECULAR_COEFFICIENT 0.04

// Clear coat directional hemishperical reflectance (this approximation should be improved)
float clearCoatDHRApprox( const in float roughness, const in float dotNL ) {

	return DEFAULT_SPECULAR_COEFFICIENT + ( 1.0 - DEFAULT_SPECULAR_COEFFICIENT ) * ( pow( 1.0 - dotNL, 5.0 ) * pow( 1.0 - roughness, 2.0 ) );

}

void RE_Direct_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometry.normal, directLight.direction ) );

	vec3 irradiance = dotNL * directLight.color;

	#ifndef PHYSICALLY_CORRECT_LIGHTS

		irradiance *= PI; // punctual light

	#endif

	#ifndef STANDARD
		float clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );
	#else
		float clearCoatDHR = 0.0;
	#endif

	reflectedLight.directSpecular += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry, material.specularColor.rgb, material.specularRoughness );

	reflectedLight.directDiffuse += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor.rgb );

	#ifndef STANDARD

		reflectedLight.directSpecular += irradiance * material.clearCoat * BRDF_Specular_GGX( directLight, geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );

	#endif

}

void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	// Defer to the IndirectSpecular function to compute
	// the indirectDiffuse if energy preservation is enabled.
	#ifndef ENVMAP_TYPE_CUBE_UV

		reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor.rgb );

	#endif

}

void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearCoatRadiance, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {

	#ifndef STANDARD
		float dotNV = saturate( dot( geometry.normal, geometry.viewDir ) );
		float dotNL = dotNV;
		float clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );
	#else
		float clearCoatDHR = 0.0;
	#endif

	float clearCoatInv = 1.0 - clearCoatDHR;

	// Both indirect specular and diffuse light accumulate here
	// if energy preservation enabled, and PMREM provided.
	#if defined( ENVMAP_TYPE_CUBE_UV )

		vec3 singleScattering = vec3( 0.0 );
		vec3 multiScattering = vec3( 0.0 );
		vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;

		BRDF_Specular_Multiscattering_Environment( geometry, material.specularColor.rgb, material.specularRoughness, singleScattering, multiScattering );

		vec3 diffuse = material.diffuseColor * ( 1.0 - ( singleScattering + multiScattering ) );

		reflectedLight.indirectSpecular += clearCoatInv * radiance * singleScattering;
		reflectedLight.indirectDiffuse += multiScattering * cosineWeightedIrradiance;
		reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;

	#else

		reflectedLight.indirectSpecular += clearCoatInv * radiance * BRDF_Specular_GGX_Environment( geometry, material.specularColor.rgb, material.specularRoughness );

	#endif

	#ifndef STANDARD

		reflectedLight.indirectSpecular += clearCoatRadiance * material.clearCoat * BRDF_Specular_GGX_Environment( geometry, vec3( DEFAULT_SPECULAR_COEFFICIENT ), material.clearCoatRoughness );

	#endif
}

#define RE_Direct	RE_Direct_Physical
#define RE_Direct_RectArea RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular RE_IndirectSpecular_Physical

`
