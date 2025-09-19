import React from 'react';

// === LOCAL DEVELOPMENT FOUNDATION ===
// This component provides the basic app structure for local development
// Copy this to your local src/App.js when running locally

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './Layout';

// Import your pages
import Dashboard from '../pages/Dashboard';
import LabAssistant from '../pages/LabAssistant';
import FlagForge from '../pages/FlagForge';
import ScriptSage from '../pages/ScriptSage';
import TrainerArchitect from '../pages/TrainerArchitect';
import SpriteValidator from '../pages/SpriteValidator';
import NarrativeEngine from '../pages/NarrativeEngine';
import PreviewTab from '../pages/PreviewTab';
import BugCatcher from '../pages/BugCatcher';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={
          <Layout currentPageName="Dashboard">
            <Dashboard />
          </Layout>
        } />
        <Route path="/labassistant" element={
          <Layout currentPageName="LabAssistant">
            <LabAssistant />
          </Layout>
        } />
        <Route path="/flagforge" element={
          <Layout currentPageName="FlagForge">
            <FlagForge />
          </Layout>
        } />
        <Route path="/scriptsage" element={
          <Layout currentPageName="ScriptSage">
            <ScriptSage />
          </Layout>
        } />
        <Route path="/trainerarchitect" element={
          <Layout currentPageName="TrainerArchitect">
            <TrainerArchitect />
          </Layout>
        } />
        <Route path="/spritevalidator" element={
          <Layout currentPageName="SpriteValidator">
            <SpriteValidator />
          </Layout>
        } />
        <Route path="/narrativeengine" element={
          <Layout currentPageName="NarrativeEngine">
            <NarrativeEngine />
          </Layout>
        } />
        <Route path="/previewtab" element={
          <Layout currentPageName="PreviewTab">
            <PreviewTab />
          </Layout>
        } />
        <Route path="/bugcatcher" element={
          <Layout currentPageName="BugCatcher">
            <BugCatcher />
          </Layout>
        } />
      </Routes>
    </Router>
  );
}

export default App;