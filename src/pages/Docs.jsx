import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createPageUrl } from "@/utils";
import { AnimatePresence, motion } from "framer-motion";
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  ChevronRight,
  Code,
  FlaskConical,
  GitCommit,
  Home,
  LifeBuoy,
  Monitor,
  Palette,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const toolSections = [
  {
    title: "Core Tools",
    color: "emerald",
    tools: [
      {
        title: "Dashboard",
        icon: Home,
        description:
          "Your central hub for project selection, high-level statistics, and quick navigation. All roads lead from here.",
        features: [
          "Create and manage multiple ROM hack projects.",
          "View at-a-glance stats for flags, trainers, scripts, and sprites.",
          "Access quick action cards to jump directly into any tool.",
          "Monitor system status, including AI service and connection health.",
          "See a live feed of the most recent changes to your project.",
        ],
      },
      {
        title: "Lab Assistant",
        icon: FlaskConical,
        description:
          "An interactive AI chat interface for general ROM hacking questions and assistance.",
        features: [
          "Ask complex questions about scripting, game mechanics, or tool usage.",
          "The AI has access to your project's Knowledge Hub for contextual answers.",
          "Provides code examples, debugging help, and creative ideas.",
          "Upload text files for the AI to analyze and discuss.",
        ],
      },
    ],
  },
  {
    title: "Development Tools",
    color: "blue",
    tools: [
      {
        title: "Flag Forge",
        icon: Zap,
        description:
          "A comprehensive database for managing game flags, blending vanilla flags with your custom creations.",
        features: [
          "Browse and search over 800+ documented vanilla Emerald flags.",
          "Create, edit, and delete your own custom flags.",
          "Filter flags by category (Story, System, etc.) or configuration status.",
          "Add notes and modify descriptions of vanilla flags without losing the original data.",
          "Changes are automatically logged in the Bug Catcher.",
        ],
      },
      {
        title: "Script Sage",
        icon: Code,
        description:
          "An advanced integrated development environment (IDE) for HMA/XSE scripting with powerful AI assistance.",
        features: [
          "Full-featured text editor with syntax highlighting (planned).",
          "AI Assistant to generate, debug, and refactor scripts.",
          "Extensive database of HMA commands and script templates.",
          "Visual Script Flow to see a node-based representation of your logic.",
          "Export scripts directly to `.hma` files.",
        ],
      },
      {
        title: "Trainer Architect",
        icon: Users,
        description:
          "AI-powered tool for generating strategically sound and thematically consistent NPC trainers.",
        features: [
          "Define high-level concepts like biome, theme, and difficulty.",
          "The AI generates a full team with appropriate species, levels, movesets, and items.",
          "Analyzes team synergy, type coverage, and potential weaknesses.",
          "Generate unique trainer sprites based on class and a text prompt.",
          "Save and manage a library of custom-built trainers.",
        ],
      },
    ],
  },
  {
    title: "Creative Tools",
    color: "purple",
    tools: [
      {
        title: "Sprite Studio",
        icon: Palette,
        description:
          "A utility for validating and managing your custom sprites to ensure compatibility with Gen III games.",
        features: [
          "Upload sprite sheets for analysis.",
          "Automatically checks for palette size (16 colors) and dimension constraints.",
          "Provides clear feedback on validation issues.",
          "AI-powered style rater to check for consistency with the Gen III aesthetic (planned).",
          "Manage a central library of all your project sprites.",
        ],
      },
      {
        title: "Narrative Engine",
        icon: BookOpen,
        description:
          "A suite of tools for story writers to track events, manage characters, and generate dialogue.",
        features: [
          "Track major and minor story events and link them to flags and scripts.",
          "Create detailed profiles for NPCs, including backstories, personalities, and relationships.",
          "Use the Dialogue AI to generate authentic-sounding dialogue for any character or situation.",
          'Enable "ROMancer Mode" for surreal, poetic, and unexpected AI story suggestions.',
        ],
      },
    ],
  },
  {
    title: "System & Debugging",
    color: "orange",
    tools: [
      {
        title: "Bug Catcher",
        icon: GitCommit,
        description:
          "A detailed, filterable changelog that automatically records every significant action taken across the app.",
        features: [
          "See a complete history of created, updated, and deleted assets.",
          "Filter logs by module (e.g., only show changes from Flag Forge).",
          "Provides a safety net and an easy way to track project progress.",
          'Data snapshots for "updated" actions show what the data looked like before and after the change.',
        ],
      },
      {
        title: "Preview Tab",
        icon: Monitor,
        description:
          "An integrated emulator and debugger for live testing and analysis of your ROM hack (BETA).",
        features: [
          "Simulates ROM execution within the app.",
          "Provides a live console output of script activity and flag changes.",
          "Features an AI Assistant that gives real-time commentary on your play session.",
          "Includes a memory viewer to inspect specific RAM addresses.",
        ],
      },
    ],
  },
  {
    title: "Resources",
    color: "cyan",
    tools: [
      {
        title: "Knowledge Hub",
        icon: BrainCircuit,
        description:
          "Your project's personal, searchable encyclopedia. A place to store notes, code snippets, and discoveries.",
        features: [
          "Create and categorize entries on any topic.",
          "Powerful search scans titles, content, and keywords.",
          "Acts as the long-term memory for the Lab Assistant AI.",
          "A central place to document your unique findings and solutions.",
        ],
      },
    ],
  },
];

