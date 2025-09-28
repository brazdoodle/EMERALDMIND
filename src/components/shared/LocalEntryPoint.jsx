// This file is the entry point for local development.
// It sets up the React application root and routing.

import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from '../../pages/Layout.jsx';

// Import all pages
import Dashboard from '../../pages/Dashboard.jsx';
import FlagForge from '../../pages/FlagForge.jsx';
import TrainerArchitect from '../../pages/TrainerArchitect.jsx';
import ScriptSage from '../../pages/ScriptSage.jsx';
import SpriteStudio from '../../pages/SpriteStudio.jsx';
import NarrativeEngine from '../../pages/NarrativeEngine.jsx';
import LabAssistant from '../../pages/LabAssistant.jsx';
import PreviewTab from '../../pages/PreviewTab.jsx';
import BugCatcher from '../../pages/BugCatcher.jsx';
import Docs from '../../pages/Docs.jsx';
import ProgrammaticGenerator from '../../pages/ProgrammaticGenerator.jsx';

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
  { path: "/ProgrammaticGenerator", component: ProgrammaticGenerator },
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