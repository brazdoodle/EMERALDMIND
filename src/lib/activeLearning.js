// Active Learning Workflow for Command Registry
// Handles user feedback, iterative improvement, and automated learning

import { getCommandRegistry } from './commandRegistry.js';
import { getScriptGenerator } from './scriptGenerator.js';
import { describeUnknownCommand } from './llmUtils.js';

export class ActiveLearningWorkflow {
  constructor() {
    this.registry = getCommandRegistry();
    this.generator = getScriptGenerator();
    this.learningStats = {
      commandsReviewed: 0,
      commandsAccepted: 0,
      commandsRejected: 0,
      averageConfidenceImprovement: 0,
      lastReviewSession: null
    };
    
    this.reviewQueue = new Map(); // Commands pending review
    this.feedbackHistory = []; // Historical feedback for analysis
  }

  // Add command to review queue
  queueForReview(command, context = {}) {
    const existing = this.reviewQueue.get(command) || { 
      command, 
      contexts: [],
      priority: 0,
      firstSeen: new Date().toISOString()
    };
    
    existing.contexts.push({
      ...context,
      timestamp: new Date().toISOString()
    });
    
    // Increase priority based on frequency of encounters
    existing.priority += 1;
    
    this.reviewQueue.set(command, existing);
  }

  // Get commands that need review, sorted by priority
  getReviewQueue(limit = 10) {
    return Array.from(this.reviewQueue.values())
      .sort((a, b) => b.priority - a.priority)
      .slice(0, limit);
  }

  // Process user feedback on a command
  async processFeedback(commandName, feedback, quickQuery = null) {
    const {
      action, // 'accept', 'reject', 'modify'
      description,
      syntax,
      category,
      examples = [],
      confidence = 0.8,
      notes = ''
    } = feedback;

    try {
      let result = { success: false, changes: [] };

      switch (action) {
        case 'accept':
          result = await this.acceptCommand(commandName, {
            description: description || '',
            syntax: syntax || commandName,
            category,
            examples,
            confidence,
            notes,
            source: 'user_accepted'
          });
          break;

        case 'reject':
          result = await this.rejectCommand(commandName, feedback.reason || 'User rejected');
          break;

        case 'modify':
          result = await this.modifyCommand(commandName, feedback);
          break;

        case 'request_ai_description':
          if (quickQuery) {
            result = await this.requestAIDescription(commandName, quickQuery);
          }
          break;

        default:
          throw new Error(`Unknown feedback action: ${action}`);
      }

      // Record feedback in history
      this.feedbackHistory.push({
        command: commandName,
        action,
        feedback,
        result,
        timestamp: new Date().toISOString(),
        user: feedback.user || 'anonymous'
      });

      // Remove from review queue if processed
      if (['accept', 'reject'].includes(action)) {
        this.reviewQueue.delete(commandName);
      }

      // Update learning stats
      this.updateLearningStats(action, result);

      return result;

    } catch (_error) {
      console.error('Failed to process feedback:', error);
      return {
        success: false,
        error: error.message,
        command: commandName
      };
    }
  }

  // Accept command into registry
  async acceptCommand(commandName, commandData) {
    const existingCmd = this.registry.getCommand(commandName);
    const oldConfidence = existingCmd?.confidence || 0;

    const newCommand = {
      id: commandName,
      command: commandName,
      syntax: commandData.syntax || commandName,
      description: commandData.description || `User-accepted command: ${commandName}`,
      category: commandData.category || this.registry.inferCategory(commandName),
      confidence: Math.max(commandData.confidence || 0.8, oldConfidence),
      sources: existingCmd ? [...existingCmd.sources, commandData.source] : [commandData.source],
      examples: [...(existingCmd?.examples || []), ...commandData.examples],
      aliases: existingCmd?.aliases || [],
      relatedCommands: existingCmd?.relatedCommands || [],
      usage: existingCmd?.usage || { count: 0, lastUsed: null },
      lastReviewed: new Date().toISOString(),
      reviewNotes: commandData.notes || ''
    };

    this.registry.addCommand(newCommand);
    this.registry.save();

    return {
      success: true,
      command: newCommand,
      changes: ['accepted', 'confidence_updated', 'description_added'],
      confidenceImprovement: newCommand.confidence - oldConfidence
    };
  }

  // Reject command (mark as invalid)
  async rejectCommand(commandName, reason = '') {
    // Add to a rejected commands list to avoid future suggestions
    const rejectedCommands = this.registry.metadata.rejectedCommands || [];
    if (!rejectedCommands.includes(commandName)) {
      rejectedCommands.push(commandName);
      this.registry.metadata.rejectedCommands = rejectedCommands;
    }

    // Add rejection note
    this.registry.metadata.rejectionReasons = this.registry.metadata.rejectionReasons || {};
    this.registry.metadata.rejectionReasons[commandName] = {
      reason,
      timestamp: new Date().toISOString()
    };

    this.registry.save();

    return {
      success: true,
      command: commandName,
      changes: ['rejected', 'blacklisted'],
      reason
    };
  }

