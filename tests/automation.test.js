// Comprehensive Test Suite for Script Generation Pipeline
// Tests for sanitizer, command registry, script generator, and active learning

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
  extractScriptFromModelOutput, 
  sanitizeGeneratedScript, 
  buildScriptGenPrompt,
  describeUnknownCommand 
} from '../src/lib/llmUtils.js';
import { CommandRegistry, getCommandRegistry } from '../src/lib/commandRegistry.js';
import { ScriptGenerator, getScriptGenerator } from '../src/lib/scriptGenerator.js';
import { ActiveLearningWorkflow } from '../src/lib/activeLearning.js';

// Mock quickQuery function for testing
const mockQuickQuery = async (prompt, options = {}) => {
  if (prompt.includes('describe')) {
    return 'Mock AI description for command';
  }
  
  return `
\`\`\`
section1: # 000000
faceplayer
msgbox @test_message MSG_NORMAL
release
end
\`\`\`
  `;
};

describe('Script Sanitizer', () => {
  it('should extract script from fenced code blocks', () => {
    const input = `
Here's your script:

\`\`\`
faceplayer
msgbox @test MSG_NORMAL
release
end
\`\`\`

That should work!
    `;
    
    const result = extractScriptFromModelOutput(input);
    expect(result).toContain('faceplayer');
    expect(result).toContain('msgbox @test MSG_NORMAL');
    expect(result).toContain('end');
  });

  it('should preserve brace block spacing', () => {
    const input = `
faceplayer
msgbox @text MSG_NORMAL
{
Hello there!

This is a multi-line message.
}
release
end
    `;
    
    const result = extractScriptFromModelOutput(input);
    expect(result).toContain('Hello there!');
    expect(result).toContain('This is a multi-line message.');
  });

  it('should remove JSON and streaming tokens', () => {
    const input = `
{"thinking": "I need to create a script"}
\`\`\`
faceplayer
msgbox @text MSG_NORMAL
release
end
\`\`\`
[DONE]
    `;
    
    const result = extractScriptFromModelOutput(input);
    expect(result).not.toContain('thinking');
    expect(result).not.toContain('[DONE]');
    expect(result).toContain('faceplayer');
  });

  it('should sanitize and identify unknown commands', () => {
    const input = `
faceplayer
unknowncommand param1 param2
msgbox @text MSG_NORMAL
anotherbadcommand
release
end
    `;
    
    const { text, unknownCommands } = sanitizeGeneratedScript(input, 1);
    
    expect(text).toContain('section1: # 000000');
    expect(text).toContain('faceplayer');
    expect(text).toContain('end');
    expect(unknownCommands).toContain('unknowncommand');
    expect(unknownCommands).toContain('anotherbadcommand');
    expect(unknownCommands).not.toContain('faceplayer');
    expect(unknownCommands).not.toContain('msgbox');
  });

  it('should not inject dynamic header by default', () => {
    const input = 'faceplayer\nmsgbox @text MSG_NORMAL\nrelease';
    const { text } = sanitizeGeneratedScript(input, 1);
    
    expect(text).not.toContain('#dynamic 0x800000');
    expect(text).toContain('section1: # 000000');
    expect(text).toContain('end'); // Should add trailing end
  });
});

