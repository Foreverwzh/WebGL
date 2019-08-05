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
    const url = '/static/model/DamagedHelmet/DamagedHelmet.gltf'
    // const url = '/static/model/deir_el-sultan_jerusalem/scene.gltf'
    // const url = '/static/model/pers_win_01/scene.gltf'
    const loader = new GLTFLoader()
    loader.load(url).then(object => {
      kala.add(object)
    })
    console.log(kala)
    console.log(loader)
  }

}
</script>

<style lang="scss" scoped>
</style>

