import { vec3, mat4 } from 'gl-matrix';
import { create, all } from 'mathjs';

const math = create(all);

math.import({
    radians: function(angle){
        return angle / 180 * Math.PI;
    }
});

export class Camera {
    constructor(gl){
        this.Yaw = -90;
        this.Pitch = 0.0;
        this.Speed = 1.0;
        this.Sensitivity = 0.02;
        this.gl = gl;

        this.deltaTime = 0;

        this.Position = vec3.create();
        this.Front = vec3.create();
        this.Right = vec3.create();
        this.Up = vec3.create();
        this.WorldUp = vec3.create();
        this.keyDown = new Set();
        vec3.set(this.WorldUp, 0.0, 1.0, 0.0);
        this.updateCameraVectors();
        this.addMouseEvent();
        this.addKeyEvent();
    }

    setPosition(pos){
        vec3.set(this.Position, ...pos);
        this.updateCameraVectors();
    }

    updateCameraVectors(){
        const front = vec3.create();
        const x = math.cos(math.radians(this.Yaw)) * math.cos(math.radians(this.Pitch));
        const y = math.sin(math.radians(this.Pitch));
        const z = math.sin(math.radians(this.Yaw)) * math.cos(math.radians(this.Pitch));
        vec3.set(front, x, y, z);
        vec3.normalize(this.Front, front);
        vec3.cross(this.Right, this.Front, this.WorldUp);
        vec3.normalize(this.Right, this.Right);
        vec3.cross(this.Up, this.Right, this.Front);
        vec3.normalize(this.Up, this.Up);
    }

    getViewMatrix(){
        const view = mat4.create();
        const center = vec3.create();
        vec3.add(center, this.Position, this.Front);
        mat4.lookAt(view, this.Position, center, this.Up);
        return view;
    }

    ProcessMouseMovement(xoffset, yoffset, constrainPitch = true){
        xoffset *= this.Sensitivity;
        yoffset *= this.Sensitivity;

        this.Yaw += xoffset;
        this.Pitch += yoffset;
        if (constrainPitch){
            if (this.Pitch > 89.0)
                this.Pitch = 89.0;
            if (this.Pitch < -89.0)
                this.Pitch = -89.0;
        }
        this.updateCameraVectors();
    }

    addMouseEvent(){
        this.gl.canvas.addEventListener("mousemove", (e) => {
            if(!this.kala.pointerLock) return false;
            this.ProcessMouseMovement(-e.movementX, -e.movementY);
        });
    }

    ProcessKeyAction(k){
        if(k === "w"){
            const t = vec3.create();
            const desV = this.Speed * this.deltaTime;
            vec3.scale(t, this.Front, desV);
            vec3.add(this.Position, this.Position, t);
        }

        if(k === "s"){
            const t = vec3.create();
            const desV = -this.Speed * this.deltaTime;
            vec3.scale(t, this.Front, desV);
            vec3.add(this.Position, this.Position, t);
        }

        if(k === "a"){
            const t = vec3.create();
            const desV = -this.Speed * this.deltaTime;
            vec3.scale(t, this.Right, desV);
            vec3.add(this.Position, this.Position, t);
        }

        if(k === "d"){
            const t = vec3.create();
            const desV = this.Speed * this.deltaTime;
            vec3.scale(t, this.Right, desV);
            vec3.add(this.Position, this.Position, t);
        }

        if(k === " "){
            const t = vec3.create();
            const desV = this.Speed * this.deltaTime;
            vec3.scale(t, this.WorldUp, desV);
            vec3.add(this.Position, this.Position, t);
        }

        if(k === "c"){
            const t = vec3.create();
            const desV = -this.Speed * this.deltaTime;
            vec3.scale(t, this.WorldUp, desV);
            vec3.add(this.Position, this.Position, t);
        }

        this.updateCameraVectors();
    }

    addKeyEvent(){
        this.gl.canvas.setAttribute("tabindex", 1);
        this.gl.canvas.addEventListener("keydown", (e) => {
            e.preventDefault();
            if(!this.kala.pointerLock) return false;
            const k = e.key;
            this.keyDown.add(k);
            return false;
        });

        this.gl.canvas.addEventListener("keyup", (e) => {
            e.preventDefault();
            if(!this.kala.pointerLock) return false;
            const k = e.key;
            this.keyDown.delete(k);
            return false;
        });
    }
}