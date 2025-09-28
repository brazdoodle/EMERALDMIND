# API Documentation

## Overview

EmeraldMind's API layer provides a comprehensive interface for managing Pokemon ROM hacking data, AI-powered content generation, and project management. The API is designed around entity models, service layers, and integration points that work together to provide a seamless development experience.

## Core Entities

### Trainer Entity
Represents a Pokemon trainer with team, battle behavior, and metadata.

#### Schema
```javascript
{
  id: "uuid",                    // Unique identifier
  name: "Trainer Name",          // Display name
  trainer_class: "Youngster",    // Trainer classification
  level_min: 10,                 // Minimum level range
  level_max: 15,                 // Maximum level range
  party: [                       // Pokemon team
    {
      species: "pikachu",         // Pokemon species name
      level: 12,                  // Individual level
      moves: ["thunderbolt", "quick-attack", "tail-whip", "growl"],
      ability: "static",          // Pokemon ability
      nature: "jolly",            // Nature modifier
      item: "oran_berry"          // Held item
    }
  ],
  ai_flags: 0x23,                // Battle AI behavior flags
  defeat_flag: "FLAG_TRAINER_1", // Flag set when defeated
  victory_script: "@victory",    // Script executed on win
  defeat_script: "@defeat",      // Script executed on loss
  project_id: "project_uuid",    // Associated project
  created_date: "2024-01-01T00:00:00Z",
  modified_date: "2024-01-01T00:00:00Z"
}
```

#### Methods

##### `Trainer.create(data)`
Creates a new trainer instance.
```javascript
const trainer = await Trainer.create({
  name: "Youngster Joey",
  trainer_class: "Youngster",
  level_min: 4,
  level_max: 4,
  party: [{ species: "rattata", level: 4 }],
  project_id: currentProject.id
});
```

##### `Trainer.list(sortOrder?, filters?)`
Retrieves trainers with optional sorting and filtering.
```javascript
// Get all trainers sorted by creation date
const trainers = await Trainer.list('-created_date');

// Get trainers for specific project
const projectTrainers = await Trainer.list(null, { 
  project_id: project.id 
});
```

##### `Trainer.update(id, data)`
Updates an existing trainer.
```javascript
await Trainer.update(trainer.id, {
  name: "Elite Joey",
  trainer_class: "Ace Trainer",
  level_min: 50,
  level_max: 55
});
```

##### `Trainer.delete(id)`
Removes a trainer from storage.
```javascript
await Trainer.delete(trainer.id);
```

##### `Trainer.export(id, format?)`
Exports trainer data in specified format.
```javascript
const hmaScript = await Trainer.export(trainer.id, 'hma');
const jsonData = await Trainer.export(trainer.id, 'json');
```

### Script Entity
Represents HMA scripts for ROM functionality.

#### Schema
```javascript
{
  id: "uuid",
  name: "Script Name",
  content: "#org @start\nlock\nfaceplayer\n...",
  script_type: "npc_interaction",    // Script category
  complexity: "basic",               // Complexity level
  flags_used: ["FLAG_EXAMPLE"],      // Referenced flags
  variables_used: ["VAR_TEMP"],      // Referenced variables
  validation_status: "valid",        // Validation result
  quality_score: 0.85,              // Quality assessment
  project_id: "project_uuid",
  created_date: "2024-01-01T00:00:00Z",
  modified_date: "2024-01-01T00:00:00Z"
}
```

#### Methods

##### `Script.create(data)`
Creates a new script with validation.
```javascript
const script = await Script.create({
  name: "Gym Leader Battle",
  content: hmaScriptContent,
  script_type: "trainer_battle",
  project_id: currentProject.id
});
```

##### `Script.analyze(content)`
Analyzes script quality and structure.
```javascript
const analysis = await Script.analyze(scriptContent);
// Returns: { quality_score, validation_errors, suggestions, complexity }
```

##### `Script.validate(content)`
Validates HMA script syntax.
```javascript
const validation = await Script.validate(scriptContent);
// Returns: { valid, errors, warnings, auto_corrections }
```

### Flag Entity
Represents ROM flags for state management.

