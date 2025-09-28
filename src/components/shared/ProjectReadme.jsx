/**
 * This file is for documentation purposes and is not directly used in the app's runtime.
 * It provides a comprehensive overview of the EmeraldMind ROM Hacking Suite.
 */
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Zap, Users, Code, Palette, BookOpen, 
  FlaskConical, Monitor, GitCommit, BookCopy,
  Rocket, Settings, Bug, Eye, Play
} from 'lucide-react';

const modules = [
  // This is a static representation of the app's modules for documentation.
  { name: 'Flag Forge', icon: Zap, description: 'Manage game flags and story progression triggers.' },
  { name: 'Trainer Architect', icon: Users, description: 'Design and generate trainer battles with AI-powered team building.' },
  { name: 'Script Sage', icon: Code, description: 'Write, validate, and visualize HMA/XSE game scripts.' },
  { name: 'Sprite Studio', icon: Palette, description: 'Generate Gen III-style battle sprites with AI.' },
  { name: 'Narrative Engine', icon: BookOpen, description: 'Craft story events, NPC lore, and generate dialogue.' },
  { name: 'Lab Assistant', icon: FlaskConical, description: 'Your AI companion for all ROM hacking questions.' },
  { name: 'Preview Tab', icon: Monitor, description: 'Test your ROM in a live GBA emulator with debug tools.' },
  { name:- 'Bug Catcher', icon: GitCommit, description: 'Track project changes and detected bugs.' },
];

export default function ProjectReadme() {
  return (
    <div className="p-8 bg-slate-950 text-white">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-bold text-emerald-400 mb-2">EmeraldMind</h1>
        <p className="text-xl text-slate-300">The Professional ROM Hacking Suite for Pokémon Emerald</p>
      </header>

      <section className="max-w-4xl mx-auto space-y-8">
        <div>
          <h2 className="text-3xl font-semibold border-b-2 border-emerald-500 pb-2 mb-4">Core Modules</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {modules.map(module => (
              <Card key={module.name} className="bg-slate-900 border-slate-800">
                <CardHeader className="flex flex-row items-center gap-4">
                  <module.icon className="w-8 h-8 text-emerald-400" />
                  <CardTitle className="text-xl text-white">{module.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-400">{module.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-3xl font-semibold border-b-2 border-emerald-500 pb-2 mb-4">Getting Started</h2>
          <div className="space-y-4 text-slate-300">
            <p>1. Start by creating a new project on the <strong>Dashboard</strong>.</p>
            <p>2. Use <strong>Flag Forge</strong> to define the key milestones of your story.</p>
            <p>3. Generate unique battle sprites in <strong>Sprite Studio</strong>.</p>
            <p>4. Build challenging opponents with <strong>Trainer Architect</strong>.</p>
            <p>5. Write the game's logic and dialogue in <strong>Script Sage</strong>.</p>
            <p>6. Test everything in real-time using the <strong>Preview Tab</strong>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}