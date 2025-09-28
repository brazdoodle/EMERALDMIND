import { ChangelogEntry, Flag } from "@/api/entities";
import FlagEditModal from "@/components/flagforge/FlagEditModal";
import EntityErrorHandler from "@/components/shared/EntityErrorHandler";
import { PageShell } from "@/components/shared/PageShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAppState } from "@/lib/appState.jsx";
import { Clock, Edit, MoreHorizontal, Search, X, Zap } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { comprehensiveEmeraldFlags } from "../../data/ComprehensiveEmeraldFlags";

// Contextual flag categories for better UX - grouping related functionality
const contextualFlagCategories = {
  All: {
    label: "All Flags",
    flags: () => comprehensiveEmeraldFlags,
  },
  Progress: {
    label: "Towns & Progress",
    flags: () =>
      comprehensiveEmeraldFlags.filter(
        (f) => f.category === "Towns and Cities" || f.category === "Badges"
      ),
  },
  Items: {
    label: "Items & Rewards",
    flags: () =>
      comprehensiveEmeraldFlags.filter(
        (f) => f.category === "Hidden Items" || f.category === "Item Ball Flags"
      ),
  },
  Story: {
    label: "Story & Events",
    flags: () =>
      comprehensiveEmeraldFlags.filter(
        (f) =>
          f.category === "Scripts" ||
          f.category === "Event Flags" ||
          f.category === "Mystery Gift"
      ),
  },
  System: {
    label: "System & Utility",
    flags: () =>
      comprehensiveEmeraldFlags.filter(
        (f) =>
          f.category === "System Flags" ||
          f.category === "Special Flags" ||
          f.category === "Daily Flags"
      ),
  },
  Temporary: {
    label: "Temporary",
    flags: () =>
      comprehensiveEmeraldFlags.filter(
        (f) =>
          f.category === "Temporary" ||
          (f.unused &&
            (f.flag.startsWith("FLAG_TEMP_") ||
              f.flag.startsWith("FLAG_UNUSED_")))
      ),
  },
  Configured: {
    label: "Configured",
    flags: () => [], // Will be handled by filtering logic based on user modifications
  },
};

const flagCategories = Object.keys(contextualFlagCategories);

