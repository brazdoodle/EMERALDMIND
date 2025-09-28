// === ADVANCED HMA SCRIPT GENERATOR ===
// Powerful script generation with sophisticated patterns and professional templates

export class HMAScriptGenerator {
  constructor() {
    this.scriptPatterns = this.initializeScriptPatterns();
    this.advancedTemplates = this.initializeAdvancedTemplates();
    this.flagManager = this.initializeFlagManager();
  }
  
  initializeScriptPatterns() {
    return {
      // Core NPC interaction patterns
      basicNPC: {
        template: `#dynamic 0x800000

#org @main
lock
faceplayer
msgbox.default @greeting
release
end

#org @greeting
= {message}`,
        variables: ['message'],
        description: 'Basic NPC with single message'
      },
      
      // Conditional dialogue with flag tracking
      conditionalNPC: {
        template: `#dynamic 0x800000

#org @main
lock
faceplayer
checkflag {flag}
if.flag.set.goto @repeat_interaction
msgbox.default @first_meeting
setflag {flag}
goto @end

#org @repeat_interaction
msgbox.default @subsequent_meeting

#org @end
release
end

#org @first_meeting
= {firstMessage}

#org @subsequent_meeting
= {repeatMessage}`,
        variables: ['flag', 'firstMessage', 'repeatMessage'],
        description: 'NPC that remembers previous interactions'
      },
      
      // Item giving NPC with full validation
      itemGiver: {
        template: `#dynamic 0x800000

#org @main
lock
faceplayer
checkflag {completedFlag}
if.flag.set.goto @already_received
checkitemspace {itemConstant} {quantity}
compare LASTRESULT 0x1
if.ne.goto @inventory_full
msgbox.default @giving_item
giveitem {itemConstant} {quantity}
setflag {completedFlag}
goto @end

#org @already_received
msgbox.default @already_given_message

#org @inventory_full
msgbox.default @bag_full_message

#org @end
release
end

#org @giving_item
= {givingMessage}

#org @already_given_message
= {alreadyGivenMessage}

#org @bag_full_message
= Your bag is full! Come back when you have space.`,
        variables: ['completedFlag', 'itemConstant', 'quantity', 'givingMessage', 'alreadyGivenMessage'],
        description: 'NPC that gives items with proper validation'
      },
      
      // Trainer battle with defeat flag
      trainerBattle: {
        template: `#dynamic 0x800000

#org @main
lock
faceplayer
checkflag {defeatFlag}
if.flag.set.goto @post_battle
msgbox.default @challenge_message
trainerbattle {trainerConstant} @defeat_message @challenge_message
setflag {defeatFlag}
goto @end

#org @post_battle
msgbox.default @rematch_message

#org @end
release
end

#org @challenge_message
= {challengeText}

#org @defeat_message
= {defeatText}

#org @rematch_message
= {rematchText}`,
        variables: ['defeatFlag', 'trainerConstant', 'challengeText', 'defeatText', 'rematchText'],
        description: 'Trainer battle with proper flag management'
      },
      
      // Multi-stage quest NPC
      questNPC: {
        template: `#dynamic 0x800000

#org @main
lock
faceplayer
checkvar {questVar}
compare LASTRESULT 0x0
if.eq.goto @quest_start
compare LASTRESULT 0x1
if.eq.goto @quest_progress
compare LASTRESULT 0x2
if.eq.goto @quest_complete
goto @end

#org @quest_start
msgbox.default @quest_introduction
setvar {questVar} 0x1
goto @end

#org @quest_progress
checkflag {objectiveFlag}
if.flag.set.goto @objective_complete
msgbox.default @progress_reminder
goto @end

#org @objective_complete
msgbox.default @completion_message
giveitem {rewardItem} {rewardQuantity}
setvar {questVar} 0x2
goto @end

#org @quest_complete
msgbox.default @post_quest_message

#org @end
release
end

#org @quest_introduction
= {introText}

#org @progress_reminder
= {reminderText}

#org @completion_message
= {completionText}

#org @post_quest_message
= {postQuestText}`,
        variables: ['questVar', 'objectiveFlag', 'rewardItem', 'rewardQuantity', 'introText', 'reminderText', 'completionText', 'postQuestText'],
        description: 'Multi-stage quest with variable tracking'
      },
      
      // Movement and cutscene
      cutsceneMovement: {
        template: `#dynamic 0x800000

#org @main
lock
applymovement PLAYER @player_movement
applymovement {npcId} @npc_movement
waitmovement PLAYER
waitmovement {npcId}
msgbox.default @cutscene_dialogue
release
end

#org @player_movement
#raw {playerMovements}
#raw 0xFE

#org @npc_movement
#raw {npcMovements}
#raw 0xFE

#org @cutscene_dialogue
= {cutsceneText}`,
        variables: ['npcId', 'playerMovements', 'npcMovements', 'cutsceneText'],
        description: 'Cutscene with coordinated character movement'
      },
      
      // Shop NPC with mart integration
      shopKeeper: {
        template: `#dynamic 0x800000

#org @main
lock
faceplayer
msgbox.default @shop_greeting
shop {shopId}
msgbox.default @shop_farewell
release
end

#org @shop_greeting
= {greetingText}

#org @shop_farewell
= {farewellText}`,
        variables: ['shopId', 'greetingText', 'farewellText'],
        description: 'Shop keeper with Pokemart integration'
      }
    };
  }
  
