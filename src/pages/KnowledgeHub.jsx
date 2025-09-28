import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { KnowledgeEntry } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookCopy, Search, Loader2, Edit, Save, X, Plus, Eye, Trash2, FlaskConical, BrainCircuit, Upload, Download, Globe, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageShell } from '@/components/shared/PageShell';
import { useLabAssistant } from '@/components/shared/LabAssistantService';
import { ChangelogEntry } from '@/api/entities';
import EntityErrorHandler from '@/components/shared/EntityErrorHandler';
import BulkUploadModal from '@/components/knowledge/BulkUploadModal';

// Define the new canonical list of categories
const knowledgeCategories = ["Scripting", "Graphics", "Music", "Tools", "Advanced", "Documentation"];

// Update categoryColors to reflect the new canonical categories
const categoryColors = {
  Scripting: 'bg-yellow-400/20 text-yellow-300 border-yellow-400/30',
  Graphics: 'bg-purple-400/20 text-purple-300 border-purple-400/30',
  Music: 'bg-pink-400/20 text-pink-300 border-pink-400/30',
  Tools: 'bg-red-400/20 text-red-300 border-red-400/30',
  Advanced: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  Documentation: 'bg-cyan-400/20 text-cyan-300 border-cyan-400/30',
};

// This array will be used by the modal for category selection, and by the main view for badges.
// It's derived from the updated categoryColors for consistency.
const categories = Object.keys(categoryColors);


