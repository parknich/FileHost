import { createApp } from 'vue';
import './style.css'; // Make sure this path is correct
import App from './App.vue';
import router from './router';

const app = createApp(App);
app.use(router);
app.mount('#app');
