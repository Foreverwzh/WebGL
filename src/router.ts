import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Box from './views/Box.vue'
import ObjectLoad from './views/ObjectLoad.vue'

Vue.use(Router)

export default new Router({
  mode: 'history',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/box',
      name: 'box',
      component: Box
    },
    {
      path: '/objectload',
      name: 'objectload',
      component: ObjectLoad
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/About.vue')
    }
  ]
})