  initializeAdvancedTemplates() {
    return {
      gymLeaderScript: {
        name: 'Gym Leader Battle Script',
        pattern: 'trainerBattle',
        defaultValues: {
          defeatFlag: '0x820',
          trainerConstant: 'TRAINER_BROCK',
          challengeText: 'I am the Gym Leader! Prepare for a tough battle!',
          defeatText: 'Impressive! You have earned this badge!',
          rematchText: 'You already defeated me. Keep training!'
        },
        tags: ['gym', 'battle', 'leader']
      },
      
      itemShopScript: {
        name: 'Item Shop NPC',
        pattern: 'shopKeeper',
        defaultValues: {
          shopId: '0x1',
          greetingText: 'Welcome to our shop! Take a look at our items.',
          farewellText: 'Thank you for shopping with us!'
        },
        tags: ['shop', 'items', 'commerce']
      },
      
      tutorialNPC: {
        name: 'Tutorial/Guide NPC',
        pattern: 'conditionalNPC',
        defaultValues: {
          flag: '0x821',
          firstMessage: 'Welcome, new trainer! Let me teach you the basics.',
          repeatMessage: 'Remember what I taught you and keep practicing!'
        },
        tags: ['tutorial', 'guide', 'teaching']
      },
      
      questGiver: {
        name: 'Quest Giver NPC',
        pattern: 'questNPC',
        defaultValues: {
          questVar: '0x8000',
          objectiveFlag: '0x822',
          rewardItem: 'ITEM_RARE_CANDY',
          rewardQuantity: '1',
          introText: 'I have a special task for you, trainer!',
          reminderText: 'Have you completed the task I gave you?',
          completionText: 'Excellent work! Here is your reward.',
          postQuestText: 'Thanks again for your help!'
        },
        tags: ['quest', 'objective', 'reward']
      }
    };
  }
  
  initializeFlagManager() {
    return {
      customFlagStart: 0x800,
      customFlagEnd: 0x8FF,
      customVarStart: 0x8000,
      customVarEnd: 0x80FF,
      usedFlags: new Set(),
      usedVars: new Set(),
      
      getNextFlag() {
        for (let flag = this.customFlagStart; flag <= this.customFlagEnd; flag++) {
          const flagHex = `0x${flag.toString(16).toUpperCase()}`;
          if (!this.usedFlags.has(flagHex)) {
            this.usedFlags.add(flagHex);
            return flagHex;
          }
        }
        return null;
      },
      
      getNextVar() {
        for (let varNum = this.customVarStart; varNum <= this.customVarEnd; varNum++) {
          const varHex = `0x${varNum.toString(16).toUpperCase()}`;
          if (!this.usedVars.has(varHex)) {
            this.usedVars.add(varHex);
            return varHex;
          }
        }
        return null;
      },
      
      reserveFlag(flag) {
        this.usedFlags.add(flag);
      },
      
      reserveVar(varNum) {
        this.usedVars.add(varNum);
      }
    };
  }
  
