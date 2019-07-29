varying highp vec2 vTextureCoord;
uniform sampler2D albedoMap;


void main() {
    highp vec4 texelColor = vec4(1, 1, 1, 1);
    texelColor = texture2D(albedoMap, vTextureCoord);
    // gl_FragColor = vec4(fract(vTextureCoord + vec2(2.0)), 1.0, 1.0);
    gl_FragColor = texelColor;
}