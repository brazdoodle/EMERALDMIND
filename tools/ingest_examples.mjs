#!/usr/bin/env node
// Example Script Ingestion Tool
// Scans example files, extracts commands, and updates the command registry

import { existsSync, mkdirSync, readFileSync, readdirSync, statSync } from "fs";
import { basename, dirname, extname, join } from "path";
import { fileURLToPath } from "url";

// Import our utilities
import { getCommandRegistry } from "../src/lib/commandRegistry.js";
import {
  extractScriptFromModelOutput,
  sanitizeGeneratedScript,
} from "../src/lib/llmUtils.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PROJECT_ROOT = join(__dirname, "..");

// Configuration
const CONFIG = {
  examplesDir: join(PROJECT_ROOT, "tmp", "examples"),
  fallbackDirs: [join(PROJECT_ROOT, "tmp"), PROJECT_ROOT],
  supportedExtensions: [".txt", ".hma", ".script", ".asm"],
  outputReport: join(PROJECT_ROOT, "tmp", "ingestion_report.json"),
  batchSize: 10,
  verbose: true,
};

class ExampleIngester {
  constructor(config = CONFIG) {
    this.config = { ...CONFIG, ...config };
    this.registry = getCommandRegistry();
    this.stats = {
      filesProcessed: 0,
      commandsFound: 0,
      newCommands: 0,
      errors: [],
      startTime: new Date(),
      endTime: null,
    };
    this.commandUsage = new Map(); // Track command frequency
  }

  // Find all example files to process
  findExampleFiles() {
    const files = [];

    // Check configured examples directory first
    if (existsSync(this.config.examplesDir)) {
      this.walkDirectory(this.config.examplesDir, files);
    }

    // Fallback to scanning other directories
    if (files.length === 0) {
      for (const dir of this.config.fallbackDirs) {
        const fallbackFiles = this.findFilesInDirectory(dir, [
          "*_sample.txt",
          "*.hma",
          "*.script",
        ]);
        files.push(...fallbackFiles);
      }
    }

    if (this.config.verbose) {
      console.log(`Found ${files.length} example files to process`);
      files.forEach((f) => console.log(`  - ${f}`));
    }

    return files;
  }

  // Recursively walk directory for supported files
  walkDirectory(dir, files) {
    try {
      const entries = readdirSync(dir);

      for (const entry of entries) {
        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);

        if (stat.isDirectory() && !entry.startsWith(".")) {
          this.walkDirectory(fullPath, files);
        } else if (stat.isFile() && this.isSupportedFile(entry)) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      this.stats.errors.push(
        `Failed to read directory ${dir}: ${error.message}`
      );
    }
  }

  // Find specific files in directory
  findFilesInDirectory(dir, patterns) {
    const files = [];

    try {
      if (!existsSync(dir)) return files;

      const entries = readdirSync(dir);

      for (const pattern of patterns) {
        for (const entry of entries) {
          if (this.matchesPattern(entry, pattern)) {
            const fullPath = join(dir, entry);
            if (statSync(fullPath).isFile()) {
              files.push(fullPath);
            }
          }
        }
      }
    } catch (error) {
      this.stats.errors.push(
        `Failed to scan directory ${dir}: ${error.message}`
      );
    }

    return files;
  }

  // Check if file is supported for ingestion
  isSupportedFile(filename) {
    const ext = extname(filename).toLowerCase();
    return this.config.supportedExtensions.includes(ext);
  }

  // Simple pattern matching (supports * wildcards)
  matchesPattern(filename, pattern) {
    if (pattern === filename) return true;
    if (!pattern.includes("*")) return false;

    const regex = new RegExp("^" + pattern.replace(/\*/g, ".*") + "$", "i");
    return regex.test(filename);
  }