export default function FlagForge() {
  // Use global state for project management
  const { state } = useAppState();
  const currentProject = state.currentProject;

  const [allFlags, setAllFlags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [selectedFlag, setSelectedFlag] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(50); // Show 50 flags per page

  /**
   * Formats flag ID to ensure proper hex display with leading zeros
   * @param {string} flagId - The flag ID to format (e.g., "0x1", "0x20", "FLAG_TEMP_1")
   * @returns {string} - Formatted flag ID (e.g., "0x001", "0x020")
   */
  const formatFlagId = useCallback((flagId) => {
    if (!flagId) return flagId;

    // Handle hex values like "0x1", "0x20", etc.
    const hexMatch = flagId.match(/^0x([0-9A-Fa-f]+)$/);
    if (hexMatch) {
      const hexValue = hexMatch[1];
      // Pad to at least 3 digits for better readability
      const paddedHex = hexValue.padStart(3, "0");
      return `0x${paddedHex.toUpperCase()}`;
    }

    // Return as-is for non-hex formats
    return flagId;
  }, []);

  /**
   * Determines if a flag has been configured/modified by the user
   * @param {object} flag - The flag object to check
   * @returns {boolean} - True if the flag has been modified
   */
  const isFlagConfigured = useCallback((flag) => {
    if (!flag.is_vanilla) return true; // Custom flags are always "configured"
    return (
      flag.is_user_modified ||
      (flag.notes && flag.notes.trim().length > 0) ||
      (flag.original_description &&
        flag.description !== flag.original_description)
    );
  }, []);

  /**
   * Seeds the database with default vanilla Emerald flags if they don't exist.
   * This is a one-time operation for new projects.
   */
  const seedVanillaFlags = useCallback(async () => {
    try {
      // Check for missing vanilla flags and add them.
      const existingDbFlags = await Flag.filter({ is_vanilla: true });
      const existingFlagIds = new Set(existingDbFlags.map((f) => f.flag_id));

      const missingFlags = comprehensiveEmeraldFlags.filter(
        (vf) => !existingFlagIds.has(vf.value)
      );

      if (missingFlags.length > 0) {
        console.log(
          `Found ${missingFlags.length} missing vanilla flags. Seeding now...`
        );
        const flagsToCreate = missingFlags.map((f) => ({
          project_id: currentProject?.id || "default-project",
          flag_id: f.value,
          name: f.flag,
          description: f.description,
          category: f.category,
          is_vanilla: true,
          unused: f.unused || false,
          original_description: f.description,
        }));
        await Flag.bulkCreate(flagsToCreate);
      }
    } catch (_error) {
      // If seeding fails due to rate limiting, we can still show vanilla flags from local data
      if (
        _error?.response?.status === 429 ||
        _error?.message?.includes("Rate limit")
      ) {
        console.warn(
          "Rate limited during seeding, using local vanilla flag data"
        );
        return;
      }
      throw _error;
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
    } catch (_error) {
      console.error("Error loading flags:", error);
      setLoadError(error);

      // Fallback: show comprehensive flags from local data if we can't load from API
      if (
        error?.response?.status === 429 ||
        error?.message?.includes("Rate limit")
      ) {
        const fallbackFlags = comprehensiveEmeraldFlags.map((f) => ({
          id: f.value, // Using hex value as unique ID for fallback display
          flag_id: f.value,
          name: f.flag,
          description: f.description,
          category: f.category,
          is_vanilla: true,
          unused: f.unused || false,
          original_description: f.description,
        }));
        setAllFlags(fallbackFlags);
        setLoadError({
          ...error,
          isFallback: true,
          message: "Using offline flag database due to rate limiting",
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
    // Always use comprehensive flags as the base dataset for consistency
    let flagsToFilter = comprehensiveEmeraldFlags;

    // For specific categories, apply category-based filtering
    if (activeCategory !== "All") {
      const categoryFlags =
        contextualFlagCategories[activeCategory]?.flags() || [];
      flagsToFilter = categoryFlags;
    }

    return flagsToFilter
      .filter((flag) => {
        // For contextual categories, flag is already filtered by category
        let categoryMatch = true;
        if (activeCategory === "All") {
          categoryMatch = true;
        } else if (activeCategory === "Configured") {
          categoryMatch = isFlagConfigured(flag);
        }
        // Category matching is already handled by flagsToFilter selection above
        // No additional category filtering needed

        const term = searchTerm.toLowerCase();
        const searchMatch =
          !term ||
          flag.name.toLowerCase().includes(term) ||
          flag.flag_id.toLowerCase().includes(term) ||
          (flag.description && flag.description.toLowerCase().includes(term));
        return categoryMatch && searchMatch;
      })
      .sort((a, b) => {
        // Sort by hex value of flag_id, ascending
        const valA = parseInt(a.flag_id || a.value, 16);
        const valB = parseInt(b.flag_id || b.value, 16);
        if (isNaN(valA)) return 1; // Put non-hex values at the end
        if (isNaN(valB)) return -1;
        return valA - valB;
      });
  }, [activeCategory, searchTerm, isFlagConfigured]);

  // Paginated flags for display
  const paginatedFlags = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredFlags.slice(startIndex, endIndex);
  }, [filteredFlags, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredFlags.length / itemsPerPage);

  // Reset to page 1 when category or search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchTerm]);

  /**
   * Handles saving a new or updated flag to the database.
   * @param {object} flagData - The data for the flag being saved.
   * @param {boolean} isNew - True if the flag is being created, false if updated.
   */
  const handleSaveFlag = async (flagData, isNew) => {
    try {
      // Normalize flag_id: allow users to enter with or without 0x, store as lowercase 0xNNN
      let normalizedFlagId = (flagData.flag_id || "").toString().trim();
      if (normalizedFlagId) {
        if (
          !normalizedFlagId.startsWith("0x") &&
          /^[0-9a-fA-F]+$/.test(normalizedFlagId)
        ) {
          normalizedFlagId = `0x${normalizedFlagId.toLowerCase()}`;
        } else {
          normalizedFlagId = normalizedFlagId.toLowerCase();
        }
      }
      // Prevent collisions with existing flags
      const collision = allFlags.find(
        (f) => f.flag_id === normalizedFlagId && f.id !== flagData.id
      );
      if (collision && isNew) {
        alert(
          `A flag with id ${normalizedFlagId} already exists: ${collision.name}. Pick a unique hex id.`
        );
        return;
      }
      if (isNew) {
        const newFlag = await Flag.create({
          ...flagData,
          flag_id: normalizedFlagId || flagData.flag_id,
          project_id: currentProject?.id || "default-project",
          is_vanilla: false,
        });
        setAllFlags((prev) => [newFlag, ...prev]);
        await ChangelogEntry.create({
          project_id: currentProject?.id || "default-project",
          module: "Flag Forge",
          action: "created",
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
          is_user_modified: Boolean(flagData.is_vanilla),
        };
        const updatedFlag = await Flag.update(flagData.id, updatedData);
        setAllFlags((prev) =>
          prev.map((f) => (f.id === flagData.id ? { ...f, ...updatedFlag } : f))
        );

        await ChangelogEntry.create({
          project_id: currentProject?.id || "default-project",
          module: "Flag Forge",
          action: "updated",
          item_name: flagData.name,
          description: `Modified flag '${flagData.name}' (${flagData.flag_id})`,
        });
      }
    } catch (_error) {
      console.error("Failed to save flag:", error);
    }
  };

  /**
   * Handles deleting a custom flag from the database.
   * @param {object} flag - The flag to delete
   */
  const handleDeleteFlag = async (flag) => {
    if (flag.is_vanilla) {
      alert(
        "Cannot delete vanilla game flags. You can only delete custom flags you've created."
      );
      return;
    }

    if (
      !confirm(
        `Are you sure you want to delete the custom flag "${flag.name}" (${flag.flag_id})? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      await Flag.delete(flag.id);
      setAllFlags((prev) => prev.filter((f) => f.id !== flag.id));

      await ChangelogEntry.create({
        project_id: currentProject?.id || "default-project",
        module: "Flag Forge",
        action: "deleted",
        item_name: flag.name,
        description: `Deleted custom flag '${flag.name}' (${flag.flag_id})`,
      });
    } catch (_error) {
      console.error("Failed to delete flag:", error);
    }
  };

  const openEditModal = (flag) => {
    setSelectedFlag(flag);
    setIsModalOpen(true);
  };

  const getStatusBadge = (flag) => {
    if (isFlagConfigured(flag) && flag.is_vanilla) {
      return (
        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30">
          Configured
        </Badge>
      );
    }
    if (flag.is_vanilla)
      return (
        <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Vanilla
        </Badge>
      );
    return (
      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
        Custom
      </Badge>
    );
  };

  const getConfigurationStats = () => {
    const customCount = allFlags.filter((f) => !f.is_vanilla).length;
    const modifiedCount = allFlags.filter(
      (f) => f.is_vanilla && isFlagConfigured(f)
    ).length;
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
          <p className="text-slate-600 dark:text-slate-400">
            Loading comprehensive flag database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <PageShell
      icon={Zap}
      iconColor="blue"
      title="Flag Forge"
      description={`Complete flag database with ${comprehensiveEmeraldFlags.length}+ verified Emerald flags (100% authoritative)`}
    >
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
            <span>
              Using local flag database due to high server load. You can browse
              and search flags, but changes won't be saved until service
              recovers.
            </span>
          </div>
        </div>
      )}

      <Card className="bg-muted/50 backdrop-blur-xl border rounded-2xl shadow-xl flag-table-container flex flex-col">
        <CardHeader className="p-4 shrink-0">
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
                  title="Search through 1545+ Pokémon Emerald flags by name, ID, category, or description"
                />
              </div>
              <div
                className="text-sm text-slate-600 dark:text-slate-400"
                title={`Displaying ${filteredFlags.length} flags from the comprehensive database of ${comprehensiveEmeraldFlags.length} total flags`}
              >
                Showing{" "}
                <span className="font-bold text-blue-400">
                  {filteredFlags.length}
                </span>{" "}
                of{" "}
                <span className="font-bold text-slate-900 dark:text-white">
                  {comprehensiveEmeraldFlags.length}
                </span>{" "}
                flags
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                title="Complete authoritative database of Pokémon Emerald flags from decomp research"
              >
                {comprehensiveEmeraldFlags.length} Total Flags
              </Badge>
              {totalPages > 1 && (
                <Badge
                  className="bg-slate-500/20 text-slate-400 border-slate-500/30"
                  title={`Page ${currentPage} of ${totalPages} (${itemsPerPage} flags per page)`}
                >
                  Page {currentPage}/{totalPages}
                </Badge>
              )}
              <Badge
                className="bg-blue-500/20 text-blue-400 border-blue-500/30"
                title="System-level flags controlling core game mechanics"
              >
                {allFlags.filter((f) => f.category === "System").length} System
              </Badge>
              <Badge
                className="bg-purple-500/20 text-purple-400 border-purple-500/30"
                title="Story progression and narrative flags"
              >
                {allFlags.filter((f) => f.category === "Story").length} Story
              </Badge>
              <Badge
                className="bg-orange-500/20 text-orange-400 border-orange-500/30"
                title="Flags you've modified or added notes to"
              >
                {stats.totalConfigured} Configured
              </Badge>
              <Badge
                className="bg-green-500/20 text-green-400 border-green-500/30"
                title="Custom flags you've created for your project"
              >
                {stats.customCount} Custom
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-4 h-full flex flex-col">
          <Tabs
            value={activeCategory}
            onValueChange={setActiveCategory}
            className="w-full flex flex-col flex-1"
          >
            <TabsList className="flag-tabs-container w-full rounded-xl p-1 mb-0 rounded-b-none shrink-0 grid grid-cols-4 sm:grid-cols-5 lg:grid-cols-6">
              {flagCategories.map((cat) => (
                <TabsTrigger
                  key={cat}
                  value={cat}
                  className="flex-1 flex items-center justify-center gap-1 px-1 py-2 text-xs font-medium"
                >
                  <span className="truncate">
                    {contextualFlagCategories[cat]?.label || cat}
                  </span>
                  {cat === "All" && (
                    <span className="ml-1 bg-blue-500/30 text-blue-300 rounded-full px-1.5 py-0.5 text-xs shrink-0">
                      {comprehensiveEmeraldFlags.length}
                    </span>
                  )}
                  {cat === "Configured" && stats.totalConfigured > 0 && (
                    <span className="ml-1 bg-orange-500/30 text-orange-300 rounded-full px-1.5 py-0.5 text-xs shrink-0">
                      {stats.totalConfigured}
                    </span>
                  )}
                </TabsTrigger>
              ))}
            </TabsList>

            <div className="flex-1 border border-slate-300 dark:border-slate-700/50 rounded-xl rounded-t-none border-t-0 bg-slate-100/50 dark:bg-slate-950/30 flag-table-container">
              <div className="h-full flag-table-wrapper">
                <Table className="flag-table-fixed">
                  <TableHeader className="sticky top-0 bg-slate-100/90 dark:bg-slate-900/90 backdrop-blur-sm">
                    <TableRow className="border-b-slate-300 dark:border-b-slate-700/50">
                      <TableHead className="text-blue-500 font-mono text-center flag-col-id">
                        Flag ID
                      </TableHead>
                      <TableHead className="text-blue-500 font-mono text-left flag-col-name">
                        Name
                      </TableHead>
                      <TableHead className="text-blue-500 font-mono text-left hidden sm:table-cell flag-col-description">
                        Description
                      </TableHead>
                      <TableHead className="text-blue-500 font-mono text-center flag-col-category">
                        Category
                      </TableHead>
                      <TableHead className="text-blue-500 font-mono text-center flag-col-status">
                        Type
                      </TableHead>
                      <TableHead className="text-blue-500 font-mono text-center flag-col-actions">
                        Edit
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredFlags.length === 0 && !isLoading ? (
                      <TableRow>
                        <TableCell
                          colSpan={6}
                          className="text-center py-8 text-slate-900 dark:text-white"
                        >
                          No flags found matching your criteria.
                        </TableCell>
                      </TableRow>
                    ) : (
                      paginatedFlags.map((flag) => (
                        <TableRow
                          key={flag.id}
                          className="border-slate-300 dark:border-slate-800/50 hover:bg-slate-200/50 dark:hover:bg-slate-800/30"
                        >
                          <TableCell className="font-bold text-slate-700 dark:text-slate-300 font-mono text-center flag-col-id">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-xs">
                                {formatFlagId(flag.flag_id || flag.value)}
                              </span>
                              {flag.is_vanilla && (
                                <span
                                  className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block"
                                  title="Vanilla Emerald flag"
                                ></span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-slate-900 dark:text-white flag-col-name">
                            <div className="flex items-center gap-2">
                              <span className="truncate flex-1">
                                {flag.name || flag.flag}
                              </span>
                              {flag.notes && flag.notes.trim().length > 0 && (
                                <span
                                  className="text-xs text-slate-400 shrink-0"
                                  title="Has user notes"
                                >
                                  [Note]
                                </span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-slate-600 dark:text-slate-400 hidden sm:table-cell overflow-hidden">
                            <Popover>
                              <PopoverTrigger asChild>
                                <div className="flex items-center gap-2 cursor-pointer group">
                                  <p className="truncate flex-1">
                                    {flag.description}
                                  </p>
                                  <MoreHorizontal className="w-4 h-4 text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white transition-colors shrink-0" />
                                </div>
                              </PopoverTrigger>
                              <PopoverContent className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white max-w-md">
                                <h4 className="font-bold mb-2">
                                  Full Description
                                </h4>
                                <p className="text-sm text-slate-600 dark:text-slate-300">
                                  {flag.description}
                                </p>
                                {flag.notes && flag.notes.trim().length > 0 && (
                                  <div className="mt-3 pt-3 border-t border-slate-300 dark:border-slate-600">
                                    <h5 className="font-semibold text-orange-400 mb-1">
                                      User Notes
                                    </h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-300">
                                      {flag.notes}
                                    </p>
                                  </div>
                                )}
                              </PopoverContent>
                            </Popover>
                          </TableCell>
                          <TableCell className="flag-col-category text-center">
                            <Badge
                              variant="outline"
                              className="text-slate-900 dark:text-white border-slate-300 dark:border-slate-600 text-xs px-2 py-0.5 truncate max-w-full"
                            >
                              {flag.category}
                            </Badge>
                          </TableCell>
                          <TableCell className="flag-col-status text-center">
                            {getStatusBadge(flag)}
                          </TableCell>
                          <TableCell className="flag-col-actions text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditModal(flag)}
                                className="h-7 w-7 p-0"
                              >
                                <Edit className="w-3 h-3 text-slate-400 hover:text-blue-400" />
                              </Button>
                              {!flag.is_vanilla && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteFlag(flag)}
                                  className="text-red-400 hover:text-red-300 h-7 w-7 p-0"
                                  title="Delete custom flag"
                                >
                                  <X className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-slate-300 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-900/20">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <span>
                    Showing {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredFlags.length)}{" "}
                    of {filteredFlags.length} filtered flags
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(1)}
                    disabled={currentPage === 1}
                    className="h-8 px-2"
                    title="First page"
                  >
                    «
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="h-8 px-2"
                    title="Previous page"
                  >
                    ‹
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2"
                    title="Next page"
                  >
                    ›
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="h-8 px-2"
                    title="Last page"
                  >
                    »
                  </Button>
                </div>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>

      <FlagEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        flag={selectedFlag}
        onSave={handleSaveFlag}
      />
    </PageShell>
  );
}
