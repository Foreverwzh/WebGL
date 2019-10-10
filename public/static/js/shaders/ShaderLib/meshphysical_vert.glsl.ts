export default /* glsl */`
#define PHYSICAL

varying vec3 vViewPosition;
varying vec3 vWorldPosition;
varying vec3 vNormal;

#include <common>
#include <uv_pars_vertex>
#include <shadowmap_pars_vertex>

void main() {

	#include <uv_vertex>
	vec3 transformedNormal = (normalMatrix * vec4(normal, 1.0)).xyz;
	vNormal = normalize( transformedNormal );
	vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
	vViewPosition = -mvPosition.xyz;
	vec4 worldPosition = modelMatrix * vec4(position, 1.0);
	vWorldPosition = worldPosition.xyz;
	gl_Position = projectMatrix * mvPosition;
	#include <shadowmap_vertex>
}
`
