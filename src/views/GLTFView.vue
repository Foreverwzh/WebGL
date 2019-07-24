<template>
    <div>
        <canvas id="glcanvas" width="1000" height="480"></canvas>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'
import axios from 'axios'
import { vec3, mat4 } from 'gl-matrix'
import { Kala } from './../../public/static/js/kala'
import { GLTFLoader } from './../../public/static/js/gltfLoader'
import Stats from 'stats.js'

@Component
export default class ObjectLoad extends Vue {
  glEle: any
  kala: Kala
  animate: any = null
  stats: Stats = new Stats()
  getShaderSource (vsUrl: string, fsUrl: string) {
    return Promise.all([axios.get(vsUrl), axios.get(fsUrl)])
  }
  renderer () {
    this.stats.begin()
    this.kala.render()
    this.stats.end()
    this.animate = requestAnimationFrame(this.renderer)
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
    this.stats.showPanel(0)
    document.body.appendChild(this.stats.dom)
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
    axios.get('/static/model/gun/Handgun_obj.gltf').then(res => {
      console.log(res.data)
      const loader = new GLTFLoader()
      kala.add(loader.load(res.data))
    })
    console.log(kala)
  }

}
</script>

<style lang="scss" scoped>
</style>

