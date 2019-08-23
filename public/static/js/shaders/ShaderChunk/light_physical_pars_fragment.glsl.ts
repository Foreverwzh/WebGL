export default `
struct PhysicalMaterial
{
  vec4 ambientColor;
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

void CalculateLight_Physical( const in IncidentLight directLight, const in GeometricContext geometry, const in PhysicalMaterial material, inout ReflectedLight reflectedLight )
{

  vec3 L = normalize(directLight.direction);
  vec3 N = normalize(geometry.normal);
  vec3 V = normalize(geometry.viewDir);
  vec3 H = normalize(V + L);
  float dotNL = max(dot(N, L), 0.0);
  vec3 irradiance = dotNL * directLight.color;
  float clearCoatDHR = material.clearCoat * clearCoatDHRApprox( material.clearCoatRoughness, dotNL );

  reflectedLight.directSpecular += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Specular_GGX( directLight, geometry, material.specularColor.rgb, material.specularRoughness );
  reflectedLight.directDiffuse += ( 1.0 - clearCoatDHR ) * irradiance * BRDF_Diffuse_Lambert( material.diffuseColor.rgb );

  reflectedLight.ambientColor += material.ambientColor.rgb;
  reflectedLight.indirectDiffuse += irradiance * BRDF_Diffuse_Lambert( material.diffuseColor.rgb );
  // reflectedLight.indirectSpecular += radiance * BRDF_Specular_GGX_Environment( geometry, material.specularColor.rgb, material.specularRoughness );
}
`
