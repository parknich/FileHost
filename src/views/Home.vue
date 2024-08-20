<template>
    <div class="home-container">
      <h1>Welcome to FileHost</h1>
      <p>Upload your files and manage them efficiently.</p>
      <div class="button-container">
        <router-link to="/login">
          <button class="main-button">Log In</button>
        </router-link>
        <router-link to="/signup">
          <button class="main-button">Sign Up</button>
        </router-link>
      </div>
    </div>
  </template>
  
  <style scoped>
  .home-container {
    max-width: 600px;
    margin: 2rem auto;
    padding: 2rem;
    background-color: var(--secondary-color);
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
    text-align: center;
  }
  
  h1 {
    margin-bottom: 1rem;
    font-size: 2.5em;
    color: var(--text-color);
  }
  
  p {
    margin-bottom: 2rem;
    color: var(--text-muted);
  }
  
  .button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .main-button {
    width: 100%;
    max-width: 300px;
    padding: 0.8em;
    margin: 0.5em 0;
    border: none;
    border-radius: 4px;
    background-color: var(--accent-color);
    color: var(--text-color);
    font-size: 1em;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .main-button:hover {
    background-color: #535bf2;
  }
  </style>
  