import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import RoutePlanner from './pages/RoutePlanner';
import Dashboard from './pages/Dashboard';
import DisruptionLab from './pages/DisruptionLab';
import MockRegistry from './pages/MockRegistry';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-[#0B1120]">
        <Navbar />
        <main className="flex-grow flex flex-col">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/plan" element={<RoutePlanner />} />
            <Route path="/planning" element={<Navigate to="/plan" replace />} />
            <Route path="/p" element={<Navigate to="/plan" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/disruption" element={<DisruptionLab />} />
            <Route path="/data-registry" element={<MockRegistry />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
