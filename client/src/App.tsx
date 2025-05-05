import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Histoire from './pages/Histoire';
import VisualisationInventaire from './pages/VisualisationInventaire';
import Reglements from './pages/Reglements';
import EnsemblesReglements from './pages/EnsemblesReglements';
import EnsRegTerritoire from './pages/EnsRegTerr';
import AnalyseQuartiers from './pages/AnalyseQuartiers';
import AnalyseReglements from './pages/AnalyseReglements';
const app: React.FC = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/historique" />} />
          <Route path="/historique" element={<Histoire />} />
          <Route path="/inventaire" element={<VisualisationInventaire/>}/>
          <Route path="/reg" element={<Reglements/>}/>
          <Route path="/ens-reg" element={<EnsemblesReglements/>}/>
          <Route path="/ens-reg-terr" element={<EnsRegTerritoire/>}/>
          <Route path="/ana-reg" element={<AnalyseReglements/>}/>
          <Route path="/ana-quartiers" element={<AnalyseQuartiers/>}/>
        </Routes>
      </Router>
  );
};

export default app;