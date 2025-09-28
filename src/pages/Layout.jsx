import { LabAssistantProvider } from "@/components/shared/LabAssistantService";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import ThemeToggle from "@/components/shared/ThemeToggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useUser } from "@/contexts/UserContext";
import {
  BookOpen,
  BrainCircuit,
  Code,
  FlaskConical,
  Gamepad2,
  GitCommit,
  Home,
  LifeBuoy,
  Monitor,
  Palette,
  Users,
  Zap,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const coreTools = [
  { title: "Dashboard", icon: Home, url: "/" },
  { title: "Lab Assistant", icon: FlaskConical, url: "/LabAssistant" },
];

const developmentTools = [
  { title: "Flag Forge", icon: Zap, url: "/FlagForge" },
  { title: "Script Sage", icon: Code, url: "/ScriptSage" },
  { title: "Trainer Architect", icon: Users, url: "/TrainerArchitect" },
];

const creativeTools = [
  { title: "Sprite Studio", icon: Palette, url: "/SpriteStudio" },
  { title: "Narrative Engine", icon: BookOpen, url: "/NarrativeEngine" },
];

const systemTools = [
  { title: "Bug Catcher", icon: GitCommit, url: "/BugCatcher" },
  { title: "Preview Tab", icon: Monitor, url: "/PreviewTab" },
];

const documentation = [
  { title: "Documentation", icon: LifeBuoy, url: "/Docs" },
  { title: "Knowledge Hub", icon: BrainCircuit, url: "/KnowledgeHub" },
];

const userTools = [];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const { currentUser } = useUser();
  const [isAiConnected, setIsAiConnected] = useState(false);

  // Check AI connectivity status
  useEffect(() => {
    const checkAiStatus = async () => {
      try {
        // Simple connectivity check - adjust URL based on your AI service
        const response = await fetch("/api/health", {
          method: "GET",
          signal: AbortSignal.timeout(3000),
        });
        setIsAiConnected(response.ok);
      } catch (_error) {
        setIsAiConnected(false);
      }
    };

    checkAiStatus();
    // Check every 30 seconds
    const interval = setInterval(checkAiStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const renderNavigationGroup = (items, groupTitle, groupColor = "emerald") => (
    <SidebarGroup className="mb-2">
      <SidebarGroupLabel
        className={`text-xs font-semibold text-${groupColor}-400 uppercase tracking-wider px-2 py-1 mb-1`}
      >
        {groupTitle}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5">
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`transition-all duration-200 rounded-lg h-9 font-medium 
                  ${
                    location.pathname === item.url
                      ? // Active state
                        `bg-${groupColor}-500/20 text-${groupColor}-700 dark:text-${groupColor}-300 border-l-2 border-${groupColor}-500 dark:border-${groupColor}-400 shadow-sm`
                      : // Inactive state
                        "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                <Link to={item.url} className="flex items-center gap-3 px-3">
                  <item.icon className="w-4 h-4 flex-shrink-0" />
                  <span className="font-semibold tracking-wide text-sm">
                    {item.title}
                  </span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <ThemeProvider>
      <LabAssistantProvider>
        <SidebarProvider>
          {/* This div now ALWAYS responds to dark: classes properly */}
          <div className="h-screen flex flex-col w-full bg-background transition-colors duration-300">
            {/* Compact AI Status Bar at the top */}
            <div className="bg-slate-900 dark:bg-slate-950 text-white px-4 py-1.5 text-xs border-b border-slate-700">
              <div className="flex items-center justify-end">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isAiConnected
                        ? "bg-emerald-400 animate-pulse"
                        : "bg-red-400"
                    }`}
                  ></div>
                  <span className="text-slate-300">
                    AI {isAiConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-1 min-h-0">
              <Sidebar className="border-r border-border bg-card hidden md:flex transition-colors duration-300">
                <SidebarHeader className="border-b border-slate-300 dark:border-slate-800 p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                        <Gamepad2 className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                    </div>
                    <div>
                      <h2 className="text-foreground text-lg font-bold tracking-wide">
                        EMERALDMIND
                      </h2>
                      <p className="text-xs text-muted-foreground font-mono">
                        ROM Hacking IDE
                      </p>
                    </div>
                  </div>
                </SidebarHeader>

                <SidebarContent className="p-2 space-y-2">
                  {renderNavigationGroup(coreTools, "Core", "emerald")}
                  {renderNavigationGroup(
                    developmentTools,
                    "Development",
                    "blue"
                  )}
                  {renderNavigationGroup(creativeTools, "Creative", "purple")}
                  {renderNavigationGroup(systemTools, "System", "orange")}
                  {renderNavigationGroup(documentation, "Resources", "cyan")}
                  {renderNavigationGroup(userTools, "User", "slate")}
                </SidebarContent>

                <SidebarFooter className="border-t border-border p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className={`w-8 h-8 bg-gradient-to-r ${
                          currentUser?.avatar?.backgroundColor ||
                          "from-emerald-500 to-teal-500"
                        } rounded-full flex items-center justify-center`}
                      >
                        <span className="text-white font-bold text-sm">
                          {currentUser?.avatar?.value || "U"}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-foreground text-sm font-semibold truncate">
                          {currentUser?.name || "User"}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {currentUser?.tagline || "ROM Hacking Enthusiast"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThemeToggle />
                    </div>
                  </div>
                </SidebarFooter>
              </Sidebar>

              <main className="flex-1 flex flex-col min-h-0">
                <header className="bg-card border-b border-border px-4 py-3 md:hidden flex-shrink-0">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="hover:bg-accent p-2 rounded-lg transition-colors duration-200 text-emerald-400" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5 text-white" />
                      </div>
                      <h1 className="text-lg font-bold text-foreground">
                        EMERALDMIND
                      </h1>
                    </div>
                    <div className="ml-auto">
                      <ThemeToggle />
                    </div>
                  </div>
                </header>

                {/* Pages now inherit theme from this container automatically with proper scrolling */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                  <div className="p-4 md:p-6">{children}</div>
                </div>
              </main>
            </div>
          </div>
        </SidebarProvider>
      </LabAssistantProvider>
    </ThemeProvider>
  );
}