  // Process a single example file
  async processFile(filePath) {
    try {
      const content = readFileSync(filePath, "utf8");
      const filename = basename(filePath);

      if (this.config.verbose) {
        console.log(`\nProcessing: ${filename}`);
      }

      // Extract and sanitize script content
      const extracted = extractScriptFromModelOutput(content);
      if (!extracted || extracted.trim().length === 0) {
        this.stats.errors.push(`No script content found in ${filename}`);
        return { commands: [], dialogBlocks: [] };
      }

      const { text: sanitized, unknownCommands } = sanitizeGeneratedScript(
        extracted,
        1
      );

      // Extract commands from sanitized script
      const commands = this.extractCommands(sanitized, filename);

      // Extract dialog blocks for context
      const dialogBlocks = this.extractDialogBlocks(sanitized);

      // Update registry with found commands
      let newCommands = 0;
      for (const cmdInfo of commands) {
        const existingCmd = this.registry.getCommand(cmdInfo.command);
        const isNew = !existingCmd;

        const commandData = {
          id: cmdInfo.command,
          command: cmdInfo.command,
          syntax: cmdInfo.syntax || cmdInfo.command,
          description:
            existingCmd?.description || `Command found in ${filename}`,
          category: this.registry.inferCategory(cmdInfo.command),
          confidence: existingCmd ? Math.max(existingCmd.confidence, 0.4) : 0.3,
          sources: [filename],
          examples: cmdInfo.examples || [],
          params: cmdInfo.params || [],
          aliases: [],
          relatedCommands: [],
          usage: {
            count: cmdInfo.usage || 1,
            lastUsed: new Date().toISOString(),
          },
        };

        this.registry.addCommand(commandData);

        if (isNew) newCommands++;

        // Track usage frequency
        const count = this.commandUsage.get(cmdInfo.command) || 0;
        this.commandUsage.set(cmdInfo.command, count + (cmdInfo.usage || 1));
      }

      this.stats.filesProcessed++;
      this.stats.commandsFound += commands.length;
      this.stats.newCommands += newCommands;

      if (this.config.verbose) {
        console.log(`  Found ${commands.length} commands (${newCommands} new)`);
        console.log(`  Dialog blocks: ${dialogBlocks.length}`);
      }

      return { commands, dialogBlocks, newCommands };
    } catch (error) {
      this.stats.errors.push(`Failed to process ${filePath}: ${error.message}`);
      return { commands: [], dialogBlocks: [] };
    }
  }

  // Ensure registry is loaded from disk (Node only)
  async ensureRegistryLoaded() {
    if (this.registry && typeof this.registry.loadFromDisk === "function") {
      await this.registry.loadFromDisk();
    }
  }

  // Extract command information from script text
  extractCommands(scriptText, source) {
    const commands = [];
    const lines = scriptText.split(/\r?\n/);
    let inBrace = false;
    let inMovementBlock = false;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Track brace blocks (dialog)
      if (line === "{" || line.startsWith("{")) {
        inBrace = true;
        continue;
      }
      if (line === "}" || line.endsWith("}")) {
        inBrace = false;
        continue;
      }
      if (inBrace) continue;

      // Skip section headers
      if (/^section\d*:/i.test(line)) continue;

      // Skip comments and labels
      if (line.startsWith("#") || line.startsWith("@") || line.startsWith("//"))
        continue;

      // Detect movement blocks
      if (
        line.includes("walk_") ||
        line.includes("face_") ||
        line.includes("delay")
      ) {
        inMovementBlock = true;
        continue;
      }

      // Extract command
      const cmdMatch = line.match(/^([a-z][a-z0-9_.]*)\b/i);
      if (cmdMatch) {
        const command = cmdMatch[1].toLowerCase();

        // Parse full syntax and parameters
        const syntax = line;
        const params = this.parseCommandParams(line, command);

        // Look for usage examples in surrounding context
        const examples = this.findCommandExamples(lines, i, command);

        commands.push({
          command,
          syntax,
          params,
          examples,
          usage: 1,
          context: {
            line: i + 1,
            surrounding: lines.slice(Math.max(0, i - 2), i + 3),
            inMovementBlock,
          },
        });

        inMovementBlock = false;
      }
    }

