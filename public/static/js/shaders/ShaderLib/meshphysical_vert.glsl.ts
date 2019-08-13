export default /* glsl */`
#define PHYSICAL

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

	#ifdef USE_TANGENT

		varying vec3 vTangent;
		varying vec3 vBitangent;

	#endif

#endif

#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>

	#include <beginnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <project_vertex>

	vViewPosition = - mvPosition.xyz;

}
`
