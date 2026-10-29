import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Pages
import Home from './pages/Home.jsx';
import Register from './pages/Register.jsx';
import Login from './pages/Login.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Profile from './pages/Profile.jsx';
import ChangePassword from './pages/ChangePassword.jsx';
import NotFound from './pages/NotFound.jsx';

// Styles
import './styles/global.css';
import './styles/auth.css';
import './styles/dashboard.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
        <main>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />

            {/* Protected Routes (Secured by ProtectedRoute Guard) */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/change-password" element={<ChangePassword />} />
            </Route>

            {/* 404 Not Found Catch-All */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
        <footer className="footer">
          <div className="container">
            <p>
              Node.js Lab Project &bull; User Authentication with React &amp; Express &bull; Secure HttpOnly Session Architecture
            </p>
          </div>
        </footer>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
