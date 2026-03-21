import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import ProjectPage from './pages/ProjectPage.jsx';
import ContactPage from './pages/ContactPage.jsx';

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (!hash) {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/home" element={<Navigate to="/" replace />} />
        <Route path="/contact-us" element={<ContactPage />} />
        <Route path="/:slug" element={<ProjectPage />} />
      </Routes>
    </BrowserRouter>
  );
}
