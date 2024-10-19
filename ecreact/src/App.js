import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import FindEvents from './pages/FindEvents/FindEvents';
import MarkInsights from './pages/MarkInsights/MarkInsights';
import AIRecc from './pages/AIRecc/AIRecc';


function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/find-events" element={<FindEvents />} />
          <Route path="/mark-insights" element={<MarkInsights />} />
          <Route path="/ai-recc" element={<AIRecc />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
