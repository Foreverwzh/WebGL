export default /* glsl */`
varying vec3 TexCoords;
void main()
{
	TexCoords = position;
	gl_Position = projectMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
}
`