function KnowledgeEntryModal({ entry, isOpen, onClose, onSave, onDelete, isNew = false }) {
  const [editedEntry, setEditedEntry] = useState(
    entry || {
      category: categories[0] || 'Scripting', // Use first available category or default
      topic: '',
      content: '',
      keywords: []
    }
  );
  const [keywordInput, setKeywordInput] = useState('');

  useEffect(() => {
    if (isOpen) { // Only update editedEntry when the modal opens
        setEditedEntry(entry || {
          category: categories[0] || 'Scripting', // Use first available category or default
          topic: '',
          content: '',
          keywords: []
        });
        setKeywordInput(''); // Clear keyword input when modal opens
    }
  }, [entry, isOpen]);

  const isReadOnly = !isNew && entry?.isBaseline;

  const addKeyword = () => {
    const newKeyword = keywordInput.trim();
    if (newKeyword && !editedEntry.keywords.includes(newKeyword)) {
      setEditedEntry(prev => ({ ...prev, keywords: [...prev.keywords, newKeyword] }));
      setKeywordInput('');
    }
  };

  const removeKeyword = (keywordToRemove) => {
    setEditedEntry(prev => ({
      ...prev,
      keywords: prev.keywords.filter(kw => kw !== keywordToRemove)
    }));
  };

  const handleSave = async () => {
    if (!editedEntry.topic.trim() || !editedEntry.content.trim()) {
      alert('Topic and content are required.');
      return;
    }

    // Prevent editing of baseline entries
    if (!isNew && entry?.isBaseline) {
      alert('Baseline entries cannot be edited as they provide system-wide knowledge.');
      return;
    }

    try {
      if (isNew) {
        const newEntry = await KnowledgeEntry.create({
          project_id: 'default_project',
          category: editedEntry.category,
          topic: editedEntry.topic.trim(),
          content: editedEntry.content.trim(),
          keywords: editedEntry.keywords
        });
        await ChangelogEntry.create({
          project_id: 'default_project',
          module: 'Knowledge Hub',
          action: 'created',
          item_name: newEntry.topic,
          description: `Added new knowledge: '${newEntry.topic}'`,
          data_after: newEntry,
        });
      } else {
        const originalEntry = { ...entry }; // Capture state before update for data_before
        const updatedEntry = await KnowledgeEntry.update(entry.id, {
          category: editedEntry.category,
          topic: editedEntry.topic.trim(),
          content: editedEntry.content.trim(),
          keywords: editedEntry.keywords
        });
        await ChangelogEntry.create({
          project_id: 'default_project',
          module: 'Knowledge Hub',
          action: 'updated',
          item_name: updatedEntry.topic,
          description: `Updated knowledge entry: '${updatedEntry.topic}'`,
          data_before: originalEntry,
          data_after: updatedEntry,
        });
      }
      onSave();
      onClose();
    } catch (_error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!entry?.id) return;
    
    // Prevent deletion of baseline entries (but allow personal entries even if they have isBaseline flag)
    if (entry.isBaseline && entry.designation === 'baseline') {
      alert('Baseline entries cannot be deleted. You can hide them from your view instead.');
      return;
    }
    
    if (confirm('Are you sure you want to delete this knowledge entry? This action cannot be undone.')) {
      try {
        const deletedEntryData = { ...entry }; // Capture state before deletion for data_before
        await KnowledgeEntry.delete(entry.id);
        await ChangelogEntry.create({
          project_id: 'default_project',
          module: 'Knowledge Hub',
          action: 'deleted',
          item_name: deletedEntryData.topic,
          description: `Deleted knowledge entry: '${deletedEntryData.topic}'`,
          data_before: deletedEntryData,
        });
        onDelete();
        onClose();
      } catch (_error) {
        console.error('Failed to delete entry:', error);
        alert('Failed to delete entry. Please try again.');
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-teal-500 dark:text-teal-400 flex items-center gap-2">
            {isNew ? <Plus className="w-6 h-6" /> : isReadOnly ? <Eye className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
            {isNew ? 'Add Knowledge Entry' : isReadOnly ? 'View Baseline Entry' : 'Edit Knowledge Entry'}
          </DialogTitle>
          {isReadOnly && (
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">
              Baseline entries are read-only system knowledge that persist across all users and projects.
            </p>
          )}
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Category</label>
            <Select
              value={editedEntry.category}
              onValueChange={(value) => !isReadOnly && setEditedEntry(prev => ({ ...prev, category: value }))}
              disabled={isReadOnly}
            >
              <SelectTrigger className={`${isReadOnly ? 'bg-slate-50 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800/50'} border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white`}>
                <SelectValue />
              </SelectTrigger>
              {!isReadOnly && (
                <SelectContent className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  {categories.map(cat => ( // Uses the updated 'categories' array
                    <SelectItem key={cat} value={cat} className="text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700">
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              )}
            </Select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Topic</label>
            <Input
              value={editedEntry.topic}
              onChange={(e) => !isReadOnly && setEditedEntry(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g., HMA Script Fundamentals"
              className={`${isReadOnly ? 'bg-slate-50 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800/50'} border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400`}
              readOnly={isReadOnly}
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Content</label>
            <Textarea
              value={editedEntry.content}
              onChange={(e) => !isReadOnly && setEditedEntry(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Detailed explanation, examples, code snippets..."
              className={`${isReadOnly ? 'bg-slate-50 dark:bg-slate-800' : 'bg-slate-100 dark:bg-slate-800/50'} border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 h-40 resize-none`}
              readOnly={isReadOnly}
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Keywords</label>
            {!isReadOnly && (
              <div className="flex gap-2 mb-3">
                <Input
                  value={keywordInput}
                  onChange={(e) => setKeywordInput(e.target.value)}
                  placeholder="Add keyword..."
                  className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addKeyword();
                    }
                  }}
                />
                <Button onClick={addKeyword} variant="outline" className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {editedEntry.keywords.map((keyword, i) => (
                <Badge
                  key={i}
                  className={`${isReadOnly ? 'bg-slate-100 dark:bg-slate-800' : 'bg-slate-200 dark:bg-slate-700'} text-slate-700 dark:text-slate-300 flex items-center gap-1 ${!isReadOnly ? 'cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600' : ''}`}
                  onClick={() => !isReadOnly && removeKeyword(keyword)}
                >
                  {keyword}
                  {!isReadOnly && <X className="w-3 h-3" />}
                </Badge>
              ))}
            </div>
          </div>

          {/* Entry Type Information */}
          {!isNew && (
            <div className={`flex items-center space-x-3 p-4 rounded-lg border ${
              entry?.isBaseline 
                ? 'bg-emerald-50/50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'
                : 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
            }`}>
              <div className="flex items-center gap-2">
                {entry?.isBaseline ? (
                  <Globe className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                )}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  entry?.isBaseline 
                    ? 'text-emerald-700 dark:text-emerald-400'
                    : 'text-blue-700 dark:text-blue-400'
                }`}>
                  {entry?.isBaseline ? 'Baseline Entry' : 'Personal Entry'}
                </p>
                <p className={`text-xs mt-1 ${
                  entry?.isBaseline 
                    ? 'text-emerald-600 dark:text-emerald-300'
                    : 'text-blue-600 dark:text-blue-300'
                }`}>
                  {entry?.isBaseline 
                    ? 'System-wide knowledge available to all users - cannot be edited or deleted'
                    : 'Personal knowledge entry - can be edited and deleted by you'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div>
              {!isNew && !isReadOnly && (
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="border-red-500 text-red-500 dark:text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Entry
                </Button>
              )}
            </div>
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
              >
                {isReadOnly ? 'Close' : 'Cancel'}
              </Button>
              {!isReadOnly && (
                <Button
                  onClick={handleSave}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isNew ? 'Create Entry' : 'Save Changes'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function KnowledgeHub() {
  const [entries, setEntries] = useState([]);
  const [filteredEntries, setFilteredEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null); // New state for error handling
  const [searchTerm, setSearchTerm] = useState('');
  const [currentEntry, setCurrentEntry] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isNewEntry, setIsNewEntry] = useState(false);
  const [isBulkUploadOpen, setIsBulkUploadOpen] = useState(false);
  const [entryTypeFilter, setEntryTypeFilter] = useState('all'); // 'all', 'baseline', 'personal'

  // Get the lab assistant context to refresh knowledge when entries change
  const { refreshKnowledge, showAssistant } = useLabAssistant();

  const applyFilters = useCallback((entriesList, search, typeFilter) => {
    let filtered = entriesList;

    // Apply entry type filter
    if (typeFilter === 'baseline') {
      filtered = filtered.filter(entry => entry.isBaseline === true);
    } else if (typeFilter === 'personal') {
      filtered = filtered.filter(entry => entry.isBaseline !== true);
    }

    // Apply search filter
    if (search) {
      const lowercasedTerm = search.toLowerCase();
      filtered = filtered.filter(entry =>
        entry.topic.toLowerCase().includes(lowercasedTerm) ||
        entry.content.toLowerCase().includes(lowercasedTerm) ||
        entry.category.toLowerCase().includes(lowercasedTerm) ||
        entry.keywords.some(kw => kw.toLowerCase().includes(lowercasedTerm))
      );
    }

    setFilteredEntries(filtered);
  }, []);

  const loadEntries = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null); // Clear previous errors
    try {
      const allEntries = await KnowledgeEntry.list('-created_date');
      setEntries(allEntries);
      applyFilters(allEntries, searchTerm, entryTypeFilter); // Apply filter based on existing search term and type filter
    } catch (_error) {
      console.error("Failed to load knowledge entries:", error);
      setLoadError(error); // Set error state
    }
    setIsLoading(false);
  }, [applyFilters, searchTerm, entryTypeFilter]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    applyFilters(entries, searchTerm, entryTypeFilter);
  }, [searchTerm, entries, applyFilters, entryTypeFilter]);

  const handleSelectEntry = (entry) => {
    setCurrentEntry(entry);
    setIsNewEntry(false);
    setIsModalOpen(true);
  };

  const handleAddEntry = () => {
    setCurrentEntry(null);
    setIsNewEntry(true);
    setIsModalOpen(true);
  };

  const handleEntrySaved = () => {
    loadEntries(); // Reload entries
    // Refresh knowledge in the lab assistant context
    if (refreshKnowledge) {
      refreshKnowledge();
    }
  };

  const handleEntryDeleted = () => {
    loadEntries(); // Reload entries
    // Refresh knowledge in the lab assistant context
    if (refreshKnowledge) {
      refreshKnowledge();
    }
  };

  const retryLoad = () => {
    loadEntries();
  };

  const handleBulkImport = async (processedData) => {
    try {
      const bulkEntries = processedData.map(item => ({
        project_id: 'default_project',
        category: item.category,
        topic: item.topic,
        content: item.content,
        keywords: item.keywords,
        isGlobal: item.isGlobal || false
      }));

      const createdEntries = await KnowledgeEntry.bulkCreate(bulkEntries);

      // Log bulk import in changelog
      await ChangelogEntry.create({
        project_id: 'default_project',
        module: 'Knowledge Hub',
        action: 'bulk_imported',
        item_name: `${createdEntries.length} entries`,
        description: `Bulk imported ${createdEntries.length} knowledge entries`,
        data_after: { count: createdEntries.length, entries: createdEntries.map(e => e.topic) },
      });

      loadEntries();
      
      // Refresh knowledge in the lab assistant context
      if (refreshKnowledge) {
        refreshKnowledge();
      }
    } catch (_error) {
      console.error('Bulk import failed:', _error);
      throw _error;
    }
  };

  const handleExportEntries = () => {
    const exportData = {
      exported_at: new Date().toISOString(),
      total_entries: entries.length,
      entries: entries.map(entry => ({
        category: entry.category,
        topic: entry.topic,
        content: entry.content,
        keywords: entry.keywords,
        isBaseline: entry.isBaseline || false,
        created_date: entry.created_date
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `knowledge-base-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleHideBaselineEntry = async (entryId) => {
    try {
      await KnowledgeEntry.hideBaseline(entryId);
      loadEntries(); // Reload to update the view
    } catch (_error) {
      console.error('Failed to hide baseline entry:', error);
    }
  };
  
  return (
    <div className="p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        <header className="mb-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                  <BrainCircuit className="w-7 h-7 text-cyan-400" />
                  Knowledge Hub
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  Your personal encyclopedia for ROM hacking knowledge.
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  onClick={() => setIsBulkUploadOpen(true)} 
                  variant="outline" 
                  className="border-cyan-400 text-cyan-600 hover:bg-cyan-50 dark:border-cyan-500 dark:text-cyan-400 dark:hover:bg-cyan-900/20"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Bulk Upload
                </Button>
                <Button 
                  onClick={handleExportEntries}
                  variant="outline" 
                  className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button onClick={handleAddEntry} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Entry
                </Button>
              </div>
            </div>
          </motion.div>
        </header>

        <Card className="mb-6 bg-white/90 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800">
          <CardContent className="p-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <Input
                type="text"
                placeholder="Search knowledge base... (e.g., 'how to script a gym battle')"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 rounded-xl h-12 pl-10 w-full text-lg text-slate-900 dark:text-white placeholder:text-slate-500"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={entryTypeFilter === 'all' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntryTypeFilter('all')}
                  className={entryTypeFilter === 'all' 
                    ? "bg-slate-500 hover:bg-slate-600 text-white" 
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  }
                >
                  All
                </Button>
                <Button
                  variant={entryTypeFilter === 'baseline' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntryTypeFilter('baseline')}
                  className={entryTypeFilter === 'baseline' 
                    ? "bg-emerald-500 hover:bg-emerald-600 text-white" 
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  }
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Baseline
                </Button>
                <Button
                  variant={entryTypeFilter === 'personal' ? "default" : "outline"}
                  size="sm"
                  onClick={() => setEntryTypeFilter('personal')}
                  className={entryTypeFilter === 'personal' 
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
                  }
                >
                  <User className="w-4 h-4 mr-2" />
                  Personal
                </Button>
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {filteredEntries.length} of {entries.length} entries
                ({entries.filter(e => e.isBaseline).length} baseline, {entries.filter(e => !e.isBaseline).length} personal)
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 dark:text-slate-400">Loading knowledge entries...</p>
          </div>
        ) : loadError ? (
          <EntityErrorHandler error={loadError} entityName="Knowledge" onRetry={retryLoad} />
        ) : (
          <div className="space-y-4">
            {filteredEntries.map(entry => (
              <Card 
                key={entry.id} 
                className="bg-white/90 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 cursor-pointer hover:border-cyan-400/50 transition-all duration-200"
                onClick={() => handleSelectEntry(entry)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-slate-900 dark:text-white text-lg flex items-center gap-2">
                        {entry.topic}
                        {entry.isBaseline ? (
                          <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 text-xs">
                            <Globe className="w-3 h-3 mr-1" />
                            Baseline
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">
                            <User className="w-3 h-3 mr-1" />
                            Personal
                          </Badge>
                        )}
                      </CardTitle>
                      <Badge variant="outline" className={`${categoryColors[entry.category] || 'bg-slate-600/20 text-slate-400 border-slate-600/30'} text-xs font-medium px-2 py-0.5 mt-2 w-fit`}>
                        {entry.category}
                      </Badge>
                    </div>
                    {entry.isBaseline && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleHideBaselineEntry(entry.id);
                        }}
                        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 ml-2"
                        title="Hide this baseline entry"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-2">{entry.content}</p>
                </CardContent>
              </Card>
            ))}
            {filteredEntries.length === 0 && (
              <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                <p>No entries found for your search.</p>
              </div>
            )}
          </div>
        )}

        {/* Modal for viewing/editing entries */}
        <KnowledgeEntryModal
          entry={currentEntry}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleEntrySaved}
          onDelete={handleEntryDeleted}
          isNew={isNewEntry}
        />

        {/* Bulk Upload Modal */}
        <BulkUploadModal
          isOpen={isBulkUploadOpen}
          onClose={() => setIsBulkUploadOpen(false)}
          onBulkImport={handleBulkImport}
        />
      </div>
    </div>
  );
}