export default /* glsl */`
#define PHYSICAL

#include <uv_pars_fragment>
#include <texture_pars_fragment>

void main() {

	#include <texture_fragment>

	gl_FragColor = texelColor;

}
`
