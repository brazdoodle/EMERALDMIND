// === ULTIMATE HEX MANIAC ADVANCE KNOWLEDGE DATABASE ===
// Comprehensive, expert-level ROM hacking knowledge entries
// Verified against authoritative sources and community best practices

export const expertRomHackingKnowledge = [
  // === ADVANCED SCRIPTING MASTERY ===
  {
    category: "Scripting",
    topic: "Advanced HMA Script Architecture",
    content: `Master-level HMA scripting requires understanding the complete execution model:

MEMORY MANAGEMENT:
- #dynamic 0x800000: Auto-allocates in free space starting at 8MB
- #freespace: Finds gaps in existing ROM data
- #remove: Safely removes old scripts before rewriting
- Always check 'Free Space Finder' before large insertions

SCRIPT FLOW CONTROL:
- lock/release: Thread-safe player control (always pair these)
- lockall/releaseall: Freezes ALL NPCs and objects
- pause: Temporary delay (0-255 units, 1 unit ≈ 16ms)
- call/return: Stack-based subroutines (max depth ~8 levels)

ADVANCED TECHNIQUES:
- Multi-threading: Use 'special 0x113' for parallel script execution
- Conditional chains: if.flag.clear.call for complex branching
- Dynamic loading: setvar + goto for runtime script selection
- Error recovery: Always include 'end' fallbacks for invalid states

PERFORMANCE OPTIMIZATION:
- Minimize lock/release cycles
- Use 'special' commands for intensive operations
- Cache frequently-checked flags in variables
- Avoid nested script calls beyond 4 levels deep`,
    keywords: ["hma", "advanced", "scripting", "memory", "optimization", "threading", "performance"],
    isGlobal: true
  },

  {
    category: "Scripting", 
    topic: "Pokemon Emerald Flag System Mastery",
    content: `Complete understanding of Emerald's flag system for professional ROM hacking:

FLAG MEMORY LAYOUT:
0x200-0x2FF: Temporary flags (reset on map change, overworld actions)
0x300-0x3FF: Trainer defeat flags (one per trainer)
0x400-0x4FF: Item collection flags (hidden items, gifts)
0x500-0x5FF: Story progression (gym badges, major events)
0x600-0x6FF: Location access flags (surfing, strength blocks)
0x700-0x7FF: NPC interaction states
0x800-0x8FF: Custom hack flags (safe for modification)

CRITICAL SYSTEM FLAGS:
FLAG_SYS_POKEMON_GET (0x828): Enable Pokemon menu
FLAG_SYS_POKEDEX_GET (0x829): Enable Pokedex
FLAG_SYS_POKENAV_GET (0x82A): Enable PokeNav
FLAG_SYS_B_DASH (0x82C): Enable running shoes
FLAG_SYS_SAFARI_MODE (0x831): Safari zone active
FLAG_SYS_USE_STRENGTH (0x832): Strength boulders moveable

BADGE FLAGS (0x820-0x827):
FLAG_BADGE01_GET through FLAG_BADGE08_GET
Required for: HM usage, gym leader rematches, Elite Four access

PROFESSIONAL USAGE:
- Always document custom flag usage (0x800-0x8FF)
- Use meaningful flag names: FLAG_CUSTOM_COMPLETED_SIDEQUEST_DEVON
- Check system flags before story modifications
- Never directly modify trainer defeat flags
- Use conditional flag chains for complex story branching`,
    keywords: ["flags", "emerald", "system", "badges", "memory", "0x200", "0x800", "professional"],
    isGlobal: true
  },

  {
    category: "Scripting",
    topic: "Battle System Integration",
    content: `Expert-level Pokemon battle system modification and integration:

TRAINER BATTLE SETUP:
trainerbattle_start TRAINER_TYPE TRAINER_ID BATTLE_FLAGS
- TRAINER_TYPE: 0=normal, 1=continue_script_but_no_music, 2=double
- TRAINER_ID: Index in trainers table (0x23EAC4 in Emerald)
- BATTLE_FLAGS: Bit flags for special behaviors

WILD POKEMON BATTLES:
setwildbattle SPECIES LEVEL ITEM
- SPECIES: Pokemon index (1-386 for Gen 3)
- LEVEL: 1-100, affects all stats
- ITEM: Held item index, 0 for none

ADVANCED BATTLE FEATURES:
setvar VAR_BATTLE_OUTCOME 0x0  // Reset battle result
trainerbattle_no_intro TRAINER_TYPE TRAINER_ID LOSE_TEXT_POINTER
checkvar VAR_BATTLE_OUTCOME 0x1  // 0x0=lost, 0x1=won, 0x5=fled

REMATCH SYSTEM:
- Use flag checks to enable rematches
- Modify trainer data for level scaling
- Link to phone/PokeNav registration scripts

DOUBLE BATTLES:
trainerbattle_double TRAINER_ID PARTNER_ID INTRO_TEXT DEFEAT_TEXT
- Requires two trainer entries
- Partner trainer follows same AI patterns

BATTLE AI MODIFICATION:
- Trainer AI levels: 0x00 (random) to 0xFF (perfect)
- Smart switching flags in trainer data
- Custom AI routines via 'callasm' integration

POSTGAME BATTLES:
- Elite Four rematches (flags 0x4B0-0x4B3) 
- Champion rematch (flag 0x4B4)
- Frontier brain battles (special battle types)`,
    keywords: ["trainerbattle", "setwildbattle", "battle", "ai", "rematch", "double", "elite four"],
    isGlobal: true
  },

  {
    category: "Graphics",
    topic: "Professional Sprite Management",
    content: `Master-level Pokemon sprite editing and animation systems:

GBA SPRITE LIMITATIONS:
- Maximum 128 OAM sprites simultaneous
- 32KB VRAM for sprite tiles
- 15 colors + transparency per 4bpp sprite
- Size limits: 8x8 to 64x64 pixels per sprite part

POKEMON SPRITE STRUCTURE:
Front Sprite: 64x64 pixels, 4bpp indexed
Back Sprite: 64x64 pixels, 4bpp indexed  
Icon: 32x32 pixels, 4bpp indexed
Footprint: 16x16 pixels, 1bpp

PROFESSIONAL WORKFLOW:
1. Design in 64x64 canvas with GBA-safe palette
2. Use NSE (NamelessSprite Editor) for insertion
3. Test in-battle and overworld contexts
4. Verify animation frame timing
5. Check memory usage with multiple sprites

ANIMATION SYSTEMS:
- Front sprite: Idle animation (2-4 frames typical)
- Back sprite: Entrance animation only
- Overworld: Walking cycle (4 frames + standing)
- Battle intro: Slide-in with size scaling

ADVANCED TECHNIQUES:
- Palette sharing between related Pokemon
- Delta compression for animation frames
- OAM optimization for complex sprites
- Dynamic sprite loading for memory efficiency

COMMON ISSUES:
- Palette conflicts in multi-Pokemon battles
- Animation timing desync with audio
- VRAM overflow with too many unique tiles
- Incorrect transparency handling

TOOLS MASTERY:
- NSE: Primary sprite editor, batch operations
- G3T: Tileset integration, shared graphics
- Palette editors: Exact color matching
- Emulator debugging: Real-time sprite analysis`,
    keywords: ["sprites", "nse", "4bpp", "animation", "oam", "vram", "palette", "64x64"],
    isGlobal: true
  },

  {
    category: "Advanced",
    topic: "ASM Integration and Custom Routines",
    content: `Expert assembly programming integration for advanced ROM hacking:

CALLASM FUNDAMENTALS:
callasm 0x800000  // Call routine at specified address
- Routine must preserve registers (push/pop)
- Return with 'bx lr' instruction
- Use Thumb mode (.thumb directive)

REGISTER USAGE:
r0-r3: Argument registers, caller-saved
r4-r11: Local variables, callee-saved  
r12: Scratch register
r13 (sp): Stack pointer
r14 (lr): Link register (return address)
r15 (pc): Program counter

STANDARD ROUTINE TEMPLATE:
.thumb
push {r0-r7, lr}    // Save registers
// Your custom code here
pop {r0-r7, pc}     // Restore and return

COMMON USE CASES:
- Custom battle formulas (damage, accuracy)
- Advanced AI behaviors
- New move effects
- Dynamic text generation
- Hardware-level optimizations

MEMORY ACCESS:
ldr r0, =0x02000000  // Load RAM address
ldrb r1, [r0]        // Load byte from address
strb r1, [r0]        // Store byte to address

POKEMON DATA MANIPULATION:
- Party Pokemon: 0x02024284 (100 bytes per Pokemon)
- Current battle: 0x02024C08 battle struct
- RNG seed: 0x03005D80 (32-bit)
- Battle flags: 0x02022B4C

DEBUGGING TECHNIQUES:
- Use emulator memory viewer
- Strategic register dumps
- Conditional breakpoints
- Stack trace analysis

INTEGRATION BEST PRACTICES:
- Comment all custom routines extensively
- Use consistent calling conventions
- Test edge cases thoroughly
- Maintain compatibility with existing code
- Document all memory modifications`,
    keywords: ["asm", "assembly", "callasm", "thumb", "registers", "memory", "pokemon", "battle"],
    isGlobal: true
  },

  {
    category: "Tools",
    topic: "Professional ROM Hacking Workflow",
    content: `Industry-standard workflow for professional Pokemon ROM development:

PROJECT ORGANIZATION:
workspace/
├── roms/
│   ├── base/           // Clean ROM backups  
│   ├── working/        // Development versions
│   └── releases/       // Distribution builds
├── resources/
│   ├── graphics/       // Source images (PNG/BMP)
│   ├── audio/          // Music and sound files
│   ├── scripts/        // HMA/XSE source files
│   └── data/           // Tables and documentation
├── tools/              // ROM hacking utilities
└── docs/               // Project documentation

VERSION CONTROL:
- Git for all text-based files (scripts, documentation)
- Binary tracking for graphics and audio sources
- .gitignore ROM files (too large, use backup system)
- Branch per major feature/area
- Tag releases with version numbers

DEVELOPMENT CYCLE:
1. Feature planning and documentation
2. Resource creation (graphics, audio, scripts)
3. Integration testing in clean ROM copy
4. Compatibility testing across emulators
5. Beta testing with save state progression
6. Bug fixes and optimization
7. Release preparation and distribution

QUALITY ASSURANCE:
- Automated script validation
- Regression testing on previous saves
- Cross-emulator compatibility checks
- Performance profiling in complex areas
- Memory usage analysis

COLLABORATION STANDARDS:
- Shared flag/variable registry
- Code review for critical changes
- Documentation updates with features
- Regular build integration
- Issue tracking and resolution

TOOLS INTEGRATION:
- Advance Map: Map editing and events
- HMA: Scripts and data modification  
- G3T: Graphics and tileset management
- Audio tools: Music and sound effects
- Hex editors: Low-level debugging

BACKUP STRATEGY:
- Daily incremental backups
- Weekly full project archives
- Cloud storage for critical files
- Multiple ROM checkpoints
- Source control history preservation

DISTRIBUTION:
- IPS patches for modifications
- UPS patches for larger changes
- Documentation and readme files
- Installation instructions
- Compatibility warnings`,
    keywords: ["workflow", "git", "backup", "quality", "collaboration", "advance map", "hma", "distribution"],
    isGlobal: true
  },

  {
    category: "Game Mechanics",
    topic: "Pokemon Stats and Formula Mastery",
    content: `Deep understanding of Pokemon stat systems for mechanical modifications:

STAT CALCULATION FORMULAS:
HP = floor((2 * Base + IV + floor(EV/4)) * Level / 100) + Level + 10
Other = floor((floor((2 * Base + IV + floor(EV/4)) * Level / 100) + 5) * Nature)

BASE STAT RANGES:
HP: 1-255 (Shedinja=1, Blissey=255)
Attack/Defense/SpAtk/SpDef: 1-255 (typical range 20-180)
Speed: 1-255 (Shuckle=5, Ninjask=160, Deoxys-S=180)

IV (INDIVIDUAL VALUES):
Range: 0-31 for each stat
Stored as: 32-bit value with specific bit layout
HP IV = bit 0 of each other stat IV (complex derivation)

EV (EFFORT VALUES):
Range: 0-255 per stat, 510 total maximum
Gained from: Wild Pokemon battles (1-3 EVs each)
Items: Vitamins (+10), Wings (+1), Berries (reset)

NATURE EFFECTS:
+10%: Beneficial stat (x1.1 multiplier)
-10%: Hindered stat (x0.9 multiplier)  
Neutral: No change (x1.0 multiplier)
Affects: All stats except HP

DAMAGE CALCULATION:
Physical: ((((2*Level/5+2)*Attack*Move/Defense)/50)+2)*Modifiers
Special: Same formula with SpAtk/SpDef
Critical: 2x multiplier (can be modified)
STAB: 1.5x for same-type moves
Type effectiveness: 0x, 0.5x, 1x, 2x multipliers

SPEED CALCULATIONS:
Battle order determined by: Modified Speed stat
Paralysis: Speed *= 0.25
Choice Scarf: Speed *= 1.5
Tailwind: Team Speed *= 2 (4 turns)
Trick Room: Reverse speed order

MODIFICATION TECHNIQUES:
- Edit base stats in Pokemon data (0x44 bytes per species)
- Custom EV/IV manipulation via ASM
- Nature effect modification
- Formula alterations for different mechanics
- Custom stat calculations for new features`,
    keywords: ["stats", "formula", "iv", "ev", "nature", "damage", "speed", "calculation", "base"],
    isGlobal: true
  },

  {
    category: "Documentation",
    topic: "ROM Hacking Documentation Standards",
    content: `Professional documentation practices for ROM hacking projects:

PROJECT DOCUMENTATION:
README.md - Project overview, installation, credits
CHANGELOG.md - Version history and changes
INSTALL.txt - Step-by-step setup instructions
CREDITS.txt - Contributors and tool acknowledgments
LICENSE.txt - Usage rights and restrictions

TECHNICAL DOCUMENTATION:
flags.md - Complete flag usage registry
variables.md - Variable allocation and purposes  
commands.md - Custom command reference
memory.md - Memory layout and modifications
compatibility.md - Known issues and limitations

SCRIPT DOCUMENTATION:
// === SCRIPT HEADER TEMPLATE ===
// Name: [Descriptive script name]
// Purpose: [What this script accomplishes] 
// Location: [Map/Event where used]
// Flags: [Required flags, modified flags]
// Variables: [Used variables and ranges]
// Author: [Creator name]
// Date: [Creation/modification date]
// Version: [Script version number]

CODE COMMENTING STANDARDS:
- Explain WHY, not just WHAT
- Document all flag/variable modifications
- Note memory address usage
- Explain complex logic flows
- Reference related scripts/events

VERSION CONTROL MESSAGES:
feat: Add new trainer battle system
fix: Resolve flag conflict in Route 101
docs: Update script documentation
refactor: Optimize movement sequences
test: Add battle system validation

CHANGE LOG ENTRIES:
[Version] - [Date]
Added:
- New features and content
Changed:  
- Modifications to existing features
Fixed:
- Bug fixes and corrections
Removed:
- Deprecated or removed content

USER-FACING DOCUMENTATION:
- Feature overview with screenshots
- Installation requirements and steps
- Gameplay changes and new mechanics
- Troubleshooting common issues
- FAQ for frequently asked questions
- Contact information for support

COLLABORATION GUIDELINES:
- Code review requirements
- Testing procedures
- Documentation update responsibilities
- Communication channels
- Issue reporting standards`,
    keywords: ["documentation", "readme", "changelog", "comments", "git", "collaboration", "standards"],
    isGlobal: true
  }
];

// Export for easy integration with existing knowledge system
export default expertRomHackingKnowledge;