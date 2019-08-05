// #extension OES_element_index_uint: enable
precision highp float;
attribute vec3 aVertexPosition;
attribute vec3 aVertexNormal;
attribute vec2 aTextureCoord;
attribute vec4 aColor;
attribute vec4 aTangent;

uniform mat4 uModel;
uniform mat4 uProjection;
uniform mat4 uView;

varying vec2 vTextureCoord;
varying vec3 vVertexNormal;
varying vec4 vColor;
varying vec4 vTangent;

void main() {
    gl_Position = uProjection * uView * uModel  * vec4(aVertexPosition, 1.0);
    vTextureCoord = aTextureCoord;
    vVertexNormal = aVertexNormal;
    vColor = aColor;
    vTangent = aTangent;
}