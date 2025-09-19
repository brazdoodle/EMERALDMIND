import React, { useState, useEffect, useCallback } from 'react';
import { KnowledgeEntry } from '@/api/entities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookCopy, Search, Loader2, Edit, Save, X, Plus, Eye, Trash2, FlaskConical, BrainCircuit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLabAssistant } from '@/components/shared/LabAssistantService';
import { ChangelogEntry } from '@/api/entities';
import EntityErrorHandler from '@/components/shared/EntityErrorHandler';

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
    } catch (error) {
      console.error('Failed to save entry:', error);
      alert('Failed to save entry. Please try again.');
    }
  };

  const handleDelete = async () => {
    if (!entry?.id) return;
    
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
      } catch (error) {
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
            {isNew ? <Plus className="w-6 h-6" /> : <Edit className="w-6 h-6" />}
            {isNew ? 'Add Knowledge Entry' : 'Edit Knowledge Entry'}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Category</label>
            <Select
              value={editedEntry.category}
              onValueChange={(value) => setEditedEntry(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                {categories.map(cat => ( // Uses the updated 'categories' array
                  <SelectItem key={cat} value={cat} className="text-slate-900 dark:text-white hover:bg-slate-200 dark:hover:bg-slate-700">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Topic */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Topic</label>
            <Input
              value={editedEntry.topic}
              onChange={(e) => setEditedEntry(prev => ({ ...prev, topic: e.target.value }))}
              placeholder="e.g., HMA Script Fundamentals"
              className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400"
            />
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Content</label>
            <Textarea
              value={editedEntry.content}
              onChange={(e) => setEditedEntry(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Detailed explanation, examples, code snippets..."
              className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 h-40 resize-none"
            />
          </div>

          {/* Keywords */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Keywords</label>
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
            <div className="flex flex-wrap gap-2">
              {editedEntry.keywords.map((keyword, i) => (
                <Badge
                  key={i}
                  className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-600"
                  onClick={() => removeKeyword(keyword)}
                >
                  {keyword}
                  <X className="w-3 h-3" />
                </Badge>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <div>
              {!isNew && (
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
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Entry
              </Button>
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

  // Get the lab assistant context to refresh knowledge when entries change
  const { refreshKnowledge, showAssistant } = useLabAssistant();

  const applyFilters = useCallback((entriesList, search) => {
    let filtered = entriesList;

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
      applyFilters(allEntries, searchTerm); // Apply filter based on existing search term
    } catch (error) {
      console.error("Failed to load knowledge entries:", error);
      setLoadError(error); // Set error state
    }
    setIsLoading(false);
  }, [applyFilters, searchTerm]);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  useEffect(() => {
    applyFilters(entries, searchTerm);
  }, [searchTerm, entries, applyFilters]);

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
              <Button onClick={handleAddEntry} className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-semibold px-4 py-2 rounded-lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Entry
              </Button>
            </div>
          </motion.div>
        </header>

        <Card className="mb-6 bg-white/90 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800">
          <CardContent className="p-4">
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
                  <CardTitle className="text-slate-900 dark:text-white text-lg">{entry.topic}</CardTitle>
                  <Badge variant="outline" className={`${categoryColors[entry.category] || 'bg-slate-600/20 text-slate-400 border-slate-600/30'} text-xs font-medium px-2 py-0.5 mt-1 w-fit`}>
                    {entry.category}
                  </Badge>
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
      </div>
    </div>
  );
}