import { Camera } from './camera';
import { loadTexture } from './glTool';
import { mat4 } from 'gl-matrix';
import { Geometry } from './geometry';

interface AttribLocations {
    vertexPosition: any;
    vertexNormal: any;
    textureCoord: any;
}

interface UniformLocations {
    projection: any;
    model: any;
    view: any;
    normalMatrix: any;
    uSampler: any;
}

interface ProgramInfo {
    program: any;
    attribLocations: AttribLocations;
    uniformLocations: UniformLocations;
}

export class Kala {
    public gl: any;
    public camera: Camera;
    public geometries: Geometry[];
    public scene: mat4;
    public view: any;
    public Geometry: any;
    public lastRenderTime: Date;
    public deltaTime: number;
    public pointerLock: boolean;
    public programInfo: ProgramInfo;

    public constructor(canvas: any) {
        this.gl = canvas.getContext('webgl');
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.geometries = [];
        this.scene = this.initScene();
        this.Geometry = Geometry;
        this.pointerLock = false;
        this.fullScreen();
    }

    public initScene(): mat4 {
        const gl = this.gl;
        const fieldOfView = 45 * Math.PI / 180;
        const aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
        const zNear = 0.1;
        const zFar = 100.0;
        const scene = mat4.create();
        mat4.perspective(scene,
            fieldOfView,
            aspect,
            zNear,
            zFar);
        return scene;
    }

    loadShader(type: any, source: string) {
        const gl = this.gl;

        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    loadTexture(url: string) {
        return loadTexture(this.gl, url);
    }

    initShaderProgram(vsSource: string, fsSource: string) {
        const gl = this.gl;

        if (!vsSource) {
            console.error('Empty VertexShader Source');
            return false;
        }

        if (!fsSource) {
            console.error('Empty FragmentShader Source');
            return false;
        }

        const vertexShader = this.loadShader(gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.loadShader(gl.FRAGMENT_SHADER, fsSource);

        if (!vertexShader || !fragmentShader) {
            return false;
        }

        const shaderProgram = gl.createProgram();
        gl.attachShader(shaderProgram, vertexShader);
        gl.attachShader(shaderProgram, fragmentShader);
        gl.linkProgram(shaderProgram);

        if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
            console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shaderProgram));
            return null;
        }
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
        };
        return shaderProgram;
    }

    addCamera() {
        this.camera = new Camera(this.gl);
        this.camera.kala = this;
        return this.camera;
    }

    add(geometry: Geometry) {
        this.geometries.push(geometry);
    }

    initBuffers(data: number[]) {
        const gl = this.gl;
        const dataBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, dataBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
        return dataBuffer;
    }

    renderGeometry(geometry: Geometry) {
        const gl = this.gl;
        const vertex_buffer = this.initBuffers(geometry.vertices);
        const normal_buffer = this.initBuffers(geometry.normals);
        const texcoord_buffer = this.initBuffers(geometry.textureCoords);
        const normalMatrix = mat4.create();
        mat4.invert(normalMatrix, geometry.Model);
        mat4.transpose(normalMatrix, normalMatrix);
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, vertex_buffer);
            gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexPosition,
                3,
                gl.FLOAT,
                false,
                12,
                0);
            gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexPosition);
        }
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, normal_buffer);
            gl.vertexAttribPointer(
                this.programInfo.attribLocations.vertexNormal,
                3,
                gl.FLOAT,
                false,
                12,
                0);
            gl.enableVertexAttribArray(
                this.programInfo.attribLocations.vertexNormal);
        }
        {
            gl.bindBuffer(gl.ARRAY_BUFFER, texcoord_buffer);
            gl.vertexAttribPointer(
                this.programInfo.attribLocations.textureCoord,
                2,
                gl.FLOAT,
                false,
                8,
                0);
            gl.enableVertexAttribArray(
                this.programInfo.attribLocations.textureCoord);
        }
        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.projection,
            false,
            this.scene);
        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.model,
            false,
            geometry.Model);
        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.normalMatrix,
            false,
            normalMatrix);
        gl.uniformMatrix4fv(
            this.programInfo.uniformLocations.view,
            false,
            this.view);
        // Tell WebGL we want to affect texture unit 0
        gl.activeTexture(gl.TEXTURE0);

        // Bind the texture to texture unit 0
        gl.bindTexture(gl.TEXTURE_2D, geometry.texture || this.loadTexture(''));

        // Tell the shader we bound the texture to texture unit 0
        gl.uniform1i(this.programInfo.uniformLocations.uSampler, 0);

        {
            const offset = 0;
            const vertexCount = geometry.vertices.length / 3;
            gl.drawArrays(gl.TRIANGLES, offset, vertexCount);
        }
    }

    fullScreen() {
        const elem = this.gl.canvas;
        const _this = this;
        document.addEventListener('fullscreenchange', fullscreenChange, false);
        document.addEventListener('pointerlockchange', pointerLockChange, false);
        document.addEventListener('pointerlockerror', pointerLockError, false);
        function fullscreenChange() {
            if (document.fullscreenElement === elem) {
                elem.requestPointerLock = elem.requestPointerLock ||
                    elem.mozRequestPointerLock ||
                    elem.webkitRequestPointerLock;
                elem.requestPointerLock();
            }
        }
        function pointerLockChange() {
            if (document.pointerLockElement === elem) {
                _this.pointerLock = true;
            } else {
                _this.pointerLock = false;
            }
        }
        function pointerLockError() {
            _this.pointerLock = false;
        }
        elem.requestFullscreen = elem.requestFullscreen ||
            elem.mozRequestFullscreen ||
            elem.mozRequestFullScreen ||
            elem.webkitRequestFullscreen;
        elem.addEventListener('click', () => {
            elem.requestFullscreen();
        }, false);

    }

    render() {
        if (!this.camera) {
            console.error('Please add a camera before rendering.');
            return false;
        }
        const now = new Date();
        if (!this.lastRenderTime) {
            this.lastRenderTime = now;
        } else {
            this.deltaTime = now.getTime() - this.lastRenderTime.getTime();
            this.lastRenderTime = now;
        }
        this.camera.deltaTime = this.deltaTime * 0.001;
        for (const k of this.camera.keyDown) {
            this.camera.ProcessKeyAction(k);
        }
        const gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0.0, 0.0, 0.0, 1.0);
        gl.clearDepth(1.0);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        this.scene = this.initScene();
        this.view = this.camera.getViewMatrix();

        gl.useProgram(this.programInfo.program);
        this.geometries.forEach(geometry => this.renderGeometry(geometry));
    }
}
