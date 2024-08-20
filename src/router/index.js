import { createRouter, createWebHistory } from 'vue-router';
import Signup from '../views/Signup.vue';
import Login from '../views/Login.vue';
import Dashboard from '../views/Dashboard.vue';
import Home from '../views/Home.vue';
import { isAuthenticated } from '../services/auth'; // Import the auth utility

const routes = [
    { path: '/', component: Home },
    { path: '/signup', component: Signup },
    { path: '/login', component: Login },
    { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } }, // Protect this route
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !isAuthenticated()) {
    next('/login'); // Redirect to login if not authenticated
  } else {
    next();
  }
});

export default router;
