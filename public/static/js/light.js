import { isObject } from "util";

class Light {
    constructor(pos){
        if(!pos || !isObject(pos)){
            return false;
        }
        this.position = pos;
    }
}

export default Light;