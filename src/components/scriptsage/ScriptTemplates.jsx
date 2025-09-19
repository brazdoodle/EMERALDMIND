
// === PROFESSIONAL HMA/XSE SCRIPT TEMPLATES ===
// Real, tested script templates reflecting authentic ROM hacking syntax

export const scriptTemplates = {
  basic_npc: {
    title: "Basic NPC Dialogue",
    category: "NPCs",
    description: "Standard NPC conversation with proper structure and pointers.",
    difficulty: "Beginner",
    code: `script_npc_standard:
  lock
  faceplayer
  msgbox.default <text_npc_standard>
  release
  end

text_npc_standard:
{
  Hello there, trainer!
  The world of POKéMON is vast
  and full of wonders!
}`,
    features: ["Basic dialogue", "Pointer-based text", "Standard lock/release"]
  },

  item_giver_flag_check: {
    title: "Item Giver (with Flag Check)",
    category: "Items",
    description: "Gives an item only once, with robust bag-full checking. Based on classic ROM hacking patterns.",
    difficulty: "Intermediate",
    code: `script_item_giver:
  lock
  faceplayer
  if.flag.set.goto 0x250 <already_received_item>
  msgbox.default <offer_item_text>
  npc.item "Potion" 1 // This is a custom command for a common operation
  if.no.goto <bag_is_full>
  setflag 0x250
  msgbox.default <received_item_thanks>
  release
  end

already_received_item:
  msgbox.default <already_received_reminder>
  release
  end

bag_is_full:
  msgbox.default <bag_full_text>
  release
  end

offer_item_text:
{
  You look like you're on an
  important journey.
  
  Please, take this!
}

received_item_thanks:
{
  (Player obtained a Potion!)
  
  Take care of your POKéMON!
}

already_received_reminder:
{
  I hope that item is useful
  for you on your journey.
}

bag_full_text:
{
  Oh, it seems your Bag is full.
  Make some space and come back!
}`,
    features: ["One-time event (flag)", "Efficient bag check", "Multiple dialogue pointers", "Branching logic"]
  },

  conditional_npc: {
    title: "Conditional NPC (Story Progression)",
    category: "NPCs",
    description: "NPC with different dialogue based on a story flag.",
    difficulty: "Intermediate",
    code: `script_story_npc:
  lock
  faceplayer
  if.flag.set.goto 0x205 <after_event_dialogue>
  msgbox.default <before_event_dialogue>
  release
  end

after_event_dialogue:
  msgbox.default <post_event_dialogue>
  release
  end

before_event_dialogue:
{
  The GYM LEADER is tough! I wonder
  if anyone can beat him.
}

post_event_dialogue:
{
  Wow, you beat the GYM LEADER!
  That's incredible!
  
  You're a real pro!
}`,
    features: ["Flag checking", "Conditional branching", "Story progression"]
  },
  
  starter_selection: {
    title: "Starter Pokemon Selection",
    category: "Pokemon",
    description: "A classic starter selection system with choices and subroutines.",
    difficulty: "Advanced",
    code: `script_starter_choice:
  lock
  faceplayer
  if.flag.set.goto 0x820 <already_chose_starter>
  
  msgbox.default <prof_intro>
  multichoice 20 8 3 0 // x, y, options, cancel option (0 = CANCEL)
  compare LASTRESULT 0
  if.equal.goto <chose_grass>
  compare LASTRESULT 1
  if.equal.goto <chose_fire>
  compare LASTRESULT 2
  if.equal.goto <chose_water>
  
  // Player cancelled (LASTRESULT will be 3 if CANCEL option is 0)
  msgbox.default <prof_come_back>
  release
  end
  
chose_grass:
  msgbox.yesno <confirm_grass>
  if.no.goto <script_starter_choice>
  call <give_treecko_script>
  goto <starter_given>
  
chose_fire:
  msgbox.yesno <confirm_fire>
  if.no.goto <script_starter_choice>
  call <give_torchic_script>
  goto <starter_given>

chose_water:
  msgbox.yesno <confirm_water>
  if.no.goto <script_starter_choice>
  call <give_mudkip_script>
  goto <starter_given>
  
starter_given:
  setflag 0x820
  msgbox.default <prof_good_luck>
  release
  end

already_chose_starter:
  msgbox.default <prof_hows_pokemon>
  release
  end

// --- Subroutines for giving pokemon ---
give_treecko_script:
  givepokemon 0xFC 5 0 0 0 0 // Treecko (0xFC), Lv.5, Default IVs/Ability/Gender/Nature
  return
  
give_torchic_script:
  givepokemon 0xFD 5 0 0 0 0 // Torchic (0xFD), Lv.5, Default IVs/Ability/Gender/Nature
  return
  
give_mudkip_script:
  givepokemon 0xFE 5 0 0 0 0 // Mudkip (0xFE), Lv.5, Default IVs/Ability/Gender/Nature
  return

// --- Text Pointers ---
prof_intro:
{
  Welcome, new trainer!
  It's time to choose your first
  POKéMON partner.
}

confirm_grass:
{
  Are you sure you want to
  choose TREEKO?
}

confirm_fire:
{
  Are you sure you want to
  choose TORCHIC?
}

confirm_water:
{
  Are you sure you want to
  choose MUDKIP?
}

prof_come_back:
{
  Oh, you couldn't decide?
  Come back when you're ready!
}

prof_good_luck:
{
  Excellent choice! Take good
  care of your new partner!
}

prof_hows_pokemon:
{
  How is your POKéMON doing?
  I hope you two are getting
  along well!
}`,
    features: ["Multiple choices", "Yes/No confirmation", "Subroutines (`call`/`return`)", "Complex branching"]
  },

  starter_selection_scene: {
    title: "Starter Selection Scene (Official)",
    category: "Cutscenes",
    description: "The complete, authentic script for the starter selection event when Prof. Birch is attacked.",
    difficulty: "Expert",
    code: `script_birch_starter_choice:
  lock
  faceplayer
  setflag 0x0860
  setflag 0x0052
  fadescreen ToBlack
  hidesprite 4
  movesprite PLAYER 6 13
  move.player <player_turn_in_place>
  special ChooseStarter
  waitstate
  move.npc 2 <prof_walk_right>
  msgbox.default <birch_thank_you_text>
  special HealPlayerParty
  setflag 0x02D0
  clearflag 0x02D1
  setflag 0x02BC
  setvar 0x4084 2
  setvar 0x4060 3
  clearflag 0x4000
  if.gender.call <set_male_flag_sub> <set_female_flag_sub>
  warp.xy 1 4 6 5
  waitstate
  release
  end

player_turn_in_place:
{
  walk_in_place_fastest_left
}

prof_walk_right:
{
  walk_right
}

set_male_flag_sub:
  setflag 0x02D2
  return

set_female_flag_sub:
  setflag 0x02F8
  return

birch_thank_you_text:
{
  Prof. Birch: Whew\\.
  
  I was in the tall grass studying wild
  Pokémon when I was jumped.
  
  You saved me. Thanks a lot!
  
  Oh?
  
  Hi, you're [player]!
  
  This is not the place to chat, so come
  by my Pokémon Lab later, okay?
}`,
    features: ["Scene setup", "Sprite manipulation", "Hardcoded special functions", "Wait states", "Gender-based logic", "Warping"]
  },

  gym_leader_battle: {
    title: "Gym Leader Battle Script",
    category: "Trainers",
    description: "Complete gym leader with pre-battle dialogue and post-battle rewards.",
    difficulty: "Advanced",
    code: `script_gym_leader:
  lock
  faceplayer
  if.trainerflag.set.goto 250 <already_defeated> // Trainer ID 250
  
  msgbox.default <leader_intro_text>
  trainerbattle.single 250 <leader_loss_script> <leader_win_script> // Trainer ID, Loss script, Win script
  release
  end

leader_loss_script:
  msgbox.default <leader_loss_text>
  release
  end

leader_win_script:
  msgbox.default <leader_victory_speech>
  setflag 0x800 // Player has Badge 1
  giveitem ITEM_TM39 1 0x2 // Give TM, 0x2 for MSG_OBTAIN message
  settrainerflag 250 // Mark trainer as defeated
  release
  end

already_defeated:
  msgbox.default <leader_rematch_text>
  release
  end

// --- Text Pointers ---
leader_intro_text:
{
  So, you've finally made it.
  Show me if your bond with your
  POKéMON is strong enough!
}
leader_loss_text:
{
  What? I can't believe my
  rock-hard POKéMON lost!
}
leader_victory_speech:
{
  You've proven your strength!
  As a reward, take this TM!
}
leader_rematch_text:
{
  The BOULDER BADGE brought out
  the power of your POKéMON!
  
  Keep training and become even
  stronger!
}`,
    features: ["Trainer battles", "Badge giving logic", "TM reward", "Trainer flag checking"]
  },

  cutscene_movement: {
    title: "Cinematic Cutscene",
    category: "Cutscenes",
    description: "Multi-character cutscene with synchronized movement and dialogue.",
    difficulty: "Expert",
    code: `script_cutscene_example:
  lock
  fadescreen 0x1 // Fade to black
  
  applymovement 0x4 <grunt1_path> // Object ID 4 (Grunt 1)
  applymovement 0x5 <grunt2_path> // Object ID 5 (Grunt 2)
  waitmovement 0x0 // Wait for all objects to finish
  
  fadescreen 0x0 // Fade from black
  
  msgbox.default <grunt1_dialogue>
  
  applymovement 0xFF <boss_path> // 0xFF is this event (player or event controlling script)
  waitmovement 0x0
  
  msgbox.default <boss_dialogue>
  
  release
  end

// --- Movement Pointers ---
grunt1_path:
{
  walk_fast_down
  walk_fast_down
  0xFE
}

grunt2_path:
{
  delay_8
  walk_fast_down
  walk_fast_down
  0xFE
}

boss_path:
{
  face_up
  walk_down
  walk_down
  face_right
  0xFE
}

// --- Text Pointers ---
grunt1_dialogue:
{
  GRUNT: Boss, the plan is in
  motion! We'll have control
  soon!
}
boss_dialogue:
{
  BOSS: Excellent! No one can
  stop us now!
}`,
    features: ["Multi-character movement", "Synchronized timing", "Screen fades", "Scene choreography"]
  },

  heal_spot_bed: {
    title: "Player Heal Spot (Bed)",
    category: "Cutscenes",
    description: "A complete, reusable script for healing the player's party when they interact with an object like a bed.",
    difficulty: "Intermediate",
    code: `script_heal_bed:
  lockall
  msgbox.default <text_heal_prompt>
  closeonkeypress
  call <subroutine_heal_party>
  releaseall
  end
  
subroutine_heal_party:
  fadescreen ToBlack
  fanfare mus_heal
  waitfanfare
  special HealPlayerParty
  fadescreen FromBlack
  return

text_heal_prompt:
{
  There's a bed.
  Let's take a rest.
}`,
    features: ["Subroutine (call/return)", "Screen fades", "Sound/Fanfare", "Party healing", "lockall/releaseall"]
  },

  daily_random_item_giver: {
    title: "Daily Random Item Giver",
    category: "Advanced",
    description: "NPC gives the player a random item from a specific range, but only once per day.",
    difficulty: "Expert",
    code: `script_daily_random_giver:
  lock
  faceplayer
  checkdailyflags
  if.flag.set.goto 0x4010 <already_received>
  
  msgbox.default <offer_item_text>
{
  Hello, trainer! As a thank you for
  visiting, please take this Berry!
}
  
  random 10          // varResult is now 0-9
  addvar varResult 153 // varResult is now 153-162 (Oran-Aspear Berry)
  npc.item 0x800D 1    // Give item from varResult
  if.no.goto <bag_full>
  
  setflag 0x4010
  msgbox.default <come_again_text>
{
  Enjoy! Come back tomorrow for another!
}
  release
  end

already_received:
  msgbox.default <already_received_text>
{
  I've already given you something today.
  Please visit me again tomorrow!
}
  release
  end

bag_full:
  msgbox.default <bag_full_text>
{
  Oh dear, your Bag is full.
  Make some space and then we'll talk.
}
  release
  end`,
    features: ["Daily event lock", "Random number generation", "Variable math (`addvar`)", "Dynamic item giving", "Bag full check"]
  },

  // ADVANCED TEMPLATE - LOTTERY SYSTEM
  advanced_daily_lottery: {
    title: "Advanced Daily Lottery System",
    category: "Advanced",
    description: "Complete daily lottery system with prize tiers, inventory checking, and state management. Based on official game lottery.",
    difficulty: "Expert",
    code: `script_lottery_main:
  lock
  faceplayer
  checkdailyflags
  if.compare.goto 0x8020 != 0 <already_done_today>
  if.flag.set.goto 0x250 <section_completed>
  
  msgbox.yesno <lottery_intro_text>
{
  Welcome to the Daily Lottery!
  
  Would you like to draw a ticket?
  You can only play once per day.
}
  if.no.goto <section_decline>
  
  setflag 0x250
  preparemsg <drawing_ticket_text>
{
  Please pick a ticket.
  \\.\CC080F\\.\CC080F\\.\CC080F\\.\CC080F\\.\CC080F
}
  waitmsg
  
  special RetrieveLotteryNumber
  copyvar var8 varResult
  special BufferLottoTicketNumber
  
  msgbox.default <ticket_number_text>
{
  Your ticket number is [buffer1]!
  
  Checking against your POKéMON...
}
  
  move.npc 1 <clerk_computer_animation>
  sound se_pc_on
  special DoComputerEffect
  pause 180
  special PickLotteryTicket
  pause 60
  special EndComputerEffect
  move.npc 1 <clerk_face_player>
  
  if.compare.goto var4 == 0 <no_match>
  if.compare.goto var4 == 1 <third_prize>
  if.compare.goto var4 == 2 <second_prize>
  if.compare.goto var4 == 3 <first_prize>
  if.compare.goto var4 == 4 <jackpot>
  end

third_prize:
  incrementhiddenvalue 45
  setvar 0x8005 ITEM_POTION
  bufferitem buffer1 0x8005
  msgbox.default <third_prize_text>
{
  Congratulations! Two digits matched!
  You win the [buffer1]!
}
  call <give_prize>
  goto <lottery_end>

second_prize:
  incrementhiddenvalue 45
  setvar 0x8005 ITEM_ULTRA_BALL
  bufferitem buffer1 0x8005
  msgbox.default <second_prize_text>
{
  Amazing! Three digits matched!
  You win the [buffer1]!
}
  call <give_prize>
  goto <lottery_end>

first_prize:
  incrementhiddenvalue 45
  setvar 0x8005 ITEM_MAX_REVIVE
  bufferitem buffer1 0x8005
  msgbox.default <first_prize_text>
{
  Incredible! Four digits matched!
  You win the [buffer1]!
}
  call <give_prize>
  goto <lottery_end>

jackpot:
  incrementhiddenvalue 45
  incrementhiddenvalue 46
  setvar 0x8005 ITEM_MASTER_BALL
  bufferitem buffer1 0x8005
  msgbox.default <jackpot_text>
{
  JACKPOT! All five digits matched!
  You win the grand prize [buffer1]!
}
  call <give_prize>
  special TryPutLotteryWinnerReportOnAir
  goto <lottery_end>

give_prize:
  npc.item 0x8005 1
  if.no.goto <bag_full>
  return

bag_full:
  copyvar 0x8021 0x8005
  msgbox.default <bag_full_text>
{
  Your Bag is full!
  Come back with room and I'll give
  you your prize.
}
  return

no_match:
  msgbox.default <no_match_text>
{
  Sorry, no digits matched this time.
  Better luck tomorrow!
}
  goto <lottery_end>

already_done_today:
  if.compare.goto 0x8021 != 0 <delayed_prize>
  msgbox.default <already_played_text>
{
  You've already played today.
  Come back tomorrow!
}
  release
  end

delayed_prize:
  msgbox.default <delayed_prize_text>
{
  Here's your prize from before!
}
  copyvar 0x8005 0x8021
  bufferitem buffer1 0x8005
  npc.item 0x8005 1
  if.no.goto <still_no_room>
  setvar 0x8021 0
  release
  end

still_no_room:
  msgbox.default <still_no_room_text>
{
  Still no room in your Bag.
  Make space and come back.
}
  release
  end

section_decline:
  msgbox.default <decline_text>
{
  Come back anytime!
}
  release
  end

section_completed:
  msgbox.default <completed_text>
{
  Thanks for playing today!
  Come back tomorrow for another try.
}
  release
  end

lottery_end:
  msgbox.default <thanks_text>
{
  Thank you for playing!
  Come back tomorrow!
}
  release
  end

clerk_computer_animation:
{
  walk_in_place_fastest_right
}

clerk_face_player:
{
  face_player
}`,
    features: [
      "Daily event system", 
      "Multi-tier prize structure", 
      "Complex state management", 
      "Inventory full handling", 
      "Delayed prize collection",
      "Professional user experience",
      "Advanced conditionals",
      "Dynamic text substitution",
      "Hidden statistics tracking"
    ]
  },

  advanced_cutscene_battle: {
    title: "Advanced Cutscene with Battle Integration",
    category: "Advanced",
    description: "Professional cutscene featuring dialogue, battle preparation, and complex sprite choreography. Based on official game cutscenes.",
    difficulty: "Expert", 
    code: `script_advanced_cutscene:
  lockall
  if.flag.set.goto 0x200 <post_battle_section>
  setflag 0x200
  
  # Initial dialogue
  msgbox.default <villain_threat_text>
  msgbox.default <hero_response_text>
  closeonkeypress
  pause 30
  sound se_not_effective
  
  # Dynamic movement based on player position
  copyvar var0 varFacing
  if.compare.goto var0 == 1 <player_facing_up>
  
  # Default movement for other directions
  move.npc 4 <villain_retreat_default>
  goto <battle_prep>

player_facing_up:
  move.npc 4 <villain_retreat_up>
  
battle_prep:
  move.npc 1 <ally_approach>
  msgbox.yesno <battle_ready_text>
  if.yes.goto <start_battle>
  msgbox.default <not_ready_text>
  closeonkeypress
  releaseall
  end

start_battle:
  special SavePlayerParty
  fadescreen ToBlack
  special ChooseHalfPartyForBattle
  waitstate
  if.compare.goto varResult != 0 <proceed_battle>
  special LoadPlayerParty
  goto <battle_prep>

proceed_battle:
  special ReducePlayerPartyToSelectedMons
  setvar var4 2
  special DoSpecialTrainerBattle
  waitstate
  special LoadPlayerParty
  copyvar var0 varResult
  if.compare.goto var0 == 1 <victory>
  
  # Handle defeat
  fadescreen ToBlack
  special SetCB2WhiteOut
  waitstate

victory:
  msgbox.default <victory_speech>
  closeonkeypress
  
  # Complex scene cleanup
  fadescreen ToBlack
  hidesprite 5
  hidesprite 6
  movesprite2 3 5 6
  spriteface 3 South
  spritebehave 3 WanderAround
  showsprite 3
  fadescreen FromBlack
  
  # Story progression
  setvar 0x4050 2
  setflag 0x201
  releaseall
  end

post_battle_section:
  msgbox.default <already_defeated_text>
  releaseall
  end

# Movement data
villain_retreat_default:
{
  lock_facing_direction
  walk_fast_up
  walk_fast_up
  unlock_facing_direction
  delay_16
  delay_16
  walk_slow_down
  walk_slow_down
}

villain_retreat_up:
{
  face_left
  lock_facing_direction
  walk_fast_right
  walk_fast_right
  unlock_facing_direction
  delay_16
  delay_16
  walk_slow_left
  walk_slow_left
  face_down
}

ally_approach:
{
  walk_down
  walk_down
  face_player
}

# Text pointers
villain_threat_text:
{
  VILLAIN: You cannot stop our plan!
  
  We will achieve our goals no matter
  the cost!
}

hero_response_text:
{
  ALLY: [player]! We must work together
  to stop this madness!
  
  Are you ready to battle alongside me?
}

battle_ready_text:
{
  ALLY: This will be a tough fight.
  
  Are you prepared?
}

not_ready_text:
{
  ALLY: Take your time to prepare.
  The fate of the region depends on us!
}

victory_speech:
{
  ALLY: We did it, [player]!
  
  Your courage and skill made the
  difference today.
  
  The region is safe once more.
}

already_defeated_text:
{
  ALLY: Thanks to you, the crisis
  has been averted.
  
  The region is safe once more.
}`,
    features: [
      "Multi-character dialogue",
      "Battle system integration", 
      "Dynamic movement based on player position",
      "Complex sprite choreography",
      "Party management and restoration",
      "Victory/defeat handling",
      "Professional scene transitions",
      "State management across game systems"
    ]
  },

  safari_zone_entry: {
    title: "Safari Zone / Paid Entry",
    category: "Advanced",
    description: "A complete script for a paid entry area like the Safari Zone, with prerequisite checks.",
    difficulty: "Expert",
    code: `script_safari_entry:
  lockall
  showmoney 0 0 0
  msgbox.yesno <welcome_prompt>
{
Welcome to the Safari Zone!
Entry is $500. Would you like to play?
}
  if.yes.goto <check_prereqs>
  
  // Player declined
  msgbox.default <decline_text>
  hidemoney 0 0
  releaseall
  end

check_prereqs:
  checkitem "\\Po\\Ke\\Bl\\Lo\\Ck Case" 1
  if.no.goto <handle_no_case>
  
  countPokemon
  if.compare.goto varResult == 6 <handle_full_party>
  
  checkmoney 500 0
  if.no.goto <handle_no_money>

  // All checks passed, proceed
  sound se_shop
  paymoney 500 0
  updatemoney 0 0 0
  
  msgbox.default <entry_granted_text>
  closeonkeypress
  hidemoney 0 0
  
  special EnterSafariMode
  warp.xy 26 3 32 33 // Warp to Safari Zone map
  waitstate
  end

handle_no_case:
  msgbox.default <no_case_text>
  hidemoney 0 0
  releaseall
  end

handle_full_party:
  msgbox.default <party_full_text>
  hidemoney 0 0
  releaseall
  end

handle_no_money:
  msgbox.default <no_money_text>
  hidemoney 0 0
  releaseall
  end

// --- Text Pointers ---
decline_text:
{
  Okay. Please play another time!
}
no_case_text:
{
  You need a PokeBlock Case to enter.
  You can get one in Lilycove City.
}
party_full_text:
{
  Your party is full. Please make
  room before entering.
}
no_money_text:
{
  You don't have enough money.
}
entry_granted_text:
{
  Here are your 30 Safari Balls.
  Enjoy yourself!
}`,
    features: ["UI Management (Money)", "Transactional Logic", "Prerequisite Checks (Item, Money, Party)", "Game Mode Switching", "Advanced Conditionals"]
  },

  environmental_puzzle: {
    title: "Environmental Puzzle / Item Choice",
    category: "Puzzles",
    description: "A script where taking an item triggers an environmental change and warps the player.",
    difficulty: "Advanced",
    code: `script_fossil_choice:
  lock
  faceplayer
  msgbox.yesno <fossil_prompt>
{
You found the Root Fossil.
Taking it will cause a tremor.
Take it anyway?
}
  if.no.goto <left_fossil>
  
  // Player chose to take it
  npc.item "Root Fossil" 1
  if.no.goto <bag_full> // Check if bag is full
  
  setflag 0x014F // Sets flag that fossil was taken
  hidesprite 1   // Hides the fossil sprite
  pause 30
  
  // Trigger environmental effects
  call <subroutine_crumble_effect>
  
  // Warp player out of the collapsing area
  warp.xy 0 26 19 59
  waitstate
  release
  end

left_fossil:
  msgbox.default <left_alone_text>
  release
  end

bag_full:
  msgbox.default <bag_full_text>
  release
  end

subroutine_crumble_effect:
  setvar var4 1
  setvar var5 1
  setvar var6 32
  setvar var7 2
  special ShakeCamera
  waitstate
  special DoMirageTowerCeilingCrumble
  waitstate
  return

// --- Text Pointers ---
left_alone_text:
{
  You left the fossil alone.
}
bag_full_text:
{
  Your bag is full!
}`,
    features: ["Conditional Player Choice", "Environmental Effects", "Item Interaction", "Cinematic Effects (Camera Shake)", "Warping", "Subroutines"]
  },

  complex_rival_encounter: {
    title: "Complex Rival Encounter (Gender-Based)",
    category: "Battles",
    description: "Advanced rival battle with gender-specific dialogue, music, choreography, and item rewards.",
    difficulty: "Expert",
    code: `main_rival_encounter:
  lockall
  showsprite 25  // Show rival sprite
  
  // Play gender-specific music
  if.gender.call <play_may_theme> <play_brendan_theme>
  pause 65
  
  // Move rival into position
  move.npc 25 <rival_approach_movement>
  pause 30
  
  // Gender-specific battle encounter
  if.gender.goto <may_battle_section> <brendan_battle_section>
  releaseall
  end

play_may_theme:
  playsong mus_encounter_may loop
  return

play_brendan_theme:
  playsong mus_encounter_brendan loop
  return

may_battle_section:
  msgbox.default <may_challenge_text>
  
  // Battle based on player's starter choice
  copyvar var0 0x4023  // Get starter choice
  if.compare.goto var0 == 0 <may_battle_treecko>
  if.compare.goto var0 == 1 <may_battle_torchic>
  if.compare.goto var0 == 2 <may_battle_mudkip>
  end

brendan_battle_section:
  msgbox.default <brendan_challenge_text>
  
  // Battle based on player's starter choice  
  copyvar var0 0x4023
  if.compare.goto var0 == 0 <brendan_battle_treecko>
  if.compare.goto var0 == 1 <brendan_battle_torchic>
  if.compare.goto var0 == 2 <brendan_battle_mudkip>
  end

may_battle_treecko:
  single.battle.nointro May~6 <may_defeat_text>
  goto <post_battle_rewards>

may_battle_torchic:
  single.battle.nointro May~9 <may_defeat_text>
  goto <post_battle_rewards>

may_battle_mudkip:
  single.battle.nointro May~3 <may_defeat_text>
  goto <post_battle_rewards>

brendan_battle_treecko:
  single.battle.nointro Brendan~6 <brendan_defeat_text>
  goto <post_battle_rewards>

brendan_battle_torchic:
  single.battle.nointro Brendan~9 <brendan_defeat_text>
  goto <post_battle_rewards>

brendan_battle_mudkip:
  single.battle.nointro Brendan~3 <brendan_defeat_text>
  goto <post_battle_rewards>

post_battle_rewards:
  msgbox.default <reward_dialogue>
  npc.item "HM02" 1  // Give Fly HM
  setflag 0x006E     // Set flag for receiving Fly
  
  // Farewell scene with music transition
  savesong mus_dummy
  fadedefault
  pause 60
  
  // Hide rival and end scene
  hidesprite 25
  releaseall
  end

rival_approach_movement:
{
  walk_fast_right
  walk_fast_right
  walk_fast_right
  walk_fast_up
}

// --- Text Pointers ---
may_challenge_text:
{
  May: [player]! Ready for battle?
}

brendan_challenge_text:
{
  Brendan: Let's see how strong you've gotten!
}

may_defeat_text:
{
  You're really getting strong, [player]!
}

brendan_defeat_text:
{
  Impressive! You've improved a lot!
}

reward_dialogue:
{
  Here's something that will help you
  on your journey!
}`,
    features: ["Gender-Specific Logic", "Music Management", "Starter-Based Battles", "Complex Choreography", "Item Rewards", "Advanced Conditionals"]
  },

  advanced_daycare_system: {
    title: "Advanced Day-care Pokemon System",
    category: "Advanced",
    description: "Complete Pokemon day-care system with state management, cost calculation, and comprehensive error handling.",
    difficulty: "Expert",
    code: `script_daycare_lady:
  lock
  faceplayer
  special2 varResult GetDaycareState
  if.compare.goto varResult == 2 <one_pokemon_section>
  if.compare.goto varResult == 3 <two_pokemon_section>
  
  # No Pokemon in daycare
  msgbox.yesno <daycare_intro_text>
{
  I'm the Day-care Lady.
  We can raise Pokémon for you.
  Would you like us to raise one?
}
  if.yes.goto <deposit_pokemon>
  msgbox.default <decline_text>
{
  Oh, fine, then. Come again.
}
  release
  end

one_pokemon_section:
  msgbox.default <greetings_text>
{
  Ah, it's you! Good to see you.
  Your Pokémon can only be doing good!
}
  setvar var4 0
  call <check_level_gains>
  msgbox.yesno <deposit_second_text>
{
  We can raise two of your Pokémon.
  Would you like us to raise one more?
}
  if.yes.goto <deposit_pokemon>
  msgbox.yesno <retrieve_prompt>
{
  Will you take your Pokémon back?
}
  if.yes.goto <retrieve_pokemon>
  goto <end_conversation>

two_pokemon_section:
  msgbox.default <greetings_text>
  setvar var4 0
  call <check_level_gains>
  setvar var4 1  
  call <check_level_gains>
  msgbox.yesno <retrieve_prompt>
{
  Will you take your Pokémon back?
}
  if.yes.goto <retrieve_pokemon>
  goto <end_conversation>

deposit_pokemon:
  special2 varResult CountPartyNonEggMons
  if.compare.goto varResult == 1 <only_one_pokemon>
  special2 varResult CountPartyAliveNonEggMons
  if.compare.goto varResult == 2 <only_two_alive>
  
  msgbox.default <choose_pokemon_text>
{
  Which Pokémon should we raise for you?
}
  fadescreen ToBlack
  special ChooseSendDaycareMon
  waitstate
  if.compare.goto var4 == 255 <end_conversation>
  
  special2 varResult CountPartyAliveNonEggMons_IgnoreVar4Slot
  if.no.goto <would_leave_no_pokemon>
  
  # Store the Pokemon
  special2 var5 GetSelectedMonNicknameAndSpecies
  waitsound
  cry 0x8005 0
  msgbox.default <storing_pokemon_text>
{
  Fine, we'll raise your [buffer1] for a while.
  Come back for it later.
}
  waitcry
  special StoreSelectedPokemonInDaycare
  incrementhiddenvalue 47
  
  special2 varResult GetDaycareState
  if.compare.goto varResult == 2 <offer_second_deposit>
  release
  end

retrieve_pokemon:
  special2 varResult CalculatePlayerPartyCount
  if.compare.goto varResult == 6 <party_full>
  
  special2 varResult GetDaycareState
  setvar var4 0
  if.compare.goto varResult == 2 <show_retrieval_menu>
  special ShowDaycareLevelMenu
  waitstate
  copyvar var4 varResult
  if.compare.goto varResult == 2 <end_conversation>

show_retrieval_menu:
  special GetDaycareCost
  msgbox.yesno <cost_confirmation>
{
  If you want your [buffer1] back,
  it will cost $[buffer2].
}
  if.yes.goto <process_payment>
  goto <end_conversation>

process_payment:
  special2 varResult IsEnoughForCostInVar5
  if.no.goto <insufficient_funds>
  
  # Animate NPC going to get Pokemon
  move.npc 1 <daycare_fetch_animation>
{
  delay_16
  delay_16
  face_left
  delay_16
  delay_16
  face_right
  delay_16
  delay_16
  face_up
  walk_slow_up
  set_invisible
  delay_16
  delay_16
  delay_16
  delay_16
  delay_16
  face_down
  set_visible
  walk_slow_down
}
  
  special2 varResult TakePokemonFromDaycare
  special SubtractMoneyFromVar5
  sound se_shop
  msgbox.default <retrieval_success>
{
  Perfect! Here's your Pokémon.
}
  waitsound
  cry 0x800D 0
  msgbox.default <pokemon_returned>
{
  [player] took back [buffer1] from the Day-care Lady.
}
  waitcry
  
  special2 varResult GetDaycareState
  if.compare.goto varResult == 2 <offer_second_retrieval>
  goto <end_conversation>

# --- Subroutines ---
check_level_gains:
  special2 varResult GetNumLevelsGainedFromDaycare
  if.compare.call varResult != 0 <announce_level_gain>
  return

announce_level_gain:
  msgbox.default <level_gain_text>
{
  By level, your [buffer1] has grown by [buffer2].
}
  return

# --- Error Handling ---
party_full:
  msgbox.default <party_full_text>
{
  Your Pokémon team is full.
  Make room, then come see me.
}
  release
  end

only_one_pokemon:
  msgbox.default <need_more_pokemon>
{
  Oh? But you have just one Pokémon.
  Come back another time.
}
  release
  end

only_two_alive:
  msgbox.default <need_backup_pokemon>
{
  If you leave that Pokémon with me,
  what will you battle with?
  Come back another time.
}
  release
  end

would_leave_no_pokemon:
  msgbox.default <no_battle_pokemon>
{
  If you leave me that Pokémon,
  what will you battle with?
  Come back another time.
}
  release
  end

insufficient_funds:
  msgbox.default <not_enough_money>
{
  You don't have enough money.
}
  release
  end

offer_second_deposit:
  msgbox.yesno <deposit_second_text>
  if.yes.goto <deposit_pokemon>
  goto <end_conversation>

offer_second_retrieval:
  msgbox.yesno <retrieve_second_text>
{
  Will you take back the other one, too?
}
  if.yes.goto <retrieve_pokemon>
  goto <end_conversation>

end_conversation:
  msgbox.default <goodbye_text>
{
  Fine. Come again.
}
  release
  end`,
    features: [
      "Complex State Management",
      "Multi-step Pokemon Handling", 
      "Economic Transaction System",
      "Comprehensive Error Handling",
      "UI Integration",
      "Sound Management", 
      "Dynamic Text Substitution",
      "Professional User Experience",
      "Advanced Special Functions"
    ]
  }
};

// Template categories
export const templateCategories = [
  "All Templates",
  "NPCs", 
  "Items",
  "Pokemon",
  "Trainers", 
  "Cutscenes",
  "Shops",
  "Puzzles", // Added Puzzles category
  "Battles", // Added Battles category
  "Advanced" 
];

// Get templates by category
export function getTemplatesByCategory(category) {
  if (category === "All Templates") {
    return scriptTemplates;
  }
  
  return Object.fromEntries(
    Object.entries(scriptTemplates).filter(([key, template]) => template.category === category)
  );
}

// Get templates by difficulty
export function getTemplatesByDifficulty(difficulty) {
  return Object.fromEntries(
    Object.entries(scriptTemplates).filter(([key, template]) => template.difficulty === difficulty)
  );
}

// Search templates
export function searchTemplates(query) {
  const lowerQuery = query.toLowerCase();
  return Object.fromEntries(
    Object.entries(scriptTemplates).filter(([key, template]) => 
      template.title.toLowerCase().includes(lowerQuery) ||
      template.description.toLowerCase().includes(lowerQuery) ||
      template.features.some(feature => feature.toLowerCase().includes(lowerQuery)) ||
      template.code.toLowerCase().includes(lowerQuery)
    )
  );
}
