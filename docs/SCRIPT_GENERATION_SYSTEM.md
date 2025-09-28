# Script Generation System Documentation

## Overview

The Script Generation System is a comprehensive framework for generating, validating, and managing HMA (Hex Maniac Advance) scripts for Pokemon ROM hacking. The system provides intelligent script generation, template management, and validation to ensure proper script syntax and functionality.

## Architecture

### Core Components

1. **ScriptGenerator** (`src/lib/scriptGenerator.js`)
   - Main orchestration layer for script generation
   - Coordinates AI generation with template systems
   - Handles validation and quality assurance

2. **HMAScriptGenerator** (`src/lib/hmaScriptGenerator.js`)
   - HMA-specific script generation logic
   - Template management and pattern matching
   - Flag and variable auto-assignment

3. **ScriptAnalyzer** (`src/lib/scriptAnalyzer.js`)
   - Script parsing and analysis capabilities
   - Quality assessment and validation
   - Structure detection and optimization suggestions

4. **HMAScriptValidator** (`src/lib/hmaScriptValidator.js`)
   - Syntax validation for HMA scripts
   - Command verification and parameter checking
   - Auto-correction for common script issues

5. **CommandRegistry** (`src/lib/commandRegistry.js`)
   - Maintains database of valid HMA commands
   - Provides command documentation and examples
   - Supports confidence scoring for command usage

## Script Generation Process

### 1. Request Analysis
```javascript
const request = {
  type: "trainer_battle",
  description: "Create script for gym leader battle with victory flag",
  context: {
    trainer_id: "TRAINER_BROCK",
    victory_flag: "FLAG_DEFEATED_BROCK",
    location: "Pewter Gym"
  }
};
```

### 2. Template Selection
The system automatically selects appropriate templates based on:
- Script type and complexity
- Available context information
- User preferences and project settings
- Historical success patterns

### 3. AI Generation
```javascript
const scriptPrompt = buildPrompt({
  template: selectedTemplate,
  context: enhancedContext,
  examples: relevantExamples,
  constraints: validationRules
});

const generatedScript = await InvokeLLM({
  prompt: scriptPrompt,
  task: 'scriptSage',
  consistency_level: CONSISTENCY_LEVELS.BALANCED
});
```

### 4. Validation and Cleanup
- Syntax validation against HMA standards
- Command verification using CommandRegistry
- Flag and variable reference validation
- Auto-correction of common formatting issues

## Template System

### Built-in Templates

#### Basic NPC Interaction
```hma
#org @start
lock
faceplayer
msgbox @msg MSG_NORMAL
release
end

#org @msg
= Hello! I'm a friendly NPC.
```

#### Trainer Battle
```hma
#org @start
lock
faceplayer
checkflag [TRAINER_DEFEATED_FLAG]
if 0x1 goto @already_defeated
msgbox @challenge MSG_NORMAL
trainerbattle 0x0 [TRAINER_ID] 0x0 @win @lose
setflag [TRAINER_DEFEATED_FLAG]
goto @already_defeated

#org @challenge
= Prepare for battle!

#org @win  
= You won! Take this badge.

#org @lose
= Better luck next time!

#org @already_defeated
msgbox @after_battle MSG_NORMAL
release
end

#org @after_battle
= Thanks for the great battle!
```

#### Item Distribution
```hma
#org @start
lock
faceplayer
checkflag [ITEM_RECEIVED_FLAG]
if 0x1 goto @already_received
msgbox @offer MSG_YESNO
compare LASTRESULT 0x1
if 0x1 goto @give_item
msgbox @declined MSG_NORMAL
release
end

#org @give_item
giveitem [ITEM_ID] 0x1
setflag [ITEM_RECEIVED_FLAG]
msgbox @received MSG_NORMAL
release
end

#org @offer
= Would you like this item?

#org @give_item
= Here you go!

#org @declined  
= Maybe next time.

#org @already_received
= Hope that item is useful!

#org @received
= Enjoy your new item!
```

### Template Categories

1. **NPC Interactions**
   - Basic dialogue
   - Information providers
   - Shop assistants
   - Quest givers

2. **Battle Scripts**
   - Trainer battles
   - Wild Pokemon encounters
   - Gym leader challenges
   - Elite Four encounters

3. **Item Management**
   - Item distribution
   - Shop interactions
   - Treasure chests
   - Hidden items  

4. **Story Events**
   - Cutscenes
   - Plot advancement
   - Character interactions
   - Location transitions

