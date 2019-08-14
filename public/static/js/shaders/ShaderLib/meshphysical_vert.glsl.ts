export default /* glsl */`
#define PHYSICAL

void main() {

	gl_Position = projectMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);

}
`