    return commands;
  }

  // Parse command parameters from syntax
  parseCommandParams(line, command) {
    const params = [];
    const parts = line.split(/\s+/).slice(1); // Skip command name

    parts.forEach((part, index) => {
      if (!part) return;

      const param = {
        index,
        value: part,
        type: this.inferParamType(part),
        required: true,
      };

      params.push(param);
    });

    return params;
  }

  // Infer parameter type from value
  inferParamType(value) {
    if (/^0x[0-9A-Fa-f]+$/.test(value)) return "hex";
    if (/^\d+$/.test(value)) return "int";
    if (/^var\d*$/i.test(value)) return "var";
    if (/^@\w+$/.test(value)) return "label";
    if (/^<.*>$/.test(value)) return "reference";
    if (value.includes(".")) return "qualified";
    return "string";
  }

  // Find additional examples of command usage
  findCommandExamples(lines, currentIndex, command) {
    const examples = [];

    // Look for other instances of this command
    for (let i = 0; i < lines.length; i++) {
      if (i === currentIndex) continue;

      const line = lines[i].trim();
      if (
        line.toLowerCase().startsWith(command + " ") ||
        line.toLowerCase() === command
      ) {
        examples.push(line);
      }
    }

    return examples.slice(0, 3); // Limit to 3 examples
  }

  // Extract dialog blocks for contextual understanding
  extractDialogBlocks(scriptText) {
    const blocks = [];
    const lines = scriptText.split(/\r?\n/);
    let currentBlock = null;

    for (const line of lines) {
      const trimmed = line.trim();

      if (trimmed === "{" || trimmed.startsWith("{")) {
        currentBlock = { lines: [], context: "dialog" };
      } else if (trimmed === "}" || trimmed.endsWith("}")) {
        if (currentBlock && currentBlock.lines.length > 0) {
          blocks.push({
            ...currentBlock,
            text: currentBlock.lines.join("\n").trim(),
          });
        }
        currentBlock = null;
      } else if (currentBlock) {
        currentBlock.lines.push(trimmed);
      }
    }

    return blocks;
  }

  // Generate comprehensive ingestion report
  generateReport() {
    this.stats.endTime = new Date();
    this.stats.duration = this.stats.endTime - this.stats.startTime;

    const registryStats = this.registry.getStats();

    const report = {
      ingestion: this.stats,
      registry: registryStats,
      topCommands: Array.from(this.commandUsage.entries())
        .sort(([, a], [, b]) => b - a)
        .slice(0, 20)
        .map(([cmd, count]) => ({ command: cmd, usageCount: count })),
      recommendations: this.generateRecommendations(),
    };

    // Save report to file
    try {
      const reportDir = dirname(this.config.outputReport);
      if (!existsSync(reportDir)) {
        mkdirSync(reportDir, { recursive: true });
      }

      import("fs").then((fs) => {
        fs.writeFileSync(
          this.config.outputReport,
          JSON.stringify(report, null, 2)
        );
        console.log(`\nIngestion report saved to: ${this.config.outputReport}`);
      });
    } catch (error) {
      console.warn("Failed to save report:", error.message);
    }

    return report;
  }

  // Generate recommendations for improving the registry
  generateRecommendations() {
    const recommendations = [];
    const commands = this.registry.getAllCommands();

    // Find commands with low confidence that need review
    const lowConfidenceCommands = commands.filter(
      (cmd) => cmd.confidence < 0.5
    );
    if (lowConfidenceCommands.length > 0) {
      recommendations.push({
        type: "review_needed",
        message: `${lowConfidenceCommands.length} commands have low confidence and need review`,
        commands: lowConfidenceCommands.slice(0, 10).map((cmd) => cmd.command),
      });
    }

    // Find commands without examples
    const noExamplesCommands = commands.filter(
      (cmd) => cmd.examples.length === 0
    );
    if (noExamplesCommands.length > 0) {
      recommendations.push({
        type: "add_examples",
        message: `${noExamplesCommands.length} commands need usage examples`,
        commands: noExamplesCommands.slice(0, 10).map((cmd) => cmd.command),
      });
    }

    // Find commands with generic descriptions
    const genericDescCommands = commands.filter(
      (cmd) =>
        cmd.description.includes("Command found in") ||
        cmd.description.startsWith("HMA command:")
    );
    if (genericDescCommands.length > 0) {
      recommendations.push({
        type: "improve_descriptions",
        message: `${genericDescCommands.length} commands have generic descriptions`,
        commands: genericDescCommands.slice(0, 10).map((cmd) => cmd.command),
      });
    }

    return recommendations;
  }

  // Main ingestion process
  async ingest() {
    console.log("Starting HMA command ingestion...\n");
    // Ensure the registry has loaded persisted data when available
    if (typeof this.ensureRegistryLoaded === "function") {
      await this.ensureRegistryLoaded();
    }

    const files = this.findExampleFiles();
    if (files.length === 0) {
      console.log("No example files found to process.");
      console.log("Place example scripts in:", this.config.examplesDir);
      return null;
    }

    // Process files in batches
    for (let i = 0; i < files.length; i += this.config.batchSize) {
      const batch = files.slice(i, i + this.config.batchSize);

      const batchPromises = batch.map((file) => this.processFile(file));
      await Promise.all(batchPromises);

      if (this.config.verbose && files.length > this.config.batchSize) {
        console.log(
          `Processed batch ${
            Math.floor(i / this.config.batchSize) + 1
          }/${Math.ceil(files.length / this.config.batchSize)}`
        );
      }
    }

    // Save updated registry (use async saveToDisk when available)
    if (this.registry && typeof this.registry.saveToDisk === "function") {
      await this.registry.saveToDisk();
    } else if (this.registry && typeof this.registry.save === "function") {
      // fallback for older interfaces
      try {
        this.registry.save();
      } catch (e) {
        /* ignore */
      }
    }

    // Generate and display report
    const report = this.generateReport();

    console.log("\n=== INGESTION COMPLETE ===");
    console.log(`Files processed: ${this.stats.filesProcessed}`);
    console.log(`Commands found: ${this.stats.commandsFound}`);
    console.log(`New commands: ${this.stats.newCommands}`);
    console.log(`Total registry size: ${report.registry.total}`);
    console.log(`Errors: ${this.stats.errors.length}`);

    if (this.stats.errors.length > 0) {
      console.log("\nErrors encountered:");
      this.stats.errors.forEach((error) => console.log(`  - ${error}`));
    }

    if (report.recommendations.length > 0) {
      console.log("\nRecommendations:");
      report.recommendations.forEach((rec) => {
        console.log(`  - ${rec.type}: ${rec.message}`);
      });
    }

    return report;
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const config = { ...CONFIG };

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case "--examples-dir":
        config.examplesDir = args[++i];
        break;
      case "--quiet":
        config.verbose = false;
        break;
      case "--batch-size":
        config.batchSize = parseInt(args[++i]) || config.batchSize;
        break;
      case "--help":
        console.log(`
HMA Command Ingestion Tool

Usage: node tools/ingest_examples.mjs [options]

Options:
  --examples-dir <path>   Directory containing example scripts (default: tmp/examples)
  --batch-size <num>      Number of files to process simultaneously (default: 10)
  --quiet                 Suppress verbose output
  --help                  Show this help message

The tool will scan for supported files (.txt, .hma, .script, .asm) and extract
HMA commands to build/update the command registry.
        `);
        process.exit(0);
        break;
    }
  }

  const ingester = new ExampleIngester(config);

  try {
    await ingester.ingest();
  } catch (error) {
    console.error("Ingestion failed:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { CONFIG as DEFAULT_CONFIG, ExampleIngester };