  // Modify existing command
  async modifyCommand(commandName, modifications) {
    const existingCmd = this.registry.getCommand(commandName);
    if (!existingCmd) {
      throw new Error(`Command ${commandName} not found in registry`);
    }

    const changes = [];
    const updatedCmd = { ...existingCmd };

    // Apply modifications
    if (modifications.description && modifications.description !== existingCmd.description) {
      updatedCmd.description = modifications.description;
      changes.push('description_updated');
    }

    if (modifications.syntax && modifications.syntax !== existingCmd.syntax) {
      updatedCmd.syntax = modifications.syntax;
      changes.push('syntax_updated');
    }

    if (modifications.category && modifications.category !== existingCmd.category) {
      updatedCmd.category = modifications.category;
      changes.push('category_updated');
    }

    if (modifications.examples && modifications.examples.length > 0) {
      updatedCmd.examples = [...existingCmd.examples, ...modifications.examples];
      changes.push('examples_added');
    }

    // Increase confidence when user reviews
    const oldConfidence = existingCmd.confidence;
    updatedCmd.confidence = Math.min(1.0, oldConfidence + 0.2);
    updatedCmd.lastReviewed = new Date().toISOString();

    if (modifications.notes) {
      updatedCmd.reviewNotes = modifications.notes;
      changes.push('notes_added');
    }

    this.registry.addCommand(updatedCmd);
    this.registry.save();

    return {
      success: true,
      command: updatedCmd,
      changes,
      confidenceImprovement: updatedCmd.confidence - oldConfidence
    };
  }

  // Request AI-generated description for command
  async requestAIDescription(commandName, quickQuery) {
    try {
      const description = await describeUnknownCommand(commandName, quickQuery);
      
      if (!description || description.includes('unknown command')) {
        return {
          success: false,
          error: 'AI could not generate description',
          command: commandName
        };
      }

      // Add as low-confidence suggestion
      const suggestedCommand = {
        id: commandName,
        command: commandName,
        syntax: commandName,
        description,
        category: this.registry.inferCategory(commandName),
        confidence: 0.4, // Low confidence for AI-generated
        sources: ['ai_suggestion'],
        examples: [],
        aliases: [],
        relatedCommands: [],
        usage: { count: 0, lastUsed: null },
        needsReview: true
      };

      this.registry.addCommand(suggestedCommand);
      this.registry.save();

      return {
        success: true,
        command: suggestedCommand,
        changes: ['ai_description_added'],
        description
      };

    } catch (_error) {
      return {
        success: false,
        error: error.message,
        command: commandName
      };
    }
  }

  // Update learning statistics
  updateLearningStats(action, result) {
    const prev = this.learningStats || {
      commandsReviewed: 0,
      commandsAccepted: 0,
      commandsRejected: 0,
      averageConfidenceImprovement: 0
    };

    const newStats = {
      ...prev,
      lastReviewSession: new Date().toISOString()
    };

    switch (action) {
      case 'accept':
        newStats.commandsAccepted = (prev.commandsAccepted || 0) + 1;
        newStats.commandsReviewed = (prev.commandsReviewed || 0) + 1;
        if (result && result.confidenceImprovement) {
          const total = newStats.commandsReviewed;
          const current = prev.averageConfidenceImprovement || 0;
          newStats.averageConfidenceImprovement = 
            (current * (total - 1) + result.confidenceImprovement) / total;
        }
        break;

      case 'reject':
        newStats.commandsRejected = (prev.commandsRejected || 0) + 1;
        newStats.commandsReviewed = (prev.commandsReviewed || 0) + 1;
        break;

      case 'modify':
        newStats.commandsReviewed = (prev.commandsReviewed || 0) + 1;
        if (result && result.confidenceImprovement) {
          const total = newStats.commandsReviewed;
          const current = prev.averageConfidenceImprovement || 0;
          newStats.averageConfidenceImprovement = 
            (current * (total - 1) + result.confidenceImprovement) / total;
        }
        break;
    }

    // Replace the stats object so external references to previous snapshot stay unchanged
    this.learningStats = newStats;
  }

  // Automated quality assessment
  assessRegistryQuality() {
    const commands = this.registry.getAllCommands();
    const assessment = {
      totalCommands: commands.length,
      highConfidence: commands.filter(cmd => cmd.confidence >= 0.8).length,
      mediumConfidence: commands.filter(cmd => cmd.confidence >= 0.5 && cmd.confidence < 0.8).length,
      lowConfidence: commands.filter(cmd => cmd.confidence < 0.5).length,
      needsReview: commands.filter(cmd => cmd.needsReview).length,
      hasExamples: commands.filter(cmd => cmd.examples && cmd.examples.length > 0).length,
      hasDescription: commands.filter(cmd => cmd.description && !cmd.description.startsWith('HMA command:')).length,
      categories: {},
      recommendations: []
    };

    // Category breakdown
    commands.forEach(cmd => {
      assessment.categories[cmd.category] = (assessment.categories[cmd.category] || 0) + 1;
    });

    // Generate recommendations
    if (assessment.lowConfidence > assessment.totalCommands * 0.3) {
      assessment.recommendations.push({
        type: 'review_needed',
        priority: 'high',
        message: `${assessment.lowConfidence} commands have low confidence and need review`
      });
    }

    if (assessment.needsReview > 0) {
      assessment.recommendations.push({
        type: 'pending_review',
        priority: 'medium',
        message: `${assessment.needsReview} commands are marked for review`
      });
    }

    if (assessment.hasExamples < assessment.totalCommands * 0.5) {
      assessment.recommendations.push({
        type: 'add_examples',
        priority: 'low',
        message: `${assessment.totalCommands - assessment.hasExamples} commands need usage examples`
      });
    }

    return assessment;
  }

