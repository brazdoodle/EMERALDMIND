import { LabAssistantProvider } from "@/components/shared/LabAssistantService.jsx";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { RGBPartyProvider } from "@/contexts/RGBPartyContext.jsx";
import { UserProvider } from "@/contexts/UserContext.jsx";
import { AppProvider } from "@/lib/appState.jsx";
import { ErrorBoundary } from "@/lib/errorBoundary.jsx";
import Pages from "@/pages/Pages.jsx";
import "./App.css";

// Development utilities for testing and debugging
if (import.meta.env.DEV) {
  // Test functions removed - clean build without user data remnants

  import("@/services/LabAssistantPokemon.js")
    .then((_module) => {
      window.enhanceLabAssistantWithPokemon =
        _module.enhanceLabAssistantWithPokemon;
    })
    .catch(() => {
      // Module not available in production
    });

  import("@/services/DifficultyTester.js")
    .then((_module) => {
      window.difficultyTester = _module.default;
    })
    .catch(() => {
      // Module not available in production
    });
}

function App() {
  return (
    <ErrorBoundary level="app" context="EmeraldMind" showDetails={true}>
      <UserProvider>
        <AppProvider>
          <LabAssistantProvider>
            <ThemeProvider>
              <RGBPartyProvider>
                <Pages />
                <Toaster />
              </RGBPartyProvider>
            </ThemeProvider>
          </LabAssistantProvider>
        </AppProvider>
      </UserProvider>
    </ErrorBoundary>
  );
}

export default App;
