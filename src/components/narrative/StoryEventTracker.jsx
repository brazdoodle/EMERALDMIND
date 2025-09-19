import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { motion, AnimatePresence } from 'framer-motion';
import { FileText, Plus, Edit, ChevronDown, Flag, Code } from 'lucide-react';
import StoryEventModal from './StoryEventModal';

const EventCard = ({ event, onEdit }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="bg-slate-800/50 dark:bg-slate-800/50 light:bg-slate-100 rounded-xl border border-slate-700/50 dark:border-slate-700/50 light:border-slate-300"
    >
      <div className="p-4 cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-white dark:text-white light:text-slate-900">{event.title}</h3>
            <p className="text-sm text-slate-400 dark:text-slate-400 light:text-slate-600 line-clamp-1">{event.description}</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-cyan-400 dark:text-cyan-400 light:text-cyan-600 border-cyan-400/30 dark:border-cyan-400/30 light:border-cyan-500/30">{event.story_arc}</Badge>
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </motion.div>
          </div>
        </div>
      </div>
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-slate-700/50 dark:border-slate-700/50 light:border-slate-300 pt-4 space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">Trigger Flags</h4>
                <div className="flex flex-wrap gap-1">
                  {event.trigger_flags?.map(f => <Badge key={f} className="bg-yellow-500/10 text-yellow-400 font-mono text-xs">{f}</Badge>) || <p className="text-xs text-slate-500">None</p>}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-slate-300 dark:text-slate-300 light:text-slate-700 mb-1">Completion Flags</h4>
                <div className="flex flex-wrap gap-1">
                  {event.completion_flags?.map(f => <Badge key={f} className="bg-green-500/10 text-green-400 font-mono text-xs">{f}</Badge>) || <p className="text-xs text-slate-500">None</p>}
                </div>
              </div>
              <Button size="sm" variant="ghost" onClick={() => onEdit(event)} className="mt-2 text-blue-400 hover:text-blue-300">
                <Edit className="w-3 h-3 mr-2" />
                Edit Event
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default function StoryEventTracker({ events, flags, scripts, onCreateEvent }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const handleEdit = (event) => {
    setSelectedEvent(event);
    setModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedEvent(null);
    setModalOpen(true);
  };
  
  const handleSave = (eventData) => {
    if (!selectedEvent) {
      onCreateEvent(eventData);
    } else {
      // Update logic would go here
      console.log('Updating event:', eventData);
    }
    setModalOpen(false);
  };

  return (
    <Card className="bg-slate-900/80 dark:bg-slate-900/80 light:bg-white/90 backdrop-blur-sm border border-slate-800 dark:border-slate-800 light:border-slate-300 rounded-2xl shadow-xl">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl font-semibold tracking-tight text-white dark:text-white light:text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-purple-400" />
          Story Event Tracker
        </CardTitle>
        <Button onClick={handleCreate} className="bg-purple-600 hover:bg-purple-700 text-white rounded-lg">
          <Plus className="w-4 h-4 mr-2" />
          New Event
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2">
          <AnimatePresence>
            {events.map(event => (
              <EventCard key={event.id} event={event} onEdit={handleEdit} />
            ))}
          </AnimatePresence>
          {events.length === 0 && (
            <div className="text-center py-10 text-slate-500">
              <FileText className="mx-auto w-12 h-12 mb-2" />
              <p>No story events created yet.</p>
            </div>
          )}
        </div>
      </CardContent>
      <StoryEventModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        event={selectedEvent}
        onSave={handleSave}
        allFlags={flags}
        allScripts={scripts}
      />
    </Card>
  );
}