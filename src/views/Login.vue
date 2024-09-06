<template>
  <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9394690619698484"
  crossorigin="anonymous"></script>
  <div class="auth-form">
    <h1>Log In</h1>
    <form @submit.prevent="handleLogin">
      <input v-model="identifier" type="text" placeholder="Username" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <div class="button-container">
        <input type="submit" value="Log In" />
      </div>
    </form>
    <p>Don't have an account? <router-link to="/signup">Sign Up</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';
import { useRouter } from 'vue-router';

const identifier = ref(''); // This can be either email or username
const password = ref('');
const router = useRouter();

const handleLogin = async () => {
  try {
    const response = await api.post('/auth/login', {
      identifier: identifier.value,
      password: password.value,
    });

    localStorage.setItem('token', response.data.token);
    localStorage.setItem('identifier', identifier.value);
    router.push('/dashboard');
  } catch (err) {
    console.error('Error logging in:', err.response?.data?.message || 'An error occurred');
  }
};
</script>


<style scoped>
.auth-form {
  max-width: 400px;
  margin: 2rem auto;
  padding: 2rem;
  background-color: var(--secondary-color);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
}

h1 {
  margin-bottom: 1rem;
}

input[type="text"],
input[type="password"] {
  width: calc(100% - 2em); /* Adjust width to match the button */
  padding: 0.8em;
  margin: 0.5em 0;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--secondary-color);
  color: var(--text-color);
  font-size: 1em;
}

input[type="submit"] {
  width: calc(100% - 2em); /* Adjust width to match the inputs */
  padding: 0.8em;
  margin: 0.5em 0;
  border: none;
  border-radius: 4px;
  background-color: var(--accent-color);
  color: var(--text-color);
  font-size: 1em;
  cursor: pointer;
}

input[type="submit"]:hover {
  background-color: #535bf2;
}

.button-container {
  width: 98.5%;
  display: flex;
  justify-content: center;
}

p {
  margin-top: 1rem;
  color: var(--text-muted);
}
</style>
