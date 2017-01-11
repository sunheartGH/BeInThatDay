import Vue from 'vue'
import VueRouter from 'vue-router'
import config from 'config'
import bus from 'bus'
import utils from 'utils'
import Message from './components/message.vue'
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
  },
  {
    name: 'search',
    path: '/search',
    component(resolve) {
        require(['./views/search.vue'], resolve);
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
    });

    bus.$on('logined', () => {
      if (this.$router.app.$route.name == 'home') {
        this.goHome();
      }
    });

    bus.$on('usercalendar', (userId) => {
      this.$router.push({ path: '/home', query:{userId} });
      this.refresh = Math.random() + "home";
    });


    bus.$on('showmessage', (userId) => {
      this.$router.push({ path: '/profile/'+userId, query: { infoshow: 'messages' } });
      this.refresh = Math.random() + "profile";
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
      this.refresh = Math.random() + "home";
    },
    goSearch() {
      this.$router.push({name: 'search'});
    }
  },
  components: {
    "app-login":Login,
    "app-message":Message,
    "app-treat":Treat,
  },
  router,
})
