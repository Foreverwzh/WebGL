import Vue from 'vue'
import Router from 'vue-router'
import Home from './views/Home.vue'
import Test1 from './views/Test1'

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
      path: '/test1',
      name: 'test1',
      component: Test1
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('./views/About.vue')
    }
  ]
})
