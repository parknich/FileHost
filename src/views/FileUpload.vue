<template>
  <div>
    <h1>File Upload</h1>
    <form @submit.prevent="uploadFile">
      <input type="file" @change="handleFileChange" required />
      <button type="submit">Upload</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="fileUrl">File uploaded: <a :href="fileUrl" target="_blank">{{ fileUrl }}</a></p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import api from '../services/api';

const file = ref(null);
const error = ref('');
const fileUrl = ref('');

const handleFileChange = (event) => {
  file.value = event.target.files[0];
};

const uploadFile = async () => {
  if (!file.value) return;

  try {
    const formData = new FormData();
    formData.append('file', file.value);

    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'x-auth-token': localStorage.getItem('token'),
      },
    });

    fileUrl.value = response.data.file.path; // Assuming the backend returns the file path
  } catch (err) {
    error.value = err.response?.data?.message || 'An error occurred';
  }
};
</script>

<style>
.error {
  color: red;
}
</style>
