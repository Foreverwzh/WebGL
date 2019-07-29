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

@Component
export default class Box extends Vue {
  glEle: any
  kala: Kala
  boxInfo () {
    const data = [
      -0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 0.0, 0.0,
      0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 1.0, 0.0,
      0.5, 0.5, -0.5, 0.0, 0.0, -1.0, 1.0, 1.0,
      0.5, 0.5, -0.5, 0.0, 0.0, -1.0, 1.0, 1.0,
      -0.5, 0.5, -0.5, 0.0, 0.0, -1.0, 0.0, 1.0,
      -0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 0.0, 0.0,

      -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.0, 0.0,
      0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 0.0,
      0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 1.0,
      0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 1.0, 1.0,
      -0.5, 0.5, 0.5, 0.0, 0.0, 1.0, 0.0, 1.0,
      -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.0, 0.0,

      -0.5, 0.5, 0.5, -1.0, 0.0, 0.0, 1.0, 0.0,
      -0.5, 0.5, -0.5, -1.0, 0.0, 0.0, 1.0, 1.0,
      -0.5, -0.5, -0.5, -1.0, 0.0, 0.0, 0.0, 1.0,
      -0.5, -0.5, -0.5, -1.0, 0.0, 0.0, 0.0, 1.0,
      -0.5, -0.5, 0.5, -1.0, 0.0, 0.0, 0.0, 0.0,
      -0.5, 0.5, 0.5, -1.0, 0.0, 0.0, 1.0, 0.0,

      0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0,
      0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 1.0, 1.0,
      0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 0.0, 1.0,
      0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 0.0, 1.0,
      0.5, -0.5, 0.5, 1.0, 0.0, 0.0, 0.0, 0.0,
      0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 1.0, 0.0,

      -0.5, -0.5, -0.5, 0.0, -1.0, 0.0, 0.0, 1.0,
      0.5, -0.5, -0.5, 0.0, -1.0, 0.0, 1.0, 1.0,
      0.5, -0.5, 0.5, 0.0, -1.0, 0.0, 1.0, 0.0,
      0.5, -0.5, 0.5, 0.0, -1.0, 0.0, 1.0, 0.0,
      -0.5, -0.5, 0.5, 0.0, -1.0, 0.0, 0.0, 0.0,
      -0.5, -0.5, -0.5, 0.0, -1.0, 0.0, 0.0, 1.0,

      -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 1.0,
      0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 1.0, 1.0,
      0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0,
      0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 1.0, 0.0,
      -0.5, 0.5, 0.5, 0.0, 1.0, 0.0, 0.0, 0.0,
      -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.0, 1.0
    ]
    const d1: number[] = []
    const d2: number[] = []
    const d3: number[] = []
    data.forEach((i, index) => {
      const a = index % 8
      if (a >= 0 && a < 3) {
        d1.push(i)
      }
      if (a >= 3 && a < 6) {
        d2.push(i)
      }
      if (a >= 6 && a < 8) {
        d3.push(i)
      }
    })
    return {
      vertexes: d1,
      normals: d2,
      textureCoords: d3
    }
  }
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
    const box = this.boxInfo()
    const texture = new kala.PBRTexture()
    texture.source = '/static/image/container2.png'
    const material = new kala.Material()
    material.addAlbedoMap(texture)
    const cubePositions = [
      vec3.fromValues(0.0, 0.0, 0.0),
      vec3.fromValues(2.0, 5.0, -15.0),
      vec3.fromValues(-1.5, -2.2, -2.5),
      vec3.fromValues(-3.8, -2.0, -12.3),
      vec3.fromValues(2.4, -0.4, -3.5),
      vec3.fromValues(-1.7, 3.0, -7.5),
      vec3.fromValues(1.3, -2.0, -2.5),
      vec3.fromValues(1.5, 2.0, -2.5),
      vec3.fromValues(1.5, 0.2, -1.5),
      vec3.fromValues(-1.3, 1.0, -1.5)
    ]
    for (let i of cubePositions) {
      const geometry = new kala.Geometry({
        data: box.vertexes,
        stride: 12
      }, {
        data: box.normals,
        stride: 12
      }, {
        data: box.textureCoords,
        stride: 8
      })
      const mesh = new kala.Mesh(geometry, material)
      kala.add(mesh)
      geometry.translate(i)
    }
    this.renderer()
    this.addResizeEvent()
  }

}
</script>

<style lang="scss" scoped>
</style>

