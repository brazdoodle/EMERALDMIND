
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Palette, Sword, Loader2, Download, Save, FlaskConical, Plus, Sparkles, Eye, CheckCircle, Search, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { GenerateImage } from '@/api/integrations';
import { Sprite } from '@/api/entities';
import { gen3References } from '@/components/sprite/Gen3SpriteData';
import EntityErrorHandler from '@/components/shared/EntityErrorHandler';

function SpriteGenerator() {
  const [prompt, setPrompt] = useState('');
  const [characterType, setCharacterType] = useState('ace_trainer');
  const [battleStance, setBattleStance] = useState('confident');
  const [colorScheme, setColorScheme] = useState('default');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSprite, setGeneratedSprite] = useState(null);
  const [downscaledSprite, setDownscaledSprite] = useState(null);

  const createDownscaledVersion = (originalUrl) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 64;
      canvas.height = 64;
      ctx.imageSmoothingEnabled = false;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        ctx.drawImage(img, 0, 0, 64, 64);
        resolve(canvas.toDataURL('image/png'));
      };
      img.src = originalUrl;
    });
  };

  const generateSprite = async () => {
    setIsGenerating(true);
    setGeneratedSprite(null);
    setDownscaledSprite(null);

    try {
      const { poses, trainerClasses } = gen3References;
      const specificPoses = trainerClasses[characterType]?.poses || trainerClasses.ace_trainer.poses;
      const specificPose = specificPoses[Math.floor(Math.random() * specificPoses.length)];
      
      const genderCues = characterType.includes('female') || prompt.toLowerCase().includes('female') || characterType === 'lass' || characterType === 'beauty';

      const enhancedPrompt = `PIXEL PERFECT 64x64 battle trainer sprite, Pokemon Emerald authentic style. Sharp, chunky pixels, clean black outlines. 15-color indexed palette. NO anti-aliasing. HUMAN TRAINER ONLY, no animal features. Fill 62x62 area, 1px transparent border.
${genderCues ? 'FEMALE TRAINER: Longer hair, fitted outfit, graceful pose. Ref: May, Flannery.' : 'MALE TRAINER: Shorter hair, looser clothing, powerful stance. Ref: Brendan, Norman.'}
CHARACTER: ${characterType.replace('_', ' ')}, ${prompt || 'determined expression'}.
POSE: ${specificPose}.
COLORS: ${colorScheme} theme, high contrast.
STYLE: Tile-aligned for 8x8 GBA system. Reference exact pixel art of Pokemon Ruby/Sapphire/Emerald.`;

      const response = await GenerateImage({ prompt: enhancedPrompt });
      if (response?.url) {
        setGeneratedSprite(response.url);
        const downscaled = await createDownscaledVersion(response.url);
        setDownscaledSprite(downscaled);
      } else {
        throw new Error("Image generation failed to return a URL.");
      }
    } catch (error) {
      console.error('Error generating sprite:', error);
      alert('Failed to generate sprite. The AI might be busy. Please try again.');
    }
    setIsGenerating(false);
  };

  const saveSpriteToProject = async () => {
    if (!generatedSprite) return;
    await Sprite.create({
      project_id: 'current_project',
      sprite_id: `battle_sprite_${Date.now()}`,
      name: prompt || `Generated ${characterType.replace('_', ' ')}`,
      type: 'battle',
      file_url: generatedSprite,
      dimensions: { width: 64, height: 64 },
      tags: ['generated', 'ai', 'battle', characterType]
    });
    alert('Sprite saved to project!');
  };

  const downloadSprite = (version = 'original') => {
    const url = version === 'rom' ? downscaledSprite : generatedSprite;
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `sprite_${version}.png`;
    a.click();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-6">
        <CardContent className="space-y-4 p-0">
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Prompt / Description</label>
              <Textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)} 
                placeholder="A confident gym leader with spiky red hair..." 
                className="bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/50 dark:border-slate-600 dark:text-white" 
              />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Trainer Class</label>
              <Select value={characterType} onValueChange={setCharacterType}>
                <SelectTrigger className="bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/50 dark:border-slate-600 dark:text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                  {Object.keys(gen3References.trainerClasses).map(tc => (
                    <SelectItem key={tc} value={tc}>
                      {tc.replace('_', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
               <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Stance</label>
                <Select value={battleStance} onValueChange={setBattleStance}>
                  <SelectTrigger className="bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/50 dark:border-slate-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                    <SelectItem value="confident">Confident</SelectItem>
                    <SelectItem value="aggressive">Aggressive</SelectItem>
                    <SelectItem value="elegant">Elegant</SelectItem>
                  </SelectContent>
                </Select>
               </div>
               <div>
                <label className="text-sm font-medium text-slate-700 dark:text-slate-400 mb-2 block">Color Theme</label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
                  <SelectTrigger className="bg-slate-100 border-slate-300 text-slate-800 dark:bg-slate-800/50 dark:border-slate-600 dark:text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-600 dark:text-white">
                    <SelectItem value="default">Auto</SelectItem>
                    <SelectItem value="fire">Fire</SelectItem>
                    <SelectItem value="water">Water</SelectItem>
                    <SelectItem value="grass">Grass</SelectItem>
                  </SelectContent>
                </Select>
               </div>
            </div>
            <Button onClick={generateSprite} disabled={isGenerating} className="w-full bg-gradient-to-r from-purple-500 to-violet-500 h-12 font-medium">
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" /> 
                  Forging Sprite...
                </>
              ) : (
                <>
                  <Sword className="w-5 h-5 mr-2" /> 
                  Generate Battle Sprite
                </>
              )}
            </Button>
        </CardContent>
      </div>

      <div className="space-y-6">
        {generatedSprite ? (
          <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl">
            <CardHeader>
              <CardTitle className="text-slate-900 dark:text-white text-xl">Generated Sprite</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-6">
              <div className="text-center space-y-2">
                <h4 className="text-slate-600 dark:text-slate-400 text-xs">Original Generation</h4>
                <img 
                  src={generatedSprite} 
                  alt="Original" 
                  className="mx-auto border rounded border-slate-300 bg-slate-100 dark:border-slate-600 dark:bg-slate-800" 
                  style={{ imageRendering: 'pixelated', width: '200px', height: '200px' }} 
                />
                <Button onClick={() => downloadSprite('original')} variant="outline" className="w-full">
                  <Download className="w-4 h-4 mr-2" /> Download Original
                </Button>
              </div>
              <div className="text-center space-y-2">
                <h4 className="text-emerald-600 dark:text-emerald-400 text-xs">ROM-Ready 64×64</h4>
                {downscaledSprite && (
                  <>
                    <img 
                      src={downscaledSprite} 
                      alt="ROM-ready" 
                      className="mx-auto border rounded border-emerald-400 bg-slate-100 dark:border-emerald-600 dark:bg-slate-800" 
                      style={{ imageRendering: 'pixelated', width: '128px', height: '128px' }} 
                    />
                    <Button onClick={() => downloadSprite('rom')} className="w-full bg-emerald-600 hover:bg-emerald-700">
                      <Download className="w-4 h-4 mr-2" /> Download ROM Version
                    </Button>
                  </>
                )}
              </div>
              <div className="col-span-2 text-center pt-4 border-t border-slate-200 dark:border-slate-700">
                <Button onClick={saveSpriteToProject} className="bg-purple-600 hover:bg-purple-700">
                  <Save className="w-4 h-4 mr-2" /> Save to Project
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
           <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl h-full flex items-center justify-center">
             <div className="text-center text-slate-500 dark:text-slate-400 p-8">
                <Palette className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <h3 className="font-semibold text-lg text-slate-700 dark:text-slate-300">Your Sprite Appears Here</h3>
                <p className="text-sm">Configure the options on the left and click "Generate" to create a new battle sprite.</p>
             </div>
           </Card>
        )}
      </div>
    </div>
  );
}

