attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;

uniform mat4 uModel;
uniform mat4 uProjection;
uniform mat4 uView;

varying highp vec2 vTextureCoord;

void main() {
    gl_Position = uProjection * uView * uModel  * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
}