import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Layout/Sidebar';
import { Header } from './components/Layout/Header';
import { Dashboard } from './pages/Dashboard';
import { Upload } from './pages/Upload';
import { Briefings } from './pages/Briefings';
import { BriefingDetails } from './pages/BriefingDetails';
import { Slices } from './pages/Slices';
import { Settings } from './pages/Settings';
import { About } from './pages/About';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <HeaderWithTitle />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/upload" element={<Upload />} />
                <Route path="/briefings" element={<Briefings />} />
                <Route path="/briefings/:id" element={<BriefingDetails />} />
                <Route path="/briefings/:id/slices" element={<Slices />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/about" element={<About />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </div>
      </div>
    </Router>
  );
}

function HeaderWithTitle() {
  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path === '/') return 'Dashboard';
    if (path === '/upload') return 'Upload Video';
    if (path === '/briefings') return 'All Briefings';
    if (path.startsWith('/briefings/') && path.endsWith('/slices')) return 'Briefing Slices';
    if (path.startsWith('/briefings/')) return 'Briefing Details';
    if (path === '/settings') return 'Settings';
    if (path === '/about') return 'About';
    return 'Attacked.ai BFI';
  };

  return <Header title={getPageTitle()} />;
}

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <div>
          <span>Attacked.ai BFI v1.0.0</span>
        </div>
        <div className="flex items-center space-x-4">
          <a 
            href="/docs" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:text-gray-700 dark:hover:text-gray-300"
          >
            API Documentation
          </a>
        </div>
      </div>
    </footer>
  );
}

export default App;