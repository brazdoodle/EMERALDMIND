import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronLeft, ChevronRight, Copy, Bot } from 'lucide-react';

const communityExamples = [
  {
    title: 'Mystery Gift Event',
    description: 'A complete mystery gift implementation that adds a special Pokémon to the player\'s party when they interact with a delivery person NPC. Includes flag checking and party validation.',
    category: 'Events',
    hexDiff: `--- a/data/scripts/mystery_gift.s
+++ b/data/scripts/mystery_gift.s
@@ mystery_gift_delivery:
+ checkflag FLAG_RECEIVED_MYSTERY_GIFT
+ if 1, goto already_received
+ checkflag FLAG_PARTY_NOT_FULL  
+ if 0, goto party_full
+ givemon SPECIES_CELEBI, 30, ITEM_NONE
+ setflag FLAG_RECEIVED_MYSTERY_GIFT
+ msgbox "A mysterious Pokémon appeared!"`,
    author: 'HoennMaster92'
  },
  {
    title: 'Multi-Map Cutscene',
    description: 'An advanced cutscene system that seamlessly transitions between multiple maps while maintaining story continuity. Perfect for epic legendary encounters or team boss battles.',
    category: 'Scripting',
    hexDiff: `--- a/data/maps/ancient_chamber/events.inc
+++ b/data/maps/ancient_chamber/events.inc  
@@ legendary_cutscene:
+ lock
+ applymovement PLAYER, movement_step_forward
+ waitmovement 0
+ warp MAP_CHAMBER_INNER, 5, 5
+ setvar VAR_CUTSCENE_STATE, 1
+ fadescreen FADE_TO_BLACK
+ call legendary_encounter_inner
+ warp MAP_ANCIENT_CHAMBER, 10, 15`,
    author: 'RegiceLegend'
  },
  {
    title: 'Roaming Pokémon AI',
    description: 'An intelligent roaming system that makes legendary Pokémon move realistically across routes, avoiding the player initially but becoming more aggressive as the story progresses.',
    category: 'Advanced',
    hexDiff: `--- a/src/roaming.c
+++ b/src/roaming.c
@@ UpdateRoamingPokemon:
+ if (Random() % 16 == 0) {  
+   u8 currentMap = GetRoamingLocation();
+   u8 playerMap = gSaveBlock1Ptr->location.mapNum;
+   if (abs(currentMap - playerMap) < 3)
+     SetRoamingLocation(GetRandomAdjacentRoute());
+   else
+     SetRoamingLocation(GetRouteTowardsPlayer());
+ }`,
    author: 'WildEncounterPro'
  }
];

export default function ExamplesCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const currentExample = communityExamples[currentIndex];
  
  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + communityExamples.length) % communityExamples.length);
  };
  
  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % communityExamples.length);
  };
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(currentExample.hexDiff);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-4 h-4 text-purple-400" />
          <span className="text-purple-400 font-mono font-bold">Community Examples</span>
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="ghost" onClick={goToPrevious}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-slate-400 text-xs px-2">
            {currentIndex + 1} / {communityExamples.length}
          </span>
          <Button size="sm" variant="ghost" onClick={goToNext}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-purple-400 font-bold text-sm">{currentExample.title}</h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">
              {currentExample.description}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-purple-400 text-purple-400 text-xs">
              {currentExample.category}
            </Badge>
            <Button size="sm" variant="ghost" onClick={copyToClipboard} className="text-slate-400 hover:text-white">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
        </div>
        
        <pre className="bg-slate-950 border border-slate-700 rounded p-3 text-xs font-mono overflow-x-auto">
          <code className="text-green-400">{currentExample.hexDiff}</code>
        </pre>
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">by {currentExample.author}</span>
          <span className="text-slate-500">Click copy to use in your project</span>
        </div>
      </div>
    </div>
  );
}