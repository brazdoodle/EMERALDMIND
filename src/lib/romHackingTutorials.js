// === INTERACTIVE ROM HACKING TUTORIALS ===
// Comprehensive tutorial system with step-by-step guidance

export class ROMHackingTutorials {
  constructor() {
    this.tutorials = new Map();
    this.initializeTutorials();
  }
  
  initializeTutorials() {
    // Beginner Tutorial: First NPC Script
    this.tutorials.set('first-npc', {
      id: 'first-npc',
      title: 'Your First NPC Script',
      difficulty: 'beginner',
      duration: '10 minutes',
      description: 'Learn to create a basic NPC that gives dialogue',
      prerequisites: ['HMA installed', 'ROM backup created'],
      steps: [
        {
          id: 1,
          title: 'Create the Script File',
          instruction: 'Open HMA and create a new script file (.hma)',
          code: `// My first NPC script
#dynamic 0x800000

#org @main
lock
faceplayer
msgbox.default @greeting
release
end

#org @greeting
= Hello! Welcome to ROM hacking!`,
          explanation: 'This creates a basic script with proper structure. The #dynamic directive tells HMA where to place the script in ROM.',
          tips: ['Use #dynamic for auto-placement', 'Always lock/release for NPCs', 'faceplayer makes NPC face the player']
        },
        {
          id: 2,
          title: 'Compile the Script',
          instruction: 'Save and compile your script in HMA',
          explanation: 'HMA will generate the compiled bytecode and insert it into your ROM.',
          tips: ['Check for compilation errors', 'Note the generated offset', 'Make a backup before testing']
        },
        {
          id: 3,
          title: 'Assign to NPC',
          instruction: 'Use AdvanceMap to assign the script offset to an NPC',
          explanation: 'Open your map in AdvanceMap, select the NPC, and enter the script offset.',
          tips: ['Use the offset from HMA compilation', 'Set NPC movement type to "Face Down"', 'Save the map after changes']
        },
        {
          id: 4,
          title: 'Test in Game',
          instruction: 'Load your ROM in an emulator and talk to the NPC',
          explanation: 'The NPC should face you and display your message.',
          troubleshooting: ['If no text appears, check script offset', 'If game crashes, verify script syntax', 'If NPC doesn\'t respond, check event number assignment']
        }
      ],
      nextTutorial: 'conditional-dialogue'
    });

    // Intermediate Tutorial: Conditional Dialogue
    this.tutorials.set('conditional-dialogue', {
      id: 'conditional-dialogue',
      title: 'Conditional Dialogue with Flags',
      difficulty: 'intermediate',
      duration: '15 minutes',
      description: 'Create NPCs that remember previous interactions',
      prerequisites: ['Completed "Your First NPC Script"', 'Understanding of flags'],
      steps: [
        {
          id: 1,
          title: 'Plan Your Flag System',
          instruction: 'Choose a safe custom flag (0x800-0x8FF range)',
          code: `// Flag 0x820 - Talked to Tutorial NPC
// Flag 0x821 - Received item from NPC`,
          explanation: 'Always document your flags to avoid conflicts.',
          tips: ['Use 0x800+ for custom flags', 'Keep a flag documentation file', 'Group related flags together']
        },
        {
          id: 2,
          title: 'Create Conditional Script',
          instruction: 'Write a script that checks and sets flags',
          code: `#dynamic 0x800000

#org @main
lock
faceplayer
checkflag 0x820
if.flag.set.goto @already_talked
msgbox.default @first_time
setflag 0x820
goto @end

#org @already_talked
msgbox.default @repeat_visit

#org @end
release
end

#org @first_time
= Nice to meet you! I'm the tutorial NPC.

#org @repeat_visit
= Good to see you again!`,
          explanation: 'This script uses checkflag and setflag to remember if you\'ve talked before.',
          tips: ['Always use goto for flow control', 'Group related messages together', 'Test both conversation paths']
        }
      ],
      nextTutorial: 'item-giving-npc'
    });

    // Advanced Tutorial: Item-Giving NPC
    this.tutorials.set('item-giving-npc', {
      id: 'item-giving-npc',
      title: 'NPC That Gives Items',
      difficulty: 'intermediate',
      duration: '20 minutes',
      description: 'Create an NPC that gives items with proper checks',
      prerequisites: ['Understanding of conditional dialogue', 'Item ID knowledge'],
      steps: [
        {
          id: 1,
          title: 'Item Check Logic',
          instruction: 'Create a script that checks inventory space and gives items',
          code: `#dynamic 0x800000

#org @main
lock
faceplayer
checkflag 0x825
if.flag.set.goto @already_got_item
checkitemspace ITEM_POTION 1
compare LASTRESULT 0x1
if.ne.goto @bag_full
giveitem ITEM_POTION 1
setflag 0x825
msgbox.default @got_item
goto @end

#org @already_got_item
msgbox.default @already_have

#org @bag_full
msgbox.default @no_space

#org @end
release
end

#org @got_item
= Here's a Potion for you!

#org @already_have
= You already have my gift!

#org @no_space
= Your bag is full!`,
          explanation: 'This prevents item duplication and handles full inventory.',
          tips: ['Always check item space first', 'Use descriptive flag names', 'Handle all possible outcomes']
        }
      ],
      nextTutorial: 'trainer-battle'
    });

    // Expert Tutorial: Trainer Battle Setup
    this.tutorials.set('trainer-battle', {
      id: 'trainer-battle',
      title: 'Creating Trainer Battles',
      difficulty: 'advanced',
      duration: '30 minutes',
      description: 'Set up custom trainer battles with proper flags and scripts',
      prerequisites: ['Trainer editor knowledge', 'Understanding of battle flags'],
      steps: [
        {
          id: 1,
          title: 'Design Trainer Data',
          instruction: 'Use trainer editor to create your custom trainer',
          explanation: 'Set up Pokemon, AI, items, and trainer class.',
          tips: ['Choose appropriate AI level', 'Balance Pokemon levels', 'Test movesets thoroughly']
        },
        {
          id: 2,
          title: 'Create Battle Script',
          instruction: 'Write a script with trainer battle logic',
          code: `#dynamic 0x800000

#org @main
lock
faceplayer
checkflag 0x300  // Trainer defeat flag
if.flag.set.goto @defeated
msgbox.default @challenge
trainerbattle.start TRAINER_YOUNGSTER_BEN @defeated_msg @challenge_msg
setflag 0x300
goto @end

#org @defeated
msgbox.default @rematch_msg

#org @end
release
end

#org @challenge_msg
= I challenge you to a battle!

#org @defeated_msg
= You're really strong!

#org @rematch_msg
= Want a rematch sometime?`,
          explanation: 'Trainer battles automatically set flags when won, preventing rematches.',
          tips: ['Use trainer flag range (0x300+)', 'Provide before and after messages', 'Consider rematch logic']
        }
      ],
      nextTutorial: 'complex-events'
    });

    // Master Tutorial: Complex Event Chain
    this.tutorials.set('complex-events', {
      id: 'complex-events',
      title: 'Complex Multi-Stage Events',
      difficulty: 'expert',
      duration: '45 minutes',
      description: 'Create sophisticated event chains with multiple NPCs and conditions',
      prerequisites: ['All previous tutorials', 'Map editing experience'],
      steps: [
        {
          id: 1,
          title: 'Event Planning',
          instruction: 'Design a multi-stage quest with flag progression',
          explanation: 'Plan how different NPCs interact and which flags control progression.',
          tips: ['Document all flag interactions', 'Create flowchart of event progression', 'Plan for edge cases']
        },
        {
          id: 2,
          title: 'Implementation Strategy',
          instruction: 'Implement using variables and complex flag logic',
          code: `// Quest stages using variables
// 0x8000 - Quest progress (0=not started, 1=stage1, 2=stage2, etc.)
// 0x830-0x839 - Quest flags

#dynamic 0x800000

#org @quest_giver
lock
faceplayer
checkvar 0x8000
compare LASTRESULT 0x0
if.eq.goto @start_quest
compare LASTRESULT 0x1
if.eq.goto @check_progress
compare LASTRESULT 0x2
if.eq.goto @quest_complete
goto @end

#org @start_quest
msgbox.default @quest_intro
setvar 0x8000 0x1
goto @end

// ... complex branching logic continues`,
          explanation: 'Variables allow more complex state tracking than simple flags.',
          tips: ['Use variables for multi-state tracking', 'Keep logic modular', 'Test all branches thoroughly']
        }
      ],
      nextTutorial: null
    });
  }
  
