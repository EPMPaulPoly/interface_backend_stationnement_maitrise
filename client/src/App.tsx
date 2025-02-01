import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import Histoire from './pages/Histoire';
import VisualisationInvenataire from './pages/VisualisationInventaire';
import Reglements from './pages/Reglements';
import EnsemblesReglements from './pages/EnsemblesReglements';
import EnsRegTerritoire from './pages/EnsRegTerr';
import CompReg from './pages/CompReg';
const app: React.FC = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Navigate to="/historique" />} />
          <Route path="/historique" element={<Histoire />} />
          <Route path="/inventaire" element={<VisualisationInvenataire/>}/>
          <Route path="/reg" element={<Reglements/>}/>
          <Route path="/ens-reg" element={<EnsemblesReglements/>}/>
          <Route path="/ens-reg-terr" element={<EnsRegTerritoire/>}/>
          <Route path="/comp-reg" element={<CompReg/>}/>
        </Routes>
      </Router>
  );
};

export default app;