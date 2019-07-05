import { mat4 } from "gl-matrix";

export class Geometry{
    constructor(vertexes, normals, coords){
        this.vertexes = vertexes;
        this.normals = normals;
        this.textureCoords = coords;
        this.color = [0, 0, 255, 255];
        this.Model = mat4.create();
    }

    rotate(radius, vec){
        mat4.rotate(this.Model, this.Model, radius, vec);
    }

    translate(vec){
        mat4.translate(this.Model, this.Model, vec);
    }

}