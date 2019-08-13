<template>
    <div>
        <canvas id="glcanvas" width="1000" height="480"></canvas>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'
import axios from 'axios'
import { vec3, mat4 } from 'gl-matrix'
import { Kala } from './../../public/static/js/Kala'
import { OBJLoader } from './../../public/static/js/OBJLoader'

@Component
export default class ObjectLoad extends Vue {
  glEle: any
  kala: Kala
  getShaderSource (vsUrl: string, fsUrl: string) {
    return Promise.all([axios.get(vsUrl), axios.get(fsUrl)])
  }
  renderer () {
    this.kala.render()
    requestAnimationFrame(this.renderer)
  }
  addResizeEvent () {
    this.resetCanvas()
    window.onresize = (e) => {
      this.resetCanvas()
    }
  }
  resetCanvas () {
    const canvas = this.glEle
    canvas.style.width = document.body.clientWidth + 'px'
    canvas.style.height = document.body.clientHeight + 'px'
    let devicePixelRatio = window.devicePixelRatio || 1
    let w = canvas.clientWidth * devicePixelRatio
    let h = canvas.clientHeight * devicePixelRatio
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w
      canvas.height = h
    }
  }
  async mounted () {
    this.glEle = document.getElementById('glcanvas')
    const kala = this.kala = new Kala(this.glEle)
    let vsSource
    let fsSource
    const sourceRes = await this.getShaderSource('/static/source/box/vs.glsl', '/static/source/box/fs.glsl');
    [vsSource, fsSource ] = [sourceRes[0].data, sourceRes[1].data]

    kala.initShaderProgram(vsSource, fsSource)
    kala.camera.setPosition([0, 0, 10])
    kala.camera.Speed = 10
    this.renderer()
    this.addResizeEvent()
    const objloader = new OBJLoader()
    objloader.load('/static/model/gun/Handgun_obj.obj', (data: any) => {
      console.log(data)
      data.objects.forEach((obj: any) => {
        const geometry = new kala.Geometry({
          data: obj.geometry.vertices,
          stride: 12
        }, {
          data: obj.geometry.normals,
          stride: 12
        }, {
          data: obj.geometry.textureCoords,
          stride: 8
        })
        const material = new kala.Material()
        const mesh = new kala.Mesh(geometry, material)
        this.kala.add(mesh)
      })
    })
  }

}
</script>

<style lang="scss" scoped>
</style>

