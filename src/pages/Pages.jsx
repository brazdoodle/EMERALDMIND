// Optimized Pages with Lazy Loading
import { Suspense, lazy } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  useLocation,
} from "react-router-dom";
import Layout from "./Layout.jsx";

// Lazy load all pages for better performance
const Dashboard = lazy(() => import("./Dashboard.jsx"));
const FlagForge = lazy(() => import("./FlagForge.jsx"));
const ScriptSage = lazy(() => import("./ScriptSage.jsx"));
const ProgrammaticGenerator = lazy(() => import("./ProgrammaticGenerator.jsx"));
const TrainerArchitect = lazy(() => import("./TrainerArchitect.jsx"));
const NarrativeEngine = lazy(() => import("./NarrativeEngine.jsx"));
const LabAssistant = lazy(() => import("./LabAssistant.jsx"));
const PreviewTab = lazy(() => import("./PreviewTab.jsx"));
const BugCatcher = lazy(() => import("./BugCatcher.jsx"));
const KnowledgeHub = lazy(() => import("./KnowledgeHub.jsx"));
const SpriteStudio = lazy(() => import("./SpriteStudio.jsx"));
const Docs = lazy(() => import("./Docs.jsx"));
// Import performance dashboard
const PerformanceDashboard = lazy(() =>
  import("@/components/dashboard/PerformanceDashboard")
);

const PAGES = {
  Dashboard: Dashboard,
  FlagForge: FlagForge,
  ScriptSage: ScriptSage,
  ProgrammaticGenerator: ProgrammaticGenerator,
  TrainerArchitect: TrainerArchitect,
  NarrativeEngine: NarrativeEngine,
  LabAssistant: LabAssistant,
  PreviewTab: PreviewTab,
  BugCatcher: BugCatcher,
  KnowledgeHub: KnowledgeHub,
  SpriteStudio: SpriteStudio,
  Docs: Docs,
  PerformanceDashboard: PerformanceDashboard,
};

// Enhanced loading fallback with better UX
const PageLoadingFallback = ({ pageName }) => (
  <div className="min-h-screen bg-background flex items-center justify-center">
    <div className="text-center space-y-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
      <div className="text-lg font-medium">Loading {pageName}...</div>
      <div className="text-sm text-muted-foreground">
        Optimizing performance...
      </div>
    </div>
  </div>
);

function _getCurrentPage(url) {
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  let urlLastPart = url.split("/").pop();
  if (urlLastPart.includes("?")) {
    urlLastPart = urlLastPart.split("?")[0];
  }

  const pageName = Object.keys(PAGES).find(
    (page) => page.toLowerCase() === urlLastPart.toLowerCase()
  );
  return pageName || Object.keys(PAGES)[0];
}

// Create a wrapper component that uses useLocation inside the Router context
function PagesContent() {
  const location = useLocation();
  const currentPage = _getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Suspense fallback={<PageLoadingFallback pageName={currentPage} />}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/FlagForge" element={<FlagForge />} />
          <Route path="/ScriptSage" element={<ScriptSage />} />
          <Route
            path="/ProgrammaticGenerator"
            element={<ProgrammaticGenerator />}
          />
          <Route path="/TrainerArchitect" element={<TrainerArchitect />} />
          <Route path="/NarrativeEngine" element={<NarrativeEngine />} />
          <Route path="/LabAssistant" element={<LabAssistant />} />
          <Route path="/PreviewTab" element={<PreviewTab />} />
          <Route path="/BugCatcher" element={<BugCatcher />} />
          <Route path="/KnowledgeHub" element={<KnowledgeHub />} />
          <Route path="/SpriteStudio" element={<SpriteStudio />} />
          <Route path="/Docs" element={<Docs />} />
          <Route path="/Performance" element={<PerformanceDashboard />} />
        </Routes>
      </Suspense>
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
