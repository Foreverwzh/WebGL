<template>
    <div>
        <canvas id="glcanvas" width="1000" height="480"></canvas>
    </div>
</template>

<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'
import axios from 'axios'
import { vec3, mat4, quat } from 'gl-matrix'
import { Kala } from './../../public/static/js/Kala'
import { GLTFLoader } from './../../public/static/js/GLTFLoader'

@Component
export default class ObjectLoad extends Vue {
  glEle: any
  kala: Kala
  animate: any = null
  getShaderSource (vsUrl: string, fsUrl: string) {
    return Promise.all([axios.get(vsUrl), axios.get(fsUrl)])
  }
  renderer () {
    this.kala.render()
    if (this.kala.objects[0]) {
      const r = quat.create()
      quat.fromEuler(r, 0, -0.5, 0)
      this.kala.objects[0].rotate(r)
      this.kala.objects[0].matrixWorldNeedsUpdate = true
    }
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
  mounted () {
    this.glEle = document.getElementById('glcanvas')
    const kala = this.kala = new Kala(this.glEle)
    let vsSource
    let fsSource
    kala.camera.setPosition([0, 0, 10])
    kala.camera.Speed = 10
    this.renderer()
    const url = '/static/model/DamagedHelmet/DamagedHelmet.gltf'
    const loader = new GLTFLoader()
    loader.load(url).then(object => {
      this.addResizeEvent()
      kala.add(object)
    })
    console.log(kala.objects)
    console.log(loader)
  }

}
</script>

<style lang="scss" scoped>
</style>

