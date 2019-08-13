precision highp float;
precision highp int;
#define USE_MAP
#define USE_EMISSIVEMAP
#define USE_NORMALMAP
#define USE_ROUGHNESSMAP
#define USE_METALNESSMAP
uniform mat4 modelMatrix;
uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 viewMatrix;
uniform mat3 normalMatrix;
uniform vec3 cameraPosition;
attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;
#ifdef USE_TANGENT
attribute vec4 tangent;
#endif
#ifdef USE_COLOR
attribute vec3 color;
#endif
#ifdef USE_MORPHTARGETS
attribute vec3 morphTarget0;
attribute vec3 morphTarget1;
attribute vec3 morphTarget2;
attribute vec3 morphTarget3;
#ifdef USE_MORPHNORMALS
attribute vec3 morphNormal0;
attribute vec3 morphNormal1;
attribute vec3 morphNormal2;
attribute vec3 morphNormal3;
#else
attribute vec3 morphTarget4;
attribute vec3 morphTarget5;
attribute vec3 morphTarget6;
attribute vec3 morphTarget7;
#endif
#endif
#ifdef USE_SKINNING
attribute vec4 skinIndex;
attribute vec4 skinWeight;
#endif

#define PHYSICAL

varying vec3 vViewPosition;

#ifndef FLAT_SHADED

varying vec3 vNormal;

#ifdef USE_TANGENT

varying vec3 vTangent;
varying vec3 vBitangent;

#endif

#endif

#define PI 3.14159265359
#define PI2 6.28318530718
#define PI_HALF 1.5707963267949
#define RECIPROCAL_PI .31830988618
#define RECIPROCAL_PI2 .15915494
#define LOG2 1.442695
#define EPSILON 1e-6

#define saturate(a)clamp(a,0.,1.)
#define whiteCompliment(a)(1.-saturate(a))

float pow2(const in float x){return x*x;}
float pow3(const in float x){return x*x*x;}
float pow4(const in float x){float x2=x*x;return x2*x2;}
float average(const in vec3 color){return dot(color,vec3(.3333));}
// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand(const in vec2 uv){
    const highp float a=12.9898,b=78.233,c=43758.5453;
    highp float dt=dot(uv.xy,vec2(a,b)),sn=mod(dt,PI);
    return fract(sin(sn)*c);
}

struct IncidentLight{
    vec3 color;
    vec3 direction;
    bool visible;
};

struct ReflectedLight{
    vec3 directDiffuse;
    vec3 directSpecular;
    vec3 indirectDiffuse;
    vec3 indirectSpecular;
};

struct GeometricContext{
    vec3 position;
    vec3 normal;
    vec3 viewDir;
};

vec3 transformDirection(in vec3 dir,in mat4 matrix){
    
    return normalize((matrix*vec4(dir,0.)).xyz);
    
}

// http://en.wikibooks.org/wiki/GLSL_Programming/Applying_Matrix_Transformations
vec3 inverseTransformDirection(in vec3 dir,in mat4 matrix){
    
    return normalize((vec4(dir,0.)*matrix).xyz);
    
}

vec3 projectOnPlane(in vec3 point,in vec3 pointOnPlane,in vec3 planeNormal){
    
    float distance=dot(planeNormal,point-pointOnPlane);
    
    return-distance*planeNormal+point;
    
}

float sideOfPlane(in vec3 point,in vec3 pointOnPlane,in vec3 planeNormal){
    
    return sign(dot(point-pointOnPlane,planeNormal));
    
}

vec3 linePlaneIntersect(in vec3 pointOnLine,in vec3 lineDirection,in vec3 pointOnPlane,in vec3 planeNormal){
    
    return lineDirection*(dot(planeNormal,pointOnPlane-pointOnLine)/dot(planeNormal,lineDirection))+pointOnLine;
    
}

mat3 transposeMat3(const in mat3 m){
    
    mat3 tmp;
    
    tmp[0]=vec3(m[0].x,m[1].x,m[2].x);
    tmp[1]=vec3(m[0].y,m[1].y,m[2].y);
    tmp[2]=vec3(m[0].z,m[1].z,m[2].z);
    
    return tmp;
    
}

// https://en.wikipedia.org/wiki/Relative_luminance
float linearToRelativeLuminance(const in vec3 color){
    
    vec3 weights=vec3(.2126,.7152,.0722);
    
    return dot(weights,color.rgb);
    
}

#if defined(USE_MAP)||defined(USE_BUMPMAP)||defined(USE_NORMALMAP)||defined(USE_SPECULARMAP)||defined(USE_ALPHAMAP)||defined(USE_EMISSIVEMAP)||defined(USE_ROUGHNESSMAP)||defined(USE_METALNESSMAP)

varying vec2 vUv;
uniform mat3 uvTransform;

#endif

#ifdef USE_COLOR

varying vec3 vColor;

#endif

void main(){
    
    #if defined(USE_MAP)||defined(USE_BUMPMAP)||defined(USE_NORMALMAP)||defined(USE_SPECULARMAP)||defined(USE_ALPHAMAP)||defined(USE_EMISSIVEMAP)||defined(USE_ROUGHNESSMAP)||defined(USE_METALNESSMAP)
    
    vUv=(uvTransform*vec3(uv,1)).xy;
    
    #endif
    
    #ifdef USE_COLOR
    
    vColor.xyz=color.xyz;
    
    #endif
    
    vec3 objectNormal=vec3(normal);
    
    #ifdef USE_TANGENT
    
    vec3 objectTangent=vec3(tangent.xyz);
    
    #endif
    
    vec3 transformedNormal=normalMatrix*objectNormal;
    
    #ifdef FLIP_SIDED
    
    transformedNormal=-transformedNormal;
    
    #endif
    
    #ifdef USE_TANGENT
    
    vec3 transformedTangent=normalMatrix*objectTangent;
    
    #ifdef FLIP_SIDED
    
    transformedTangent=-transformedTangent;
    
    #endif
    
    #endif
    
    vec3 transformed=vec3(position);
    
    vec4 mvPosition=modelViewMatrix*vec4(transformed,1.);
    
    gl_Position=projectionMatrix*mvPosition;
    
    vViewPosition=-mvPosition.xyz;
    
}