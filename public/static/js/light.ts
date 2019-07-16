import { vec3 } from 'gl-matrix';

class Light {
    public position: vec3;
    constructor(pos: vec3) {
        this.position = pos;
    }
}

export default Light;