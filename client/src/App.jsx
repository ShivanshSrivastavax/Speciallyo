import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import FloatingHearts from './components/FloatingHearts';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateProposal from './pages/CreateProposal';
import EditProposal from './pages/EditProposal';
import PublicProposal from './pages/PublicProposal';
import ProposalResponses from './pages/ProposalResponses';
import { useAuthStore } from './store/authStore';

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col selection:bg-rose-200 selection:text-rose-900">
        <FloatingHearts />
        <Navbar />

        <main className="flex-1">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/p/:slug" element={<PublicProposal />} />
            <Route path="/propose/:slug" element={<PublicProposal />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/create" element={<CreateProposal />} />
              <Route path="/edit/:id" element={<EditProposal />} />
              <Route path="/responses/:id" element={<ProposalResponses />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
