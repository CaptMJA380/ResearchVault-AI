import axios from 'axios';

const API_BASE = 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 30000,
});

// Response interceptor for clear error message extraction
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'An unexpected error occurred while communicating with ResearchVault AI server.';
    return Promise.reject(new Error(message));
  }
);

// Health & System
export const getHealth = () => api.get('/health');
export const getReady = () => api.get('/health/ready');
export const getDashboardStats = () => api.get('/dashboard/stats');

// Papers
export const getPapers = (params) => api.get('/papers', { params });
export const getPaperById = (id) => api.get(`/papers/${id}`);
export const createPaper = (formData) =>
  api.post('/papers', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updatePaper = (id, data) => api.put(`/papers/${id}`, data);
export const deletePaper = (id) => api.delete(`/papers/${id}`);
export const getPaperFileUrl = (id) => `${API_BASE}/papers/${id}/file`;
export const summarizePaper = (id) => api.post(`/papers/${id}/summarize`);

// Notes
export const addNote = (paperId, content) => api.post(`/papers/${paperId}/notes`, { content });
export const updateNote = (paperId, noteId, content) =>
  api.put(`/papers/${paperId}/notes/${noteId}`, { content });
export const deleteNote = (paperId, noteId) =>
  api.delete(`/papers/${paperId}/notes/${noteId}`);

// Discovery & Related
export const getRelatedPapers = (id) => api.get(`/papers/${id}/related`);
export const exportBibTeXUrl = (id) => `${API_BASE}/papers/${id}/export/bibtex`;

// Collections
export const getCollections = () => api.get('/collections');
export const getCollectionById = (id) => api.get(`/collections/${id}`);
export const createCollection = (data) => api.post('/collections', data);
export const updateCollection = (id, data) => api.put(`/collections/${id}`, data);
export const deleteCollection = (id) => api.delete(`/collections/${id}`);

// Semantic Search
export const searchSemantic = (q, limit = 10) =>
  api.get('/search/semantic', { params: { q, limit } });

export default api;
