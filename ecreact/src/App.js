import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import FindEvents from './pages/FindEvents/FindEvents';
import MarkInsights from './pages/MarkInsights/MarkInsights';
import Login from './pages/Login/Login';
import AIRecc from './pages/AIRecc/AIRecc';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';

function App() {
  return (
    <AuthProvider>
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/find-events" element={<ProtectedRoute><FindEvents /></ProtectedRoute>} />
          <Route path="/mark-insights" element={<ProtectedRoute><MarkInsights /></ProtectedRoute>} />
          <Route path="/ai-recc" element={<ProtectedRoute><AIRecc /></ProtectedRoute>} />
        </Routes>
      </Layout>
    </Router>
    </AuthProvider>
  );
}

export default App;
