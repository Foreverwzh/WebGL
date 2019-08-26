export default /* glsl */`
#define PHYSICAL

varying vec4 vMVPosition;
uniform vec3 emissive;
uniform float clearCoat;
uniform float clearCoatRoughness;
uniform float roughness;
uniform float metalness;

#include <common>
#include <uv_pars_fragment>
#include <texture_pars_fragment>
#include <normalmap_pars_fragment>
#include <aomap_pars_fragment>
#include <metalroughnessmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <light_common>
#include <light_pars_begin>
#include <light_physical_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( 1.0 );
	vec3 totalEmissiveRadiance = emissive;

	#include <texture_fragment>
	#include <normal_fragment_maps>
	#include <metalroughnessmap_fragment>
	#include <emissivemap_fragment>

	#include <light_physical_fragment>
	#include <light_fragment_begin>
	#include <light_fragment_end>
	#include <aomap_fragment>

	#ifdef USE_TANGENT

		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

	#endif
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + totalEmissiveRadiance;
	gl_FragColor = vec4(outgoingLight, diffuseColor.a);

}
`
