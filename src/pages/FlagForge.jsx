import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Flag } from "@/api/entities";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Plus, Zap, Search, Edit, MoreHorizontal, X, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { vanillaEmeraldFlags } from "@/components/flagforge/EmeraldFlagData.js";
import { ChangelogEntry } from "@/api/entities";
import FlagEditModal from "@/components/flagforge/FlagEditModal";
import EntityErrorHandler from "@/components/shared/EntityErrorHandler";

const flagCategories = ["All", "System", "Badges", "Story", "Temporary", "Hidden Items", "Configured"];

export default function FlagForge() {
  const [allFlags, setAllFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  /**
   * Determines if a flag has been configured/modified by the user
   * @param {object} flag - The flag object to check
   * @returns {boolean} - True if the flag has been modified
   */
  const isFlagConfigured = useCallback((flag) => {
    if (!flag.is_vanilla) return true; // Custom flags are always "configured"
    return flag.is_user_modified ||
           (flag.notes && flag.notes.trim().length > 0) ||
           (flag.original_description && flag.description !== flag.original_description);
  }, []);

  /**
   * Seeds the database with default vanilla Emerald flags if they don't exist.
   * This is a one-time operation for new projects.
   */
  const seedVanillaFlags = useCallback(async () => {
    try {
      // Check for missing vanilla flags and add them.
      const existingDbFlags = await Flag.filter({ is_vanilla: true });
      const existingFlagIds = new Set(existingDbFlags.map(f => f.flag_id));

      const missingFlags = vanillaEmeraldFlags.filter(vf => !existingFlagIds.has(vf.hex_id));

      if (missingFlags.length > 0) {
        console.log(`Found ${missingFlags.length} missing vanilla flags. Seeding now...`);
        const flagsToCreate = missingFlags.map(f => ({
          project_id: 'current_project',
          flag_id: f.hex_id,
          name: f.name,
          description: f.description,
          category: f.category,
          is_vanilla: true,
          original_description: f.description,
        }));
        await Flag.bulkCreate(flagsToCreate);
      }
    } catch (error) {
      // If seeding fails due to rate limiting, we can still show vanilla flags from local data
      if (error?.response?.status === 429 || error?.message?.includes('Rate limit')) {
        console.warn('Rate limited during seeding, using local vanilla flag data');
        return;
      }
      throw error;
    }
  }, []);

  /**
   * Loads all flags from the database and sets the initial state.
   */
  const loadFlags = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    
    try {
      await seedVanillaFlags();
      const flagData = await Flag.list("-created_date");
      setAllFlags(flagData);
    } catch (error) {
      console.error('Error loading flags:', error);
      setLoadError(error);
      
      // Fallback: show vanilla flags from local data if we can't load from API
      if (error?.response?.status === 429 || error?.message?.includes('Rate limit')) {
        const fallbackFlags = vanillaEmeraldFlags.map(f => ({
          id: f.hex_id, // Using hex_id as a unique ID for fallback display
          flag_id: f.hex_id,
          name: f.name,
          description: f.description,
          category: f.category,
          is_vanilla: true,
          original_description: f.description,
        }));
        setAllFlags(fallbackFlags);
        setLoadError({ 
          ...error, 
          isFallback: true, 
          message: 'Using offline flag database due to rate limiting' 
        });
      }
    } finally {
      setIsLoading(false);
    }
  }, [seedVanillaFlags]);

  useEffect(() => {
    loadFlags();
  }, [loadFlags]);

  /**
   * Filters and sorts flags based on the active category and search term.
   */
  const filteredFlags = useMemo(() => {
    return allFlags.filter(flag => {
      const categoryMatch = activeCategory === "All" ||
                           flag.category === activeCategory ||
                           (activeCategory === "Configured" && isFlagConfigured(flag));
      const term = searchTerm.toLowerCase();
      const searchMatch = !term ||
        flag.name.toLowerCase().includes(term) ||
        flag.flag_id.toLowerCase().includes(term) ||
        (flag.description && flag.description.toLowerCase().includes(term));
      return categoryMatch && searchMatch;
    }).sort((a, b) => {
      // Sort by hex value of flag_id, ascending
      const valA = parseInt(a.flag_id, 16);
      const valB = parseInt(b.flag_id, 16);
      if (isNaN(valA)) return 1; // Put non-hex values at the end
      if (isNaN(valB)) return -1;
      return valA - valB;
    });
  }, [allFlags, activeCategory, searchTerm, isFlagConfigured]);

  /**
   * Handles saving a new or updated flag to the database.
   * @param {object} flagData - The data for the flag being saved.
   * @param {boolean} isNew - True if the flag is being created, false if updated.
   */
  const handleSaveFlag = async (flagData, isNew) => {
    try {
      // Normalize flag_id: allow users to enter with or without 0x, store as lowercase 0xNNN
      let normalizedFlagId = (flagData.flag_id || '').toString().trim();
      if (normalizedFlagId) {
        if (!normalizedFlagId.startsWith('0x') && /^[0-9a-fA-F]+$/.test(normalizedFlagId)) {
          normalizedFlagId = '0x' + normalizedFlagId.toLowerCase();
        } else {
          normalizedFlagId = normalizedFlagId.toLowerCase();
        }
      }
      // Prevent collisions with existing flags
      const collision = allFlags.find(f => f.flag_id === normalizedFlagId && f.id !== flagData.id);
      if (collision && isNew) {
        alert(`A flag with id ${normalizedFlagId} already exists: ${collision.name}. Pick a unique hex id.`);
        return;
      }
      if (isNew) {
        const newFlag = await Flag.create({
          ...flagData,
          flag_id: normalizedFlagId || flagData.flag_id,
          project_id: 'current_project',
          is_vanilla: false,
        });
        setAllFlags(prev => [newFlag, ...prev]);
        await ChangelogEntry.create({
          project_id: 'current_project',
          module: 'Flag Forge',
          action: 'created',
          item_name: newFlag.name,
          description: `Created new flag '${newFlag.name}' (${newFlag.flag_id})`,
        });
      } else {
        const updatedData = {
          name: flagData.name,
          description: flagData.description,
          category: flagData.category,
          notes: flagData.notes,
          flag_id: normalizedFlagId || flagData.flag_id,
          is_user_modified: flagData.is_vanilla ? true : false,
        };
        const updatedFlag = await Flag.update(flagData.id, updatedData);
        setAllFlags(prev => prev.map(f => f.id === flagData.id ? { ...f, ...updatedFlag } : f));

        await ChangelogEntry.create({
          project_id: 'current_project',
          module: 'Flag Forge',
          action: 'updated',
          item_name: flagData.name,
          description: `Modified flag '${flagData.name}' (${flagData.flag_id})`,
        });
      }
    } catch (error) {
      console.error("Failed to save flag:", error);
    }
  };

  /**
   * Handles deleting a custom flag from the database.
   * @param {object} flag - The flag to delete
   */
  const handleDeleteFlag = async (flag) => {
    if (flag.is_vanilla) {
      alert("Cannot delete vanilla game flags. You can only delete custom flags you've created.");
      return;
    }

    if (!confirm(`Are you sure you want to delete the custom flag "${flag.name}" (${flag.flag_id})? This action cannot be undone.`)) {
      return;
    }

    try {
      await Flag.delete(flag.id);
      setAllFlags(prev => prev.filter(f => f.id !== flag.id));

      await ChangelogEntry.create({
        project_id: 'current_project',
        module: 'Flag Forge',
        action: 'deleted',
        item_name: flag.name,
        description: `Deleted custom flag '${flag.name}' (${flag.flag_id})`,
      });
    } catch (error) {
      console.error("Failed to delete flag:", error);
    }
  };

  const openEditModal = (flag) => {
    setSelectedFlag(flag);
    setIsModalOpen(true);
  };

  const openNewModal = () => {
    setSelectedFlag(null); // No flag means it's a new one
    setIsModalOpen(true);
  };

  const getStatusBadge = (flag) => {
    if (isFlagConfigured(flag) && flag.is_vanilla) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">Configured</Badge>;
    }
    if (flag.is_vanilla) return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Vanilla</Badge>;
    return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Custom</Badge>;
  };

  const getConfigurationStats = () => {
    const customCount = allFlags.filter(f => !f.is_vanilla).length;
    const modifiedCount = allFlags.filter(f => f.is_vanilla && isFlagConfigured(f)).length;
    const totalConfigured = customCount + modifiedCount;

    return { customCount, modifiedCount, totalConfigured };
  };

  const stats = getConfigurationStats();

  const retryLoad = () => {
    loadFlags();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading comprehensive flag database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex justify-between items-center">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
                    <Zap className="w-7 h-7 text-blue-400"/>
                    Flag Forge
                </h1>
                <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
                  Complete flag database with {vanillaEmeraldFlags.length}+ verified Emerald flags
                </p>
            </motion.div>
            <Button onClick={openNewModal} className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg hover:from-blue-600 hover:to-cyan-600">
                <Plus className="w-5 h-5 mr-2" />
                New Custom Flag
            </Button>
        </header>

        {loadError && !loadError.isFallback && (
          <EntityErrorHandler 
            error={loadError}
            entityName="Flag"
            onRetry={retryLoad}
            className="mb-6"
          />
        )}

        {loadError?.isFallback && (
          <div className="mb-6 p-4 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-400/30 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-300">
              <Clock className="w-4 h-4" />
              <span className="font-medium">Offline Mode:</span>
              <span>Using local flag database due to high server load. You can browse and search flags, but changes won't be saved until service recovers.</span>
            </div>
          </div>
        )}

        <Card className="bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm border border-slate-300 dark:border-slate-800 rounded-2xl shadow-xl">
          <CardHeader className="p-4">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    type="text"
                    placeholder="Search flags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-slate-100 dark:bg-slate-800/50 border-slate-300 dark:border-slate-600 rounded-xl h-10 pl-9 w-full text-slate-900 dark:text-white"
                  />
                </div>
                <div className="text-sm text-slate-600 dark:text-slate-400">
                  Showing <span className="font-bold text-blue-400">{filteredFlags.length}</span> of <span className="font-bold text-slate-900 dark:text-white">{allFlags.length}</span> flags
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                  {vanillaEmeraldFlags.length} Total Vanilla Flags
                </Badge>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {allFlags.filter(f => f.category === 'System').length} System
                </Badge>
                <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                  {allFlags.filter(f => f.category === 'Story').length} Story
                </Badge>
                <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
                  {stats.totalConfigured} Configured
                </Badge>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {stats.customCount} Custom
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
              <TabsList className="grid w-full grid-cols-4 md:grid-cols-7 bg-slate-200 dark:bg-slate-800/50 rounded-xl p-1 mb-4">
                {flagCategories.map(cat => (
                  <TabsTrigger key={cat} value={cat} className="data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:text-blue-400 data-[state=active]:shadow-sm text-slate-600 dark:text-slate-300 text-xs">
                    {cat}
                    {cat === "Configured" && stats.totalConfigured > 0 && (
                      <span className="ml-1 bg-orange-500/30 text-orange-300 rounded-full px-1.5 py-0.5 text-xs">
                        {stats.totalConfigured}
                      </span>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              <div className="overflow-auto border border-slate-300 dark:border-slate-700/50 rounded-xl max-h-[60vh] bg-slate-100/50 dark:bg-slate-950/30">
                <Table>
                  <TableHeader className="sticky top-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm">
                    <TableRow className="border-b-slate-300 dark:border-b-slate-700/50">
                      <TableHead className="text-blue-400 font-mono">Flag ID</TableHead>
                      <TableHead className="text-blue-400 font-mono">Name</TableHead>
                      <TableHead className="text-blue-400 font-mono hidden sm:table-cell">Description</TableHead>
                      <TableHead className="text-blue-400 font-mono">Category</TableHead>
                      <TableHead className="text-blue-400 font-mono">Status</TableHead>
                      <TableHead className="text-right text-blue-400 font-mono">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlags.length === 0 && !isLoading ? (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-slate-900 dark:text-white">No flags found matching your criteria.</TableCell></TableRow>
                    ) : filteredFlags.map(flag => (
                      <TableRow key={flag.id} className="border-slate-300 dark:border-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-800/30">
                        <TableCell className="font-bold text-slate-700 dark:text-slate-300 font-mono">
                          {flag.flag_id}
                          {isFlagConfigured(flag) && flag.is_vanilla && (
                            <span className="ml-2 w-2 h-2 bg-orange-400 rounded-full inline-block" title="This flag has been configured"></span>
                          )}
                        </TableCell>
                        <TableCell className="font-medium text-slate-900 dark:text-white">
                          {flag.name}
                          {flag.notes && flag.notes.trim().length > 0 && (
                            <span className="ml-2 text-xs text-slate-400" title="Has user notes">📝</span>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-600 dark:text-slate-400 hidden sm:table-cell max-w-sm">
                           <Popover>
                            <PopoverTrigger asChild>
                              <div className="flex items-center gap-2 cursor-pointer group">
                                <p className="truncate">{flag.description}</p>
                                <MoreHorizontal className="w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white max-w-md">
                              <h4 className="font-bold mb-2">Full Description</h4>
                              <p className="text-sm text-slate-600 dark:text-slate-300">{flag.description}</p>
                              {flag.notes && flag.notes.trim().length > 0 && (
                                <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                                  <h5 className="font-semibold text-orange-400 mb-1">User Notes</h5>
                                  <p className="text-sm text-slate-600 dark:text-slate-300">{flag.notes}</p>
                                </div>
                              )}
                            </PopoverContent>
                          </Popover>
                        </TableCell>
                        <TableCell><Badge variant="outline" className="text-slate-900 dark:text-white border-slate-300 dark:border-slate-600">{flag.category}</Badge></TableCell>
                        <TableCell>{getStatusBadge(flag)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEditModal(flag)}>
                              <Edit className="w-4 h-4 text-slate-400 hover:text-blue-400"/>
                            </Button>
                            {!flag.is_vanilla && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteFlag(flag)}
                                className="text-red-400 hover:text-red-300"
                                title="Delete custom flag"
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Tabs>
          </CardContent>
        </Card>

        <FlagEditModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          flag={selectedFlag}
          onSave={handleSaveFlag}
        />
      </div>
    </div>
  );
}