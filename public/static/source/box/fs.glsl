precision highp float;
varying vec2 vTextureCoord;
uniform sampler2D albedoMap;


void main() {
    vec4 texelColor = vec4(1, 1, 1, 1);
    texelColor = texture2D(albedoMap, vTextureCoord);
    // gl_FragColor = vec4(fract(vTextureCoord), 1.0, 1.0);
    gl_FragColor = texelColor;
}