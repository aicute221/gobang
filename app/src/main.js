import Vue from 'vue/dist/vue.js'
import VueRouter from 'vue-router'
import axios from 'axios'
Vue.use(VueRouter);

import App from './App.vue'

Vue.config.productionTip = false;

window.axios = axios;


import Index from './components/Index.vue';
import Game from './components/Game.vue';

const router = new VueRouter({
    routes: [
        {
            path: '/index' , component: Index
        },
        {
            path: '/' , component: Game
        }
    ]
});

const app = new Vue({
    router: router,
    render: h => h(App)
}).$mount('#app');




// new Vue({
//   render: h => h(App)
// }).$mount('#app')
