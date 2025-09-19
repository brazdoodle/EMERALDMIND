
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Zap, Code, Users, Palette, BookOpen } from 'lucide-react';

export default function QuickActions({ currentProject }) {
  const actions = [
  {
    title: 'Create Flags',
    description: 'Design story progression flags',
    icon: Zap,
    page: 'FlagForge',
    gradient: 'from-emerald-500 to-green-500'
  },
  {
    title: 'Write Scripts',
    description: 'Generate HMA-compatible scripts',
    icon: Code,
    page: 'ScriptSage',
    gradient: 'from-yellow-500 to-orange-500'
  },
  {
    title: 'Build Trainers',
    description: 'Create challenging opponents',
    icon: Users,
    page: 'TrainerArchitect',
    gradient: 'from-teal-500 to-cyan-500'
  },
  {
    title: 'Validate Sprites',
    description: 'Check sprite compatibility',
    icon: Palette,
    page: 'SpriteStudio',
    gradient: 'from-purple-500 to-violet-500'
  },
  {
    title: 'Craft Story',
    description: 'Build narrative elements',
    icon: BookOpen,
    page: 'NarrativeEngine',
    gradient: 'from-pink-500 to-rose-500'
  }];

  return (
    <Card className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-sm border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl shadow-xl">
      <CardHeader className="p-4 md:p-6">
        <CardTitle className="text-white dark:text-white light:text-slate-900 text-xl font-semibold tracking-tight">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          {actions.map((action, index) =>
          <Link key={index} to={createPageUrl(action.page)} className="block group">
              <div className="p-4 md:p-5 border border-slate-700/50 dark:border-slate-700/50 light:border-slate-200 hover:border-slate-600/50 dark:hover:border-slate-600/50 light:hover:border-slate-300 bg-slate-800/30 dark:bg-slate-800/30 light:bg-slate-100 hover:bg-slate-800/50 dark:hover:bg-slate-800/50 light:hover:bg-slate-200 rounded-xl transition-all duration-300 hover:scale-[1.02]">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${action.gradient} bg-opacity-20 group-hover:bg-opacity-30 transition-all`}>
                    <action.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white dark:text-white light:text-slate-900 text-sm md:text-base">{action.title}</h3>
                    <p className="text-xs md:text-sm text-slate-400 dark:text-slate-400 light:text-slate-600">{action.description}</p>
                  </div>
                </div>
              </div>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>);
}
