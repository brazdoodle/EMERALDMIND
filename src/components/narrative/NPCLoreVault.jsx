import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Crown, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function NPCLoreVault({ 
  npcs, 
  events, 
  onCreateNPC, 
  romancerMode 
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newNPC, setNewNPC] = useState({
    name: '',
    role: 'townsperson',
    personality_traits: [],
    backstory: '',
    dialogue_style: 'casual'
  });

  const handleCreateNPC = () => {
    if (newNPC.name.trim()) {
      onCreateNPC(newNPC);
      setNewNPC({
        name: '',
        role: 'townsperson',
        personality_traits: [],
        backstory: '',
        dialogue_style: 'casual'
      });
      setShowCreateForm(false);
    }
  };

  const roleIcons = {
    gym_leader: Crown,
    elite_four: Crown,
    champion: Crown,
    rival: Users,
    professor: Briefcase,
    team_leader: Crown,
    townsperson: Users,
    merchant: Briefcase,
    story_npc: Users,
    other: Users
  };

  const roleColors = {
    gym_leader: 'yellow',
    elite_four: 'red',
    champion: 'purple',
    rival: 'orange',
    professor: 'green',
    team_leader: 'red',
    townsperson: 'blue',
    merchant: 'cyan',
    story_npc: 'pink',
    other: 'gray'
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-cyan-400">NPC Profiles</h2>
        <Button 
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-cyan-600 hover:bg-cyan-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add NPC
        </Button>
      </div>

      {showCreateForm && (
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle>Create New NPC</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                placeholder="NPC name..."
                value={newNPC.name}
                onChange={(e) => setNewNPC({...newNPC, name: e.target.value})}
                className="bg-slate-800 border-slate-600"
              />
              <select
                value={newNPC.role}
                onChange={(e) => setNewNPC({...newNPC, role: e.target.value})}
                className="bg-slate-800 border-slate-600 rounded-md px-3 py-2 text-slate-300"
              >
                <option value="townsperson">Townsperson</option>
                <option value="gym_leader">Gym Leader</option>
                <option value="elite_four">Elite Four</option>
                <option value="champion">Champion</option>
                <option value="rival">Rival</option>
                <option value="professor">Professor</option>
                <option value="team_leader">Team Leader</option>
                <option value="merchant">Merchant</option>
                <option value="story_npc">Story NPC</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Textarea
              placeholder="Character backstory..."
              value={newNPC.backstory}
              onChange={(e) => setNewNPC({...newNPC, backstory: e.target.value})}
              className="bg-slate-800 border-slate-600 h-24"
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateNPC} className="bg-cyan-600 hover:bg-cyan-700">
                Create NPC
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <AnimatePresence>
          {npcs.map((npc, index) => {
            const RoleIcon = roleIcons[npc.role] || Users;
            const roleColor = roleColors[npc.role] || 'gray';
            
            return (
              <motion.div
                key={npc.id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className="bg-slate-900 border-slate-700">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-cyan-400">{npc.name}</CardTitle>
                        <Badge className={`bg-${roleColor}-400/20 text-${roleColor}-400 mt-2`}>
                          {npc.role.replace('_', ' ')}
                        </Badge>
                      </div>
                      <RoleIcon className="w-5 h-5 text-slate-400" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-300">{npc.backstory}</p>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {npcs.length === 0 && (
          <Card className="bg-slate-900 border-slate-700 border-dashed">
            <CardContent className="p-12 text-center">
              <Users className="w-12 h-12 mx-auto text-slate-400 mb-4" />
              <p className="text-slate-400 mb-2">No NPCs created yet</p>
              <p className="text-slate-500 text-sm">Start building your cast of characters</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}