describe('Command Registry', () => {
  let registry;

  beforeEach(() => {
    registry = new CommandRegistry(':memory:'); // Use in-memory registry for tests
  });

  afterEach(() => {
    registry.clear();
  });

  it('should initialize with default commands', () => {
    const commands = registry.getAllCommands();
    expect(commands.length).toBeGreaterThan(0);
    expect(commands.some(cmd => cmd.command === 'faceplayer')).toBe(true);
    expect(commands.some(cmd => cmd.command === 'msgbox')).toBe(true);
    expect(commands.some(cmd => cmd.command === 'release')).toBe(true);
  });

  it('should add and retrieve commands', () => {
    const testCommand = {
      id: 'testcmd',
      command: 'testcmd',
      syntax: 'testcmd param1 param2',
      description: 'Test command for unit tests',
      category: 'core',
      confidence: 0.9,
      sources: ['test'],
      examples: ['testcmd 1 2']
    };

    registry.addCommand(testCommand);
    const retrieved = registry.getCommand('testcmd');
    
    expect(retrieved).toBeDefined();
    expect(retrieved.command).toBe('testcmd');
    expect(retrieved.description).toBe('Test command for unit tests');
    expect(retrieved.confidence).toBe(0.9);
  });

  it('should search commands by query', () => {
    const results = registry.searchCommands('face');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].command).toContain('face');
  });

  it('should categorize commands correctly', () => {
    const category = registry.inferCategory('setflag');
    expect(category).toBe('flags');
    
    const battleCategory = registry.inferCategory('single.battle.continue.silent');
    expect(battleCategory).toBe('battle');
  });

  it('should merge duplicate commands', () => {
    const cmd1 = {
      id: 'mergecmd',
      command: 'mergecmd',
      description: 'First description',
      confidence: 0.5,
      sources: ['source1']
    };

    const cmd2 = {
      id: 'mergecmd',
      command: 'mergecmd',
      description: 'Second description',
      confidence: 0.8,
      sources: ['source2']
    };

    registry.addCommand(cmd1);
    registry.addCommand(cmd2);
    
    const merged = registry.getCommand('mergecmd');
    expect(merged.confidence).toBe(0.8); // Should take higher confidence
    expect(merged.sources).toContain('source1');
    expect(merged.sources).toContain('source2');
  });

  it('should validate registry integrity', () => {
    const validation = registry.validate();
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
  });

  it('should export commands in different formats', () => {
    const jsonExport = registry.exportCommands('json');
    expect(() => JSON.parse(jsonExport)).not.toThrow();
    
    const csvExport = registry.exportCommands('csv');
    expect(csvExport).toContain('command,syntax,description');
    
    const mdExport = registry.exportCommands('markdown');
    expect(mdExport).toContain('# HMA Command Reference');
  });
});

describe('Script Generator', () => {
  let generator;

  beforeEach(() => {
    generator = new ScriptGenerator();
  });

  it('should get relevant commands for presets', () => {
    const commands = generator.getRelevantCommands('basic_npc');
    expect(commands.length).toBeGreaterThan(0);
    expect(commands.some(cmd => cmd.command === 'faceplayer')).toBe(true);
    expect(commands.some(cmd => cmd.command === 'msgbox')).toBe(true);
  });

  it('should validate generation requirements', () => {
    const validation = generator.validateGenerationRequirements('basic_npc', mockQuickQuery);
    expect(validation.valid).toBe(true);
    expect(validation.issues).toHaveLength(0);
    
    const badValidation = generator.validateGenerationRequirements('nonexistent_preset', null);
    expect(badValidation.valid).toBe(false);
    expect(badValidation.issues.length).toBeGreaterThan(0);
  });

  it('should generate scripts successfully', async () => {
    const result = await generator.generateScript({
      preset: 'basic_npc',
      quality: 'FAST',
      quickQuery: mockQuickQuery,
      includeAnalysis: false
    });

    expect(result.success).toBe(true);
    expect(result.script.sanitized).toContain('faceplayer');
    expect(result.script.sanitized).toContain('end');
    expect(result.metadata.generationTime).toBeGreaterThan(0);
  });

  it('should handle generation failures gracefully', async () => {
    const failingQuery = async () => {
      throw new Error('Mock failure');
    };

    const result = await generator.generateScript({
      preset: 'basic_npc',
      quickQuery: failingQuery
    });

    expect(result.success).toBe(false);
    expect(result.error).toContain('Mock failure');
  });

  it('should track generation statistics', async () => {
    const statsBefore = generator.getStats();
    
    await generator.generateScript({
      preset: 'basic_npc',
      quickQuery: mockQuickQuery
    });
    
    const statsAfter = generator.getStats();
    expect(statsAfter.totalGenerated).toBe(statsBefore.totalGenerated + 1);
  });

  it('should build enhanced prompts with context', () => {
    const commands = generator.getRelevantCommands('basic_npc', 5);
    const templates = [];
    
    const prompt = generator.enhancePromptWithContext(
      'basic_npc', 
      'Base prompt', 
      commands, 
      templates
    );
    
    expect(prompt).toContain('Basic NPC Interaction');
    expect(prompt).toContain('simple');
    expect(prompt).toContain('Base prompt');
  });

  it('should handle batch generation', async () => {
    const configs = [
      { preset: 'basic_npc', quality: 'FAST' },
      { preset: 'trainer_battle', quality: 'FAST' }
    ];
    
    const results = await generator.batchGenerate(configs, mockQuickQuery);
    
    expect(results).toHaveLength(2);
    expect(results.every(r => r.success)).toBe(true);
  });
});

