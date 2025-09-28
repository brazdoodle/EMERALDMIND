import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AddCommandModal({ open, onClose, commands = [], onAdd, prefillDetails = null }) {
  const initial = (prefillDetails && prefillDetails.length) ? prefillDetails.map(p => ({
    name: p.name || p.command || '',
    syntax: p.syntax || p.name || p.command || '',
    description: p.description || '',
    category: p.category || 'Custom',
    notes: p.notes || ''
  })) : commands.map(cmd => ({
    name: cmd,
    syntax: `${cmd}`,
    description: '',
    category: 'Custom',
    notes: ''
  }));

  const [newCommands, setNewCommands] = useState(initial);

  React.useEffect(() => {
    const init = (prefillDetails && prefillDetails.length) ? prefillDetails.map(p => ({
      name: p.name || p.command || '',
      syntax: p.syntax || p.name || p.command || '',
      description: p.description || '',
      category: p.category || 'Custom',
      notes: p.notes || ''
    })) : commands.map(cmd => ({
      name: cmd,
      syntax: `${cmd}`,
      description: '',
      category: 'Custom',
      notes: ''
    }));
    setNewCommands(init);
  }, [open, commands, prefillDetails]);

  const handleAdd = () => {
    onAdd(newCommands);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Commands</DialogTitle>
          <DialogDescription>
            Document new HMA script commands to add to the command database.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {newCommands.map((cmd, index) => (
            <div key={index} className="space-y-4 border border-slate-200 dark:border-slate-800 rounded-lg p-4">
              <div>
                <Label htmlFor={`command-${index}`}>Command Name</Label>
                <Input
                  id={`command-${index}`}
                  value={cmd.name}
                  onChange={(e) => {
                    const updated = [...newCommands];
                    updated[index] = { ...cmd, name: e.target.value };
                    setNewCommands(updated);
                  }}
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor={`syntax-${index}`}>Syntax</Label>
                <Input
                  id={`syntax-${index}`}
                  value={cmd.syntax}
                  onChange={(e) => {
                    const updated = [...newCommands];
                    updated[index] = { ...cmd, syntax: e.target.value };
                    setNewCommands(updated);
                  }}
                  className="font-mono"
                  placeholder="command [param1] <param2>"
                />
              </div>

              <div>
                <Label htmlFor={`description-${index}`}>Description</Label>
                <Textarea
                  id={`description-${index}`}
                  value={cmd.description}
                  onChange={(e) => {
                    const updated = [...newCommands];
                    updated[index] = { ...cmd, description: e.target.value };
                    setNewCommands(updated);
                  }}
                  placeholder="What does this command do?"
                />
              </div>

              <div>
                <Label htmlFor={`category-${index}`}>Category</Label>
                <Input
                  id={`category-${index}`}
                  value={cmd.category}
                  onChange={(e) => {
                    const updated = [...newCommands];
                    updated[index] = { ...cmd, category: e.target.value };
                    setNewCommands(updated);
                  }}
                  placeholder="Core, Items, Pokemon, etc."
                />
              </div>

              <div>
                <Label htmlFor={`notes-${index}`}>Notes & Examples</Label>
                <Textarea
                  id={`notes-${index}`}
                  value={cmd.notes}
                  onChange={(e) => {
                    const updated = [...newCommands];
                    updated[index] = { ...cmd, notes: e.target.value };
                    setNewCommands(updated);
                  }}
                  placeholder="Add any notes or example usage"
                />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleAdd} className="bg-emerald-600 hover:bg-emerald-700">
            Add Commands
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}