function SpriteGallery({ sprites, searchTerm, setSearchTerm, filterType, setFilterType, loadError, retryLoad, onSelect }) {
  return (
    <>
      {loadError ? (
        <EntityErrorHandler 
          error={loadError}
          entityName="Sprite"
          onRetry={retryLoad}
        />
      ) : (
        <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl text-slate-900 dark:text-white font-light">Project Gallery</CardTitle>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search sprites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-600 rounded-xl h-10 pl-9 w-64 text-slate-900 dark:text-white"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="bg-slate-100 dark:bg-slate-900/80 border-slate-300 dark:border-slate-600 rounded-xl h-10 text-slate-900 dark:text-white w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600">
                  <SelectItem value="all" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">All Types</SelectItem>
                  <SelectItem value="battle" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Battle</SelectItem>
                  <SelectItem value="pokemon" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Pokemon</SelectItem>
                  <SelectItem value="overworld" className="text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700">Overworld</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {sprites
                .filter(sprite => 
                  (filterType === 'all' || sprite.type === filterType) &&
                  (sprite.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   (sprite.tags && sprite.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))))
                )
                .map(sprite => (
                  <div key={sprite.sprite_id} className="p-2 border border-slate-200 dark:border-slate-700 rounded-lg text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors" onClick={() => onSelect && onSelect(sprite)}>
                    <img 
                      src={sprite.file_url} 
                      alt={sprite.name} 
                      className="w-full h-auto object-contain mb-2 bg-slate-100 dark:bg-slate-800" 
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{sprite.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{sprite.type}</p>
                  </div>
              ))}
              {sprites.length === 0 && (
                <p className="col-span-full text-center text-slate-500 dark:text-slate-400">No sprites in your project yet. Start generating!</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}


export default function SpriteStudio() {
  const [activeTab, setActiveTab] = useState('generator');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sprites, setSprites] = useState([]);
  const [loadError, setLoadError] = useState(null);

  const loadSprites = useCallback(async () => {
    setLoadError(null);
    try {
      const fetchedSprites = await Sprite.list({ project_id: 'current_project' });
      setSprites(fetchedSprites);
    } catch (error) {
      console.error('Failed to load sprites:', error);
      setLoadError(error);
    }
  }, []);

  useEffect(() => {
    loadSprites();
  }, [loadSprites]);

  const retryLoad = () => {
    loadSprites();
  };

  const handleSpriteSelect = (sprite) => {
    console.log("Selected sprite for further action:", sprite);
    // Future: implement logic to view/edit selected sprite
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                  <Palette className="w-7 h-7 text-purple-400" />
                  Sprite Studio
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  AI-powered sprite generation and validation for Gen III
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Button onClick={() => {}} className="bg-gradient-to-r from-purple-500 to-violet-500 text-white font-semibold shadow-lg">
                  <Plus className="w-4 h-4 mr-2" />
                  Upload Sprite
                </Button>
              </div>
            </div>
          </motion.div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-200 dark:bg-slate-800/50 rounded-xl p-1 mb-4">
            <TabsTrigger value="generator" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300 font-medium transition-all duration-200">
              <Sparkles className="w-4 h-4" />
              AI Generator
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-purple-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300 font-medium transition-all duration-200">
              <Eye className="w-4 h-4" />
              Project Gallery
            </TabsTrigger>
          </TabsList>
          <TabsContent value="generator" className="space-y-6">
            <Card className="bg-white/90 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl p-6">
              <SpriteGenerator />
            </Card>
          </TabsContent>
          <TabsContent value="gallery" className="space-y-6">
            <SpriteGallery 
              sprites={sprites}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterType={filterType}
              setFilterType={setFilterType}
              loadError={loadError}
              retryLoad={retryLoad}
              onSelect={handleSpriteSelect}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
