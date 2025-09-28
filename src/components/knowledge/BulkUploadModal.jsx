import React, { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Upload, 
  FileText, 
  Database, 
  Table, 
  CheckCircle, 
  AlertCircle,
  X,
  Download,
  Trash2,
  Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BulkUploadModal = ({ isOpen, onClose, onBulkImport }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [processedData, setProcessedData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Handle file drag events
  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileSelect = (e) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files) => {
    setSelectedFiles(files);
    setValidationErrors([]);
    setIsProcessing(true);
    setUploadProgress(0);

    const allData = [];
    const errors = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const progress = ((i + 1) / files.length) * 100;
      setUploadProgress(progress);

      try {
        const data = await parseFile(file);
        allData.push(...data);
      } catch (_error) {
        errors.push(`${file.name}: ${error.message}`);
      }
    }

    setProcessedData(allData);
    setValidationErrors(errors);
    setIsProcessing(false);
  };

  const parseFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target.result;
          const extension = file.name.toLowerCase().split('.').pop();

          let parsed = [];
          
          switch (extension) {
            case 'json':
              parsed = parseJSON(content);
              break;
            case 'csv':
              parsed = parseCSV(content);
              break;
            case 'txt':
              parsed = parseText(content, file.name);
              break;
            default:
              throw new Error('Unsupported file format. Please use JSON, CSV, or TXT files.');
          }

          // Validate parsed data
          const validated = parsed.map((item, index) => {
            if (!item.topic || !item.content) {
              throw new Error(`Entry ${index + 1}: Topic and content are required`);
            }
            return {
              category: item.category || 'Documentation',
              topic: item.topic.toString().trim(),
              content: item.content.toString().trim(),
              keywords: Array.isArray(item.keywords) 
                ? item.keywords 
                : (item.keywords ? item.keywords.split(',').map(k => k.trim()) : [])
            };
          });

          resolve(validated);
        } catch (_error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const parseJSON = (content) => {
    const data = JSON.parse(content);
    if (Array.isArray(data)) {
      return data;
    } else if (data.entries && Array.isArray(data.entries)) {
      return data.entries;
    } else {
      return [data];
    }
  };

  const parseCSV = (content) => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length === 0) throw new Error('Empty CSV file');
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',');
      const entry = {};
      
      headers.forEach((header, index) => {
        if (values[index]) {
          entry[header] = values[index].trim();
        }
      });
      
      if (entry.topic || entry.content) {
        data.push(entry);
      }
    }
    
    return data;
  };

  const parseText = (content, filename) => {
    // Try to extract topic from filename
    const topic = filename.replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' ');
    
    // Split content into sections if it contains multiple entries
    const sections = content.split(/\n\s*\n/).filter(section => section.trim());
    
    if (sections.length === 1) {
      return [{
        topic: topic,
        content: content.trim(),
        category: 'Documentation',
        keywords: []
      }];
    }
    
    // Multiple sections - treat each as separate entry
    return sections.map((section, index) => {
      const lines = section.split('\n');
      const firstLine = lines[0].trim();
      
      return {
        topic: firstLine.length > 50 ? `${topic} - Part ${index + 1}` : firstLine,
        content: firstLine.length > 50 ? section : lines.slice(1).join('\n').trim(),
        category: 'Documentation',
        keywords: []
      };
    });
  };

  const handleBulkImport = async () => {
    if (processedData.length === 0) return;
    
    try {
      await onBulkImport(processedData);
      handleClose();
    } catch (_error) {
      console.error('Bulk import failed:', error);
      setValidationErrors([...validationErrors, `Import failed: ${error.message}`]);
    }
  };

  const handleClose = () => {
    setSelectedFiles([]);
    setProcessedData([]);
    setValidationErrors([]);
    setIsProcessing(false);
    setUploadProgress(0);
    onClose();
  };

  const removeFile = (indexToRemove) => {
    setSelectedFiles(files => files.filter((_, index) => index !== indexToRemove));
    if (selectedFiles.length === 1) {
      setProcessedData([]);
      setValidationErrors([]);
    }
  };

  const getFileIcon = (filename) => {
    const ext = filename.toLowerCase().split('.').pop();
    switch (ext) {
      case 'json': return <Database className="w-4 h-4" />;
      case 'csv': return <Table className="w-4 h-4" />;
      case 'txt': return <FileText className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const generateSampleData = () => {
    const sampleData = [
      {
        category: "Scripting",
        topic: "Basic HMA Commands",
        content: "Essential HMA scripting commands for ROM hacking...",
        keywords: ["hma", "scripting", "commands", "basics"]
      },
      {
        category: "Tools",
        topic: "Advance Map Usage",
        content: "How to use Advance Map for editing Pokemon ROM maps...",
        keywords: ["advance-map", "maps", "editing"]
      }
    ];

    const blob = new Blob([JSON.stringify(sampleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-knowledge-entries.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl text-teal-500 dark:text-teal-400 flex items-center gap-2">
            <Upload className="w-6 h-6" />
            Bulk Upload Knowledge Entries
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Instructions */}
          <Card className="bg-blue-50/50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-blue-700 dark:text-blue-400">Upload Instructions</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-blue-600 dark:text-blue-300 space-y-2">
              <p><strong>Supported formats:</strong> JSON, CSV, TXT files</p>
              <p><strong>Required fields:</strong> topic, content</p>
              <p><strong>Optional fields:</strong> category, keywords</p>
              <p><strong>Note:</strong> All uploaded entries become baseline knowledge available to all users</p>
              <div className="flex gap-2 mt-3">
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={generateSampleData}
                  className="border-blue-300 text-blue-700 hover:bg-blue-100 dark:border-blue-600 dark:text-blue-400"
                >
                  <Download className="w-3 h-3 mr-1" />
                  Download Sample
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* File Upload Area */}
          <Card 
            className={`relative border-2 border-dashed transition-all duration-200 ${
              dragActive 
                ? 'border-teal-400 bg-teal-50/50 dark:bg-teal-900/20' 
                : 'border-slate-300 dark:border-slate-600 bg-white/50 dark:bg-slate-800/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <CardContent className="p-8 text-center">
              {selectedFiles.length === 0 ? (
                <>
                  <Upload className="w-12 h-12 mx-auto mb-4 text-slate-400" />
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Drop files here or click to browse
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 mb-4">
                    Upload JSON, CSV, or TXT files containing knowledge entries
                  </p>
                  <Button 
                    onClick={() => fileInputRef.current?.click()}
                    className="bg-teal-600 hover:bg-teal-700 text-white"
                  >
                    Select Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".json,.csv,.txt"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </>
              ) : (
                <div className="space-y-3">
                  <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                    Selected Files ({selectedFiles.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-slate-100 dark:bg-slate-800 rounded">
                        <div className="flex items-center gap-2">
                          {getFileIcon(file.name)}
                          <span className="text-sm font-medium">{file.name}</span>
                          <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Progress */}
          {isProcessing && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 border-2 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
                  <span className="text-sm font-medium">Processing files...</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </CardContent>
            </Card>
          )}

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <Card className="bg-red-50/50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg text-red-700 dark:text-red-400 flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Validation Errors
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1">
                {validationErrors.map((error, index) => (
                  <p key={index} className="text-sm text-red-600 dark:text-red-300">{error}</p>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Preview Results */}
          {processedData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Preview - {processedData.length} entries found
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 max-h-60 overflow-y-auto">
                {processedData.slice(0, 10).map((entry, index) => (
                  <div key={index} className="p-3 bg-slate-100 dark:bg-slate-800 rounded">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{entry.topic}</h4>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="text-xs">
                          {entry.category}
                        </Badge>
                        <Badge className="text-xs bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          Baseline
                        </Badge>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">
                      {entry.content}
                    </p>
                    {entry.keywords.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {entry.keywords.map((keyword, i) => (
                          <Badge key={i} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {processedData.length > 10 && (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400">
                    ... and {processedData.length - 10} more entries
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex justify-between pt-4">
            <Button
              onClick={handleClose}
              variant="outline"
              className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <div className="flex gap-3">
              {processedData.length > 0 && (
                <Button
                  onClick={handleBulkImport}
                  className="bg-teal-600 hover:bg-teal-700 text-white"
                  disabled={isProcessing || validationErrors.length > 0}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Import {processedData.length} Entries
                </Button>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkUploadModal;