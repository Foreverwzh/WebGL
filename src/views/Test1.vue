<template>
    <div>
        <canvas id="glcanvas" width="1000" height="480"></canvas>
    </div>
</template>

<script>
import {mat4} from "gl-matrix"
import {Camera} from "./../../public/static/js/camera"
import * as math from "mathjs"
export default {
    data(){
        return {
            glEle: null,
            gl: null,
            vsSource: `
                attribute vec4 aVertexPosition;
                attribute vec3 aVertexNormal;
                attribute vec2 aTextureCoord;

                uniform mat4 uModel;
                uniform mat4 uProjection;
                uniform mat4 uView;
                uniform mat4 uNormalMatrix;

                varying highp vec2 vTextureCoord;
                varying highp vec3 vLighting;

                void main() {
                    gl_Position = uProjection * uView * uModel  * aVertexPosition;
                    vTextureCoord = aTextureCoord;

                    highp vec3 ambientLight = vec3(0.3, 0.3, 0.3);
                    highp vec3 directionalLightColor = vec3(1, 1, 1);
                    highp vec3 directionalVector = normalize(vec3(0.85, 0.8, 0.75));

                    highp vec4 transformedNormal = uNormalMatrix * vec4(aVertexNormal, 1.0);

                    highp float directional = max(dot(transformedNormal.xyz, directionalVector), 0.0);
                    vLighting = ambientLight + (directionalLightColor * directional);
                }
            `,
            fsSource: `
                varying highp vec2 vTextureCoord;
                varying highp vec3 vLighting;
                uniform sampler2D uSampler;

                void main() {
                    highp vec4 texelColor = texture2D(uSampler, vTextureCoord);
                    gl_FragColor = vec4(texelColor.rgb * vLighting, texelColor.a);
                }
            `,
            texture: null,
            buffers: null,
            programInfo: null,
            then: 0,
            squareRotation: 0.0,
            camera: null
        }
    },
    methods:{
        isPowerOf2(value) {
            return (value & (value - 1)) == 0;
        },
        initShaderProgram(gl){
            const vertexShader = this.loadShader(gl, gl.VERTEX_SHADER, this.vsSource);
            const fragmentShader = this.loadShader(gl, gl.FRAGMENT_SHADER, this.fsSource);

            if(!vertexShader || !fragmentShader) {
                return false;
            }

            const shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);

            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                alert('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
                return null;
            }

            return shaderProgram;
        },
        loadShader(gl, type, source) {
            const shader = gl.createShader(type);

            // Send the source to the shader object

            gl.shaderSource(shader, source);

            // Compile the shader program

            gl.compileShader(shader);

            // See if it compiled successfully

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                alert('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        },
        loadTexture(gl, url) {
            const texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            // Because images have to be download over the internet
            // they might take a moment until they are ready.
            // Until then put a single pixel in the texture so we can
            // use it immediately. When the image has finished downloading
            // we'll update the texture with the contents of the image.
            const level = 0;
            const internalFormat = gl.RGBA;
            const width = 1;
            const height = 1;
            const border = 0;
            const srcFormat = gl.RGBA;
            const srcType = gl.UNSIGNED_BYTE;
            const pixel = new Uint8Array([0, 0, 255, 255]);  // opaque blue
            gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                            width, height, border, srcFormat, srcType,
                            pixel);

            const image = new Image();
            image.onload = () => {
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
                            srcFormat, srcType, image);
                // WebGL1 has different requirements for power of 2 images
                // vs non power of 2 images so check if the image is a
                // power of 2 in both dimensions.
                if (this.isPowerOf2(image.width) && this.isPowerOf2(image.height)) {
                // Yes, it's a power of 2. Generate mips.
                    gl.generateMipmap(gl.TEXTURE_2D);
                } else {
                // No, it's not a power of 2. Turn off mips and set
                // wrapping to clamp to edge
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                }
            };
            image.src = url;
            return texture;
        },
        initBuffers(gl) {

            // Create a buffer for the square's positions.

            const data = [
               -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 0.0,
                0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 0.0,
                0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 1.0,
                0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0, 1.0,
                -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 1.0,
                -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0, 0.0,

                -0.5, -0.5,  0.5,  0.0,  0.0, 1.0,   0.0, 0.0,
                0.5, -0.5,  0.5,  0.0,  0.0, 1.0,   1.0, 0.0,
                0.5,  0.5,  0.5,  0.0,  0.0, 1.0,   1.0, 1.0,
                0.5,  0.5,  0.5,  0.0,  0.0, 1.0,   1.0, 1.0,
                -0.5,  0.5,  0.5,  0.0,  0.0, 1.0,   0.0, 1.0,
                -0.5, -0.5,  0.5,  0.0,  0.0, 1.0,   0.0, 0.0,

                -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0, 0.0,
                -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,  1.0, 1.0,
                -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0, 1.0,
                -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0, 1.0,
                -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,  0.0, 0.0,
                -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0, 0.0,

                0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0, 0.0,
                0.5,  0.5, -0.5,  1.0,  0.0,  0.0,  1.0, 1.0,
                0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0, 1.0,
                0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0, 1.0,
                0.5, -0.5,  0.5,  1.0,  0.0,  0.0,  0.0, 0.0,
                0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0, 0.0,

                -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0, 1.0,
                0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0, 1.0,
                0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0, 0.0,
                0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0, 0.0,
                -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0, 0.0,
                -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0, 1.0,

                -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0, 1.0,
                0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0, 1.0,
                0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0, 0.0,
                0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0, 0.0,
                -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0, 0.0,
                -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0, 1.0
            ];
            const dataBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

            return {
                dataBuffer: dataBuffer
            };
        },
        drawScene(gl, programInfo, buffers) {
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
            gl.clearDepth(1.0);                 // Clear everything
            gl.enable(gl.DEPTH_TEST);           // Enable depth testing
            gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

            // Clear the canvas before we start drawing on it.

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            const fieldOfView = this.camera.Zoom * Math.PI / 180;   // in radians
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            const Projection = mat4.create();
            mat4.perspective(Projection,
                            fieldOfView,
                            aspect,
                            zNear,
                            zFar);
            const Model = mat4.create();
            // mat4.translate(Model,     // destination matrix
            //                 Model,     // matrix to translate
            //                 [0.0, 0.0, 0.0]);  // amount to translate
            const seed = math.random();
            mat4.rotate(Model,  // destination matrix
              Model,  // matrix to rotate
              this.squareRotation,   // amount to rotate in radians
              [1, 1, 0]);     // axis to rotate around

            // const View = mat4.create();
            // mat4.lookAt(View, [0, 1, 1], [0, 0, 0], [0, 1, -1]);
            const View = this.camera.getViewMatrix();
            const normalMatrix = mat4.create();
            mat4.invert(normalMatrix, Model);
            mat4.transpose(normalMatrix, normalMatrix);
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.dataBuffer);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexPosition,
                    3,
                    gl.FLOAT,
                    false,
                    32,
                    0);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexPosition);
            }
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.dataBuffer);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexNormal,
                    3,
                    gl.FLOAT,
                    false,
                    32,
                    12);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexNormal);
            }
            {
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.dataBuffer);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.textureCoord,
                    2,
                    gl.FLOAT,
                    false,
                    32,
                    24);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.textureCoord);
            }

            // Tell WebGL to use our program when drawing

            gl.useProgram(programInfo.program);

            // Set the shader uniforms

            gl.uniformMatrix4fv(
                programInfo.uniformLocations.projection,
                false,
                Projection);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.model,
                false,
                Model);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.normalMatrix,
                false,
                normalMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.view,
                false,
                View);
            // Tell WebGL we want to affect texture unit 0
            gl.activeTexture(gl.TEXTURE0);

            // Bind the texture to texture unit 0
            gl.bindTexture(gl.TEXTURE_2D, this.texture);

            // Tell the shader we bound the texture to texture unit 0
            gl.uniform1i(programInfo.uniformLocations.uSampler, 0);

            {
                const offset = 0;
                const vertexCount = 36;
                gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
            }
        },
        render(now) {
            now *= 0.0005;  // convert to seconds
            const deltaTime = now - this.then;
            this.then = now;
            this.squareRotation += deltaTime;
            this.drawScene(this.gl, this.programInfo, this.buffers, deltaTime);

            requestAnimationFrame(this.render);
        },
        addResizeEvent(){
            this.resetCanvas();
            window.onresize = (e) => {
                this.resetCanvas();
            } 
        },
        resetCanvas(){
            const canvas = this.glEle;
            canvas.style.width = document.body.clientWidth + "px";
            canvas.style.height = document.body.clientHeight + "px";
            var devicePixelRatio = window.devicePixelRatio || 1;
            var w = canvas.clientWidth * devicePixelRatio;
            var h = canvas.clientHeight * devicePixelRatio;
            if (canvas.width != w || canvas.height != h) {
                console.log("resetGL: Setting canvas.width=" + w + " canvas.height=" + h);
                canvas.width = w;
                canvas.height = h;
            }
        }
    },
    mounted(){
        this.glEle = document.getElementById("glcanvas");
        const gl = this.gl = this.glEle.getContext("webgl");
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        const shaderProgram = this.initShaderProgram(gl);

        this.programInfo = {
            program: shaderProgram,
            attribLocations: {
                vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
                vertexNormal: gl.getAttribLocation(shaderProgram, 'aVertexNormal'),
                textureCoord: gl.getAttribLocation(shaderProgram, 'aTextureCoord'),
            },
            uniformLocations: {
                projection: gl.getUniformLocation(shaderProgram, 'uProjection'),
                model: gl.getUniformLocation(shaderProgram, 'uModel'),
                view: gl.getUniformLocation(shaderProgram, 'uView'),
                normalMatrix: gl.getUniformLocation(shaderProgram, 'uNormalMatrix'),
                uSampler: gl.getUniformLocation(shaderProgram, 'uSampler'),
            },
        }
        this.camera = new Camera(gl);
        this.camera.setPosition([0, 0, 10]);
        this.buffers = this.initBuffers(gl);
        this.texture = this.loadTexture(gl, "/static/image/container2.png");
        this.render(new Date());
        this.addResizeEvent();
    }

}
</script>

<style lang="scss" scoped>
</style>

