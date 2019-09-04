export default /* glsl */`
#define PHYSICAL

uniform vec3 emissive;
uniform float clearCoat;
uniform float clearCoatRoughness;
uniform float roughness;
uniform float metalness;
uniform vec3 diffuse;
uniform float opacity;

varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;

#include <common>
#include <encodings_pars_fragment>
#include <uv_pars_fragment>
#include <texture_pars_fragment>
#include <normalmap_pars_fragment>
#include <aomap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <bsdfs>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <light_pars_begin>
#include <light_physical_pars_fragment>
#include <metalroughnessmap_pars_fragment>

void main() {

	vec4 diffuseColor = vec4(diffuse, opacity);
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	vec3 totalEmissiveRadiance = emissive;

	#include <texture_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <metalroughnessmap_fragment>
	#include <emissivemap_fragment>

	#include <light_physical_fragment>
	#include <light_fragment_begin>
	#include <light_fragment_end>
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	gl_FragColor = vec4(outgoingLight, diffuseColor.a);
	gl_FragColor = LinearTosRGB( gl_FragColor );
}
`
