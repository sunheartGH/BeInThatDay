import Vue from 'vue'
import VueRouter from 'vue-router'
import config from 'config'
import bus from 'bus'
import utils from 'utils'
import Treat from './components/treat.vue'
import Login from './components/login.vue'
// Vue.use(VueRouter)

const routes = [
  {
    name: 'home',
    path: '/home',
    component(resolve) {
        require(['./views/home.vue'], resolve);
    },
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
    path: '/profile/:userId',
    component(resolve) {
        require(['./views/profile.vue'], resolve);
    },
    // beforeEnter: (to, from, next) => {
    //   console.log("fffff");
    //   next();
    // }
  },
  {
    name: 'treats',
    path: '/treats',
    component(resolve) {
        require(['./views/treats.vue'], resolve);
    }
  }
]
const router = new VueRouter({
  history: true,
  // mode: 'history',
  routes
});

Vue.http.options.root = config.host;

new Vue({
  el: '#app',
  data: {
    refresh: 0,
  },
  mounted() {
    this.goHome();

    bus.$on('logouted', () => {
      this.goHome();
      this.refresh =  Math.random() + "home";
    });

    bus.$on('logined', () => {
      if (this.$router.app.$route.name == 'home') {
        this.goHome();
        this.refresh =  Math.random() + "home";
      }
    });

    bus.$on('activityclick', (activityId) => {
      this.$router.push({ name: 'show', params:{activityId} });
      this.refresh =  Math.random() + "show";
    });

    bus.$on('commentclick', (comment) => {
      if (comment.under_type == "Subject") {
        this.$router.push({ name: 'show', params:{activityId: comment.under_object} });
        this.refresh =  Math.random() + "show";
      }
    });

    bus.$on('activitytreated', (activityId) => {
      this.$router.push({ name: 'show', params:{activityId} });
      this.refresh =  Math.random() + "show";
    });

    bus.$on('userclick', (userId) => {
      if (utils.haveToken()) {
        this.$router.push({ path: '/profile/'+userId });
        this.refresh = Math.random() + "profile";
      } else {
        alert("you should login");
      }
    });

    bus.$on('usertreated', (userId) => {
      this.$router.push({ path: '/profile/'+userId });
      this.refresh = Math.random() + "profile";
    });

    bus.$on('usertreat', (treat) => {
      if (utils.haveToken()) {
        this.$router.push({ name: 'treats', params: {treat} });
      } else {
        alert("you should login");
      }
    });

    bus.$on('activitytreat', (treat) => {
      if (utils.haveToken()) {
        this.$router.push({ name: 'treats', params: {treat}});
      } else {
        alert("you should login");
      }
    });
  },
  methods: {
    goHome() {
      this.$router.push({name: 'home'});
    }
  },
  components: {
    "app-login":Login,
    "app-treat":Treat,
  },
  router,
})
