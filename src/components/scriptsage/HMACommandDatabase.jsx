
export const hmaCommands = {
  // === CORE SCRIPT COMMANDS ===
  lock: {
    syntax: "lock",
    description: "Freezes all NPCs and the player in place. Essential for preventing movement during dialogue.",
    category: "Core",
    parameters: [],
    examples: [
      {
        title: "Basic NPC Interaction",
        code: `script_npc_chat:
  lock
  faceplayer
  msgbox.default <hello_text>
  release
  end

hello_text:
{
  Hello there, trainer!
}`
      }
    ],
    related: ["release", "lockall", "faceplayer"],
    notes: "Always pair with 'release' to unfreeze movement. Script will hang without it."
  },

  lockall: {
    syntax: "lockall",
    description: "Freezes all NPCs, the player, and overworld sprites. More comprehensive than 'lock'.",
    category: "Core",
    parameters: [],
    examples: [
      {
        title: "Heal Player Party Script",
        code: `script_heal_bed:
  lockall
  msgbox.default <heal_text>
  closeonkeypress
  call <subroutine_heal>
  releaseall
  end`
      }
    ],
    related: ["releaseall", "lock"],
    notes: "Must be paired with 'releaseall'. Use for cutscenes where no movement should occur."
  },

  release: {
    syntax: "release",
    description: "Unfreezes all NPCs and the player. Must be used after 'lock'.",
    category: "Core",
    parameters: [],
    examples: [],
    related: ["lock", "releaseall", "end"],
    notes: "Critical for preventing frozen game states."
  },

  releaseall: {
    syntax: "releaseall",
    description: "Unfreezes everything that was frozen by 'lockall'.",
    category: "Core",
    parameters: [],
    examples: [],
    related: ["lockall", "release"],
    notes: "The necessary counterpart to 'lockall'."
  },

  faceplayer: {
    syntax: "faceplayer",
    description: "Makes the current NPC turn to face the player.",
    category: "Core",
    parameters: [],
    examples: [],
    related: ["lock", "msgbox"],
    notes: "Only works on the NPC executing the script."
  },

  msgbox: {
    syntax: "msgbox.default <text_pointer>",
    description: "Displays a standard dialogue box. Requires a pointer to text data. Variants: .npc, .yesno, .sign",
    category: "Core",
    parameters: [
      { name: "<text_pointer>", description: "A memory address or label pointing to the script's text." }
    ],
    examples: [
      {
        title: "Basic Dialogue",
        code: `main_script:
  lock
  faceplayer
  msgbox.default <dialogue_text>
  release
  end

dialogue_text:
{
  Welcome to our town!
}`
      }
    ],
    related: ["lock", "faceplayer", "release", "preparemsg"],
    notes: "Text blocks use special characters like '\\.' for ellipsis. .yesno variant for Yes/No prompts."
  },

  preparemsg: {
    syntax: "preparemsg <text_pointer>",
    description: "Prepares a message for display but doesn't show it yet. Must be followed by waitmsg.",
    category: "Core",
    parameters: [
      { name: "<text_pointer>", description: "Pointer to the message text" }
    ],
    examples: [
      {
        title: "Staged Message Display",
        code: `preparemsg <loading_text>
{
  Please pick a Loto Ticket.
  \\.\\..\CC080F\CC080F\CC080F\CC080F\\.\\..
}
waitmsg
special SomeGameFunction`
      }
    ],
    related: ["waitmsg", "msgbox"],
    notes: "Allows complex timing control for dramatic effect."
  },

  waitmsg: {
    syntax: "waitmsg",
    description: "Displays the message prepared by preparemsg and waits for user input.",
    category: "Core",
    parameters: [],
    examples: [],
    related: ["preparemsg"],
    notes: "Always use after preparemsg for proper message timing."
  },

  closeonkeypress: {
    syntax: "closeonkeypress",
    description: "Closes the preceding msgbox immediately on key press, without waiting for text scrolling.",
    category: "Core",
    parameters: [],
    examples: [],
    related: ["msgbox"],
    notes: "Useful for quick messages before actions."
  },

  end: {
    syntax: "end",
    description: "Terminates script execution. Every script must end with this command.",
    category: "Core",
    parameters: [],
    examples: [],
    related: ["release", "return"],
    notes: "Scripts without 'end' can cause game crashes."
  },

  return: {
    syntax: "return",
    description: "Ends a subroutine and returns to the point where 'call' was used.",
    category: "Core",
    parameters: [],
    examples: [],
    related: ["call", "end"],
    notes: "Using 'return' in a main script can lead to undefined behavior."
  },

  call: {
    syntax: "call <subroutine_pointer>",
    description: "Executes a subroutine at the given pointer, then returns to the next command.",
    category: "Core",
    parameters: [
      { name: "<subroutine_pointer>", description: "Pointer to the subroutine to execute." }
    ],
    examples: [
      {
        title: "Calling a Heal Subroutine",
        code: `main_script:
  msgbox.default <healing_prompt>
  call <heal_party_sub>
  msgbox.default <healed_message>
  end

heal_party_sub:
  special HealPlayerParty
  return`
      }
    ],
    related: ["return", "goto"],
    notes: "Subroutines are essential for reusable code and organization."
  },

  // === LOGIC & FLOW CONTROL ===
  goto: {
    syntax: "goto <pointer>",
    description: "Jumps script execution to the specified pointer. Does not return.",
    category: "Logic",
    parameters: [
      { name: "<pointer>", description: "Pointer to jump to." }
    ],
    examples: [
      {
        title: "Simple Loop",
        code: `loop_start:
  msgbox.default <loop_text>
  goto <loop_start>`
      }
    ],
    related: ["call", "if.flag.set.goto"],
    notes: "Be careful with 'goto' to avoid infinite loops."
  },

  'if.flag.set.goto': {
    syntax: "if.flag.set.goto [flag_id] <pointer>",
    description: "Jumps to a pointer if the specified flag is set (true).",
    category: "Logic",
    parameters: [
      { name: "[flag_id]", description: "The hexadecimal ID of the flag to check." },
      { name: "<pointer>", description: "Pointer to jump to if the flag is set." }
    ],
    examples: [
      {
        title: "Check Story Progression",
        code: `if.flag.set.goto 0x200 <story_complete_dialogue>
# Flag not set, continue script
msgbox.default <intro_dialogue>
setflag 0x200
end

story_complete_dialogue:
  msgbox.default <already_done_text>
  end`
      }
    ],
    related: ["setflag", "clearflag", "checkflag", "if.flag.not.set.goto"],
    notes: "The foundation of story progression and event management."
  },

  'if.flag.not.set.goto': {
    syntax: "if.flag.not.set.goto [flag_id] <pointer>",
    description: "Jumps to a pointer if the specified flag is NOT set (false).",
    category: "Logic",
    parameters: [
      { name: "[flag_id]", description: "The hexadecimal ID of the flag to check." },
      { name: "<pointer>", description: "Pointer to jump to if the flag is NOT set." }
    ],
    examples: [],
    related: ["if.flag.set.goto"],
    notes: "Often used to gate events until a prerequisite is met."
  },

  'if.yes.goto': {
    syntax: "if.yes.goto <pointer>",
    description: "Jumps to a pointer if the player chose 'Yes' in a preceding msgbox.yesno.",
    category: "Logic",
    parameters: [
      { name: "<pointer>", description: "Pointer to jump to on 'Yes'." }
    ],
    examples: [
      {
        title: "Yes/No Prompt Handling",
        code: `msgbox.yesno <confirm_text>
if.yes.goto <handle_yes>
# Player chose No
msgbox.default <handle_no_text>
release
end

handle_yes:
  msgbox.default <thank_you_text>
  release
  end`
      }
    ],
    related: ["if.no.goto", "msgbox"],
    notes: "If this command is skipped, execution continues, implying a 'No' choice."
  },

  'if.no.goto': {
    syntax: "if.no.goto <pointer>",
    description: "Jumps to a pointer if the player chose 'No' in a preceding msgbox.yesno.",
    category: "Logic",
    parameters: [
      { name: "<pointer>", description: "Pointer to jump to on 'No'." }
    ],
    examples: [],
    related: ["if.yes.goto", "msgbox"],
    notes: "Less common than 'if.yes.goto' but useful for specific logic flows."
  },

  'if.compare.goto': {
    syntax: "if.compare.goto [variable] [operator] [value] <pointer>",
    description: "Jumps to a pointer if a comparison between a variable and a value is true.",
    category: "Logic",
    parameters: [
      { name: "[variable]", description: "The variable to compare (e.g., varResult, 0x8000)." },
      { name: "[operator]", description: "Comparison operator: ==, !=, <, >, <=, >=" },
      { name: "[value]", description: "The value to compare against." },
      { name: "<pointer>", description: "Pointer to jump to if comparison is true." }
    ],
    examples: [
      {
        title: "Check Player's Starter Choice",
        code: `copyvar var0 0x4023
if.compare.goto var0 == 0 <chose_bulbasaur>
if.compare.goto var0 == 1 <chose_charmander>
if.compare.goto var0 == 2 <chose_squirtle>
end`
      }
    ],
    related: ["copyvar", "setvar", "if.compare.call"],
    notes: "Extremely versatile for any kind of conditional logic."
  },

  'if.compare.call': {
    syntax: "if.compare.call [variable] [operator] [value] <subroutine_pointer>",
    description: "Calls a subroutine if a comparison between a variable and a value is true.",
    category: "Logic",
    parameters: [
      { name: "[variable]", description: "The variable to compare." },
      { name: "[operator]", description: "Comparison operator." },
      { name: "[value]", description: "The value to compare against." },
      { name: "<subroutine_pointer>", description: "Pointer to the subroutine to call." }
    ],
    examples: [],
    related: ["if.compare.goto", "call"],
    notes: "Useful for modularizing conditional actions."
  },

  'if.gender.call': {
    syntax: "if.gender.call <male_subroutine> <female_subroutine>",
    description: "Calls a different subroutine based on the player's gender.",
    category: "Logic",
    parameters: [
      { name: "<male_subroutine>", description: "Pointer to the subroutine for male players." },
      { name: "<female_subroutine>", description: "Pointer to the subroutine for female players." }
    ],
    examples: [
      {
        title: "Gender-Specific Music",
        code: `if.gender.call <play_brendan_theme> <play_may_theme>

play_brendan_theme:
  playsong mus_encounter_brendan loop
  return

play_may_theme:
  playsong mus_encounter_may loop
  return`
      }
    ],
    related: ["if.gender.goto", "call"],
    notes: "A powerful tool for adding personalized touches to the game."
  },
  
  'if.gender.goto': {
    syntax: "if.gender.goto <male_label> <female_label>",
    description: "Branches script execution based on player gender. Male players go to first label, female players to second.",
    category: "Logic",
    parameters: [
      { name: "<male_label>", description: "Label to jump to if player is male" },
      { name: "<female_label>", description: "Label to jump to if player is female" }
    ],
    examples: [
      {
        title: "Gender-Specific Script Paths",
        code: `if.gender.goto <male_rival_encounter> <female_rival_encounter>

male_rival_encounter:
  msgbox.default <brendan_text>
  end

female_rival_encounter:
  msgbox.default <may_text>
  end`
      }
    ],
    related: ["if.gender.call", "goto"],
    notes: "Unlike if.gender.call, this command branches the entire script flow, not just subroutine calls."
  },

  // === FLAGS & VARIABLES ===
  setflag: {
    syntax: "setflag [flag_id]",
    description: "Sets a flag to true. Flags are used to track story progress and events.",
    category: "Flags",
    parameters: [
      { name: "[flag_id]", description: "Hexadecimal ID of the flag to set." }
    ],
    examples: [
      {
        title: "Marking an Event as Complete",
        code: `msgbox.default <event_text>
setflag 0x250 # Sets flag for 'EVENT_DEFEATED_RIVAL_1'`
      }
    ],
    related: ["clearflag", "checkflag", "if.flag.set.goto"],
    notes: "Flags are permanent and saved with the game."
  },

  clearflag: {
    syntax: "clearflag [flag_id]",
    description: "Clears a flag, setting it to false.",
    category: "Flags",
    parameters: [
      { name: "[flag_id]", description: "Hexadecimal ID of the flag to clear." }
    ],
    examples: [],
    related: ["setflag", "checkflag"],
    notes: "Useful for repeatable daily events or resetting states."
  },

  checkflag: {
    syntax: "checkflag [flag_id]",
    description: "Checks if a flag is set and stores the result (0 or 1) in varResult.",
    category: "Flags",
    parameters: [
      { name: "[flag_id]", description: "Hexadecimal ID of the flag to check." }
    ],
    examples: [
      {
        title: "Advanced Flag Check",
        code: `checkflag 0x300
if.compare.goto varResult == 1 <flag_was_set>
# Flag was not set...`
      }
    ],
    related: ["setflag", "if.compare.goto"],
    notes: "Less efficient than 'if.flag.set.goto' but necessary for complex logic."
  },

  setvar: {
    syntax: "setvar [variable] [value]",
    description: "Assigns a value to a variable.",
    category: "Variables",
    parameters: [
      { name: "[variable]", description: "The variable to set (e.g., varResult, 0x8000, temp1)." },
      { name: "[value]", description: "The value to assign." }
    ],
    examples: [
      {
        title: "Initialize a Counter",
        code: `setvar 0x8000 0
# This variable can now be used as a counter`
      },
      {
        title: "Set Temporary Variable",
        code: `setvar temp1 1 # Used for conditional logic later in script`
      }
    ],
    related: ["copyvar", "addvar", "if.compare.goto"],
    notes: "Variables are temporary unless they are special save game variables."
  },

  copyvar: {
    syntax: "copyvar [destination_var] [source_var]",
    description: "Copies the value from one variable to another.",
    category: "Variables",
    parameters: [
      { name: "[destination_var]", description: "The variable to copy to." },
      { name: "[source_var]", description: "The variable to copy from." }
    ],
    examples: [
      {
        title: "Store a Result",
        code: `checkflag 0x200 # Result is in varResult
copyvar 0x8001 varResult # Store the result in a different variable`
      }
    ],
    related: ["setvar"],
    notes: "Essential for preserving results from commands like 'checkflag'."
  },
  
  addvar: {
    syntax: "addvar [variable] [value]",
    description: "Adds value to the specified variable.",
    category: "Variables",
    parameters: [
      { name: "[variable]", description: "Variable to modify (can be temp1, 0x8000, etc.)" },
      { name: "[value]", description: "Value to add" }
    ],
    examples: [
      {
        title: "Increment Counter",
        code: `addvar temp1 1
if.compare.goto temp1 == 5 <counter_reached_five>`
      },
      {
        title: "Track Story Progress",
        code: `addvar 0x40D1 1`
      }
    ],
    related: ["setvar", "copyvar", "if.compare.goto"],
    notes: "Can work with temporary variables like temp1 or memory variables like 0x40D1. Variables will wrap around at 0xFFFF."
  },

  random: {
    syntax: "random [value]",
    description: "Generates a random number from 0 to (value - 1) and stores it in varResult.",
    category: "Variables",
    parameters: [
      { name: "[value]", description: "The upper bound (exclusive) for the random number." }
    ],
    examples: [
      {
        title: "Random NPC Dialogue",
        code: `random 3 # Generates 0, 1, or 2
if.compare.goto varResult == 0 <dialogue_1>
if.compare.goto varResult == 1 <dialogue_2>
goto <dialogue_3>`
      }
    ],
    related: ["if.compare.goto"],
    notes: "Perfect for lotteries, varied NPC text, or unpredictable events."
  },

  // === MOVEMENT COMMANDS ===
  applymovement: {
    syntax: "applymovement [sprite_id] <movement_pointer>",
    description: "Applies a sequence of movements to a specified sprite.",
    category: "Movement",
    parameters: [
      { name: "[sprite_id]", description: "ID of the sprite to move (255 for player)." },
      { name: "<movement_pointer>", description: "Pointer to the movement data." }
    ],
    examples: [
      {
        title: "Move Player and NPC",
        code: `applymovement 255 <player_path>
applymovement 3 <npc_path>
waitmovement 0

player_path:
{
  walk_up
  walk_up
}

npc_path:
{
  walk_down
  walk_down
}`
      }
    ],
    related: ["waitmovement", "move.npc"],
    notes: "Use 'waitmovement 0' to wait for all movements to complete."
  },

  waitmovement: {
    syntax: "waitmovement [sprite_id]",
    description: "Pauses script execution until a sprite has finished its movement.",
    category: "Movement",
    parameters: [
      { name: "[sprite_id]", description: "ID of the sprite to wait for (0 for all)." }
    ],
    examples: [],
    related: ["applymovement"],
    notes: "'waitmovement 0' is a common and critical command for synchronizing scenes."
  },

  hidesprite: {
    syntax: "hidesprite [sprite_id]",
    description: "Makes a sprite invisible.",
    category: "Movement",
    parameters: [
      { name: "[sprite_id]", description: "ID of the sprite to hide." }
    ],
    examples: [
      {
        title: "NPC Teleports Away",
        code: `fadescreen ToBlack
hidesprite 4
fadescreen FromBlack`
      }
    ],
    related: ["showsprite"],
    notes: "Combined with screen fades, this can create teleport or disappearance effects."
  },

  showsprite: {
    syntax: "showsprite [sprite_id]",
    description: "Makes a hidden sprite visible.",
    category: "Movement",
    parameters: [
      { name: "[sprite_id]", description: "ID of the sprite to show." }
    ],
    examples: [],
    related: ["hidesprite"],
    notes: "Often used to make an NPC 'appear' in a scene."
  },

  'move.npc': {
    syntax: "move.npc [sprite_id] <movement_pointer>",
    description: "A blocking version of applymovement. The script pauses until this single movement is complete.",
    category: "Movement",
    parameters: [
      { name: "[sprite_id]", description: "ID of the sprite to move" },
      { name: "<movement_pointer>", description: "Pointer to the movement data" }
    ],
    examples: [
      {
        title: "Sequential NPC Movement",
        code: `move.npc 3 <path_part_1>
move.npc 3 <path_part_2>
# The second move only starts after the first is complete`
      }
    ],
    related: ["applymovement", "waitmovement"],
    notes: "Simpler for linear, sequential movements than applymovement + waitmovement."
  },

  'move.player': {
    syntax: "move.player <movement_pointer>",
    description: "A blocking version of applymovement specifically for the player (sprite ID 255).",
    category: "Movement",
    parameters: [
      { name: "<movement_pointer>", description: "Pointer to the player's movement data." }
    ],
    examples: [],
    related: ["move.npc", "applymovement"],
    notes: "Convenience command for simple player pathing."
  },
  
  movesprite: {
    syntax: "movesprite [sprite_id] [x] [y]",
    description: "Instantly teleports a sprite to the specified X and Y coordinates on the map.",
    category: "Movement",
    parameters: [
      { name: "[sprite_id]", description: "ID of the sprite to move" },
      { name: "[x]", description: "X coordinate to move to" },
      { name: "[y]", description: "Y coordinate to move to" }
    ],
    examples: [
      {
        title: "Prepare a Cutscene",
        code: `fadescreen ToBlack
hidesprite 4
movesprite 4 10 12 # Move NPC off-screen
showsprite 4
fadescreen FromBlack`
      }
    ],
    related: ["hidesprite", "showsprite"],
    notes: "Best used during a screen fade to avoid jarring visual jumps."
  },

  movesprite2: {
    syntax: "movesprite2 [sprite_id] [x] [y]",
    description: "Instantly repositions a sprite to new coordinates, similar to movesprite. Often used to set up scenes.",
    category: "Movement",
    parameters: [
      { name: "[sprite_id]", description: "ID of the sprite to move" },
      { name: "[x]", description: "X coordinate" },
      { name: "[y]", description: "Y coordinate" }
    ],
    examples: [
      {
        title: "Advanced Sprite Positioning",
        code: `fadescreen ToBlack
movesprite2 43 27 25
fadescreen FromBlack
showsprite 43
msgbox.default <scott_arrival_text>`
      }
    ],
    related: ["movesprite", "showsprite", "hidesprite"],
    notes: "Like movesprite, this is best used during a screen fade to set sprite positions for a new scene."
  },

  // === BATTLE COMMANDS ===
  trainerbattle: {
    syntax: "trainerbattle.single [trainer_id] [intro_text_id] <defeat_text_pointer> [optional_script_pointer]",
    description: "Initiates a complete trainer battle sequence.",
    category: "Battle",
    parameters: [
      { name: "[trainer_id]", description: "The numeric ID of the trainer to battle." },
      { name: "[intro_text_id]", description: "ID for the pre-battle dialogue." },
      { name: "<defeat_text_pointer>", description: "Pointer to text shown when trainer is defeated." },
      { name: "[optional_script_pointer]", description: "Pointer to a script to run if the player loses." }
    ],
    examples: [
      {
        title: "Standard Trainer Battle",
        code: `trainerbattle.single 1 0 <defeat_text>

defeat_text:
{
  Wow, you're strong!
}`
      }
    ],
    related: ["single.battle.nointro"],
    notes: "This is the all-in-one command for standard trainer encounters."
  },
  
  'single.battle.nointro': {
    syntax: "single.battle.nointro [trainer_id] <defeat_text_pointer>",
    description: "Initiates a trainer battle without the standard intro animation. More streamlined for mid-script battles.",
    category: "Battle",
    parameters: [
      { name: "[trainer_id]", description: "The trainer's ID (e.g., May~6, Brendan~3)" },
      { name: "<defeat_text_pointer>", description: "Pointer to text shown when trainer is defeated" }
    ],
    examples: [
      {
        title: "Quick Rival Battle",
        code: `single.battle.nointro May~6 <defeat_text>
# Script continues immediately after battle

defeat_text:
{
  You're getting stronger!
}`
      }
    ],
    related: ["trainerbattle", "copyvar"],
    notes: "Perfect for story-integrated battles where a full intro sequence is not desired."
  },

  // === VISUAL & SCREEN EFFECTS ===
  fadescreen: {
    syntax: "fadescreen [effect]",
    description: "Fades the screen to or from a color. Common effects: ToBlack, FromBlack, ToWhite, FromWhite.",
    category: "Visuals",
    parameters: [
      { name: "[effect]", description: "The fade effect to use." }
    ],
    examples: [
      {
        title: "Scene Transition",
        code: `fadescreen ToBlack
# ... perform actions while screen is black (e.g., movesprite)
fadescreen FromBlack`
      }
    ],
    related: ["hidesprite", "movesprite"],
    notes: "Essential for smooth scene transitions and hiding sprite movements."
  },
  
  fadedefault: {
    syntax: "fadedefault",
    description: "Performs a standard black fade-out and fade-in, often used for transitions.",
    category: "Visuals",
    parameters: [],
    examples: [
      {
        title: "Simple Transition",
        code: `msgbox.default <leaving_text>
closeonkeypress
fadedefault
# (actions to warp player would go here)
release
end`
      }
    ],
    related: ["fadescreen", "pause"],
    notes: "A convenient shorthand for 'fadescreen ToBlack' followed by 'fadescreen FromBlack' with a slight delay."
  },

  pause: {
    syntax: "pause [frames]",
    description: "Pauses script execution for a number of frames (60 frames = 1 second).",
    category: "Visuals",
    parameters: [
      { name: "[frames]", description: "Number of frames to wait." }
    ],
    examples: [
      {
        title: "Dramatic Pause",
        code: `msgbox.default <dramatic_line>
pause 60 # Wait for 1 second
msgbox.default <response_line>`
      }
    ],
    related: ["waitmovement", "waitcry"],
    notes: "Crucial for controlling the timing and pacing of cutscenes."
  },

  // === POKEMON & ITEM COMMANDS ===
  givepokemon: {
    syntax: "givepokemon [species] [level] [item] 0 0 0",
    description: "Gifts a Pokémon to the player.",
    category: "Pokemon",
    parameters: [
      { name: "[species]", description: "Species ID of the Pokémon." },
      { name: "[level]", description: "Level of the Pokémon." },
      { name: "[item]", description: "Held item ID (0 for none)." }
    ],
    examples: [
      {
        title: "Give Player a Starter",
        code: `givepokemon SPECIES_CHARMANDER 5 ITEM_NONE 0 0 0
setflag 0x828`
      }
    ],
    related: ["npc.item", "setflag"],
    notes: "Always check for party space before using this command."
  },
  
  countPokemon: {
    syntax: "countPokemon",
    description: "Counts the number of Pokémon in the player's party and stores it in varResult.",
    category: "Pokemon",
    parameters: [],
    examples: [
      {
        title: "Check for Party Space",
        code: `countPokemon
if.compare.goto varResult == 6 <party_full_script>
# Party has space, proceed to give Pokemon
givepokemon SPECIES_EEVEE 5 ITEM_NONE 0 0 0`
      }
    ],
    related: ["givepokemon", "if.compare.goto"],
    notes: "Essential for preventing errors when giving a Pokémon to the player."
  },
  
  'npc.item': {
    syntax: "npc.item [item_id] [quantity]",
    description: "Gives an item to the player, with a standard 'Player received X' message.",
    category: "Items",
    parameters: [
      { name: "[item_id]", description: "The ID of the item to give." },
      { name: "[quantity]", description: "The number of items to give." }
    ],
    examples: [
      {
        title: "Give Player a Potion",
        code: `msgbox.default <item_gift_text>
npc.item ITEM_POTION 1
msgbox.default <item_explanation_text>`
      }
    ],
    related: ["givepokemon", "checkitem"],
    notes: "Handles showing the 'item get' fanare and message automatically."
  },

  checkitem: {
    syntax: "checkitem [item_id] [quantity]",
    description: "Checks if the player has a certain quantity of an item. Stores result in varResult.",
    category: "Items",
    parameters: [
      { name: "[item_id]", description: "ID of the item to check." },
      { name: "[quantity]", description: "Minimum quantity the player must have." }
    ],
    examples: [
      {
        title: "Key Item Check",
        code: `checkitem ITEM_SS_TICKET 1
if.compare.goto varResult == 1 <player_has_ticket>
msgbox.default <no_ticket_text>
release
end

player_has_ticket:
  msgbox.default <welcome_aboard_text>
  end`
      }
    ],
    related: ["if.compare.goto", "npc.item"],
    notes: "Result is 1 if they have enough, 0 if not."
  },

  // === SPECIAL & SYSTEM COMMANDS ===
  special: {
    syntax: "special [function_name]",
    description: "Executes a hardcoded function in the game's engine. Extremely powerful and versatile.",
    category: "Special",
    parameters: [
      { name: "[function_name]", description: "The name of the special function to call." }
    ],
    examples: [
      {
        title: "Heal Player's Party",
        code: `special HealPlayerParty
waitstate`
      },
      {
        title: "Show Pokédex",
        code: `special ShowPokedex
waitstate`
      }
    ],
    related: ["waitstate", "copyvar", "fadescreen", "special2", "setvar"],
    notes: "Key battle specials: SavePlayerParty, LoadPlayerParty, ChooseHalfPartyForBattle, DoSpecialTrainerBattle, SetCB2WhiteOut. Many 'special' commands are configured by setting variables like var4, var5, etc. right before they are called."
  },

  special2: {
    syntax: "special2 [variable] [function_name]",
    description: "An advanced version of 'special' that can pass a variable's value to the game function and often stores results in the specified variable.",
    category: "Special",
    parameters: [
      { name: "[variable]", description: "The variable (e.g., varResult, var4) to store the result or pass as input." },
      { name: "[function_name]", description: "The name of the special function to call." }
    ],
    examples: [
      {
        title: "Check Day-care State",
        code: `special2 varResult GetDaycareState
if.compare.goto varResult == 2 <one_pokemon_stored>
if.compare.goto varResult == 3 <two_pokemon_stored>`
      },
      {
        title: "Check Party Composition",
        code: `special2 varResult CountPartyAliveNonEggMons
if.compare.goto varResult <= 1 <cannot_deposit>
# Safe to deposit a Pokemon`
      }
    ],
    related: ["special", "countPokemon", "if.compare.goto"],
    notes: "Essential for complex game systems. Common functions: GetDaycareState, CountPartyNonEggMons, CalculatePlayerPartyCount, IsEnoughForCostInVar5, GetSelectedMonNicknameAndSpecies."
  },

  waitstate: {
    syntax: "waitstate",
    description: "Pauses script execution until a 'special' command has finished.",
    category: "Special",
    parameters: [],
    examples: [],
    related: ["special", "special2"],
    notes: "Absolutely necessary after 'special' commands that open a new screen or menu."
  },

  checkdailyflags: {
    syntax: "checkdailyflags",
    description: "A special command used to manage daily, repeatable events.",
    category: "Special",
    parameters: [],
    examples: [],
    related: ["setflag", "clearflag"],
    notes: "Part of the system for events like lotteries or berry giveaways."
  },

  incrementhiddenvalue: {
    syntax: "incrementhiddenvalue [id]",
    description: "Increments a hidden game counter, used for various background mechanics.",
    category: "Special",
    parameters: [
      { name: "[id]", description: "The ID of the hidden value to increment." }
    ],
    examples: [
      {
        title: "Increment Daycare Counter",
        code: `# After storing a pokemon in daycare
incrementhiddenvalue 47`
      }
    ],
    related: ["setvar", "addvar"],
    notes: "These values are not standard flags or variables and are used for specific engine functions."
  },

  // === SOUND COMMANDS ===
  sound: {
    syntax: "sound [sound_id]",
    description: "Plays a specific sound effect.",
    category: "Audio",
    parameters: [
      { name: "[sound_id]", description: "The ID of the sound effect." }
    ],
    examples: [
      {
        title: "Item Found Sound",
        code: `sound se_itemfind
# Player finds a hidden item`
      },
      {
        title: "Shop Transaction Sound",
        code: `special SubtractMoneyFromVar5
sound se_shop`
      }
    ],
    related: ["waitsound", "playsong", "cry"],
    notes: "Sound IDs (e.g., se_shop, se_save) must be known."
  },
  
  waitsound: {
    syntax: "waitsound",
    description: "Pauses script execution until the current sound effect has finished playing.",
    category: "Audio",
    parameters: [],
    examples: [
      {
        title: "Synchronized Sound and Dialogue",
        code: `sound se_door
waitsound
msgbox.default <door_opened_text>`
      }
    ],
    related: ["sound", "waitcry"],
    notes: "Ensures sound effects don't overlap with subsequent actions."
  },

  playsong: {
    syntax: "playsong [song_id] [optional: loop]",
    description: "Plays a music track. Can be looped for background music.",
    category: "Audio",
    parameters: [
      { name: "[song_id]", description: "The ID of the music track (e.g., mus_encounter_may)." },
      { name: "[optional: loop]", description: "If 'loop' is added, the song will repeat." }
    ],
    examples: [
      {
        title: "Play Rival Battle Theme",
        code: `playsong mus_encounter_may loop`
      }
    ],
    related: ["savesong", "fadesong"],
    notes: "Used to change the mood of a scene or area."
  },
  
  savesong: {
    syntax: "savesong [song_id]",
    description: "Saves the currently playing song so it can be restored later, then plays the new song.",
    category: "Audio",
    parameters: [
      { name: "[song_id]", description: "The new song to play (e.g., mus_dummy to silence)." }
    ],
    examples: [
      {
        title: "Temporarily Silence Music",
        code: `savesong mus_dummy
# ... dramatic cutscene ...
fadedefault # Restores saved song`
      }
    ],
    related: ["playsong", "fadedefault"],
    notes: "Often paired with 'fadedefault' or 'fadesong' which restores the saved music."
  },
  
  fadesong: {
    syntax: "fadesong [song_id]",
    description: "Fades out the current song and fades in a new one. Often restores music saved by 'savesong'.",
    category: "Audio",
    parameters: [
        { name: "[song_id]", description: "The ID of the song to fade to." }
    ],
    examples: [],
    related: ["playsong", "savesong"],
    notes: "Provides a smoother transition than abruptly changing songs with 'playsong'."
  },
  
  cry: {
    syntax: "cry [pokemon_species_or_variable] [pitch_modifier]",
    description: "Plays the cry sound of a specific Pokemon species. Can use a species constant or a variable.",
    category: "Audio", 
    parameters: [
      { name: "[pokemon_species_or_variable]", description: "Pokemon species constant (e.g. SPECIES_PIKACHU) or a variable like 0x8005" },
      { name: "[pitch_modifier]", description: "Pitch adjustment (0 = normal)" }
    ],
    examples: [
      {
        title: "Play Received Pokemon's Cry",
        code: `special2 var5 GetSelectedMonNicknameAndSpecies
waitsound
cry 0x8005 0
msgbox.default <received_pokemon_text>
waitcry`
      }
    ],
    related: ["waitcry", "waitsound", "sound"],
    notes: "Essential for Pokemon-related events. Variable 0x8005 is commonly used to hold the species ID from a preceding 'special' call."
  },

  waitcry: {
    syntax: "waitcry", 
    description: "Waits for the currently playing Pokemon cry to finish.",
    category: "Audio",
    parameters: [],
    examples: [],
    related: ["cry", "waitsound"],
    notes: "Ensures that dialogue or other actions don't start until the cry is complete, improving presentation."
  },
};


export const commandCategories = ["All Commands", ...Object.keys(
  Object.values(hmaCommands).reduce((acc, cmd) => {
    acc[cmd.category] = true;
    return acc;
  }, {})
).sort()];

export function getCommandsByCategory(category) {
  if (category === "All Commands") {
    return hmaCommands;
  }
  return Object.fromEntries(
    Object.entries(hmaCommands).filter(([, cmd]) => cmd.category === category)
  );
}

export function searchCommands(term) {
  const lowercasedTerm = term.toLowerCase();
  return Object.fromEntries(
    Object.entries(hmaCommands).filter(([key, cmd]) =>
      key.toLowerCase().includes(lowercasedTerm) ||
      cmd.description.toLowerCase().includes(lowercasedTerm) ||
      cmd.category.toLowerCase().includes(lowercasedTerm)
    )
  );
}
