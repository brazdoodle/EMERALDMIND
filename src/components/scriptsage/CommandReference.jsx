import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';

const hmaCommands = [
  {
    command: 'lock',
    category: 'Control',
    description: 'Prevents the player from moving during script execution',
    syntax: 'lock',
    example: 'lock'
  },
  {
    command: 'release',
    category: 'Control', 
    description: 'Allows the player to move again after script completion',
    syntax: 'release',
    example: 'release'
  },
  {
    command: 'end',
    category: 'Control',
    description: 'Terminates script execution',
    syntax: 'end',
    example: 'end'
  },
  {
    command: 'faceplayer',
    category: 'Movement',
    description: 'Makes the NPC face toward the player',
    syntax: 'faceplayer',
    example: 'faceplayer'
  },
  {
    command: 'msgbox',
    category: 'Text',
    description: 'Displays a message box with text',
    syntax: 'msgbox.type <text_pointer>',
    example: 'msgbox.default <hello_text>'
  },
  {
    command: 'checkflag',
    category: 'Logic',
    description: 'Checks if a flag is set (stores result in lastresult)',
    syntax: 'checkflag.FLAG_ID',
    example: 'checkflag.0x200'
  },
  {
    command: 'setflag',
    category: 'Logic',
    description: 'Sets a flag to true',
    syntax: 'setflag.FLAG_ID',
    example: 'setflag.0x200'
  },
  {
    command: 'clearflag',
    category: 'Logic',
    description: 'Sets a flag to false',
    syntax: 'clearflag.FLAG_ID',
    example: 'clearflag.0x200'
  },
  {
    command: 'if',
    category: 'Logic',
    description: 'Conditional jump based on lastresult value',
    syntax: 'if.VALUE.goto <label>',
    example: 'if.1.goto <flag_set_label>'
  },
  {
    command: 'goto',
    category: 'Logic',
    description: 'Unconditional jump to a label',
    syntax: 'goto <label>',
    example: 'goto <end_script>'
  },
  {
    command: 'call',
    category: 'Logic',
    description: 'Calls a subroutine (can return)',
    syntax: 'call <label>',
    example: 'call <helper_function>'
  },
  {
    command: 'return',
    category: 'Logic',
    description: 'Returns from a called subroutine',
    syntax: 'return',
    example: 'return'
  },
  {
    command: 'giveitem',
    category: 'Items',
    description: 'Gives an item to the player',
    syntax: 'giveitem.ITEM_NAME.QUANTITY',
    example: 'giveitem.ITEM_POTION.5'
  },
  {
    command: 'checkitemspace',
    category: 'Items',
    description: 'Checks if player has room for an item',
    syntax: 'checkitemspace.ITEM_NAME.QUANTITY',
    example: 'checkitemspace.ITEM_POKEBALL.10'
  },
  {
    command: 'trainerbattle',
    category: 'Battle',
    description: 'Initiates a trainer battle',
    syntax: 'trainerbattle.TYPE.TRAINER_ID.0.<defeat_text>.<after_text>',
    example: 'trainerbattle.1.TRAINER_BROCK.0.<defeat>.<after>'
  },
  {
    command: 'wildbattle',
    category: 'Battle',
    description: 'Initiates a wild Pokémon battle',
    syntax: 'wildbattle.SPECIES.LEVEL.ITEM',
    example: 'wildbattle.SPECIES_PIKACHU.25.ITEM_NONE'
  },
  {
    command: 'applymovement',
    category: 'Movement',
    description: 'Applies movement to a person',
    syntax: 'applymovement.PERSON_ID.<movement_data>',
    example: 'applymovement.PLAYER.<walk_up_movement>'
  },
  {
    command: 'waitmovement',
    category: 'Movement',
    description: 'Waits for movement to complete',
    syntax: 'waitmovement.PERSON_ID',
    example: 'waitmovement.0'
  },
  {
    command: 'warp',
    category: 'Movement',
    description: 'Warps the player to a different map',
    syntax: 'warp.MAP.X.Y',
    example: 'warp.MAP_PETALBURG_CITY.10.12'
  },
  {
    command: 'playbgm',
    category: 'Audio',
    description: 'Plays background music',
    syntax: 'playbgm.SONG_ID',
    example: 'playbgm.MUS_VICTORY_TRAINER'
  },
  {
    command: 'playsound',
    category: 'Audio',
    description: 'Plays a sound effect',
    syntax: 'playsound.SOUND_ID',
    example: 'playsound.SE_PIN'
  },
  {
    command: 'fadescreen',
    category: 'Visual',
    description: 'Fades the screen in or out',
    syntax: 'fadescreen.DIRECTION',
    example: 'fadescreen.FADE_TO_BLACK'
  },
  {
    command: 'showsprite',
    category: 'Visual',
    description: 'Shows a person sprite',
    syntax: 'showsprite.PERSON_ID',
    example: 'showsprite.1'
  },
  {
    command: 'hidesprite',
    category: 'Visual',
    description: 'Hides a person sprite',
    syntax: 'hidesprite.PERSON_ID',
    example: 'hidesprite.1'
  }
];

export default function CommandReference() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', ...new Set(hmaCommands.map(cmd => cmd.category))];
  
  const filteredCommands = hmaCommands.filter(cmd => {
    const matchesSearch = cmd.command.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         cmd.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search commands..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-slate-800 border-slate-700"
          />
        </div>
        <select 
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-md text-white text-sm"
        >
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredCommands.map((cmd, index) => (
          <Card key={index} className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm text-emerald-400 font-mono">
                  {cmd.command}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {cmd.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-slate-300 mb-2">{cmd.description}</p>
              <div className="space-y-1">
                <p className="text-xs text-slate-400">
                  <span className="font-semibold">Syntax:</span> <code className="text-yellow-400">{cmd.syntax}</code>
                </p>
                <p className="text-xs text-slate-400">
                  <span className="font-semibold">Example:</span> <code className="text-green-400">{cmd.example}</code>
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}