import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { BookOpen, AlertCircle } from "lucide-react";

const categories = [
  "System", "Badges", "Story", "Temporary", "Hidden Items",
  "Trainer", "Item", "Pokemon", "Location", "Battle", "Custom"
];

export default function FlagEditModal({ flag, isOpen, onClose, onSave }) {
  const [editedFlag, setEditedFlag] = useState(null);
  const isNew = !flag?.id;

  useEffect(() => {
    // Initialize form state when the modal opens
    if (isOpen) {
      setEditedFlag(flag || {
        flag_id: '', name: '', description: '', category: 'Custom',
        notes: '', is_vanilla: false
      });
    }
  }, [flag, isOpen]);

  const handleSave = () => {
    if (editedFlag.flag_id && editedFlag.name) {
      onSave(editedFlag, isNew);
      onClose();
    }
    // Simple validation feedback could be added here
  };

  const handleChange = (field, value) => {
    setEditedFlag(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen || !editedFlag) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] bg-slate-900 border-slate-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-light text-green-400">
            {isNew ? 'Create New Flag' : 'Edit Flag'}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="flag_id" className="text-right text-slate-300">Hex ID</Label>
            <Input id="flag_id" value={editedFlag.flag_id} onChange={(e) => handleChange('flag_id', e.target.value)} className="col-span-3 font-mono bg-slate-800 border-slate-600" placeholder="e.g., 0x250" disabled={!isNew} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right text-slate-300">Name</Label>
            <Input id="name" value={editedFlag.name} onChange={(e) => handleChange('name', e.target.value)} className="col-span-3 bg-slate-800 border-slate-600" placeholder="e.g., FLAG_GOT_BICYCLE" />
          </div>
          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="description" className="text-right pt-2 text-slate-300">Description</Label>
            <Textarea id="description" value={editedFlag.description} onChange={(e) => handleChange('description', e.target.value)} className="col-span-3 bg-slate-800 border-slate-600" placeholder="What this flag is used for." />
          </div>
          
          {editedFlag.is_vanilla && (
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2 text-slate-300 flex items-center gap-1"><BookOpen className="w-4 h-4 text-cyan-400"/>Original</Label>
              <div className="col-span-3 bg-slate-950/50 border border-slate-700 rounded-md p-3 text-sm text-slate-400">
                {editedFlag.original_description}
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right text-slate-300">Category</Label>
            <Select value={editedFlag.category} onValueChange={(value) => handleChange('category', value)}>
              <SelectTrigger className="col-span-3 bg-slate-800 border-slate-600"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-slate-800 border-slate-600 text-white">
                {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-4 items-start gap-4">
            <Label htmlFor="notes" className="text-right pt-2 text-slate-300">User Notes</Label>
            <Textarea id="notes" value={editedFlag.notes || ''} onChange={(e) => handleChange('notes', e.target.value)} className="col-span-3 bg-slate-800 border-slate-600" placeholder="Add personal notes here, e.g., scripts where it's used." />
          </div>
          
          {editedFlag.is_vanilla && (
            <div className="col-span-4 mt-2 bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
              <div>
                <h4 className="font-bold text-yellow-400">Warning</h4>
                <p className="text-yellow-300/90 text-sm">This is a default game flag. Modifying its purpose can have unintended consequences in vanilla scripts. Notes are recommended for tracking changes.</p>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-slate-600 text-slate-300">Cancel</Button>
          <Button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white">Save Flag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}