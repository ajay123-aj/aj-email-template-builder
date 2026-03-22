import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { EditorPage } from './pages/EditorPage';
import { EditorThemeProvider } from './context/EditorThemeContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EditorThemeProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/editor" element={<EditorPage />} />
        </Routes>
      </BrowserRouter>
    </EditorThemeProvider>
  </React.StrictMode>
);
