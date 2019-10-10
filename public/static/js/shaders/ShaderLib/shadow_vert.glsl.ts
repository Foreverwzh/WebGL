export default /* glsl */`
#include <shadowmap_pars_vertex>

void main() {

	vec4 mvPosition = viewMatrix * modelMatrix * vec4( position, 1.0 );
	gl_Position = projectionMatrix * mvPosition;
	vec4 worldPosition = modelMatrix * vec4( transformed, 1.0 );
	#include <shadowmap_vertex>

}
`