describe('Active Learning Workflow', () => {
  let workflow;

  beforeEach(() => {
    workflow = new ActiveLearningWorkflow();
  });

  it('should queue commands for review', () => {
    workflow.queueForReview('newcommand', { source: 'test_script.txt' });
    
    const queue = workflow.getReviewQueue();
    expect(queue.length).toBeGreaterThan(0);
    expect(queue[0].command).toBe('newcommand');
    expect(queue[0].priority).toBe(1);
  });

  it('should process accept feedback', async () => {
    const feedback = {
      action: 'accept',
      description: 'Test command description',
      syntax: 'newcommand param1',
      category: 'core',
      confidence: 0.9
    };
    
    const result = await workflow.processFeedback('newcommand', feedback);
    
    expect(result.success).toBe(true);
    expect(result.changes).toContain('accepted');
    expect(result.command.description).toBe('Test command description');
  });

  it('should process reject feedback', async () => {
    const feedback = {
      action: 'reject',
      reason: 'Not a valid HMA command'
    };
    
    const result = await workflow.processFeedback('badcommand', feedback);
    
    expect(result.success).toBe(true);
    expect(result.changes).toContain('rejected');
    expect(result.reason).toBe('Not a valid HMA command');
  });

  it('should request AI descriptions', async () => {
    const result = await workflow.requestAIDescription('unknowncmd', mockQuickQuery);
    
    expect(result.success).toBe(true);
    expect(result.description).toContain('Mock AI description');
    expect(result.command.confidence).toBeLessThan(0.5); // AI suggestions should have low confidence
  });

  it('should assess registry quality', () => {
    const assessment = workflow.assessRegistryQuality();
    
    expect(assessment.totalCommands).toBeGreaterThan(0);
    expect(typeof assessment.highConfidence).toBe('number');
    expect(typeof assessment.mediumConfidence).toBe('number');
    expect(typeof assessment.lowConfidence).toBe('number');
    expect(Array.isArray(assessment.recommendations)).toBe(true);
  });

  it('should run improvement cycles', async () => {
    workflow.queueForReview('improvecmd', { source: 'test' });
    
    const results = await workflow.runImprovementCycle(mockQuickQuery);
    
    expect(Array.isArray(results.improvements)).toBe(true);
    expect(typeof results.quality).toBe('object');
    expect(typeof results.stats).toBe('object');
  });

  it('should track learning statistics', async () => {
    const statsBefore = workflow.learningStats;
    
    await workflow.processFeedback('testcmd', {
      action: 'accept',
      description: 'Test command',
      confidence: 0.8
    });
    
    const statsAfter = workflow.learningStats;
    expect(statsAfter.commandsAccepted).toBe(statsBefore.commandsAccepted + 1);
    expect(statsAfter.commandsReviewed).toBe(statsBefore.commandsReviewed + 1);
  });

  it('should generate learning insights', () => {
    // Add some mock feedback history
    workflow.feedbackHistory = [
      { action: 'accept', result: { command: { category: 'core' } } },
      { action: 'reject', command: 'badcmd' },
      { action: 'accept', result: { command: { category: 'battle' } } }
    ];
    
    const insights = workflow.getLearningInsights();
    
    expect(typeof insights.trends.acceptanceRate).toBe('number');
    expect(typeof insights.trends.rejectionRate).toBe('number');
    expect(typeof insights.patterns.mostCommonCategories).toBe('object');
    expect(Array.isArray(insights.recommendations)).toBe(true);
  });

  it('should export and import learning data', () => {
    workflow.queueForReview('exportcmd', { source: 'test' });
    
    const exported = workflow.exportLearningData();
    
    expect(exported.stats).toBeDefined();
    expect(exported.reviewQueue).toBeDefined();
    expect(exported.feedbackHistory).toBeDefined();
    expect(exported.registryQuality).toBeDefined();
    
    const imported = workflow.importFeedback([
      { command: 'importcmd', action: 'accept', description: 'Imported command' }
    ]);
    
    expect(imported).toBe(1);
  });
});

