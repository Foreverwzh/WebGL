import { mat4, vec3 } from "gl-matrix";

export class Geometry{
    constructor(vertexes, normals, coords){
        this.vertexes = vertexes;
        this.normals = normals;
        this.textureCoords = coords;
        this.color = [0, 0, 255, 255];
        this.Model = mat4.create();
        this.position = vec3.fromValues(0, 0, 0);
    }

    rotate(radius, vec){
        mat4.rotate(this.Model, this.Model, radius, vec);
    }

    translate(vec){
        mat4.translate(this.Model, this.Model, vec);
        vec3.add(this.position, this.position, vec);
    }

    setPosition(vec){
        this.position = vec;
        const temp = vec3.create();
        
    }

}