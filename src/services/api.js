import axios from 'axios';

const api = axios.create({
  baseURL: "http://files.parknich.xyz/api",
});

export const fetchFiles = () => {
    return api.get('/files');
};

export default api;
