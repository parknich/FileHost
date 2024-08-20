<template>
  <div class="auth-form">
    <h1>Sign Up</h1>
    <form @submit.prevent="handleSignup">
      <input v-model="username" type="text" placeholder="Username" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <input v-model="key" type="key" placeholder="Invite Key" required />
      <div class="button-container">
        <input type="submit" value="Sign Up" />
      </div>
    </form>
    <p>Already have an account? <router-link to="/login">Log In</router-link></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api'; // Ensure this points to your API service
import { useRouter } from 'vue-router';

const username = ref('');
const email = ref('');
const password = ref('');
const key = ref('');
const router = useRouter();

const handleSignup = async () => {
  try {
    await api.post('/auth/signup', {
      username: username.value,
      email: email.value,
      password: password.value,
      key: key.value,
    });
    router.push('/login');
  } catch (err) {
    console.error('Error signing up:', err.response?.data?.message || 'An error occurred');
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
input[type="email"],
input[type="key"],
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
