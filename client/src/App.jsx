import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import LibraryPage from './pages/LibraryPage.jsx';
import UploadPage from './pages/UploadPage.jsx';
import PaperDetailPage from './pages/PaperDetailPage.jsx';
import CollectionsPage from './pages/CollectionsPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="library" element={<LibraryPage />} />
          <Route path="upload" element={<UploadPage />} />
          <Route path="papers/:id" element={<PaperDetailPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="search" element={<SearchPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