#### Schema
```javascript
{
  id: "uuid",
  name: "FLAG_DEFEATED_BROCK",
  key: "FLAG_DEFEATED_BROCK",
  flag_id: "0x4B0",               // Hex flag ID
  description: "Set when Brock is defeated",
  category: "Trainer Flags",
  used_by: ["script_uuid"],       // Scripts using this flag
  project_id: "project_uuid",    
  is_system: false,               // System vs user flag
  created_date: "2024-01-01T00:00:00Z"
}
```

#### Methods

##### `Flag.create(data)`
Creates a new flag definition.
```javascript
const flag = await Flag.create({
  name: "FLAG_GOT_POKEDEX",
  description: "Player received Pokedex",
  category: "Story Flags",
  project_id: currentProject.id
});
```

##### `Flag.getAvailable(project_id)`
Gets available flags for assignment.
```javascript
const availableFlags = await Flag.getAvailable(project.id);
```

##### `Flag.assignAuto(flagNames, project_id)`
Automatically assigns flag IDs.
```javascript
const assignments = await Flag.assignAuto([
  "FLAG_NEW_TRAINER_1",
  "FLAG_NEW_TRAINER_2"
], project.id);
```

## Service Layer APIs

### PokemonService
Comprehensive Pokemon data management.

#### Methods

##### `PokemonService.getPokemonDetails(identifier)`
Retrieves complete Pokemon information.
```javascript
const pokemon = await PokemonService.getPokemonDetails("pikachu");
// Returns: { name, dex_number, types, stats, evolution, habitat, moves }
```

##### `PokemonService.searchPokemon(query, filters?)`
Searches Pokemon with filters.
```javascript
const results = await PokemonService.searchPokemon("fire", {
  generation: 3,
  biome: "Desert",
  min_bst: 400
});
```

##### `PokemonService.getEvolutionChain(pokemon)`
Gets complete evolution information.
```javascript
const chain = await PokemonService.getEvolutionChain("charmander");
// Returns: [{ name: "charmander", evolves_to: "charmeleon", level: 16 }, ...]
```

##### `PokemonService.getBiomePokemon(biomes, generation?)`
Gets Pokemon for specific habitats.
```javascript
const forestPokemon = await PokemonService.getBiomePokemon(
  ["Forest", "Grassland"], 
  3
);
```

##### `PokemonService.validateTeam(team, constraints?)`
Validates team composition.
```javascript
const validation = await PokemonService.validateTeam(team, {
  maxLevel: 50,
  allowLegendaries: false,
  requiredTypes: ["Water"]
});
```

### Gen3TeamGenerator
Authentic Generation 3 trainer team generation.

#### Methods

##### `Gen3TeamGenerator.generateTeam(config)`
Generates a complete trainer team.
```javascript
const team = await Gen3TeamGenerator.generateTeam({
  trainerClass: "Ace Trainer",
  levelMin: 45,
  levelMax: 50,
  biomes: ["Forest", "Mountain"],
  teamSize: 5,
  pokedexScope: "gen3_only"
});
```

##### `Gen3TeamGenerator.getTrainerPreferences(trainerClass)`
Gets preferences for trainer class.
```javascript
const prefs = Gen3TeamGenerator.getTrainerPreferences("Gym Leader");
// Returns: { preferredTypes, evolutionPreference, baseStatRange, ... }
```

##### `Gen3TeamGenerator.validateTrainer(trainer)`
Validates trainer authenticity.
```javascript
const validation = await Gen3TeamGenerator.validateTrainer(trainerData);
// Returns: { authentic, issues, suggestions, score }
```

### ScriptGenerator
AI-powered HMA script generation.

#### Methods

##### `ScriptGenerator.generateScript(request)`
Generates HMA script from description.
```javascript
const script = await ScriptGenerator.generateScript({
  type: "trainer_battle",
  description: "Gym leader with post-battle dialogue",
  context: {
    trainer_name: "Brock",
    victory_flag: "FLAG_DEFEATED_BROCK",
    badge_item: "ITEM_BOULDER_BADGE"
  }
});
```

##### `ScriptGenerator.getTemplates(category?)`
Retrieves available script templates.
```javascript
const templates = await ScriptGenerator.getTemplates("npc_interaction");
```

