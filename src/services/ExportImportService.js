/**
 * Professional Export/Import System for EmeraldMind
 * Supports multiple formats, batch operations, and version control
 */

import { trainerLogger } from "../lib/logger";
import { ValidationEngine } from "../lib/validation/ValidationEngine";

// Export formats supported by the system
export const EXPORT_FORMATS = {
  ROM_HACK: "rom-hack",
  JSON: "json",
  CSV: "csv",
  POKEEMERALD: "pokeemerald",
  BACKUP: "backup",
};

// Import sources and validation
export const IMPORT_SOURCES = {
  JSON_FILE: "json-file",
  CSV_FILE: "csv-file",
  ROM_EXTRACT: "rom-extract",
  BACKUP_RESTORE: "backup-restore",
};

export class ExportImportService {
  constructor() {
    this.validationEngine = new ValidationEngine();
    this.exportHistory = [];
    this.importHistory = [];
  }

  /**
   * Export trainers in multiple formats with comprehensive validation
   */
  async exportTrainers(trainers, format, options = {}) {
    const {
      includeMetadata = true,
      validateBeforeExport = true,
      compressionLevel = "standard",
      batchSize = 50,
      filename = null,
    } = options;

    try {
      trainerLogger.info(
        `Starting export of ${trainers.length} trainers in ${format} format`
      );

      // Pre-export validation
      if (validateBeforeExport) {
        const validationResults = await this.validateTrainersForExport(
          trainers
        );
        if (validationResults.hasErrors) {
          throw new Error(
            `Export validation failed: ${validationResults.errorSummary}`
          );
        }
      }

      // Process trainers in batches for large datasets
      const exportData = await this.processTrainersInBatches(
        trainers,
        batchSize,
        format
      );

      // Generate export based on format
      let result;
      switch (format) {
        case EXPORT_FORMATS.ROM_HACK:
          result = await this.exportAsRomHack(exportData, options);
          break;
        case EXPORT_FORMATS.JSON:
          result = await this.exportAsJSON(exportData, options);
          break;
        case EXPORT_FORMATS.CSV:
          result = await this.exportAsCSV(exportData, options);
          break;
        case EXPORT_FORMATS.POKEEMERALD:
          result = await this.exportAsPokeemerald(exportData, options);
          break;
        case EXPORT_FORMATS.BACKUP:
          result = await this.exportAsBackup(exportData, options);
          break;
        default:
          throw new Error(`Unsupported export format: ${format}`);
      }

      // Add to export history
      this.exportHistory.push({
        timestamp: new Date().toISOString(),
        format,
        trainerCount: trainers.length,
        filename: filename || result.filename,
        size: result.size,
        success: true,
      });

      trainerLogger.info(`Export completed successfully: ${result.filename}`);
      return result;
    } catch (error) {
      trainerLogger.error("Export failed:", error);
      this.exportHistory.push({
        timestamp: new Date().toISOString(),
        format,
        trainerCount: trainers.length,
        success: false,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Import trainers with comprehensive validation and conflict resolution
   */
  async importTrainers(source, format, options = {}) {
    const {
      validateOnImport = true,
      resolveConflicts = "prompt", // 'overwrite', 'skip', 'merge', 'prompt'
      createBackup = true,
      batchSize = 50,
    } = options;

    try {
      trainerLogger.info(`Starting import from ${format} format`);

      // Create backup before import if requested
      if (createBackup) {
        await this.createImportBackup();
      }

      // Parse import data based on format
      let importData;
      switch (format) {
        case IMPORT_SOURCES.JSON_FILE:
          importData = await this.parseJSONImport(source);
          break;
        case IMPORT_SOURCES.CSV_FILE:
          importData = await this.parseCSVImport(source);
          break;
        case IMPORT_SOURCES.ROM_EXTRACT:
          importData = await this.parseRomExtract(source);
          break;
        case IMPORT_SOURCES.BACKUP_RESTORE:
          importData = await this.parseBackupRestore(source);
          break;
        default:
          throw new Error(`Unsupported import format: ${format}`);
      }

      // Validate imported data
      if (validateOnImport) {
        const validationResults = await this.validateImportedData(importData);
        if (validationResults.hasErrors && !options.ignoreValidationErrors) {
          throw new Error(
            `Import validation failed: ${validationResults.errorSummary}`
          );
        }
      }

      // Process conflicts
      const processedData = await this.resolveImportConflicts(
        importData,
        resolveConflicts
      );

      // Import in batches
      const importResults = await this.processImportInBatches(
        processedData,
        batchSize
      );

      // Add to import history
      this.importHistory.push({
        timestamp: new Date().toISOString(),
        format,
        source: typeof source === "string" ? source : "file-upload",
        trainerCount: importResults.imported,
        conflicts: importResults.conflicts,
        success: true,
      });

      trainerLogger.info(
        `Import completed: ${importResults.imported} trainers imported`
      );
      return importResults;
    } catch (error) {
      trainerLogger.error("Import failed:", error);
      this.importHistory.push({
        timestamp: new Date().toISOString(),
        format,
        source: typeof source === "string" ? source : "file-upload",
        success: false,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Export trainers as ROM hack compatible format
   */
  async exportAsRomHack(trainers, options = {}) {
    const romHackData = {
      version: "1.0.0",
      target_rom: options.targetRom || "pokeemerald",
      trainers: trainers.map((trainer) => ({
        trainer_class: trainer.trainer_class,
        trainer_pic: trainer.trainer_pic || "TRAINER_PIC_YOUNGSTER",
        trainer_name: trainer.name,
        items: trainer.items || [],
        double_battle: trainer.double_battle || false,
        ai_flags: trainer.ai_flags || [
          "AI_FLAG_CHECK_BAD_MOVE",
          "AI_FLAG_TRY_TO_FAINT",
        ],
        party: trainer.party.map((pokemon) => ({
          level: pokemon.level,
          species: pokemon.species,
          item: pokemon.item || "ITEM_NONE",
          moves: pokemon.moves || [
            "MOVE_NONE",
            "MOVE_NONE",
            "MOVE_NONE",
            "MOVE_NONE",
          ],
          ability: pokemon.ability || 0,
          gender: pokemon.gender || "MON_GENDERLESS",
          nature: pokemon.nature || "NATURE_HARDY",
          iv: pokemon.iv || 0,
          ev: pokemon.ev || [0, 0, 0, 0, 0, 0],
        })),
      })),
    };

    const content = this.generateRomHackCode(romHackData);
    const filename = `trainers_${Date.now()}.h`;

    return {
      content,
      filename,
      size: content.length,
      format: EXPORT_FORMATS.ROM_HACK,
    };
  }

  /**
   * Export trainers as structured JSON with metadata
   */
  async exportAsJSON(trainers, options = {}) {
    const jsonData = {
      metadata: {
        version: "1.0.0",
        export_date: new Date().toISOString(),
        trainer_count: trainers.length,
        emeraldmind_version: options.appVersion || "0.0.6",
        export_options: options,
      },
      trainers: trainers.map((trainer) => ({
        ...trainer,
        export_timestamp: new Date().toISOString(),
        validation_status: "exported", // Could include validation results
      })),
    };

    const content = JSON.stringify(jsonData, null, 2);
    const filename = `emeraldmind_trainers_${Date.now()}.json`;

    return {
      content,
      filename,
      size: content.length,
      format: EXPORT_FORMATS.JSON,
    };
  }

  /**
   * Export trainers as CSV for spreadsheet analysis
   */
  async exportAsCSV(trainers, _options = {}) {
    const headers = [
      "Name",
      "Class",
      "Difficulty",
      "Theme",
      "Biomes",
      "Level Min",
      "Level Max",
      "Party Size",
      "Team Types",
      "BST Average",
      "Created Date",
    ];

    const rows = trainers.map((trainer) => [
      trainer.name,
      trainer.trainer_class,
      trainer.difficulty,
      trainer.theme,
      (trainer.biomes || []).join(";"),
      trainer.level_min,
      trainer.level_max,
      trainer.party?.length || 0,
      this.getTeamTypes(trainer.party).join(";"),
      this.calculateAverageBST(trainer.party),
      trainer.created_date || new Date().toISOString(),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const filename = `emeraldmind_trainers_${Date.now()}.csv`;

    return {
      content: csvContent,
      filename,
      size: csvContent.length,
      format: EXPORT_FORMATS.CSV,
    };
  }

  /**
   * Generate pokeemerald compatible trainer data
   */
  async exportAsPokeemerald(trainers, options = {}) {
    const pokeemeraldData = trainers
      .map((trainer) => {
        return `[TRAINER_${trainer.name.toUpperCase().replace(/\s+/g, "_")}] = {
    .trainerClass = TRAINER_CLASS_${trainer.trainer_class.toUpperCase()},
    .encounterMusic_gender = TRAINER_ENCOUNTER_MUSIC_MALE,
    .trainerPic = TRAINER_PIC_${trainer.trainer_class.toUpperCase()},
    .trainerName = _("${trainer.name}"),
    .items = {},
    .doubleBattle = ${trainer.double_battle ? "TRUE" : "FALSE"},
    .aiFlags = ${this.formatAIFlags(trainer.ai_flags)},
    .party = TRAINER_PARTY(${trainer.party
      .map((p) => this.formatPokemonEntry(p))
      .join(", ")})
}`;
      })
      .join(",\n\n");

    const content = `// Generated by EmeraldMind v${
      options.appVersion || "0.0.6"
    }
// Export Date: ${new Date().toISOString()}
// Trainer Count: ${trainers.length}

${pokeemeraldData}`;

    const filename = `trainers_pokeemerald_${Date.now()}.inc`;

    return {
      content,
      filename,
      size: content.length,
      format: EXPORT_FORMATS.POKEEMERALD,
    };
  }

  /**
   * Create comprehensive backup with version control
   */
  async exportAsBackup(trainers, options = {}) {
    const backupData = {
      backup_info: {
        version: "1.0.0",
        backup_date: new Date().toISOString(),
        emeraldmind_version: options.appVersion || "0.0.6",
        backup_type: options.backupType || "manual",
        trainer_count: trainers.length,
      },
      application_settings: options.appSettings || {},
      trainers,
      export_history: this.exportHistory.slice(-10),
      import_history: this.importHistory.slice(-10),
    };

    const content = JSON.stringify(backupData, null, 2);
    const filename = `emeraldmind_backup_${Date.now()}.emb`;

    return {
      content,
      filename,
      size: content.length,
      format: EXPORT_FORMATS.BACKUP,
    };
  }

  /**
   * Validate trainers before export
   */
  async validateTrainersForExport(trainers) {
    const results = {
      hasErrors: false,
      hasWarnings: false,
      errors: [],
      warnings: [],
      errorSummary: "",
      warningSummary: "",
    };

    for (let i = 0; i < trainers.length; i++) {
      const trainer = trainers[i];
      try {
        const trainerValidation = await this.validationEngine.validateTrainer(
          trainer
        );
        const teamValidation = await this.validationEngine.validateTeam(
          trainer.party
        );

        if (!trainerValidation.valid) {
          results.hasErrors = true;
          results.errors.push({
            trainerIndex: i,
            trainerName: trainer.name,
            issues: trainerValidation.issues,
          });
        }

        if (!teamValidation.valid) {
          results.hasErrors = true;
          results.errors.push({
            trainerIndex: i,
            trainerName: trainer.name,
            issues: teamValidation.issues,
          });
        }

        // Collect warnings
        if (trainerValidation.warnings?.length > 0) {
          results.hasWarnings = true;
          results.warnings.push({
            trainerIndex: i,
            trainerName: trainer.name,
            warnings: trainerValidation.warnings,
          });
        }

        if (teamValidation.warnings?.length > 0) {
          results.hasWarnings = true;
          results.warnings.push({
            trainerIndex: i,
            trainerName: trainer.name,
            warnings: teamValidation.warnings,
          });
        }
      } catch (error) {
        results.hasErrors = true;
        results.errors.push({
          trainerIndex: i,
          trainerName: trainer.name,
          error: error.message,
        });
      }
    }

    results.errorSummary = `${results.errors.length} trainers with validation errors`;
    results.warningSummary = `${results.warnings.length} trainers with warnings`;

    return results;
  }

  /**
   * Process trainers in batches to handle large datasets
   */
  async processTrainersInBatches(trainers, batchSize, _format) {
    const processed = [];

    for (let i = 0; i < trainers.length; i += batchSize) {
      const batch = trainers.slice(i, i + batchSize);
      trainerLogger.info(
        `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
          trainers.length / batchSize
        )}`
      );

      // Add any batch-specific processing here
      const processedBatch = batch.map((trainer) => ({
        ...trainer,
        batch_id: Math.floor(i / batchSize),
        batch_position: i % batchSize,
      }));

      processed.push(...processedBatch);

      // Small delay to prevent UI blocking
      await new Promise((resolve) => setTimeout(resolve, 10));
    }

    return processed;
  }

  // Helper methods for formatting
  generateRomHackCode(data) {
    return `// ROM Hack Trainer Data
// Generated by EmeraldMind
// Version: ${data.version}

${data.trainers
  .map(
    (trainer) => `
// ${trainer.trainer_name}
{
  .trainerClass = ${trainer.trainer_class},
  .trainerName = "${trainer.trainer_name}",
  .party = {
${trainer.party
  .map((p) => `    {.level = ${p.level}, .species = ${p.species}}`)
  .join(",\n")}
  }
}`
  )
  .join(",\n")}`;
  }

  formatAIFlags(flags = []) {
    if (!flags || flags.length === 0) return "AI_FLAG_CHECK_BAD_MOVE";
    return flags.join(" | ");
  }

  formatPokemonEntry(pokemon) {
    return `{
      .level = ${pokemon.level},
      .species = SPECIES_${pokemon.species.toUpperCase()},
      .moves = {${(pokemon.moves || [])
        .map((m) => `MOVE_${m.toUpperCase()}`)
        .join(", ")}}
    }`;
  }

  getTeamTypes(party = []) {
    const types = new Set();
    party.forEach((pokemon) => {
      if (pokemon.types) {
        pokemon.types.forEach((type) => types.add(type));
      }
    });
    return Array.from(types);
  }

  calculateAverageBST(party = []) {
    if (party.length === 0) return 0;
    const totalBST = party.reduce((sum, pokemon) => {
      return sum + (pokemon.bst || 0);
    }, 0);
    return Math.round(totalBST / party.length);
  }
}

export default ExportImportService;
