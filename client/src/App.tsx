import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Histoire from './pages/Histoire';
import VisualisationInvenataire from './pages/VisualisationInventaire';

const app: React.FC = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/historique" />} />
          <Route path="/historique" element={<Histoire />} />
          <Route path="/inventaire" element={<VisualisationInvenataire/>}/>
        </Routes>
      </Router>
  );
};

export default app;