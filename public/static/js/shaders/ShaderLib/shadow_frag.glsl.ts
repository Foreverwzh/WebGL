export default /* glsl */`
uniform vec3 color;
uniform float opacity;

#include <common>
#include <bsdfs>
#include <lights_pars_begin>
#include <packing>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main() {

	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );

}
`
