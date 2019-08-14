export default /* glsl */`
#define PHYSICAL

#include <uv_pars_vertex>

void main() {

	#include <uv_vertex>

	gl_Position = projectMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

}
`
