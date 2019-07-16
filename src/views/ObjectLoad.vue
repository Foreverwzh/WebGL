<template>
    <div>
        <canvas id="glcanvas" width="1000" height="480"></canvas>
    </div>
</template>

<script lang="ts">
import { vec3, mat4 } from 'gl-matrix'
import { Kala } from './../../public/static/js/kala'
import { OBJLoader } from './../../public/static/js/OBJLoader'
export default {
    data() {
        return {
            glEle: null,
            kala: null
        }
    },
    methods: {
        getShaderSource(vs_url, fs_url) {
            return Promise.all([axios.get(vs_url), axios.get(fs_url)]);
        },
        render(now) {
            this.kala.render();
            requestAnimationFrame(this.render);
        },
        addResizeEvent() {
            this.resetCanvas();
            window.onresize = (e) => {
                this.resetCanvas(e);
            }
        },
        resetCanvas(e) {
            const canvas = this.glEle;
            canvas.style.width = document.body.clientWidth + 'px';
            canvas.style.height = document.body.clientHeight + 'px';
            let devicePixelRatio = window.devicePixelRatio || 1;
            let w = canvas.clientWidth * devicePixelRatio;
            let h = canvas.clientHeight * devicePixelRatio;
            if (canvas.width !== w || canvas.height !== h) {
                canvas.width = w;
                canvas.height = h;
            }
        }
    },
    async mounted() {
        this.glEle = document.getElementById('glcanvas');
        const kala = this.kala = new Kala(this.glEle);

        let vsSource, fsSource;
        const source_res = await this.getShaderSource('/static/source/box/vs.glsl', '/static/source/box/fs.glsl');
        [vsSource, fsSource ] = [source_res[0].data, source_res[1].data];

        kala.initShaderProgram(vsSource, fsSource);
        this.camera = kala.addCamera();
        this.camera.setPosition([0, 0, 10]);
        this.camera.Speed = 10;
        this.render(new Date());
        this.addResizeEvent();
        const objloader = new OBJLoader();
        objloader.load('/static/model/gun/obj/Handgun_obj.obj', data => {
            console.log(data);
            data.objects.forEach(obj => {
                const geometry = new kala.Geometry(obj.geometry.vertices, obj.geometry.normals, obj.geometry.textureCoords);
                this.kala.add(geometry);
            })
        });
    }

}
</script>

<style lang="scss" scoped>
</style>