  // Generate script from pattern with smart defaults
  generateScript(patternName, customValues = {}, options = {}) {
    const pattern = this.scriptPatterns[patternName];
    if (!pattern) {
      throw new Error(`Unknown script pattern: ${patternName}`);
    }
    
    const values = { ...customValues };
    
    // Auto-assign flags and variables if not provided
    if (pattern.variables.includes('flag') && !values.flag) {
      values.flag = this.flagManager.getNextFlag();
    }
    
    if (pattern.variables.includes('defeatFlag') && !values.defeatFlag) {
      values.defeatFlag = this.flagManager.getNextFlag();
    }
    
    if (pattern.variables.includes('completedFlag') && !values.completedFlag) {
      values.completedFlag = this.flagManager.getNextFlag();
    }
    
    if (pattern.variables.includes('questVar') && !values.questVar) {
      values.questVar = this.flagManager.getNextVar();
    }
    
    if (pattern.variables.includes('objectiveFlag') && !values.objectiveFlag) {
      values.objectiveFlag = this.flagManager.getNextFlag();
    }
    
    // Apply default values for missing variables
    const missingVars = pattern.variables.filter(varName => !values[varName]);
    missingVars.forEach(varName => {
      values[varName] = this.getDefaultValue(varName, patternName);
    });
    
    // Replace template variables
    let script = pattern.template;
    Object.entries(values).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      script = script.replaceAll(placeholder, value);
    });
    
    return {
      script,
      pattern: patternName,
      values,
      metadata: {
        description: pattern.description,
        flagsUsed: this.extractFlags(script),
        variablesUsed: this.extractVariables(script),
        complexity: this.calculateComplexity(script)
      }
    };
  }
  
  // Generate script from advanced template
  generateFromTemplate(templateName, customValues = {}) {
    const template = this.advancedTemplates[templateName];
    if (!template) {
      throw new Error(`Unknown template: ${templateName}`);
    }
    
    const mergedValues = { ...template.defaultValues, ...customValues };
    return this.generateScript(template.pattern, mergedValues);
  }
  
  // Smart script generation based on description
  generateFromDescription(description, options = {}) {
    const descLower = description.toLowerCase();
    
    // Pattern matching for automatic template selection
    if (descLower.includes('gym leader') || descLower.includes('gym battle')) {
      return this.generateFromTemplate('gymLeaderScript', options);
    }
    
    if (descLower.includes('shop') || descLower.includes('buy') || descLower.includes('sell')) {
      return this.generateFromTemplate('itemShopScript', options);
    }
    
    if (descLower.includes('quest') || descLower.includes('task') || descLower.includes('mission')) {
      return this.generateFromTemplate('questGiver', options);
    }
    
    if (descLower.includes('item') && (descLower.includes('give') || descLower.includes('receive'))) {
      return this.generateScript('itemGiver', options);
    }
    
    if (descLower.includes('trainer') && descLower.includes('battle')) {
      return this.generateScript('trainerBattle', options);
    }
    
    if (descLower.includes('remember') || descLower.includes('flag')) {
      return this.generateScript('conditionalNPC', options);
    }
    
    if (descLower.includes('movement') || descLower.includes('cutscene')) {
      return this.generateScript('cutsceneMovement', options);
    }
    
    // Default to basic NPC
    return this.generateScript('basicNPC', { message: options.message || 'Hello there!' });
  }
  
  // Generate comprehensive script suite for complex scenarios
  generateScriptSuite(scenario, options = {}) {
    const suites = {
      gymChallenge: [
        { name: 'gym_leader', template: 'gymLeaderScript' },
        { name: 'gym_guide', template: 'tutorialNPC', values: { firstMessage: 'This is the Gym! Are you ready for the challenge?' } },
        { name: 'victory_reward', pattern: 'itemGiver', values: { itemConstant: 'ITEM_TM01', givingMessage: 'Take this TM as a reward for your victory!' } }
      ],
      
      questChain: [
        { name: 'quest_giver', template: 'questGiver' },
        { name: 'quest_helper', pattern: 'conditionalNPC', values: { firstMessage: 'I can help you with that quest!' } },
        { name: 'quest_completion', pattern: 'itemGiver' }
      ],
      
      townMarket: [
        { name: 'item_shop', template: 'itemShopScript' },
        { name: 'shop_assistant', pattern: 'basicNPC', values: { message: 'We have the best prices in town!' } },
        { name: 'customer_npc', pattern: 'conditionalNPC', values: { firstMessage: 'I love shopping here!' } }
      ]
    };
    
    const suite = suites[scenario];
    if (!suite) {
      throw new Error(`Unknown scenario: ${scenario}`);
    }
    
    return suite.map((scriptDef, index) => {
      const values = { ...scriptDef.values, ...options };
      
      if (scriptDef.template) {
        return {
          name: scriptDef.name,
          ...this.generateFromTemplate(scriptDef.template, values)
        };
      } else {
        return {
          name: scriptDef.name,
          ...this.generateScript(scriptDef.pattern, values)
        };
      }
    });
  }
  
  // Helper methods
  getDefaultValue(varName, patternName) {
    const defaults = {
      message: 'Hello there!',
      firstMessage: 'Nice to meet you!',
      repeatMessage: 'Good to see you again!',
      itemConstant: 'ITEM_POTION',
      quantity: '1',
      givingMessage: 'Here, take this!',
      alreadyGivenMessage: 'I already gave you something!',
      trainerConstant: 'TRAINER_YOUNGSTER_BEN',
      challengeText: 'Let\'s battle!',
      defeatText: 'You won!',
      rematchText: 'Want another battle?',
      npcId: 'NPC_1',
      playerMovements: '0x11, 0x11, 0x11',
      npcMovements: '0x10, 0x10',
      cutsceneText: 'This is an important moment!',
      shopId: '0x1',
      greetingText: 'Welcome to our shop!',
      farewellText: 'Come back anytime!',
      introText: 'I have something for you to do.',
      reminderText: 'Don\'t forget about our agreement.',
      completionText: 'Perfect! Here\'s your reward.',
      postQuestText: 'Thanks for your help!',
      rewardItem: 'ITEM_RARE_CANDY',
      rewardQuantity: '1'
    };
    
    return defaults[varName] || `[${varName.toUpperCase()}]`;
  }
  
  extractFlags(script) {
    const flagMatches = script.match(/0x[8-9][0-9A-Fa-f]{2}/g) || [];
    return [...new Set(flagMatches)];
  }
  
  extractVariables(script) {
    const varMatches = script.match(/0x[8][0-9A-Fa-f]{3}/g) || [];
    return [...new Set(varMatches)];
  }
  
  calculateComplexity(script) {
    const lines = script.split('\n').filter(line => line.trim() && !line.trim().startsWith('//'));
    const commands = lines.filter(line => !line.includes('#org') && !line.includes('='));
    return {
      totalLines: lines.length,
      commandCount: commands.length,
      complexity: commands.length < 5 ? 'simple' : commands.length < 15 ? 'moderate' : 'complex'
    };
  }
  
  // Get available patterns and templates
  getAvailablePatterns() {
    return Object.entries(this.scriptPatterns).map(([name, pattern]) => ({
      name,
      description: pattern.description,
      variables: pattern.variables
    }));
  }
  
  getAvailableTemplates() {
    return Object.entries(this.advancedTemplates).map(([name, template]) => ({
      name,
      displayName: template.name,
      pattern: template.pattern,
      tags: template.tags,
      defaultValues: template.defaultValues
    }));
  }
}

// Singleton instance
let scriptGenerator = null;

export function getScriptGenerator() {
  if (!scriptGenerator) {
    scriptGenerator = new HMAScriptGenerator();
  }
  return scriptGenerator;
}

export default HMAScriptGenerator;