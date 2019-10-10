export default /* glsl */`
uniform mat4 lightViewMatrix;

void main() {

	gl_Position = projectMatrix * lightViewMatrix * modelMatrix * vec4(position, 1.0);

}
`