5. **Utility Scripts**
   - Teleporters
   - Doors and warps
   - Environmental interactions
   - System functions

## Command Registry

### Command Classification
```javascript
const commandTypes = {
  FLOW_CONTROL: ["if", "goto", "call", "return", "end"],
  PLAYER_INTERACTION: ["lock", "release", "faceplayer", "msgbox"],
  BATTLE_COMMANDS: ["trainerbattle", "wildbattle", "setwildbattle"],
  FLAG_MANAGEMENT: ["setflag", "clearflag", "checkflag"],
  VARIABLE_OPERATIONS: ["setvar", "addvar", "subvar", "copyvar"],
  ITEM_COMMANDS: ["giveitem", "removeitem", "checkitem"],
  MOVEMENT: ["applymovement", "waitmovement"],
  AUDIO: ["playse", "playbgm", "fadedefaultbgm"],
  VISUAL: ["showsprite", "hidesprite", "movesprite"]
};
```

### Confidence Scoring
Commands are scored based on usage context:
```javascript
const confidenceScores = {
  DOCUMENTED: 1.0,      // Full documentation available
  COMMON_USAGE: 0.8,    // Frequently used, well-tested  
  STANDARD: 0.6,        // Standard command, occasional use
  GENERATED: 0.5,       // Generated description
  EXPERIMENTAL: 0.3,    // Limited testing/documentation
  UNKNOWN: 0.1          // Minimal information available
};
```

## Script Analysis

### Structure Detection
The analyzer identifies common script patterns:
```javascript
const scriptStructures = {
  LINEAR_DIALOGUE: {
    pattern: /lock.*faceplayer.*msgbox.*release.*end/s,
    quality_score: 0.7,
    suggestions: ["Consider adding conditional branches"]
  },
  TRAINER_BATTLE: {
    pattern: /trainerbattle.*setflag.*goto/s,
    quality_score: 0.9,
    suggestions: ["Standard trainer battle pattern"]
  },
  COMPLEX_BRANCHING: {
    pattern: /checkflag.*if.*goto/s,
    quality_score: 0.8,
    suggestions: ["Well-structured conditional logic"]
  }
};
```

### Quality Metrics
- **Syntax Correctness**: Valid HMA commands and structure
- **Logic Flow**: Proper branching and termination
- **Flag Usage**: Appropriate flag management  
- **Resource Management**: Proper lock/release pairs
- **Code Organization**: Clear structure and readability

### Auto-Correction Features
```javascript
const autoCorrections = {
  MISSING_END: "Add 'end' command to script termination",
  UNMATCHED_LOCK: "Add 'release' before 'end' to match 'lock'",
  INVALID_FLAG: "Replace with valid flag reference",
  MISSING_LABELS: "Add required message labels",
  SYNTAX_ERRORS: "Fix command parameter formatting"
};
```

## Integration with UI

### ScriptSage Interface
The system provides a comprehensive script editing environment:

1. **Live Generation**: Real-time script creation with AI assistance
2. **Template Browser**: Access to categorized script templates  
3. **Syntax Highlighting**: HMA-aware code highlighting
4. **Error Detection**: Real-time validation with error markers
5. **Auto-Completion**: Command and parameter suggestions
6. **Project Integration**: Scripts saved to active project

### Workflow
1. **Template Selection**: Choose from categorized templates
2. **Parameter Configuration**: Set flags, variables, and IDs
3. **AI Enhancement**: Generate or enhance script content
4. **Validation**: Real-time syntax and logic checking
5. **Testing**: Preview script behavior and flow
6. **Export**: Save to project or export as .rbc file

## Flag and Variable Management

### Auto-Assignment System
```javascript
class FlagManager {
  assignFlags(script, projectFlags) {
    const requiredFlags = extractFlagReferences(script);
    const assignments = {};
    
    for (const flagName of requiredFlags) {
      if (!projectFlags.has(flagName)) {
        assignments[flagName] = this.getNextAvailableFlag();
      }
    }
    
    return assignments;
  }
}
```

### Flag Categories
- **Story Flags**: Main plot progression markers
- **Trainer Flags**: Battle completion indicators  
- **Item Flags**: Item distribution tracking
- **Event Flags**: Special event completion
- **System Flags**: Internal system states

### Variable Types
- **Story Variables**: Plot progression counters
- **Player Variables**: Player state tracking
- **Temporary Variables**: Short-term calculations
- **System Variables**: ROM-specific functionality