  // Run automated improvement suggestions
  async runImprovementCycle(quickQuery = null) {
    const improvements = [];
    const quality = this.assessRegistryQuality();
    
    // Process review queue
    const reviewItems = this.getReviewQueue(5);
    for (const item of reviewItems) {
      if (quickQuery) {
        try {
          const result = await this.requestAIDescription(item.command, quickQuery);
          if (result.success) {
            improvements.push({
              type: 'ai_description_added',
              command: item.command,
              description: result.description
            });
          }
        } catch (_error) {
          console.warn(`Failed to get AI description for ${item.command}:`, error.message);
        }
      }
    }

    // Find commands that could benefit from category reassignment
    const commands = this.registry.getAllCommands();
    for (const cmd of commands) {
      if (cmd.confidence < 0.6 && cmd.category === 'custom') {
        const betterCategory = this.registry.inferCategory(cmd.command);
        if (betterCategory !== 'custom') {
          cmd.category = betterCategory;
          cmd.confidence = Math.min(1.0, cmd.confidence + 0.1);
          this.registry.addCommand(cmd);
          improvements.push({
            type: 'category_improved',
            command: cmd.command,
            newCategory: betterCategory
          });
        }
      }
    }

    if (improvements.length > 0) {
      this.registry.save();
    }

    return {
      improvements,
      quality,
      stats: this.learningStats
    };
  }

  // Export learning data for analysis
  exportLearningData() {
    return {
      stats: this.learningStats,
      reviewQueue: Array.from(this.reviewQueue.values()),
      feedbackHistory: this.feedbackHistory,
      registryQuality: this.assessRegistryQuality(),
      exportTimestamp: new Date().toISOString()
    };
  }

  // Import feedback from external source
  importFeedback(feedbackData) {
    let imported = 0;
    
    for (const feedback of feedbackData) {
      try {
        if (feedback.command && feedback.action) {
          this.feedbackHistory.push({
            ...feedback,
            imported: true,
            importTimestamp: new Date().toISOString()
          });
          imported++;
        }
      } catch (_error) {
        console.warn('Failed to import feedback item:', error.message);
      }
    }
    
    return imported;
  }

  // Get learning insights and trends
  getLearningInsights() {
    const insights = {
      trends: {
        acceptanceRate: this.learningStats.commandsAccepted / Math.max(1, this.learningStats.commandsReviewed),
        rejectionRate: this.learningStats.commandsRejected / Math.max(1, this.learningStats.commandsReviewed),
        averageConfidenceGain: this.learningStats.averageConfidenceImprovement
      },
      patterns: {
        mostCommonCategories: {},
        frequentlyRejectedPatterns: [],
        highImprovementCommands: []
      },
      recommendations: []
    };

    // Analyze feedback patterns
    const categoryCount = {};
    const rejectedPatterns = [];
    
    this.feedbackHistory.forEach(feedback => {
      if (feedback.action === 'accept' && feedback.result?.command?.category) {
        const cat = feedback.result.command.category;
        categoryCount[cat] = (categoryCount[cat] || 0) + 1;
      }
      
      if (feedback.action === 'reject') {
        rejectedPatterns.push(feedback.command);
      }
    });

    insights.patterns.mostCommonCategories = categoryCount;
    insights.patterns.frequentlyRejectedPatterns = 
      rejectedPatterns.filter((cmd, i, arr) => arr.indexOf(cmd) !== i);

    // Generate actionable recommendations
    if (insights.trends.rejectionRate > 0.3) {
      insights.recommendations.push({
        type: 'improve_ai_suggestions',
        message: 'High rejection rate suggests AI suggestions need improvement'
      });
    }

    if (insights.trends.averageConfidenceGain < 0.1) {
      insights.recommendations.push({
        type: 'encourage_detailed_feedback',
        message: 'Low confidence improvement suggests more detailed feedback is needed'
      });
    }

    return insights;
  }
}

// Singleton instance
let globalWorkflow = null;

export function getActiveLearningWorkflow() {
  if (!globalWorkflow) {
    globalWorkflow = new ActiveLearningWorkflow();
  }
  return globalWorkflow;
}

export default ActiveLearningWorkflow;