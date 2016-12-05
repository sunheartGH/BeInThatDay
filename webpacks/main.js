import Vue from 'vue'
import VueRouter from 'vue-router'
import bus from 'bus'

// Vue.use(VueRouter)

const routes = [
  {
    name: 'home',
    path: '/home',
    component(resolve) {
        require(['./views/home.vue'], resolve);
    }
  },
  {
    name: 'show',
    path: '/show',
    component(resolve) {
        require(['./views/show.vue'], resolve);
    }
  },
  {
    name: 'profile',
    path: '/profile',
    component(resolve) {
        require(['./views/profile.vue'], resolve);
    }
  }
]
const router = new VueRouter({
  history: true,
  routes
});

new Vue({
  el: '#app',
  mounted() {
    this.$router.push({name: 'home'});
  },
  http: {
    root: "https://localhost:3000",
  },
  router
})
