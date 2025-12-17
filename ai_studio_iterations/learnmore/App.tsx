
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext'; // Import Context Provider

import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import ProductTourPage from './pages/ProductTourPage';
import PricingPage from './pages/PricingPage';
import AboutUsPage from './pages/AboutUsPage';
import SubjectsPage from './pages/SubjectsPage';
import SuccessStoriesPage from './pages/SuccessStoriesPage';
import BlogPage from './pages/BlogPage';
import StudyGuidePage from './pages/StudyGuidePage';
import StudentCarePage from './pages/StudentCarePage';

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-white dark:bg-black text-slate-900 dark:text-white selection:bg-primary-500 selection:text-white transition-colors duration-300">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/how-it-works" element={<ProductTourPage />} />
            <Route path="/subjects" element={<SubjectsPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/about-us" element={<AboutUsPage />} />
            <Route path="/success-stories" element={<SuccessStoriesPage />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/study-guides" element={<StudyGuidePage />} />
            <Route path="/student-care" element={<StudentCarePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;