describe('Integration Tests', () => {
  it('should complete full pipeline: ingestion -> generation -> learning', async () => {
    // This test simulates the complete workflow
    const registry = new CommandRegistry(':memory:');
    const generator = new ScriptGenerator();
    const workflow = new ActiveLearningWorkflow();
    
    // 1. Simulate command discovery (would come from ingestion)
    registry.addCommand({
      id: 'newdiscovered',
      command: 'newdiscovered',
      description: 'Auto-discovered command',
      category: 'custom',
      confidence: 0.3,
      sources: ['auto_ingestion']
    });
    
    // 2. Generate script (which might use the new command)
    const generationResult = await generator.generateScript({
      preset: 'basic_npc',
      quality: 'FAST',
      quickQuery: mockQuickQuery,
      includeAnalysis: false
    });
    
    expect(generationResult.success).toBe(true);
    
    // 3. Process unknown commands through learning workflow
    if (generationResult.unknownCommands?.length > 0) {
      for (const cmdInfo of generationResult.unknownCommands) {
        workflow.queueForReview(cmdInfo.command, { 
          source: 'generation', 
          preset: 'basic_npc' 
        });
      }
    }
    
    // 4. Simulate user feedback
    const feedbackResult = await workflow.processFeedback('faceplayer', {
      action: 'accept',
      description: 'Makes NPC face the player',
      confidence: 0.9
    });
    
    expect(feedbackResult.success).toBe(true);
    
    // 5. Run improvement cycle
    const improvementResult = await workflow.runImprovementCycle(mockQuickQuery);
    
    expect(Array.isArray(improvementResult.improvements)).toBe(true);
    
    // The registry should now be improved
    const finalQuality = workflow.assessRegistryQuality();
    expect(finalQuality.totalCommands).toBeGreaterThan(0);
  });

  it('should handle prompt building with full context', () => {
    const registry = getCommandRegistry();
    const commands = registry.searchCommands('face', { limit: 5 });
    const templates = [
      {
        title: 'Basic NPC',
        content: 'faceplayer\nmsgbox @text MSG_NORMAL\nrelease\nend',
        description: 'Simple NPC interaction'
      }
    ];
    
    const prompt = buildScriptGenPrompt('Advanced NPC with branches', templates, commands);
    
    expect(prompt).toContain('expert');
    expect(prompt).toContain('faceplayer');
    expect(prompt).toContain('Basic NPC');
    expect(prompt).toContain('Advanced NPC with branches');
  });

  it('should validate complete sanitizer chain', () => {
    const messyInput = `
{"thinking": "I'll create a script"}

Here's your HMA script:

\`\`\`hma
section1: # 000000
faceplayer
unknowncommand param1
msgbox @greeting MSG_YESNO
{
Hello there!

How are you doing?
}
if.no.goto @decline
msgbox @positive MSG_NORMAL
{
That's great to hear!
}
goto @end

@decline
msgbox @negative MSG_NORMAL
{
Sorry to hear that.
}

@end
release
end
\`\`\`

[DONE]
    `;
    
    const { text, unknownCommands } = sanitizeGeneratedScript(messyInput, 1);
    
    // Should preserve structure and dialog
    expect(text).toContain('faceplayer');
    expect(text).toContain('Hello there!');
    expect(text).toContain('How are you doing?');
    expect(text).toContain('release');
    expect(text).toContain('end');
    
    // Should identify unknown commands
    expect(unknownCommands).toContain('unknowncommand');
    expect(unknownCommands).not.toContain('faceplayer');
    expect(unknownCommands).not.toContain('msgbox');
    
    // Should not contain JSON or markers
    expect(text).not.toContain('thinking');
    expect(text).not.toContain('[DONE]');
    
    // Should have section header
    expect(text).toContain('section1: # 000000');
  });
});

// Performance and stress tests
describe('Performance Tests', () => {
  it('should handle large command registries efficiently', () => {
    const registry = new CommandRegistry(':memory:');
    const startTime = Date.now();
    
    // Add many commands
    for (let i = 0; i < 1000; i++) {
      registry.addCommand({
        id: `perfcmd${i}`,
        command: `perfcmd${i}`,
        description: `Performance test command ${i}`,
        category: 'test',
        confidence: Math.random()
      });
    }
    
    const addTime = Date.now() - startTime;
    expect(addTime).toBeLessThan(1000); // Should complete in under 1 second
    
    // Test search performance
    const searchStart = Date.now();
    const results = registry.searchCommands('perf', { limit: 50 });
    const searchTime = Date.now() - searchStart;
    
    expect(searchTime).toBeLessThan(100); // Should search quickly
    expect(results.length).toBeGreaterThan(0);
  });

  it('should handle batch generation efficiently', async () => {
    const generator = new ScriptGenerator();
    const configs = Array(10).fill(null).map((_, i) => ({
      preset: 'basic_npc',
      quality: 'FAST',
      sectionNumber: i + 1
    }));
    
    const startTime = Date.now();
    const results = await generator.batchGenerate(configs, mockQuickQuery);
    const totalTime = Date.now() - startTime;
    
    expect(results).toHaveLength(10);
    expect(totalTime).toBeLessThan(10000); // Should complete in reasonable time
    expect(results.every(r => r.success)).toBe(true);
  });
});

export { mockQuickQuery };