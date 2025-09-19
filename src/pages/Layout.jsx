

import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Zap,
  Code,
  Users,
  Palette,
  BookOpen,
  GitCommit,
  Monitor,
  FlaskConical,
  LifeBuoy,
  Gamepad2,
  BrainCircuit,
} from "lucide-react";
import { Sidebar, SidebarProvider, SidebarTrigger, SidebarHeader, SidebarContent, SidebarFooter, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent } from "@/components/ui/sidebar";
import { LabAssistantProvider } from "@/components/shared/LabAssistantService";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import ThemeToggle from "@/components/shared/ThemeToggle";

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

export default function Layout({ children, currentPageName }) {
  const location = useLocation();

  const renderNavigationGroup = (items, groupTitle, groupColor = "emerald") => (
    <SidebarGroup>
      <SidebarGroupLabel className={`text-xs font-semibold text-${groupColor}-400 uppercase tracking-wider px-2 py-2 mb-1`}>
        {groupTitle}
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu className="space-y-0.5">
          {items.map((item) =>
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                className={`transition-all duration-200 rounded-lg h-10 font-medium 
                  ${location.pathname === item.url ?
                    // Active state
                    `bg-${groupColor}-500/20 text-${groupColor}-700 dark:text-${groupColor}-300 border-l-2 border-${groupColor}-500 dark:border-${groupColor}-400 shadow-sm` :
                    // Inactive state
                    'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}>
                <Link to={item.url} className="flex items-center gap-3 px-4">
                  <item.icon className="w-5 h-5 flex-shrink-0" />
                  <span className="font-semibold tracking-wide text-sm">{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );

  return (
    <ThemeProvider>
      <LabAssistantProvider>
        <SidebarProvider>
          {/* This div now ALWAYS responds to dark: classes properly */}
          <div className="min-h-screen flex w-full bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            
            <Sidebar className="border-r border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:flex transition-colors duration-300">
              <SidebarHeader className="border-b border-slate-300 dark:border-slate-800 p-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-9 h-9 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center shadow-lg">
                      <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse"></div>
                  </div>
                  <div>
                    <h2 className="text-slate-900 dark:text-white text-lg font-bold tracking-wide">EMERALDMIND</h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">ROM Hacking IDE</p>
                  </div>
                </div>
              </SidebarHeader>
              
              <SidebarContent className="p-2 space-y-4">
                {renderNavigationGroup(coreTools, "Core", "emerald")}
                {renderNavigationGroup(developmentTools, "Development", "blue")}
                {renderNavigationGroup(creativeTools, "Creative", "purple")}
                {renderNavigationGroup(systemTools, "System", "orange")}
                {renderNavigationGroup(documentation, "Resources", "cyan")}

                <SidebarGroup className="mt-4">
                  <SidebarGroupLabel className="text-xs font-semibold text-emerald-400 uppercase tracking-wider px-2 py-2 mb-1">
                    System Status
                  </SidebarGroupLabel>
                  <SidebarGroupContent>
                    <div className="px-2 py-1 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">AI Status</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                          READY
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">ROM Base</span>
                        <span className="text-teal-400 font-medium">EMERALD</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 dark:text-slate-400">Mode</span>
                        <span className="text-yellow-400 font-medium">EXPERT</span>
                      </div>
                    </div>
                  </SidebarGroupContent>
                </SidebarGroup>
              </SidebarContent>

              <SidebarFooter className="border-t border-slate-300 dark:border-slate-800 p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">E</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-slate-900 dark:text-white text-sm font-semibold truncate">EmeraldMind</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">Precision Tools for ROM Architects</p>
                    </div>
                  </div>
                  <ThemeToggle />
                </div>
              </SidebarFooter>
            </Sidebar>

            <main className="flex-1 flex flex-col">
              <header className="bg-white dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 px-4 py-3 md:hidden">
                <div className="flex items-center gap-4">
                  <SidebarTrigger className="hover:bg-slate-200 dark:hover:bg-slate-800 p-2 rounded-lg transition-colors duration-200 text-emerald-400" />
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Gamepad2 className="w-5 h-5 text-white" />
                    </div>
                    <h1 className="text-lg font-bold text-slate-900 dark:text-white">EMERALDMIND</h1>
                  </div>
                  <div className="ml-auto">
                    <ThemeToggle />
                  </div>
                </div>
              </header>

              {/* Pages now inherit theme from this container automatically */}
              <div className="flex-1 overflow-auto">
                {children}
              </div>
            </main>
          </div>
        </SidebarProvider>
      </LabAssistantProvider>
    </ThemeProvider>
  );
}

