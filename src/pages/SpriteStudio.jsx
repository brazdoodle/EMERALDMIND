import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { PageShell } from '@/components/shared/PageShell';

function SpriteStudio() {
  return (
    <PageShell
      icon={BookOpen}
      iconColor="purple"
      title="Sprite Studio"
      description="Under Construction: Bringing joy back to sprite creation!"
      actions={
        <div className="flex items-center gap-3 p-3 bg-slate-200 dark:bg-slate-900/50 rounded-xl border border-purple-400/30">
          <Sparkles className="w-5 h-5 text-purple-400" />
          <Label className="text-purple-400 font-medium">Stay Tuned</Label>
        </div>
      }
    >
        <Tabs defaultValue="battle" className="w-full">
          <TabsList className="grid w-full grid-cols-1 sm:grid-cols-2">
            {/* Tabs are currently empty */}
          </TabsList>
          <TabsContent value="battle">
            {/* No content for tabs */}
          </TabsContent>
        </Tabs>
        <div className="flex justify-center mt-6">
          <img
            src="https://media.giphy.com/media/3o7abldj0b3rxrZUxW/giphy.gif"
            alt="Dancing Pikachu"
            className="rounded-lg border border-slate-300 shadow-md"
          />
        </div>
    </PageShell>
  );
}

export default SpriteStudio;