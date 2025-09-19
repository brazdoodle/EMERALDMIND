// This file is the entry point for local development.
// It sets up the React application root and routing.

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../layout.js';

// Import all pages
import Dashboard from '../../pages/Dashboard.js';
import FlagForge from '../../pages/FlagForge.js';
import TrainerArchitect from '../../pages/TrainerArchitect.js';
import ScriptSage from '../../pages/ScriptSage.js';
import SpriteStudio from '../../pages/SpriteStudio.js';
import NarrativeEngine from '../../pages/NarrativeEngine.js';
import LabAssistant from '../../pages/LabAssistant.js';
import PreviewTab from '../../pages/PreviewTab.js';
import BugCatcher from '../../pages/BugCatcher.js';
import Docs from '../../pages/Docs.js';

const App = () => {
  const pages = [
    { path: "/Dashboard", component: Dashboard },
    { path: "/FlagForge", component: FlagForge },
    { path: "/TrainerArchitect", component: TrainerArchitect },
    { path: "/ScriptSage", component: ScriptSage },
    { path: "/SpriteStudio", component: SpriteStudio },
    { path: "/NarrativeEngine", component: NarrativeEngine },
    { path: "/LabAssistant", component: LabAssistant },
    { path: "/PreviewTab", component: PreviewTab },
    { path: "/BugCatcher", component: BugCatcher },
    { path: "/Docs", component: Docs },
  ];

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/Dashboard" replace />} />
          {pages.map(page => (
            <Route key={page.path} path={page.path} element={<page.component />} />
          ))}
        </Routes>
      </Layout>
    </Router>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);