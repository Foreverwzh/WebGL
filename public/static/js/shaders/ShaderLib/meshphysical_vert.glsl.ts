export default /* glsl */`
#define PHYSICAL

#ifdef USE_TANGENT

	varying vec3 vTangent;

#endif

varying vec4 vMVPosition;

#include <common>
#include <uv_pars_vertex>

void main() {

	#include <uv_vertex>
	vMVPosition = viewMatrix * modelMatrix * vec4(position, 1.0);
	gl_Position = projectMatrix * vMVPosition;
}
`
