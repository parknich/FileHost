<template>
    <div class="dashboard">
      <aside class="sidebar">
        <h2>Files</h2>
        <ul>
          <li v-for="category in categories" :key="category" @click="selectCategory(category)">
            {{ category }}
          </li>
        </ul>
      </aside>
      <main class="content">
        <div class="header">
          <h1>My Files</h1>
          <button class="upload-button" @click="showUploadMenu = true">Upload File</button>
        </div>
        <div v-if="files.length === 0" class="no-files">
          <p>No files available. Upload some files to see them here.</p>
        </div>
        <div class="file-grid">
          <div v-for="file in filteredFiles" :key="file._id" class="file-card">
            <div v-if="isImage(file.url)" class="file-preview image-preview">
              <img :src="file.url" alt="file preview" />
            </div>
            <div v-if="isVideo(file.url)" class="file-preview video-preview">
              <video controls :src="file.url"></video>
            </div>
            <div v-if="!isImage(file.url) && !isVideo(file.url)" class="file-info">
              <p>File Type: {{ getFileType(file.name) }}</p>
            </div>
            <div class="file-info">
              <p>{{ file.name }}</p>
            </div>
            <div class="file-actions">
              <button @click="copyUrl(file.url)">Copy URL</button>
              <button @click="deleteFile(file._id)">Delete</button>
            </div>
          </div>
        </div>
      </main>
  
      <!-- Upload Menu -->
      <transition name="fade">
        <div v-if="showUploadMenu" class="upload-menu" @click.self="showUploadMenu = false">
          <div class="upload-menu-content">
            <h2>Upload File</h2>
            <div class="upload-area" @click="triggerFileInput">
              <p>Drag and drop your file here, or <span>select a file</span></p>
              <!-- Hidden file input -->
              <input type="file" ref="fileInput" @change="handleFileUpload" style="display: none;" />
            </div>
            <div v-if="selectedFile && isVideo(selectedFile.name)">
              <label for="compression">Compression:</label>
              <input type="range" id="compression" min="0" max="100" v-model="compressionLevel" />
              <p>Compression Level: {{ compressionLevel }}%</p>
            </div>
            <button class="upload-confirm" @click="uploadFile">Upload</button>
          </div>
        </div>
      </transition>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue';
  import api from '../services/api'; // Ensure this points to your API service
  
  const categories = ['All', 'Images', 'Videos', 'Other'];
  const selectedCategory = ref('All');
  const files = ref([]);
  const showUploadMenu = ref(false);
  const selectedFile = ref(null);
  const compressionLevel = ref(0);
  
  const fetchFiles = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No token found');
  
      const response = await api.get('/files', {
        headers: {
          'x-auth-token': token
        }
      });
  
      console.log('Fetched files:', response.data); // Log the fetched files
      files.value = response.data;
    } catch (err) {
      console.error('Error fetching files:', err.response?.data?.message || err.message);
    }
  };
  
  const selectCategory = (category) => {
    selectedCategory.value = category;
  };
  
  const filteredFiles = computed(() => {
    if (selectedCategory.value === 'All') return files.value;
    return files.value.filter(file => {
      if (selectedCategory.value === 'Images') return isImage(file.url);
      if (selectedCategory.value === 'Videos') return isVideo(file.url);
      return !isImage(file.url) && !isVideo(file.url);
    });
  });
  
  const isImage = (url) => {
    const imageExtensions = /\.(jpg|jpeg|png|gif|bmp|webp|svg|tiff|ico)$/i;
    return imageExtensions.test(url);
  };
  
  const isVideo = (url) => {
    const videoExtensions = /\.(mp4|mov|webm|ogg|avi|mkv|flv|wmv)$/i;
    return videoExtensions.test(url);
  };
  
  const getFileType = (fileName) => {
    if (!fileName) {
      console.error('fileName is undefined or null');
      return 'unknown';
    }
  
    // Extract file extension
    const ext = fileName.split('.').pop().toLowerCase();
  
    // Get MIME type
    const mimeType = mime.lookup(ext);
  
    // Determine file type based on MIME type
    if (mimeType) {
      if (mimeType.startsWith('image/')) {
        return 'image';
      } else if (mimeType.startsWith('video/')) {
        return 'video';
      } else {
        return 'other';
      }
    } else {
      return 'unknown';
    }
  };
  
  const copyUrl = (url) => {
    navigator.clipboard.writeText(url).then(() => {
      alert('URL copied to clipboard');
    });
  };
  
  const deleteFile = async (fileId) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/files/${fileId}`, {
        headers: {
          'x-auth-token': token
        }
      });
      fetchFiles(); // Refresh the file list
    } catch (err) {
      console.error('Error deleting file:', err.response?.data?.message || 'An error occurred');
    }
  };
  
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    selectedFile.value = file;
    showUploadMenu.value = true;
  };
  
  const uploadFile = async () => {
    if (!selectedFile.value) return;
  
    const formData = new FormData();
    const username = localStorage.getItem('identifier');
    formData.append('username', username);
    formData.append('file', selectedFile.value);
    if (isVideo(selectedFile.value.name)) {
      formData.append('compression', compressionLevel.value);
    }
  
    try {
      const token = localStorage.getItem('token');
      await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-auth-token': token
        }
      });
      showUploadMenu.value = false;
      fetchFiles(); // Refresh the file list
    } catch (err) {
      console.error('Error uploading file:', err.response?.data?.message || 'An error occurred');
    }
  };
  
  const triggerFileInput = () => {
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.click();
  };
  
  onMounted(() => {
    fetchFiles();
  });
  </script>
  
  <style scoped>
  .dashboard {
    display: flex;
    height: 100vh;
  }
  
  .sidebar {
    width: 250px;
    background-color: #1f1f1f;
    padding: 1rem;
    color: #fff;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #333;
  }
  
  .sidebar h2 {
    margin: 0;
  }
  
  .sidebar ul {
    list-style: none;
    padding: 0;
  }
  
  .sidebar li {
    padding: 0.5rem;
    cursor: pointer;
  }
  
  .sidebar li:hover {
    background-color: #333;
  }
  
  .content {
    flex: 1;
    padding: 1rem;
    overflow-y: auto;
  }
  
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .upload-button {
    background-color: #535bf2;
    color: #fff;
  }
  
  .file-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .file-card {
    background-color: #2a2a2a;
    padding: 1rem;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .file-preview {
    width: 100%;
    border-radius: 8px;
    margin-bottom: 0.5rem;
  }
  
  .image-preview img {
    width: 100%;
    height: 200px; /* Adjust height for images */
    object-fit: cover;
  }
  
  .video-preview video {
    width: 100%;
    height: 200px; /* Adjust height for videos */
  }
  
  .file-info {
    color: #ddd;
    text-align: center;
  }
  
  .file-actions {
    margin-top: 1rem;
  }
  
  .file-actions button {
    background-color: #535bf2;
    color: #fff;
  }
  
  .upload-menu {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .upload-menu-content {
    background: #2a2a2a;
    padding: 2rem;
    border-radius: 8px;
    position: relative;
    width: 90%;
    max-width: 600px;
  }
  
  .upload-area {
    border: 2px dashed #535bf2;
    padding: 2rem;
    border-radius: 8px;
    text-align: center;
    cursor: pointer;
  }
  
  .upload-area span {
    color: #535bf2;
  }
  
  .upload-confirm {
    background-color: #535bf2;
    color: #fff;
    width: 100%;
  }
  
  .fade-enter-active, .fade-leave-active {
    transition: opacity 0.5s;
  }
  
  .fade-enter, .fade-leave-to {
    opacity: 0;
  }
  </style>
  