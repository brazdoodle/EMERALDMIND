
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, FolderOpen, Save, Download, Upload, Trash2, Eye, RefreshCw } from 'lucide-react';
import { exportProject, importProject, deleteProject, getProjectSummary } from '@/utils/projectFileSystem';
import { useUser } from '@/contexts/UserContext';

export default function ProjectSelector({ 
  projects, 
  currentProject, 
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onRefreshProjects
}) {
  const { currentUser } = useUser();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProjectManager, setShowProjectManager] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [projectSummary, setProjectSummary] = useState(null);

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

  const handleExportProject = () => {
    if (currentProject && currentUser) {
      exportProject(currentUser.id, currentProject.id);
    }
  };

  const handleImportProject = (event) => {
    const file = event.target.files[0];
    if (file) {
      importProject(file, currentUser?.id)
        .then((projectData) => {
          console.log('Project imported successfully:', projectData);
          if (onRefreshProjects) onRefreshProjects();
        })
        .catch((error) => {
          console.error('Failed to import project:', error);
          alert('Failed to import project: ' + error.message);
        });
    }
  };

  const handleDeleteProject = (projectId) => {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.') && currentUser) {
      deleteProject(currentUser.id, projectId);
      if (onDeleteProject) onDeleteProject(projectId);
      if (onRefreshProjects) onRefreshProjects();
    }
  };

  const handleViewSummary = (projectId) => {
    if (currentUser) {
      const summary = getProjectSummary(currentUser.id, projectId);
      setProjectSummary(summary);
    }
  };

  return (
    <Card className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-sm border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl mb-6 md:mb-8 shadow-xl">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0 p-4 md:p-6">
        <CardTitle className="text-emerald-400 text-lg md:text-xl">Project Management</CardTitle>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl font-medium transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            New
          </Button>
          <Dialog open={showProjectManager} onOpenChange={setShowProjectManager}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-slate-700 text-slate-300 hover:bg-slate-800 px-4 py-2 rounded-xl">
                <Eye className="w-4 h-4 mr-2" />
                Manage
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-emerald-400">Project Manager</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <Select value={selectedProjectId} onValueChange={setSelectedProjectId}>
                    <SelectTrigger className="bg-slate-800 border-slate-700">
                      <SelectValue placeholder="Select project..." />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {projects.map(project => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      onClick={() => selectedProjectId && onSelectProject(projects.find(p => p.id === selectedProjectId))}
                      disabled={!selectedProjectId}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Load
                    </Button>
                    <Button 
                      onClick={() => selectedProjectId && handleViewSummary(selectedProjectId)}
                      disabled={!selectedProjectId}
                      variant="outline"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button 
                      onClick={() => selectedProjectId && handleDeleteProject(selectedProjectId)}
                      disabled={!selectedProjectId}
                      variant="destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {projectSummary && (
                    <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-sm">Project Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4 lg:gap-6 text-sm">
                        {Object.entries(projectSummary).map(([type, data]) => (
                          <div key={type} className="flex justify-between">
                            <span className="capitalize">{type}:</span>
                            <Badge variant="outline">{data.count}</Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                <div className="flex gap-2 pt-4 border-t border-slate-700 lg:gap-4 lg:pt-6">
                  <Button onClick={handleExportProject} disabled={!currentProject} className="flex-1">
                    <Download className="w-4 h-4 mr-2" />
                    Export Current
                  </Button>
                  <div className="flex-1">
                    <Input
                      type="file"
                      accept=".json"
                      onChange={handleImportProject}
                      className="hidden"
                      id="import-project"
                    />
                    <Button asChild className="w-full">
                      <label htmlFor="import-project" className="cursor-pointer flex items-center justify-center">
                        <Upload className="w-4 h-4 mr-2" />
                        Import
                      </label>
                    </Button>
                  </div>
                  <Button onClick={onRefreshProjects} variant="outline">
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0">
        {showCreateForm && (
          <div className="flex flex-col md:flex-row gap-3 mb-6 p-4 bg-slate-800/50 rounded-xl">
            <Input
              placeholder="Project name..."
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-100 border-slate-700 dark:border-slate-700 light:border-slate-300 rounded-xl flex-1 text-white dark:text-white light:text-slate-900"
              onKeyPress={(e) => e.key === 'Enter' && handleCreateProject()}
            />
            <div className="flex gap-2">
              <Button 
                onClick={handleCreateProject}
                className="bg-emerald-600 hover:bg-emerald-700 px-6 rounded-xl font-medium"
              >
                Create
              </Button>
              <Button 
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800 px-4 rounded-xl"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
        
        {currentProject ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-800/30 rounded-xl">
              <div className="flex items-center gap-3">
                <FolderOpen className="w-5 h-5 text-teal-400 flex-shrink-0" />
                <div>
                  <h3 className="font-bold text-teal-400 text-base md:text-lg">{currentProject.name}</h3>
                  <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">{currentProject.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-3 py-1.5 bg-emerald-400/10 border border-emerald-400/30 rounded-full text-emerald-400 font-mono text-xs whitespace-nowrap">
                  ACTIVE
                </div>
                <Button
                  onClick={handleExportProject}
                  variant="outline"
                  size="sm"
                  className="border-slate-700 text-slate-300 hover:bg-slate-800"
                >
                  <Save className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="text-xs text-slate-500 bg-slate-800/20 p-3 rounded-lg">
              <p><strong>Note:</strong> All scripts, trainers, sprites, and other generated content will be saved to this project.</p>
              <p>Use the project manager to switch between projects or export your work.</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mb-4">No projects yet. Create your first ROM hack project!</p>
            {projects.length > 0 && (
              <Button
                onClick={() => setShowProjectManager(true)}
                variant="outline"
                className="border-slate-700 text-slate-300 hover:bg-slate-800"
              >
                <Eye className="w-4 h-4 mr-2" />
                Browse Existing Projects
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
