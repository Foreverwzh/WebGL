<template>
    <div>
        <canvas id="glcanvas" width="1000" height="480"></canvas>
    </div>
</template>

<script>
import { vec3 } from "gl-matrix"
// import * as math from "mathjs"
import { Kala } from "./../../public/static/js/kala"
export default {
    data(){
        return {
            glEle: null,
            then: 0,
            kala: null
        }
    },
    methods:{
        boxInfo() {
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
            const d1 = [], d2 = [], d3 = [];
            data.forEach((i, index) => {
                const a = index % 8;
                if(a>=0 && a<3) {
                    d1.push(i);
                }
                if(a>=3 && a<6) {
                    d2.push(i);
                }
                if(a>=6 && a<8) {
                    d3.push(i);
                }
            })
            return {
                vertexes: d1,
                normals: d2,
                textureCoords: d3
            }
        },
        getShaderSource(vs_url, fs_url){
            return Promise.all([axios.get(vs_url), axios.get(fs_url)]);
        },
        render(now) {
            now *= 0.001;
            const deltaTime = now - this.then;
            this.then = now;
            // this.kala.geometries.forEach(geo => {
            //     geo.rotate(deltaTime, [Math.random(), Math.random(), Math.random()]);
            // })
            this.kala.render();
            requestAnimationFrame(this.render);
        },
        addResizeEvent(){
            this.resetCanvas();
            window.onresize = (e) => {
                this.resetCanvas(e);
            } 
        },
        resetCanvas(e){
            const canvas = this.glEle;
            canvas.style.width = document.body.clientWidth + "px";
            canvas.style.height = document.body.clientHeight + "px";
            var devicePixelRatio = window.devicePixelRatio || 1;
            var w = canvas.clientWidth * devicePixelRatio;
            var h = canvas.clientHeight * devicePixelRatio;
            if (canvas.width != w || canvas.height != h) {
                canvas.width = w;
                canvas.height = h;
            }
        }
    },
    async mounted(){
        this.glEle = document.getElementById("glcanvas");
        const kala = this.kala = new Kala(this.glEle);

        let vsSource, fsSource;
        const source_res = await this.getShaderSource("/static/source/box/vs.glsl", "/static/source/box/fs.glsl");
        [vsSource, fsSource ] = [source_res[0].data, source_res[1].data];

        kala.initShaderProgram(vsSource, fsSource);
        
        this.camera = kala.addCamera();
        this.camera.setPosition([0, 0, 10]);
        this.camera.Speed = 10;
        const box = this.boxInfo();
        const texture = kala.loadTexture("/static/image/container2.png");
        const cubePositions = [
            vec3.fromValues( 0.0,  0.0,  0.0), 
            vec3.fromValues( 2.0,  5.0, -15.0), 
            vec3.fromValues(-1.5, -2.2, -2.5),  
            vec3.fromValues(-3.8, -2.0, -12.3),  
            vec3.fromValues( 2.4, -0.4, -3.5),  
            vec3.fromValues(-1.7,  3.0, -7.5),  
            vec3.fromValues( 1.3, -2.0, -2.5),  
            vec3.fromValues( 1.5,  2.0, -2.5), 
            vec3.fromValues( 1.5,  0.2, -1.5), 
            vec3.fromValues(-1.3,  1.0, -1.5)
        ];
        for(let i of cubePositions) {
            const geometry = new kala.Geometry(box.vertexes, box.normals, box.textureCoords);
            geometry.texture = texture;
            kala.add(geometry);
            geometry.translate(i);
        }
        this.render(new Date());
        this.addResizeEvent();
    }

}
</script>

<style lang="scss" scoped>
</style>

