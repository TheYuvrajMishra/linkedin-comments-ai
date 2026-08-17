import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import ExtensionPage from './pages/ExtensionPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/extension" element={<ExtensionPage />} />
      </Routes>
    </BrowserRouter>
  );
}