## Validation System

### Syntax Validation
```javascript
const syntaxRules = {
  COMMAND_FORMAT: /^[a-zA-Z][a-zA-Z0-9_]*(\s+[^\s]+)*$/,
  LABEL_FORMAT: /^@[a-zA-Z][a-zA-Z0-9_]*$/,
  FLAG_FORMAT: /^(0x[0-9A-Fa-f]+|FLAG_[A-Z0-9_]+)$/,
  VARIABLE_FORMAT: /^(0x[0-9A-Fa-f]+|VAR_[A-Z0-9_]+)$/
};
```

### Logic Validation
- **Control Flow**: Ensure proper branching and returns
- **Resource Management**: Match lock/release pairs
- **Flag Consistency**: Verify flag usage patterns
- **Label References**: Validate all goto/call targets
- **Parameter Counts**: Check command parameter requirements

### Performance Validation
- **Script Length**: Warn about excessively long scripts
- **Nested Depth**: Alert for deep nesting levels
- **Resource Usage**: Monitor flag and variable consumption
- **Optimization Opportunities**: Suggest code improvements

## Advanced Features

### Batch Generation
```javascript
const batchGenerate = async (requests) => {
  const scripts = [];
  for (const request of requests) {
    const script = await generateScript(request);
    scripts.push(await validateScript(script));
  }
  return scripts;
};
```

### Template Customization
Users can create custom templates:
```javascript
const customTemplate = {
  name: "My Custom NPC",
  category: "NPC Interactions",
  template: templateString,
  parameters: ["npc_name", "dialogue_flag", "message"],
  examples: [exampleUsage]
};
```

### Export Formats
- **HMA Script**: Direct .rbc compilation format
- **Commented**: Human-readable with explanations
- **Minimal**: Stripped of comments for size optimization
- **Project Format**: Integrated with project structure

## Performance Optimizations

### Caching Strategy
```javascript
const caches = {
  templates: new Map(),      // Template definitions
  commands: new Map(),       // Command documentation  
  validations: new Map(),    // Validation results
  generations: new Map()     // Recent generations
};
```

### Lazy Loading
- Templates loaded on demand by category
- Command documentation fetched as needed
- Validation rules applied incrementally
- Generation history maintained in session

### Batch Operations
- Multiple script validation in single pass
- Bulk template processing
- Project-wide flag analysis
- Mass export operations

## Error Handling

### Generation Failures
```javascript
const errorRecovery = {
  TEMPLATE_NOT_FOUND: () => fallbackToBasicTemplate(),
  AI_GENERATION_FAILED: () => useTemplateDefaults(),
  VALIDATION_ERRORS: (errors) => applyAutoCorrection(errors),
  RESOURCE_EXHAUSTION: () => requestUserIntervention()
};
```

### User Feedback
- Clear error messages with context
- Suggested corrections and alternatives
- Visual indicators for problematic areas
- Progressive enhancement from basic to advanced features

## Best Practices

### Script Design
1. **Clear Structure**: Use consistent organization patterns
2. **Proper Resource Management**: Always match lock/release
3. **Meaningful Labels**: Use descriptive label names
4. **Flag Efficiency**: Minimize flag usage where possible
5. **Comment Appropriately**: Document complex logic

### Performance Considerations
1. **Script Length**: Keep scripts reasonably sized
2. **Nesting Levels**: Avoid excessive nested conditionals
3. **Resource Usage**: Monitor flag and variable consumption
4. **Optimization**: Use efficient command sequences

### Integration Guidelines
1. **Project Consistency**: Follow project naming conventions
2. **Flag Management**: Use project flag registry
3. **Testing**: Validate scripts in ROM environment
4. **Documentation**: Maintain script purpose documentation

## Future Enhancements

### Planned Features
- **Visual Script Editor**: Drag-and-drop script building
- **Advanced AI**: Context-aware generation improvements  
- **Debugging Tools**: Script execution tracing and debugging
- **Version Control**: Script versioning and diff capabilities
- **Collaboration**: Multi-user script development
- **Advanced Templates**: Dynamic template generation

### Extensibility
The system supports:
- **Custom Command Definitions**: Extend command registry
- **Plugin Templates**: Third-party template integration
- **Validation Extensions**: Custom validation rules
- **Export Formats**: Additional output format support
- **AI Model Integration**: Support for different AI providers