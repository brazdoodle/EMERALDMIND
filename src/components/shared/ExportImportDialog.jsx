/**
 * ExportImportDialog - Professional export/import interface
 * Supports multiple formats, batch operations, and validation
 */

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trainerLogger } from "@/lib/logger";
import ExportImportService, {
  EXPORT_FORMATS,
  IMPORT_SOURCES,
} from "@/services/ExportImportService";
import { motion } from "framer-motion";
import {
  Database,
  Download,
  FileText,
  History,
  Package,
  RefreshCw,
  Upload,
} from "lucide-react";
import { useCallback, useState } from "react";

const ExportImportDialog = ({
  open,
  onOpenChange,
  trainers = [],
  onImportComplete = null,
  currentProject = null,
}) => {
  const [activeTab, setActiveTab] = useState("export");
  const [exportFormat, setExportFormat] = useState(EXPORT_FORMATS.JSON);
  const [importSource] = useState(IMPORT_SOURCES.JSON_FILE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState("");
  const [lastOperation, setLastOperation] = useState(null);

  // Export options
  const [exportOptions, setExportOptions] = useState({
    includeMetadata: true,
    validateBeforeExport: true,
    compressionLevel: "standard",
    customFilename: "",
    selectedTrainers: new Set(), // For batch operations
  });

  // Import options
  const [importOptions, setImportOptions] = useState({
    validateOnImport: true,
    resolveConflicts: "prompt",
    createBackup: true,
    ignoreValidationErrors: false,
  });

  const [exportImportService] = useState(() => new ExportImportService());

  // Format display information
  const formatInfo = {
    [EXPORT_FORMATS.ROM_HACK]: {
      name: "ROM Hack Data",
      description: "C/H files for direct ROM integration",
      icon: Package,
      fileExt: ".h",
      pros: ["Direct ROM integration", "Optimized for hacking"],
      cons: ["Technical format", "Requires ROM knowledge"],
    },
    [EXPORT_FORMATS.JSON]: {
      name: "JSON Data",
      description: "Structured data with full metadata",
      icon: FileText,
      fileExt: ".json",
      pros: ["Human readable", "Full metadata", "Easy to share"],
      cons: ["Larger file size"],
    },
    [EXPORT_FORMATS.CSV]: {
      name: "CSV Spreadsheet",
      description: "Tabular data for analysis",
      icon: Database,
      fileExt: ".csv",
      pros: ["Excel compatible", "Easy analysis", "Compact"],
      cons: ["Limited metadata", "Flattened structure"],
    },
    [EXPORT_FORMATS.POKEEMERALD]: {
      name: "Pokeemerald Format",
      description: "Compatible with pokeemerald decomp",
      icon: Package,
      fileExt: ".inc",
      pros: ["Decomp ready", "Professional format"],
      cons: ["Technical knowledge required"],
    },
    [EXPORT_FORMATS.BACKUP]: {
      name: "EmeraldMind Backup",
      description: "Complete application backup",
      icon: Database,
      fileExt: ".emb",
      pros: ["Full app state", "Version control", "Complete backup"],
      cons: ["App-specific format"],
    },
  };

  const handleExport = useCallback(async () => {
    setIsProcessing(true);
    setProcessingStatus("Preparing export...");

    try {
      const trainersToExport =
        exportOptions.selectedTrainers.size > 0
          ? trainers.filter((_, index) =>
              exportOptions.selectedTrainers.has(index)
            )
          : trainers;

      if (trainersToExport.length === 0) {
        throw new Error("No trainers selected for export");
      }

      setProcessingStatus(`Exporting ${trainersToExport.length} trainers...`);

      const result = await exportImportService.exportTrainers(
        trainersToExport,
        exportFormat,
        {
          ...exportOptions,
          filename: exportOptions.customFilename,
          appVersion: "0.0.6",
          appSettings: currentProject,
        }
      );

      // Create download
      const blob = new Blob([result.content], {
        type:
          formatInfo[exportFormat].fileExt === ".json"
            ? "application/json"
            : "text/plain",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setLastOperation({
        type: "export",
        success: true,
        format: exportFormat,
        count: trainersToExport.length,
        filename: result.filename,
        size: result.size,
        timestamp: new Date(),
      });

      trainerLogger.info(`Export completed: ${result.filename}`);
      setProcessingStatus(`Export completed: ${result.filename}`);
    } catch (error) {
      trainerLogger.error("Export failed:", error);
      setLastOperation({
        type: "export",
        success: false,
        error: error.message,
        timestamp: new Date(),
      });
      setProcessingStatus(`Export failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  }, [
    exportFormat,
    exportOptions,
    trainers,
    currentProject,
    exportImportService,
  ]);

  const handleFileImport = useCallback(
    async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;

      setIsProcessing(true);
      setProcessingStatus("Reading file...");

      try {
        const content = await file.text();
        setProcessingStatus("Validating import data...");

        const result = await exportImportService.importTrainers(
          content,
          importSource,
          importOptions
        );

        setLastOperation({
          type: "import",
          success: true,
          source: importSource,
          count: result.imported,
          conflicts: result.conflicts,
          filename: file.name,
          timestamp: new Date(),
        });

        if (onImportComplete) {
          onImportComplete(result);
        }

        trainerLogger.info(
          `Import completed: ${result.imported} trainers imported`
        );
        setProcessingStatus(
          `Import completed: ${result.imported} trainers imported`
        );
      } catch (error) {
        trainerLogger.error("Import failed:", error);
        setLastOperation({
          type: "import",
          success: false,
          error: error.message,
          filename: file.name,
          timestamp: new Date(),
        });
        setProcessingStatus(`Import failed: ${error.message}`);
      } finally {
        setIsProcessing(false);
        event.target.value = ""; // Reset file input
      }
    },
    [importSource, importOptions, exportImportService, onImportComplete]
  );

  const toggleTrainerSelection = (index) => {
    const newSelection = new Set(exportOptions.selectedTrainers);
    if (newSelection.has(index)) {
      newSelection.delete(index);
    } else {
      newSelection.add(index);
    }
    setExportOptions((prev) => ({ ...prev, selectedTrainers: newSelection }));
  };

  const selectAllTrainers = () => {
    setExportOptions((prev) => ({
      ...prev,
      selectedTrainers: new Set(trainers.map((_, index) => index)),
    }));
  };

  const clearTrainerSelection = () => {
    setExportOptions((prev) => ({ ...prev, selectedTrainers: new Set() }));
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const FormatCard = ({ format, isSelected, onClick }) => {
    const info = formatInfo[format];
    const Icon = info.icon;

    return (
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Card
          className={`cursor-pointer transition-all ${
            isSelected
              ? "ring-2 ring-blue-500 border-blue-300"
              : "hover:border-slate-300"
          }`}
          onClick={onClick}
        >
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Icon
                className={`w-5 h-5 mt-1 ${
                  isSelected ? "text-blue-500" : "text-slate-400"
                }`}
              />
              <div className="flex-1">
                <h4 className="font-medium text-sm">{info.name}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {info.description}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {info.pros.slice(0, 2).map((pro, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {pro}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5" />
            Professional Export/Import System
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="export" className="flex items-center gap-2">
              <Download className="w-4 h-4" />
              Export
            </TabsTrigger>
            <TabsTrigger value="import" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Import
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              History
            </TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[calc(90vh-200px)] overflow-y-auto">
            <TabsContent value="export" className="space-y-4">
              {/* Format Selection */}
              <div className="space-y-3">
                <h3 className="font-medium">Choose Export Format</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.values(EXPORT_FORMATS).map((format) => (
                    <FormatCard
                      key={format}
                      format={format}
                      isSelected={exportFormat === format}
                      onClick={() => setExportFormat(format)}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Export Options */}
              <div className="space-y-4">
                <h3 className="font-medium">Export Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="includeMetadata"
                        checked={exportOptions.includeMetadata}
                        onCheckedChange={(checked) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            includeMetadata: checked,
                          }))
                        }
                      />
                      <label htmlFor="includeMetadata" className="text-sm">
                        Include metadata and timestamps
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="validateBeforeExport"
                        checked={exportOptions.validateBeforeExport}
                        onCheckedChange={(checked) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            validateBeforeExport: checked,
                          }))
                        }
                      />
                      <label htmlFor="validateBeforeExport" className="text-sm">
                        Validate data before export
                      </label>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">
                        Custom Filename
                      </label>
                      <Input
                        placeholder="Optional custom filename"
                        value={exportOptions.customFilename}
                        onChange={(e) =>
                          setExportOptions((prev) => ({
                            ...prev,
                            customFilename: e.target.value,
                          }))
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Trainer Selection */}
              {trainers.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">
                        Trainer Selection (
                        {exportOptions.selectedTrainers.size > 0
                          ? `${exportOptions.selectedTrainers.size} selected`
                          : "All trainers"}
                        )
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={selectAllTrainers}
                        >
                          Select All
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={clearTrainerSelection}
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                    {trainers.length <= 20 && (
                      <div className="max-h-40 overflow-y-auto border rounded p-2 space-y-1">
                        {trainers.map((trainer, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 text-sm"
                          >
                            <Checkbox
                              id={`trainer-${index}`}
                              checked={exportOptions.selectedTrainers.has(
                                index
                              )}
                              onCheckedChange={() =>
                                toggleTrainerSelection(index)
                              }
                            />
                            <label
                              htmlFor={`trainer-${index}`}
                              className="flex-1"
                            >
                              {trainer.name} ({trainer.trainer_class}) -{" "}
                              {trainer.party?.length || 0} Pokemon
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              <Separator />

              {/* Export Button */}
              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleExport}
                  disabled={isProcessing || trainers.length === 0}
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                >
                  {isProcessing ? (
                    <div className="flex items-center gap-2">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Exporting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Export{" "}
                      {exportOptions.selectedTrainers.size > 0
                        ? `${exportOptions.selectedTrainers.size} Trainers`
                        : `All ${trainers.length} Trainers`}
                    </div>
                  )}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="import" className="space-y-4">
              {/* Import Options */}
              <div className="space-y-4">
                <h3 className="font-medium">Import Options</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="validateOnImport"
                        checked={importOptions.validateOnImport}
                        onCheckedChange={(checked) =>
                          setImportOptions((prev) => ({
                            ...prev,
                            validateOnImport: checked,
                          }))
                        }
                      />
                      <label htmlFor="validateOnImport" className="text-sm">
                        Validate imported data
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="createBackup"
                        checked={importOptions.createBackup}
                        onCheckedChange={(checked) =>
                          setImportOptions((prev) => ({
                            ...prev,
                            createBackup: checked,
                          }))
                        }
                      />
                      <label htmlFor="createBackup" className="text-sm">
                        Create backup before import
                      </label>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm font-medium">
                        Conflict Resolution
                      </label>
                      <Select
                        value={importOptions.resolveConflicts}
                        onValueChange={(value) =>
                          setImportOptions((prev) => ({
                            ...prev,
                            resolveConflicts: value,
                          }))
                        }
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="prompt">
                            Prompt for each conflict
                          </SelectItem>
                          <SelectItem value="overwrite">
                            Overwrite existing
                          </SelectItem>
                          <SelectItem value="skip">
                            Skip conflicting items
                          </SelectItem>
                          <SelectItem value="merge">
                            Attempt to merge
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* File Upload */}
              <div className="space-y-3">
                <h3 className="font-medium">Select File to Import</h3>
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 mx-auto text-slate-400 mb-2" />
                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                    Click to select a file or drag and drop
                  </p>
                  <input
                    type="file"
                    accept=".json,.csv,.emb,.txt"
                    onChange={handleFileImport}
                    disabled={isProcessing}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <h3 className="font-medium">Recent Operations</h3>
              {lastOperation ? (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-2 h-2 rounded-full mt-2 ${
                          lastOperation.success ? "bg-green-500" : "bg-red-500"
                        }`}
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium capitalize">
                            {lastOperation.type}
                          </span>
                          <Badge
                            variant={
                              lastOperation.success ? "default" : "destructive"
                            }
                          >
                            {lastOperation.success ? "Success" : "Failed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {lastOperation.timestamp.toLocaleString()}
                        </p>
                        {lastOperation.success ? (
                          <div className="text-xs text-slate-500 mt-2 space-y-1">
                            {lastOperation.filename && (
                              <p>File: {lastOperation.filename}</p>
                            )}
                            {lastOperation.count && (
                              <p>Trainers: {lastOperation.count}</p>
                            )}
                            {lastOperation.size && (
                              <p>Size: {formatFileSize(lastOperation.size)}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-red-600 mt-2">
                            {lastOperation.error}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <p className="text-slate-500 text-center py-8">
                  No operations yet
                </p>
              )}
            </TabsContent>
          </div>
        </Tabs>

        {/* Status Bar */}
        {processingStatus && (
          <div className="border-t pt-3">
            <div className="flex items-center gap-2 text-sm">
              {isProcessing && <RefreshCw className="w-4 h-4 animate-spin" />}
              <span
                className={isProcessing ? "text-blue-600" : "text-slate-600"}
              >
                {processingStatus}
              </span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExportImportDialog;
