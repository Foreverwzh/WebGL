<template>
    <div>
        <canvas id="glcanvas" width="640" height="480"></canvas>
    </div>
</template>

<script>
import {mat4} from "gl-matrix"
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
                    gl_Position = uProjection * uModel * aVertexPosition;
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
            squareRotation: 0.0
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
            gl.clearColor(0.0, 0.0, 0.0, 1.0);  // Clear to black, fully opaque
            gl.clearDepth(1.0);                 // Clear everything
            gl.enable(gl.DEPTH_TEST);           // Enable depth testing
            gl.depthFunc(gl.LEQUAL);            // Near things obscure far things

            // Clear the canvas before we start drawing on it.

            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // Create a perspective matrix, a special matrix that is
            // used to simulate the distortion of perspective in a camera.
            // Our field of view is 45 degrees, with a width/height
            // ratio that matches the display size of the canvas
            // and we only want to see objects between 0.1 units
            // and 100 units away from the camera.

            const fieldOfView = 45 * Math.PI / 180;   // in radians
            const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
            const zNear = 0.1;
            const zFar = 100.0;
            const Projection = mat4.create();

            // note: glmatrix.js always has the first argument
            // as the destination to receive the result.
            mat4.perspective(Projection,
                            fieldOfView,
                            aspect,
                            zNear,
                            zFar);

            // Set the drawing position to the "identity" point, which is
            // the center of the scene.
            const Model = mat4.create();

            // Now move the drawing position a bit to where we want to
            // start drawing the square.

            mat4.translate(Model,     // destination matrix
                            Model,     // matrix to translate
                            [-0.0, 0.0, -6.0]);  // amount to translate

            mat4.rotate(Model,  // destination matrix
              Model,  // matrix to rotate
              this.squareRotation,   // amount to rotate in radians
              [0, 1, 0]);     // axis to rotate around
            
            const view = mat4.create();
            mat4.targetTo(view, [0, 2, 3], [0, 0, 0], [0, 1, 0]);

            const normalMatrix = mat4.create();
            mat4.invert(normalMatrix, Model);
            mat4.transpose(normalMatrix, normalMatrix);

            // Tell WebGL how to pull out the positions from the position
            // buffer into the vertexPosition attribute.
            {
                const numComponents = 3;  // pull out 2 values per iteration
                const type = gl.FLOAT;    // the data in the buffer is 32bit floats
                const normalize = false;  // don't normalize
                const stride = 32;         // how many bytes to get from one set of values to the next
                                        // 0 = use type and numComponents above
                const offset = 0;         // how many bytes inside the buffer to start from
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.dataBuffer);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexPosition,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexPosition);
            }
            {
                const numComponents = 3;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 32;
                const offset = 12;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.dataBuffer);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.vertexNormal,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.vertexNormal);
            }
            {
                const numComponents = 2;
                const type = gl.FLOAT;
                const normalize = false;
                const stride = 32;
                const offset = 24;
                gl.bindBuffer(gl.ARRAY_BUFFER, buffers.dataBuffer);
                gl.vertexAttribPointer(
                    programInfo.attribLocations.textureCoord,
                    numComponents,
                    type,
                    normalize,
                    stride,
                    offset);
                gl.enableVertexAttribArray(
                    programInfo.attribLocations.textureCoord);
            }

            // Tell WebGL to use our program when drawing

            gl.useProgram(programInfo.program);

            // Set the shader uniforms

            gl.uniformMatrix4fv(
                programInfo.uniformLocations.Projection,
                false,
                Projection);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.Model,
                false,
                Model);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.normalMatrix,
                false,
                normalMatrix);
            gl.uniformMatrix4fv(
                programInfo.uniformLocations.view,
                false,
                view);
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
            now *= 0.001;  // convert to seconds
            const deltaTime = now - this.then;
            this.then = now;
            this.squareRotation += deltaTime;
            this.drawScene(this.gl, this.programInfo, this.buffers, deltaTime);

            requestAnimationFrame(this.render);
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

        this.buffers = this.initBuffers(gl);
        this.texture = this.loadTexture(gl, "/static/image/container2.png");
        this.render(new Date());
    }

}
</script>

<style lang="scss" scoped>
#glcanvas{
    // width: 1280px;
    // height: 960px;
}
</style>