function ToolExpander({ tool, color }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card className="bg-muted/50 border shadow-sm transition-all duration-300 hover:border-accent">
      <CardHeader
        className="p-4 flex flex-row items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-4">
          <div
            className={`p-3 bg-gradient-to-br from-${color}-500/20 to-slate-500/10 rounded-lg`}
          >
            <tool.icon className={`w-6 h-6 text-${color}-400`} />
          </div>
          <div>
            <CardTitle className="text-lg text-slate-900 dark:text-white">
              {tool.title}
            </CardTitle>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {tool.description}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon">
          {isOpen ? (
            <ChevronDown className="w-5 h-5" />
          ) : (
            <ChevronRight className="w-5 h-5" />
          )}
        </Button>
      </CardHeader>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <CardContent className="pt-0 p-4 pl-6 border-t border-slate-200 dark:border-slate-700/50">
              <div className="ml-12 mt-4">
                <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-2">
                  Key Features:
                </h4>
                <ul className="list-disc list-inside space-y-2 text-slate-600 dark:text-slate-400 text-sm">
                  {tool.features.map((feature, i) => (
                    <li key={i}>{feature}</li>
                  ))}
                </ul>
                <Link to={createPageUrl(tool.title.replace(" ", ""))}>
                  <Button
                    variant="outline"
                    className={`mt-4 border-${color}-400/50 text-${color}-400 hover:bg-${color}-400/10 hover:text-${color}-300`}
                  >
                    Go to {tool.title}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function Docs() {
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
              <LifeBuoy className="w-7 h-7 text-cyan-400" />
              Documentation
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
              Comprehensive guides and references for all EmeraldMind tools
            </p>
          </motion.div>
        </header>

        <div className="space-y-8">
          {toolSections.map((section, sectionIndex) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: sectionIndex * 0.1 }}
            >
              <div className="mb-4">
                <h2
                  className={`text-2xl font-semibold text-${section.color}-400 mb-2`}
                >
                  {section.title}
                </h2>
                <div
                  className={`w-16 h-1 bg-gradient-to-r from-${section.color}-400 to-${section.color}-600 rounded-full`}
                ></div>
              </div>

              <div className="space-y-4">
                {section.tools.map((tool, toolIndex) => (
                  <motion.div
                    key={tool.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      delay: sectionIndex * 0.1 + toolIndex * 0.05,
                    }}
                  >
                    <ToolExpander tool={tool} color={section.color} />
                  </motion.div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12"
        >
          <Card className="bg-muted/50 backdrop-blur-sm border">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-purple-400" />
                Getting Started
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-slate-600 dark:text-slate-400">
              <p>
                Welcome to EmeraldMind! This comprehensive suite is designed to
                accelerate your Generation III ROM hacking workflow with
                AI-powered assistance and professional-grade tools.
              </p>
              <div className="bg-cyan-500/10 border border-cyan-400/30 rounded-lg p-4">
                <h4 className="font-semibold text-cyan-400 mb-2">
                  Quick Start Guide:
                </h4>
                <ol className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold min-w-4">1.</span>
                    Start by creating a project on the Dashboard
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold min-w-4">2.</span>
                    Build your knowledge base with ROM hacking discoveries
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold min-w-4">3.</span>
                    Use Flag Forge to plan your story progression flags
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold min-w-4">4.</span>
                    Design trainers and write scripts with AI assistance
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold min-w-4">5.</span>
                    Test everything in the Preview Tab and track issues with the
                    Bug Catcher
                  </li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
