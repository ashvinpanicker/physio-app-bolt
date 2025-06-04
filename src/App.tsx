import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Home from './pages/Home';
import Routines from './pages/Routines';
import Workout from './pages/Workout';
import History from './pages/History';
import Settings from './pages/Settings';

function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/routines" element={<Routines />} />
            <Route path="/workout/:routineId" element={<Workout />} />
            <Route path="/history" element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Navigate to="/\" replace />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}

export default App;