import Layout from "./Layout.jsx";

import Dashboard from "./Dashboard";

import FlagForge from "./FlagForge";

import ScriptSage from "./ScriptSage";

import TrainerArchitect from "./TrainerArchitect";

import NarrativeEngine from "./NarrativeEngine";

import LabAssistant from "./LabAssistant";

import PreviewTab from "./PreviewTab";

import BugCatcher from "./BugCatcher";

import KnowledgeHub from "./KnowledgeHub";

import SpriteStudio from "./SpriteStudio";

import Docs from "./Docs";

import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';

const PAGES = {
    
    Dashboard: Dashboard,
    
    FlagForge: FlagForge,
    
    ScriptSage: ScriptSage,
    
    TrainerArchitect: TrainerArchitect,
    
    NarrativeEngine: NarrativeEngine,
    
    LabAssistant: LabAssistant,
    
    PreviewTab: PreviewTab,
    
    BugCatcher: BugCatcher,
    
    KnowledgeHub: KnowledgeHub,
    
    SpriteStudio: SpriteStudio,
    
    Docs: Docs,
    
}

function _getCurrentPage(url) {
    if (url.endsWith('/')) {
        url = url.slice(0, -1);
    }
    let urlLastPart = url.split('/').pop();
    if (urlLastPart.includes('?')) {
        urlLastPart = urlLastPart.split('?')[0];
    }

    const pageName = Object.keys(PAGES).find(page => page.toLowerCase() === urlLastPart.toLowerCase());
    return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
    const location = useLocation();
    const currentPage = _getCurrentPage(location.pathname);
    
    return (
        <Layout currentPageName={currentPage}>
            <Routes>            
                
                    <Route path="/" element={<Dashboard />} />
                
                
                <Route path="/Dashboard" element={<Dashboard />} />
                
                <Route path="/FlagForge" element={<FlagForge />} />
                
                <Route path="/ScriptSage" element={<ScriptSage />} />
                
                <Route path="/TrainerArchitect" element={<TrainerArchitect />} />
                
                <Route path="/NarrativeEngine" element={<NarrativeEngine />} />
                
                <Route path="/LabAssistant" element={<LabAssistant />} />
                
                <Route path="/PreviewTab" element={<PreviewTab />} />
                
                <Route path="/BugCatcher" element={<BugCatcher />} />
                
                <Route path="/KnowledgeHub" element={<KnowledgeHub />} />
                
                <Route path="/SpriteStudio" element={<SpriteStudio />} />
                
                <Route path="/Docs" element={<Docs />} />
                
            </Routes>
        </Layout>
    );
}

export default function Pages() {
    return (
        <Router>
            <PagesContent />
        </Router>
    );
}