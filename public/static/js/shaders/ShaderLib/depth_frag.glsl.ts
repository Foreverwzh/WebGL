export default /* glsl */`
#include <packing>
void main() {

	gl_FragColor = packDepthToRGBA(gl_FragCoord.z);
	// gl_FragColor = vec4(0.0, 0.0, 0.0, gl_FragCoord.z);

}
`
