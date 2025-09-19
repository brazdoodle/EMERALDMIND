import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Code, FileText, BookOpen, Share2 } from 'lucide-react';
import ScriptSnippets from './ScriptSnippets';
import CommandReference from './CommandReference';

const TABS = [
  { value: "editor", label: "Editor", icon: Code },
  { value: "snippets", label: "Templates", icon: FileText },
  { value: "reference", label: "Commands", icon: BookOpen },
];

export default function ScriptEditorTabs({ activeTab, setActiveTab, onInsertSnippet }) {
  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-slate-900/50 rounded-xl p-1 mb-4">
          {TABS.map(tab => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:text-slate-900">
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="snippets">
          <Card className="bg-slate-900/80 border-slate-800 rounded-xl">
            <CardHeader><CardTitle className="text-lg text-white font-light">Script Templates</CardTitle></CardHeader>
            <CardContent><ScriptSnippets onInsert={onInsertSnippet} /></CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reference">
          <Card className="bg-slate-900/80 border-slate-800 rounded-xl">
            <CardHeader><CardTitle className="text-lg text-white font-light">HMA Command Reference</CardTitle></CardHeader>
            <CardContent><CommandReference /></CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}