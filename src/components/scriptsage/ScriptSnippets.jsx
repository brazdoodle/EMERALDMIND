import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Code, Plus, Copy } from 'lucide-react';

const snippets = [
  {
    title: 'Basic NPC Interaction',
    category: 'NPC',
    code: `npc_chat:\n  lock\n  faceplayer\n  msgbox.default <greeting_text>\n  release\n  end\n\ngreeting_text:\n{\n  Hello! I'm an NPC in this ROM hack.\n  How are you doing today?\n}`,
    description: 'Standard NPC greeting with basic dialogue'
  },
  {
    title: 'Item Give Script',
    category: 'Item',
    code: `give_item_script:\n  lock\n  faceplayer\n  checkflag.0x250\n  if.1.goto <already_gave>\n  msgbox.default <offer_item>\n  giveitem.ITEM_POTION.1\n  setflag.0x250\n  msgbox.default <received_item>\n  goto <end_script>\n\nalready_gave:\n  msgbox.default <already_gave_text>\n  goto <end_script>\n\nend_script:\n  release\n  end`,
    description: 'Give an item to the player once with flag tracking'
  },
  {
    title: 'Gym Leader Battle',
    category: 'Battle',
    code: `gym_leader_battle:\n  lock\n  faceplayer\n  checkflag.0x820\n  if.1.goto <already_defeated>\n  msgbox.default <pre_battle_text>\n  trainerbattle.1.TRAINER_BROCK.0.<defeat_text>.<post_battle_text>\n  setflag.0x820\n  giveitem.ITEM_TM_ROCK_TOMB.1\n  msgbox.default <badge_text>\n  goto <end_battle>\n\nalready_defeated:\n  msgbox.default <already_beaten>\n\nend_battle:\n  release\n  end`,
    description: 'Complete gym leader battle with badge and TM reward'
  },
  {
    title: 'Movement Script',
    category: 'Movement',
    code: `movement_demo:\n  lock\n  applymovement.PLAYER.<player_walk_up>\n  waitmovement.0\n  applymovement.0x1.<npc_walk_down>\n  waitmovement.0\n  faceplayer\n  msgbox.default <movement_text>\n  release\n  end\n\nplayer_walk_up:\n  walk_up\n  walk_up\n  face_down\n  end_movement\n\nnpc_walk_down:\n  walk_down\n  walk_down\n  face_up\n  end_movement`,
    description: 'Coordinated movement between player and NPC'
  },
  {
    title: 'Conditional Dialogue',
    category: 'Logic',
    code: `conditional_npc:\n  lock\n  faceplayer\n  checkflag.0x200\n  if.1.call <post_gym_dialogue>\n  if.0.call <pre_gym_dialogue>\n  release\n  end\n\npre_gym_dialogue:\n  msgbox.default <before_gym_text>\n  return\n\npost_gym_dialogue:\n  msgbox.default <after_gym_text>\n  return`,
    description: 'NPC dialogue that changes based on story progress'
  },
  {
    title: 'Shop Script',
    category: 'Shop',
    code: `pokemart_clerk:\n  lock\n  faceplayer\n  msgbox.default <welcome_text>\n  pokemart.ITEMS_LIST\n  msgbox.default <goodbye_text>\n  release\n  end\n\nwelcome_text:\n{\n  Welcome to our Poké Mart!\n  How may I help you today?\n}\n\ngoodbye_text:\n{\n  Thank you for shopping with us!\n  Come back anytime!\n}`,
    description: 'Basic Poké Mart interaction script'
  }
];

export default function ScriptSnippets({ onInsert }) {
  const categories = [...new Set(snippets.map(s => s.category))];

  const handleInsert = (code) => {
    if (onInsert) {
      onInsert(code);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        {categories.map(category => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wide">
              {category} Scripts
            </h3>
            <div className="space-y-2">
              {snippets.filter(s => s.category === category).map((snippet, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-colors">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm text-white">{snippet.title}</CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {snippet.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-400">{snippet.description}</p>
                  </CardHeader>
                  <CardContent className="pt-2">
                    <div className="flex items-center justify-between">
                      <code className="text-xs text-green-400 font-mono truncate flex-1">
                        {snippet.code.split('\n')[0]}...
                      </code>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleInsert(snippet.code)}
                        className="ml-2 text-slate-400 hover:text-white"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}