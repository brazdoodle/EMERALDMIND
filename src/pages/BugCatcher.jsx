import { ChangelogEntry } from "@/api/entities";
import EntityErrorHandler from "@/components/shared/EntityErrorHandler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppState } from "@/lib/appState.jsx";
import { motion } from "framer-motion";
import { Filter, GitCommit, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

export default function BugCatcher() {
  const { state } = useAppState();
  const currentProject = state.currentProject;

  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const loadChangelog = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      let changelogEntries;
      if (currentProject?.id) {
        // Load entries scoped to the current project
        changelogEntries = await ChangelogEntry.filter({
          project_id: currentProject.id,
        });
        // Sort by created_date descending
        changelogEntries.sort(
          (a, b) => new Date(b.created_date) - new Date(a.created_date)
        );
      } else {
        // Fallback to all entries if no project is selected
        changelogEntries = await ChangelogEntry.list("-created_date");
      }
      setEntries(changelogEntries);
    } catch (error) {
      console.error("Error loading changelog:", error);
      setLoadError(error);
    } finally {
      setIsLoading(false);
    }
  }, [currentProject?.id]);

  useEffect(() => {
    loadChangelog();
  }, [loadChangelog]);

  const retryLoad = () => {
    loadChangelog();
  };

  const actionColors = {
    created: "bg-green-500/20 text-green-400",
    updated: "bg-blue-500/20 text-blue-400",
    deleted: "bg-red-500/20 text-red-400",
    generated: "bg-purple-500/20 text-purple-400",
  };

  return (
    <div className="p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-light text-slate-900 dark:text-white mb-2 tracking-tight flex items-center gap-3">
              <GitCommit className="w-7 h-7 text-orange-400" />
              Bug Catcher
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-400 font-light ml-10">
              A comprehensive changelog and activity feed for your project.
            </p>
          </motion.div>
        </header>

        <Card className="bg-muted/50 backdrop-blur-sm border rounded-2xl shadow-xl">
          <CardHeader className="flex flex-row items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              Project History
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                className="border-orange-500/50 text-orange-400 hover:bg-orange-500/10"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search logs..."
                  className="bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg pl-9 pr-3 py-1.5 text-sm w-64 text-slate-900 dark:text-white"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-6 h-6 border-2 border-orange-400/30 border-t-orange-400 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-400">
                  Loading project history...
                </p>
              </div>
            ) : loadError ? (
              <EntityErrorHandler
                error={loadError}
                entityName="Changelog"
                onRetry={retryLoad}
              />
            ) : (
              <div className="space-y-4">
                {entries.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800/50"
                  >
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={`${
                            actionColors[entry.action] ||
                            "bg-slate-500/20 text-slate-400"
                          } uppercase`}
                        >
                          {entry.action}
                        </Badge>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {entry.item_name}
                        </span>
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          in {entry.module}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(entry.created_date).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 ml-3 pl-3 border-l-2 border-slate-200 dark:border-slate-700">
                      {entry.description}
                    </p>
                  </div>
                ))}
                {entries.length === 0 && (
                  <div className="text-center py-12 text-slate-500 dark:text-slate-400">
                    <p>No activity has been logged for this project yet.</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