  // Get tutorial by ID
  getTutorial(id) {
    return this.tutorials.get(id);
  }
  
  // Get all tutorials sorted by difficulty
  getAllTutorials() {
    const tutorials = Array.from(this.tutorials.values());
    const difficultyOrder = { 'beginner': 1, 'intermediate': 2, 'advanced': 3, 'expert': 4 };
    
    return tutorials.sort((a, b) => {
      return difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
    });
  }
  
  // Get tutorials by difficulty level
  getTutorialsByDifficulty(difficulty) {
    return Array.from(this.tutorials.values())
      .filter(tutorial => tutorial.difficulty === difficulty);
  }
  
  // Get recommended next tutorial
  getNextTutorial(currentTutorialId) {
    const current = this.tutorials.get(currentTutorialId);
    return current?.nextTutorial ? this.tutorials.get(current.nextTutorial) : null;
  }
  
  // Generate step-by-step guide
  generateStepGuide(tutorialId, stepId = null) {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) return null;
    
    if (stepId) {
      const step = tutorial.steps.find(s => s.id === stepId);
      return step || null;
    }
    
    return tutorial;
  }
  
  // Validate tutorial prerequisites
  validatePrerequisites(tutorialId, completedTutorials = []) {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) return { valid: false, missing: [] };
    
    const missing = tutorial.prerequisites.filter(prereq => {
      // Check if it's a tutorial prerequisite
      if (prereq.startsWith('Completed "')) {
        const tutorialName = prereq.match(/Completed "(.+)"/)[1];
        return !completedTutorials.includes(tutorialName);
      }
      return false; // For non-tutorial prerequisites, assume they're met
    });
    
    return {
      valid: missing.length === 0,
      missing
    };
  }
  
  // Get tutorial progress tracking
  createProgressTracker(tutorialId) {
    const tutorial = this.getTutorial(tutorialId);
    if (!tutorial) return null;
    
    return {
      tutorialId,
      title: tutorial.title,
      totalSteps: tutorial.steps.length,
      currentStep: 0,
      completed: false,
      startedAt: new Date(),
      completedAt: null,
      stepProgress: tutorial.steps.map(step => ({
        id: step.id,
        title: step.title,
        completed: false,
        completedAt: null
      }))
    };
  }
  
  // Update progress tracker
  updateProgress(tracker, stepId) {
    const stepIndex = tracker.stepProgress.findIndex(s => s.id === stepId);
    if (stepIndex !== -1) {
      tracker.stepProgress[stepIndex].completed = true;
      tracker.stepProgress[stepIndex].completedAt = new Date();
      tracker.currentStep = Math.max(tracker.currentStep, stepId);
      
      // Check if tutorial is complete
      const allCompleted = tracker.stepProgress.every(s => s.completed);
      if (allCompleted && !tracker.completed) {
        tracker.completed = true;
        tracker.completedAt = new Date();
      }
    }
    
    return tracker;
  }
  
  // Get tutorial difficulty progression
  getDifficultyProgression() {
    return [
      {
        level: 'beginner',
        title: 'Beginner',
        description: 'Basic NPC scripting and dialogue',
        tutorials: this.getTutorialsByDifficulty('beginner')
      },
      {
        level: 'intermediate',
        title: 'Intermediate',
        description: 'Flags, conditions, and item handling',
        tutorials: this.getTutorialsByDifficulty('intermediate')
      },
      {
        level: 'advanced',
        title: 'Advanced',
        description: 'Trainer battles and complex events',
        tutorials: this.getTutorialsByDifficulty('advanced')
      },
      {
        level: 'expert',
        title: 'Expert',
        description: 'Multi-stage quests and advanced techniques',
        tutorials: this.getTutorialsByDifficulty('expert')
      }
    ];
  }
  
  // Search tutorials by keyword
  searchTutorials(query) {
    const queryLower = query.toLowerCase();
    return Array.from(this.tutorials.values()).filter(tutorial => {
      return tutorial.title.toLowerCase().includes(queryLower) ||
             tutorial.description.toLowerCase().includes(queryLower) ||
             tutorial.steps.some(step => 
               step.title.toLowerCase().includes(queryLower) ||
               step.instruction.toLowerCase().includes(queryLower)
             );
    });
  }
}

// Singleton instance
let tutorialSystem = null;

export function getTutorialSystem() {
  if (!tutorialSystem) {
    tutorialSystem = new ROMHackingTutorials();
  }
  return tutorialSystem;
}

export default ROMHackingTutorials;