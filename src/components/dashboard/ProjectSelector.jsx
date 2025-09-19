
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Plus, FolderOpen } from 'lucide-react';

export default function ProjectSelector({ 
  projects, 
  currentProject, 
  onSelectProject, // Renamed from onProjectSelect
  onCreateProject,
  // onLoadStats prop removed
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      onCreateProject({
        name: newProjectName.trim(),
        description: `ROM hack project: ${newProjectName}`,
        base_rom: 'emerald'
      });
      setNewProjectName('');
      setShowCreateForm(false);
    }
  };

  return (
    <Card className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-sm border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl mb-6 md:mb-8 shadow-xl">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 p-4 md:p-6">
        <CardTitle className="text-emerald-400 text-lg md:text-xl">Active Project</CardTitle>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-emerald-600 hover:bg-emerald-700 w-full md:w-auto px-4 py-2 rounded-xl font-medium transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {showCreateForm && (
          <div className="flex flex-col md:flex-row gap-3 mb-6">
            <Input
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-100 border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl flex-1 text-white dark:text-white light:text-slate-900"
            />
            <Button 
              onClick={handleCreateProject}
              className="bg-emerald-600 hover:bg-emerald-700 px-6 rounded-xl font-medium"
            >
              Create
            </Button>
          </div>
        )}
        
        {currentProject ? (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-teal-400 text-base md:text-lg">{currentProject.name}</h3>
                <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">{currentProject.description}</p>
              </div>
            </div>
            <div className="px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/30 rounded-full text-emerald-400 font-mono text-xs whitespace-nowrap">
              ACTIVE
            </div>
          </div>
        ) : (
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-center py-6 md:py-8">No projects yet. Create your first ROM hack project!</p>
        )}
      </CardContent>
    </Card>
  );
}