##### `ScriptGenerator.analyzeScript(content)`
Analyzes script structure and quality.
```javascript
const analysis = await ScriptGenerator.analyzeScript(scriptContent);
// Returns: { structure, quality_score, suggestions, complexity }
```

## AI Integration API

### InvokeLLM
Central AI integration function with consistency guarantees.

#### Signature
```javascript
InvokeLLM(options)
```

#### Options
```javascript
{
  prompt: string,                    // Generation prompt
  model: string,                     // Model identifier
  response_json_schema?: object,     // Expected JSON structure
  consistency_level?: string,        // STRICT|BALANCED|LENIENT|LEGACY
  task_type?: string,               // trainer|script|text
  max_attempts?: number,            // Override attempt limit
  enable_validation?: boolean,      // Toggle validation
  enable_repair?: boolean,          // Toggle auto-repair
  enable_model_adaptation?: boolean, // Toggle model optimization
  debug_consistency?: boolean,      // Enable debug logging
  temperature?: number,             // Generation temperature
  max_tokens?: number,              // Token limit
  signal?: AbortSignal,             // Cancellation signal
  add_context_from_app?: boolean    // Include app context
}
```

#### Examples

##### Basic Text Generation
```javascript
const response = await InvokeLLM({
  prompt: "Describe a Pokemon battle",
  model: "llama3.1:8b",
  consistency_level: CONSISTENCY_LEVELS.LENIENT
});
```

##### Trainer Generation
```javascript
const trainer = await InvokeLLM({
  prompt: "Create a Bug Catcher with 3 Pokemon",
  model: "qwen2.5-coder:7b",
  response_json_schema: trainerSchema,
  consistency_level: CONSISTENCY_LEVELS.BALANCED,
  task_type: 'trainer'
});
```

##### Script Generation
```javascript
const script = await InvokeLLM({
  prompt: "Generate NPC dialogue script",
  model: "qwen2.5-coder:7b",
  task: 'scriptSage',
  consistency_level: CONSISTENCY_LEVELS.STRICT,
  debug_consistency: true
});
```

## Project Management API

### Project Structure
```javascript
{
  id: "uuid",
  name: "My ROM Hack",
  description: "Custom Pokemon adventure",
  version: "1.0.0",
  rom_base: "emerald",
  settings: {
    generation_scope: "gen3_only",
    difficulty_scaling: "authentic",
    ai_model: "qwen2.5-coder:7b"
  },
  created_date: "2024-01-01T00:00:00Z",
  modified_date: "2024-01-01T00:00:00Z"
}
```

### Project Methods

##### `createProject(data)`
Creates a new project workspace.
```javascript
const project = await createProject({
  name: "Fire Red Remake",
  description: "Enhanced Fire Red experience",
  rom_base: "firered"
});
```

##### `getProject(id)`
Retrieves project data.
```javascript
const project = await getProject(projectId);
```

##### `updateProject(id, data)`
Updates project configuration.
```javascript
await updateProject(project.id, {
  settings: {
    ...project.settings,
    difficulty_scaling: "enhanced"
  }
});
```

##### `exportProject(id, format?)`
Exports complete project data.
```javascript
const projectData = await exportProject(project.id, 'json');
const romPatch = await exportProject(project.id, 'ups');
```

## Validation APIs

### Schema Validation
Comprehensive data validation using JSON schemas.

```javascript
import { validateTrainer, validateScript, validateFlag } from '@/lib/validation';

// Trainer validation
const trainerValidation = validateTrainer(trainerData);
if (!trainerValidation.valid) {
  console.error('Trainer validation failed:', trainerValidation.errors);
}

// Script validation  
const scriptValidation = validateScript(scriptContent);
if (scriptValidation.warnings.length > 0) {
  console.warn('Script warnings:', scriptValidation.warnings);
}

// Flag validation
const flagValidation = validateFlag(flagData);
```

### Consistency Validation
AI output validation and repair.

```javascript
import { OutputValidator } from '@/lib/consistency/OutputValidators';

// JSON validation
const jsonValidation = OutputValidator.validate(output, 'json', {
  schema: expectedSchema
});

// Script validation
const scriptValidation = OutputValidator.validate(output, 'hma_script', {
  flagMap: projectFlags
});
```

## Error Handling

