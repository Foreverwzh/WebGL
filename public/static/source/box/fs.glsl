precision highp float;
varying vec2 vTextureCoord;
varying vec3 vVertexNormal;
varying vec4 vColor;
varying vec4 vTangent;
uniform sampler2D albedoMap;
uniform sampler2D normalMap;

void main() {
    // vec4 texelColor = vec4(vVertexNormal, 1);
    gl_FragColor = texture2D(albedoMap, vTextureCoord);
    // gl_FragColor = vec4(vTextureCoord, 1.0, 1.0);
}