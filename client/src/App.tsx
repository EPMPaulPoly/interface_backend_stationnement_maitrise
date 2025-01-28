import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Histoire from './pages/Histoire';
import VisualisationInvenataire from './pages/VisualisationInventaire';
import Reglements from './pages/Reglements';
import EnsemblesReglements from './pages/EnsemblesReglements';

const app: React.FC = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/historique" />} />
          <Route path="/historique" element={<Histoire />} />
          <Route path="/inventaire" element={<VisualisationInvenataire/>}/>
          <Route path="/reg" element={<Reglements/>}/>
          <Route path="/ens-reg" element={<EnsemblesReglements/>}/>
        </Routes>
      </Router>
  );
};

export default app;