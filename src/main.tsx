import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { ContactPage } from './pages/ContactPage';
import { EditorPage } from './pages/EditorPage';
import { EditorThemeProvider } from './context/EditorThemeContext';
import { LeadCollectInit } from './components/LeadCollectInit';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EditorThemeProvider>
      <BrowserRouter>
        <LeadCollectInit />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </EditorThemeProvider>
  </React.StrictMode>
);
