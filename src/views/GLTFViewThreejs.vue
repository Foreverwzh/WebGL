<template>
    <div>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Emit } from 'vue-property-decorator'
import axios from 'axios'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'

@Component
export default class ObjectLoad extends Vue {
  /**
   * method
   */
  public addCompile (children) {
    children.forEach(obj => {
      if (obj.type === 'Object3D') {
        this.addCompile(obj.children)
      } else if (obj.type === 'Mesh') {
        obj.material.onBeforeCompile = shader => {
          shader.fragmentShader = shader.fragmentShader.replace('#include <fog_fragment>',
          `#include <dithering_fragment>
          gl_FragColor = vec4(vUv, 1.0, 1.0);
          `)
        }
      }
    })
  }
  mounted () {
    const _this = this
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    camera.position.set(0, 0, 50)
    const renderer = new THREE.WebGLRenderer()
    renderer.setSize(window.innerWidth, window.innerHeight)
    document.body.appendChild(renderer.domElement)
    const loader = new GLTFLoader()

    // Optional: Provide a DRACOLoader instance to decode compressed mesh data
    // DRACOLoader.setDecoderPath('three/examples/js/libs/draco')
    // loader.setDRACOLoader(new DRACOLoader())
    // Optional: Pre-fetch Draco WASM/JS module, to save time while parsing.
    // DRACOLoader.getDecoderModule()

    // Load a glTF resource
    loader.load(
      // resource URL
      '/static/model/deir_el-sultan_jerusalem/scene.gltf',
      // called when the resource is loaded
      function (gltf) {

        scene.add(gltf.scene)
        console.log(gltf)
        _this.addCompile(gltf.scene.children)
        // gltf.animations // Array<THREE.AnimationClip>
        // gltf.scene // THREE.Scene
        // gltf.scenes // Array<THREE.Scene>
        // gltf.cameras // Array<THREE.Camera>
        // gltf.asset // Object

      },
      // called while loading is progressing
      function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded')

      },
      // called when loading has errors
      function (error) {

        console.log('An error happened')

      }
    )
    animate()
    function animate () {

      requestAnimationFrame(animate)
      renderer.render(scene, camera)
      // stats.update();

    }
  }

}
</script>

<style lang="scss" scoped>
</style>

