import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function StoryEventModal({ isOpen, onClose, event, onSave, allFlags, allScripts }) {
  const [currentEvent, setCurrentEvent] = useState({
    title: '',
    description: '',
    story_arc: 'main',
    trigger_flags: [],
    completion_flags: [],
  });

  useEffect(() => {
    if (event) {
      setCurrentEvent({
        ...event,
        trigger_flags: event.trigger_flags || [],
        completion_flags: event.completion_flags || [],
      });
    } else {
      setCurrentEvent({
        title: '',
        description: '',
        story_arc: 'main',
        trigger_flags: [],
        completion_flags: [],
      });
    }
  }, [event, isOpen]);

  const handleSave = () => {
    onSave(currentEvent);
    onClose();
  };

  const handleFlagsChange = (field, value) => {
    // Assuming a simple comma-separated string for now
    const flags = value.split(',').map(f => f.trim()).filter(Boolean);
    setCurrentEvent(prev => ({ ...prev, [field]: flags }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-slate-900 dark:bg-slate-900 light:bg-white border-slate-700 dark:border-slate-700 light:border-slate-300 text-white dark:text-white light:text-slate-900">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Story Event' : 'Create New Story Event'}</DialogTitle>
          <DialogDescription>
            Define a key moment in your story, including its triggers and outcomes.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={currentEvent.title}
              onChange={(e) => setCurrentEvent(prev => ({ ...prev, title: e.target.value }))}
              className="bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-slate-600 dark:border-slate-600 light:border-slate-300"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={currentEvent.description}
              onChange={(e) => setCurrentEvent(prev => ({ ...prev, description: e.target.value }))}
              className="bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-slate-600 dark:border-slate-600 light:border-slate-300"
            />
          </div>
           <div className="space-y-2">
            <Label htmlFor="story_arc">Story Arc</Label>
            <Select
              value={currentEvent.story_arc}
              onValueChange={(value) => setCurrentEvent(prev => ({ ...prev, story_arc: value }))}
            >
              <SelectTrigger id="story_arc" className="bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-slate-600 dark:border-slate-600 light:border-slate-300">
                <SelectValue placeholder="Select an arc" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="main">Main Story</SelectItem>
                <SelectItem value="sidequest">Sidequest</SelectItem>
                <SelectItem value="postgame">Postgame</SelectItem>
                <SelectItem value="character">Character Arc</SelectItem>
                <SelectItem value="worldbuilding">Worldbuilding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="trigger_flags">Trigger Flags (comma-separated)</Label>
            <Input
              id="trigger_flags"
              value={(currentEvent.trigger_flags || []).join(', ')}
              onChange={(e) => handleFlagsChange('trigger_flags', e.target.value)}
              className="bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-slate-600 dark:border-slate-600 light:border-slate-300"
              placeholder="e.g., 0x201, FLAG_SAW_RIVAL"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="completion_flags">Completion Flags (comma-separated)</Label>
            <Input
              id="completion_flags"
              value={(currentEvent.completion_flags || []).join(', ')}
              onChange={(e) => handleFlagsChange('completion_flags', e.target.value)}
              className="bg-slate-800 dark:bg-slate-800 light:bg-slate-100 border-slate-600 dark:border-slate-600 light:border-slate-300"
              placeholder="e.g., 0x202, FLAG_BEAT_GYM_1"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700">Save Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}