### Error Types
```javascript
class APIError extends Error {
  constructor(message, code, context) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.context = context;
  }
}

// Error codes
const ERROR_CODES = {
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  GENERATION_FAILED: 'GENERATION_FAILED',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  SYSTEM_ERROR: 'SYSTEM_ERROR'
};
```

### Error Handling Patterns
```javascript
try {
  const trainer = await Trainer.create(trainerData);
} catch (error) {
  if (error.code === 'VALIDATION_FAILED') {
    // Handle validation errors
    displayValidationErrors(error.context.errors);
  } else if (error.code === 'GENERATION_FAILED') {
    // Handle generation failures
    showGenerationFallback();
  } else {
    // Handle unexpected errors
    logError(error);
    showGenericError();
  }
}
```

## Performance Considerations

### Caching
Intelligent caching for expensive operations:
```javascript
// Pokemon data caching
const pokemonCache = new Map();
const getCachedPokemon = (identifier) => {
  if (!pokemonCache.has(identifier)) {
    pokemonCache.set(identifier, PokemonService.getPokemonDetails(identifier));
  }
  return pokemonCache.get(identifier);
};

// Generation result caching
const generationCache = new Map();
const getCachedGeneration = (cacheKey, generator) => {
  if (!generationCache.has(cacheKey)) {
    generationCache.set(cacheKey, generator());
  }
  return generationCache.get(cacheKey);
};
```

### Batch Operations
Optimize multiple operations:
```javascript
// Batch trainer creation
const trainers = await Promise.all(
  trainerConfigs.map(config => Trainer.create(config))
);

// Batch validation
const validations = await Promise.all(
  scripts.map(script => Script.validate(script.content))
);
```

### Streaming Operations
Handle large datasets efficiently:
```javascript
// Stream processing for large exports
const exportStream = await Project.exportStream(project.id);
for await (const chunk of exportStream) {
  processChunk(chunk);
}
```

## Authentication and Security

### Local Authentication
Simple authentication for multi-user scenarios:
```javascript
// Set current user context
setCurrentUser({
  id: "user_uuid",
  name: "Developer Name",
  preferences: userPreferences
});

// Access control
const canModifyProject = (project, user) => {
  return project.owner_id === user.id || project.collaborators.includes(user.id);
};
```

### Data Sanitization
Input sanitization for security:
```javascript
import { sanitizeInput, validateScriptContent } from '@/lib/security';

// Sanitize user input
const safeName = sanitizeInput(userInput.name);
const safeScript = validateScriptContent(userInput.script);
```

## Rate Limiting

### AI Operation Limits
Prevent excessive AI usage:
```javascript
const rateLimiter = {
  maxRequestsPerHour: 100,
  maxRequestsPerMinute: 10,
  
  async checkLimit(operation) {
    const usage = await getUserUsage();
    if (usage.hourly >= this.maxRequestsPerHour) {
      throw new Error('Hourly limit exceeded');
    }
    if (usage.minutely >= this.maxRequestsPerMinute) {
      throw new Error('Rate limit exceeded');
    }
  }
};
```

## Monitoring and Analytics

### Performance Tracking
Monitor API performance:
```javascript
const performanceTracker = {
  trackOperation(operation, duration, success) {
    console.log(`${operation}: ${duration}ms, success: ${success}`);
  },
  
  trackError(operation, error) {
    console.error(`${operation} failed:`, error);
  }
};
```

### Usage Analytics
Track feature usage:
```javascript
const analytics = {
  trackGeneration(type, success, metadata) {
    // Track generation usage
  },
  
  trackExport(format, size) {
    // Track export operations
  }
};
```

## Future API Enhancements

### Planned Features
- **Real-time Collaboration**: Multi-user project editing
- **Version Control**: Project versioning and history
- **Plugin System**: Third-party extension support
- **Cloud Sync**: Cross-device synchronization
- **Advanced Search**: Semantic search across projects
- **Batch Processing**: Large-scale operation support

### Integration Roadmap
- **ROM File Processing**: Direct ROM manipulation
- **Asset Management**: Sprite and audio handling
- **Testing Framework**: Automated ROM testing
- **Deployment Tools**: ROM distribution and patching
- **Community Features**: Project sharing and collaboration