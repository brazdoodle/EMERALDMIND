// Comprehensive Generation 3 Pokemon Emerald Flag Database
// Sources: pret/pokeemerald decompilation, PokeCommunity, HMA documentation, ROM hacking community

export const vanillaEmeraldFlags = [
  // --- System Core Flags (0x001 - 0x0FF) ---
  { hex_id: '0x001', name: 'FLAG_SYS_POKEDEX_GET', category: 'System', description: 'Player has obtained the Pokédex from Professor Birch.' },
  { hex_id: '0x002', name: 'FLAG_SYS_POKEMON_GET', category: 'System', description: 'Player has caught their first Pokémon.' },
  { hex_id: '0x003', name: 'FLAG_SYS_CHAT_USED', category: 'System', description: 'Player has used the chat system in Union Room.' },
  { hex_id: '0x004', name: 'FLAG_SYS_GAME_CLEAR', category: 'System', description: 'Player has defeated the Champion and cleared the main story.' },
  { hex_id: '0x005', name: 'FLAG_SYS_B_DASH', category: 'System', description: 'Player has obtained the Running Shoes from Mom.' },
  { hex_id: '0x006', name: 'FLAG_SYS_CONTEST_HALL_USED', category: 'System', description: 'Player has participated in at least one Contest.' },
  { hex_id: '0x007', name: 'FLAG_SYS_POKEMON_CONTEST_WON', category: 'System', description: 'Player has won at least one Contest.' },
  { hex_id: '0x008', name: 'FLAG_SYS_TV_START', category: 'System', description: 'TV broadcasts are enabled.' },
  { hex_id: '0x009', name: 'FLAG_SYS_NATIONAL_DEX', category: 'System', description: 'Player has upgraded to the National Pokédex.' },
  { hex_id: '0x00A', name: 'FLAG_SYS_CLOCK_SET', category: 'System', description: 'The in-game real-time clock has been set.' },
  { hex_id: '0x00B', name: 'FLAG_SYS_SAFARI_MODE', category: 'System', description: 'Player is currently in a Safari Zone session.' },
  { hex_id: '0x00C', name: 'FLAG_SYS_CAN_LINK_WITH_RS', category: 'System', description: 'Enables trading/battling with Ruby/Sapphire after Network Machine fix.' },
  { hex_id: '0x00D', name: 'FLAG_SYS_MYSTERY_EVENT_ENABLE', category: 'System', description: 'Mystery Event is enabled on the main menu.' },
  { hex_id: '0x00E', name: 'FLAG_SYS_FRONTIER_PASS', category: 'System', description: 'Player has received the Frontier Pass.' },
  { hex_id: '0x00F', name: 'FLAG_SYS_RIBBON_GET', category: 'System', description: 'Used to display ribbon attachment message.' },
  
  // --- Badge Flags (0x800 - 0x807) ---
  { hex_id: '0x800', name: 'FLAG_BADGE01_GET', category: 'Badges', description: 'Player has the Stone Badge from Roxanne (Rustboro Gym).' },
  { hex_id: '0x801', name: 'FLAG_BADGE02_GET', category: 'Badges', description: 'Player has the Knuckle Badge from Brawly (Dewford Gym).' },
  { hex_id: '0x802', name: 'FLAG_BADGE03_GET', category: 'Badges', description: 'Player has the Dynamo Badge from Wattson (Mauville Gym).' },
  { hex_id: '0x803', name: 'FLAG_BADGE04_GET', category: 'Badges', description: 'Player has the Heat Badge from Flannery (Lavaridge Gym).' },
  { hex_id: '0x804', name: 'FLAG_BADGE05_GET', category: 'Badges', description: 'Player has the Balance Badge from Norman (Petalburg Gym).' },
  { hex_id: '0x805', name: 'FLAG_BADGE06_GET', category: 'Badges', description: 'Player has the Feather Badge from Winona (Fortree Gym).' },
  { hex_id: '0x806', name: 'FLAG_BADGE07_GET', category: 'Badges', description: 'Player has the Mind Badge from Tate & Liza (Mossdeep Gym).' },
  { hex_id: '0x807', name: 'FLAG_BADGE08_GET', category: 'Badges', description: 'Player has the Rain Badge from Wallace/Juan (Sootopolis Gym).' },

  // --- Story Progression Flags (0x100 - 0x1FF) ---
  { hex_id: '0x100', name: 'FLAG_ADVENTURE_STARTED', category: 'Story', description: 'Adventure has officially begun.' },
  { hex_id: '0x101', name: 'FLAG_RESCUED_BIRCH', category: 'Story', description: 'Player has rescued Professor Birch from the wild Pokémon.' },
  { hex_id: '0x102', name: 'FLAG_GOT_POKEDEX_FROM_BIRCH', category: 'Story', description: 'Player has received the Pokédex from Professor Birch.' },
  { hex_id: '0x103', name: 'FLAG_RECEIVED_RUNNING_SHOES', category: 'Story', description: 'Player has received Running Shoes from their mother.' },
  { hex_id: '0x104', name: 'FLAG_DELIVERED_LETTER', category: 'Story', description: 'Player has delivered the letter to Steven in Dewford Cave.' },
  { hex_id: '0x105', name: 'FLAG_MET_RIVAL_IN_HOUSE', category: 'Story', description: 'Player has first met their rival at home.' },
  { hex_id: '0x106', name: 'FLAG_CHOSE_STARTER', category: 'Story', description: 'Player has chosen their starter Pokémon.' },
  { hex_id: '0x107', name: 'FLAG_RIVAL_LEFT_FOR_ROUTE103', category: 'Story', description: 'Rival has gone to Route 103 for the first battle.' },
  { hex_id: '0x108', name: 'FLAG_OMIT_DIVISION_BY_ZERO_CHECK', category: 'Story', description: 'Technical flag used for calculations.' },
  
  // --- Major Story Events (0x120 - 0x1FF) ---
  { hex_id: '0x120', name: 'FLAG_TEAM_AQUA_ENCOUNTERED', category: 'Story', description: 'Player has first encountered Team Aqua.' },
  { hex_id: '0x121', name: 'FLAG_TEAM_MAGMA_ENCOUNTERED', category: 'Story', description: 'Player has first encountered Team Magma.' },
  { hex_id: '0x122', name: 'FLAG_DOCK_REJECTED_DEVON', category: 'Story', description: 'Dock initially rejected Devon Goods delivery.' },
  { hex_id: '0x123', name: 'FLAG_DELIVERED_DEVON_GOODS', category: 'Story', description: 'Player has delivered the Devon Goods to Captain Stern.' },
  { hex_id: '0x124', name: 'FLAG_MET_TEAM_AQUA_HARBOR', category: 'Story', description: 'Player has encountered Team Aqua at Slateport Harbor.' },
  { hex_id: '0x125', name: 'FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE', category: 'Story', description: 'Team Aqua has escaped in the submarine.' },
  { hex_id: '0x126', name: 'FLAG_WINGULL_SENT_ON_ERRAND', category: 'Story', description: 'Wingull has been sent to deliver a message.' },
  { hex_id: '0x127', name: 'FLAG_RECEIVED_CASTFORM', category: 'Story', description: 'Player has received Castform from the Weather Institute.' },
  { hex_id: '0x128', name: 'FLAG_FLY_UNLOCKED', category: 'Story', description: 'HM02 Fly is usable outside of battle.' },
  
  // --- Gym and Elite Four Progression (0x200 - 0x2FF) ---
  { hex_id: '0x200', name: 'FLAG_DEFEATED_RUSTBORO_GYM', category: 'Story', description: 'Player has defeated Roxanne at Rustboro Gym.' },
  { hex_id: '0x201', name: 'FLAG_DEFEATED_DEWFORD_GYM', category: 'Story', description: 'Player has defeated Brawly at Dewford Gym.' },
  { hex_id: '0x202', name: 'FLAG_DEFEATED_MAUVILLE_GYM', category: 'Story', description: 'Player has defeated Wattson at Mauville Gym.' },
  { hex_id: '0x203', name: 'FLAG_DEFEATED_LAVARIDGE_GYM', category: 'Story', description: 'Player has defeated Flannery at Lavaridge Gym.' },
  { hex_id: '0x204', name: 'FLAG_DEFEATED_PETALBURG_GYM', category: 'Story', description: 'Player has defeated Norman at Petalburg Gym.' },
  { hex_id: '0x205', name: 'FLAG_DEFEATED_FORTREE_GYM', category: 'Story', description: 'Player has defeated Winona at Fortree Gym.' },
  { hex_id: '0x206', name: 'FLAG_DEFEATED_MOSSDEEP_GYM', category: 'Story', description: 'Player has defeated Tate & Liza at Mossdeep Gym.' },
  { hex_id: '0x207', name: 'FLAG_DEFEATED_SOOTOPOLIS_GYM', category: 'Story', description: 'Player has defeated Wallace/Juan at Sootopolis Gym.' },
  
  { hex_id: '0x220', name: 'FLAG_ELITE_4_SIDNEY_DEFEATED', category: 'Story', description: 'Player has defeated Elite Four Sidney.' },
  { hex_id: '0x221', name: 'FLAG_ELITE_4_PHOEBE_DEFEATED', category: 'Story', description: 'Player has defeated Elite Four Phoebe.' },
  { hex_id: '0x222', name: 'FLAG_ELITE_4_GLACIA_DEFEATED', category: 'Story', description: 'Player has defeated Elite Four Glacia.' },
  { hex_id: '0x223', name: 'FLAG_ELITE_4_DRAKE_DEFEATED', category: 'Story', description: 'Player has defeated Elite Four Drake.' },
  { hex_id: '0x224', name: 'FLAG_CHAMPION_WALLACE_DEFEATED', category: 'Story', description: 'Player has defeated Champion Wallace.' },

  // --- HM and Field Move Flags (0x250 - 0x26F) ---
  { hex_id: '0x250', name: 'FLAG_GOT_HM01_CUT', category: 'Story', description: 'Player has received HM01 Cut from Rustboro Cutter.' },
  { hex_id: '0x251', name: 'FLAG_GOT_HM02_FLY', category: 'Story', description: 'Player has received HM02 Fly from Route 119.' },
  { hex_id: '0x252', name: 'FLAG_GOT_HM03_SURF', category: 'Story', description: 'Player has received HM03 Surf from Wally\'s father.' },
  { hex_id: '0x253', name: 'FLAG_GOT_HM04_STRENGTH', category: 'Story', description: 'Player has received HM04 Strength in Rusturf Tunnel.' },
  { hex_id: '0x254', name: 'FLAG_GOT_HM05_FLASH', category: 'Story', description: 'Player has received HM05 Flash in Granite Cave.' },
  { hex_id: '0x255', name: 'FLAG_GOT_HM06_ROCK_SMASH', category: 'Story', description: 'Player has received HM06 Rock Smash in Mauville.' },
  { hex_id: '0x256', name: 'FLAG_GOT_HM07_WATERFALL', category: 'Story', description: 'Player has received HM07 Waterfall in Cave of Origin.' },
  { hex_id: '0x257', name: 'FLAG_GOT_HM08_DIVE', category: 'Story', description: 'Player has received HM08 Dive from Steven in Mossdeep.' },
  
  { hex_id: '0x260', name: 'FLAG_SYS_USE_STRENGTH', category: 'System', description: 'Enables the use of Strength field move.' },
  { hex_id: '0x261', name: 'FLAG_SYS_USE_SURF', category: 'System', description: 'Enables the use of Surf field move.' },
  { hex_id: '0x262', name: 'FLAG_SYS_USE_FLASH', category: 'System', description: 'Enables the use of Flash field move.' },
  { hex_id: '0x263', name: 'FLAG_SYS_USE_ROCK_SMASH', category: 'System', description: 'Enables the use of Rock Smash field move.' },
  { hex_id: '0x264', name: 'FLAG_SYS_USE_WATERFALL', category: 'System', description: 'Enables the use of Waterfall field move.' },
  { hex_id: '0x265', name: 'FLAG_SYS_USE_DIVE', category: 'System', description: 'Enables the use of Dive field move.' },

  // --- Legendary Pokemon Flags (0x300 - 0x32F) ---
  { hex_id: '0x300', name: 'FLAG_CAUGHT_KYOGRE', category: 'Story', description: 'Player has caught Kyogre.' },
  { hex_id: '0x301', name: 'FLAG_CAUGHT_GROUDON', category: 'Story', description: 'Player has caught Groudon.' },
  { hex_id: '0x302', name: 'FLAG_CAUGHT_RAYQUAZA', category: 'Story', description: 'Player has caught Rayquaza.' },
  { hex_id: '0x303', name: 'FLAG_CAUGHT_REGIROCK', category: 'Story', description: 'Player has caught Regirock in Desert Ruins.' },
  { hex_id: '0x304', name: 'FLAG_CAUGHT_REGICE', category: 'Story', description: 'Player has caught Regice in Island Cave.' },
  { hex_id: '0x305', name: 'FLAG_CAUGHT_REGISTEEL', category: 'Story', description: 'Player has caught Registeel in Ancient Tomb.' },
  { hex_id: '0x306', name: 'FLAG_CAUGHT_LATIOS', category: 'Story', description: 'Player has caught Latios (version dependent).' },
  { hex_id: '0x307', name: 'FLAG_CAUGHT_LATIAS', category: 'Story', description: 'Player has caught Latias (version dependent).' },
  
  { hex_id: '0x310', name: 'FLAG_AWAKENED_REGIROCK', category: 'Story', description: 'Regirock has been awakened in Desert Ruins.' },
  { hex_id: '0x311', name: 'FLAG_AWAKENED_REGICE', category: 'Story', description: 'Regice has been awakened in Island Cave.' },
  { hex_id: '0x312', name: 'FLAG_AWAKENED_REGISTEEL', category: 'Story', description: 'Registeel has been awakened in Ancient Tomb.' },
  { hex_id: '0x313', name: 'FLAG_KYOGRE_GROUDON_IN_SOOTOPOLIS', category: 'Story', description: 'Kyogre and Groudon are battling in Sootopolis City.' },
  { hex_id: '0x314', name: 'FLAG_PLAYER_AWAKENED_RAYQUAZA', category: 'Story', description: 'Player has awakened Rayquaza at Sky Pillar.' },
  { hex_id: '0x315', name: 'FLAG_DEOXYS_ENCOUNTER_ENABLED', category: 'Story', description: 'Deoxys encounter at Birth Island is enabled.' },

  // --- Important Item Flags (0x400 - 0x4FF) ---
  { hex_id: '0x400', name: 'FLAG_GOT_ITEMFINDER', category: 'Item', description: 'Player has received the Itemfinder.' },
  { hex_id: '0x401', name: 'FLAG_GOT_BIKE_ACRO', category: 'Item', description: 'Player has the Acro Bike from Rydel.' },
  { hex_id: '0x402', name: 'FLAG_GOT_BIKE_MACH', category: 'Item', description: 'Player has the Mach Bike from Rydel.' },
  { hex_id: '0x403', name: 'FLAG_GOT_GOOD_ROD', category: 'Item', description: 'Player has received the Good Rod.' },
  { hex_id: '0x404', name: 'FLAG_GOT_SUPER_ROD', category: 'Item', description: 'Player has received the Super Rod.' },
  { hex_id: '0x405', name: 'FLAG_GOT_BASEMENT_KEY', category: 'Item', description: 'Player has the Basement Key for New Mauville.' },
  { hex_id: '0x406', name: 'FLAG_GOT_SCANNER', category: 'Item', description: 'Player has the Scanner from the Abandoned Ship.' },
  { hex_id: '0x407', name: 'FLAG_GOT_ROOM_1_KEY', category: 'Item', description: 'Player has Room 1 Key from the Abandoned Ship.' },
  { hex_id: '0x408', name: 'FLAG_GOT_ROOM_2_KEY', category: 'Item', description: 'Player has Room 2 Key from the Abandoned Ship.' },
  { hex_id: '0x409', name: 'FLAG_GOT_ROOM_4_KEY', category: 'Item', description: 'Player has Room 4 Key from the Abandoned Ship.' },
  { hex_id: '0x40A', name: 'FLAG_GOT_ROOM_6_KEY', category: 'Item', description: 'Player has Room 6 Key from the Abandoned Ship.' },
  { hex_id: '0x40B', name: 'FLAG_GOT_STORAGE_KEY', category: 'Item', description: 'Player has the Storage Key from the Abandoned Ship.' },
  { hex_id: '0x40C', name: 'FLAG_GOT_DEVON_SCOPE', category: 'Item', description: 'Player has received the Devon Scope.' },
  { hex_id: '0x40D', name: 'FLAG_GOT_TM_CASE', category: 'Item', description: 'Player has received the TM Case.' },
  { hex_id: '0x40E', name: 'FLAG_GOT_BERRY_POUCH', category: 'Item', description: 'Player has received the Berry Pouch.' },
  
  // --- Contest and Battle Frontier Flags (0x500 - 0x5FF) ---
  { hex_id: '0x500', name: 'FLAG_CONTEST_HALL_OPEN', category: 'Contest', description: 'Contest Halls are accessible.' },
  { hex_id: '0x501', name: 'FLAG_WON_NORMAL_BEAUTY_CONTEST', category: 'Contest', description: 'Won Normal Rank Beauty Contest.' },
  { hex_id: '0x502', name: 'FLAG_WON_NORMAL_CUTE_CONTEST', category: 'Contest', description: 'Won Normal Rank Cute Contest.' },
  { hex_id: '0x503', name: 'FLAG_WON_NORMAL_SMART_CONTEST', category: 'Contest', description: 'Won Normal Rank Smart Contest.' },
  { hex_id: '0x504', name: 'FLAG_WON_NORMAL_TOUGH_CONTEST', category: 'Contest', description: 'Won Normal Rank Tough Contest.' },
  { hex_id: '0x505', name: 'FLAG_WON_NORMAL_COOL_CONTEST', category: 'Contest', description: 'Won Normal Rank Cool Contest.' },
  
  { hex_id: '0x520', name: 'FLAG_FRONTIER_BATTLE_TOWER_OPEN', category: 'Battle Frontier', description: 'Battle Tower is accessible.' },
  { hex_id: '0x521', name: 'FLAG_FRONTIER_BATTLE_DOME_OPEN', category: 'Battle Frontier', description: 'Battle Dome is accessible.' },
  { hex_id: '0x522', name: 'FLAG_FRONTIER_BATTLE_PALACE_OPEN', category: 'Battle Frontier', description: 'Battle Palace is accessible.' },
  { hex_id: '0x523', name: 'FLAG_FRONTIER_BATTLE_ARENA_OPEN', category: 'Battle Frontier', description: 'Battle Arena is accessible.' },
  { hex_id: '0x524', name: 'FLAG_FRONTIER_BATTLE_FACTORY_OPEN', category: 'Battle Frontier', description: 'Battle Factory is accessible.' },
  { hex_id: '0x525', name: 'FLAG_FRONTIER_BATTLE_PIKE_OPEN', category: 'Battle Frontier', description: 'Battle Pike is accessible.' },
  { hex_id: '0x526', name: 'FLAG_FRONTIER_BATTLE_PYRAMID_OPEN', category: 'Battle Frontier', description: 'Battle Pyramid is accessible.' },

  // --- NPC and Location Flags (0x600 - 0x6FF) ---
  { hex_id: '0x600', name: 'FLAG_VISITED_LITTLEROOT_TOWN', category: 'Location', description: 'Player has visited Littleroot Town.' },
  { hex_id: '0x601', name: 'FLAG_VISITED_OLDALE_TOWN', category: 'Location', description: 'Player has visited Oldale Town.' },
  { hex_id: '0x602', name: 'FLAG_VISITED_PETALBURG_CITY', category: 'Location', description: 'Player has visited Petalburg City.' },
  { hex_id: '0x603', name: 'FLAG_VISITED_RUSTBORO_CITY', category: 'Location', description: 'Player has visited Rustboro City.' },
  { hex_id: '0x604', name: 'FLAG_VISITED_DEWFORD_TOWN', category: 'Location', description: 'Player has visited Dewford Town.' },
  { hex_id: '0x605', name: 'FLAG_VISITED_SLATEPORT_CITY', category: 'Location', description: 'Player has visited Slateport City.' },
  { hex_id: '0x606', name: 'FLAG_VISITED_MAUVILLE_CITY', category: 'Location', description: 'Player has visited Mauville City.' },
  { hex_id: '0x607', name: 'FLAG_VISITED_VERDANTURF_TOWN', category: 'Location', description: 'Player has visited Verdanturf Town.' },
  { hex_id: '0x608', name: 'FLAG_VISITED_FALLARBOR_TOWN', category: 'Location', description: 'Player has visited Fallarbor Town.' },
  { hex_id: '0x609', name: 'FLAG_VISITED_LAVARIDGE_TOWN', category: 'Location', description: 'Player has visited Lavaridge Town.' },
  { hex_id: '0x60A', name: 'FLAG_VISITED_FORTREE_CITY', category: 'Location', description: 'Player has visited Fortree City.' },
  { hex_id: '0x60B', name: 'FLAG_VISITED_LILYCOVE_CITY', category: 'Location', description: 'Player has visited Lilycove City.' },
  { hex_id: '0x60C', name: 'FLAG_VISITED_MOSSDEEP_CITY', category: 'Location', description: 'Player has visited Mossdeep City.' },
  { hex_id: '0x60D', name: 'FLAG_VISITED_SOOTOPOLIS_CITY', category: 'Location', description: 'Player has visited Sootopolis City.' },
  { hex_id: '0x60E', name: 'FLAG_VISITED_EVER_GRANDE_CITY', category: 'Location', description: 'Player has visited Ever Grande City.' },
  { hex_id: '0x60F', name: 'FLAG_VISITED_PACIFIDLOG_TOWN', category: 'Location', description: 'Player has visited Pacifidlog Town.' },

  // --- Special Event Flags (0x700 - 0x7FF) ---
  { hex_id: '0x700', name: 'FLAG_MIRAGE_ISLAND_AVAILABLE', category: 'Special Events', description: 'Mirage Island is available based on personality value.' },
  { hex_id: '0x701', name: 'FLAG_SOUTHERN_ISLAND_VISITED', category: 'Special Events', description: 'Player has visited Southern Island.' },
  { hex_id: '0x702', name: 'FLAG_BIRTH_ISLAND_AVAILABLE', category: 'Special Events', description: 'Birth Island is accessible for Deoxys.' },
  { hex_id: '0x703', name: 'FLAG_NAVEL_ROCK_AVAILABLE', category: 'Special Events', description: 'Navel Rock is accessible for Ho-Oh and Lugia.' },
  { hex_id: '0x704', name: 'FLAG_FARAWAY_ISLAND_AVAILABLE', category: 'Special Events', description: 'Faraway Island is accessible for Mew.' },
  { hex_id: '0x705', name: 'FLAG_WONDER_CARD_UNUSED', category: 'Special Events', description: 'Unused Wonder Card flag.' },
  { hex_id: '0x706', name: 'FLAG_MYSTERY_EVENT_DONE', category: 'Special Events', description: 'Mystery Event has been completed.' },
  { hex_id: '0x707', name: 'FLAG_SECRET_BASE_REGISTRY_ENABLED', category: 'Special Events', description: 'Secret Base registration is enabled.' },

  // --- Temporary Flags (0x860 - 0x86F) - These are reused by the game engine ---
  { hex_id: '0x860', name: 'FLAG_TEMP_1', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts. Not safe across map changes.' },
  { hex_id: '0x861', name: 'FLAG_TEMP_2', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x862', name: 'FLAG_TEMP_3', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x863', name: 'FLAG_TEMP_4', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x864', name: 'FLAG_TEMP_5', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x865', name: 'FLAG_TEMP_6', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x866', name: 'FLAG_TEMP_7', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x867', name: 'FLAG_TEMP_8', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x868', name: 'FLAG_TEMP_9', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x869', name: 'FLAG_TEMP_A', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x86A', name: 'FLAG_TEMP_B', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x86B', name: 'FLAG_TEMP_C', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x86C', name: 'FLAG_TEMP_D', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x86D', name: 'FLAG_TEMP_E', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x86E', name: 'FLAG_TEMP_F', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },
  { hex_id: '0x86F', name: 'FLAG_TEMP_10', category: 'Temporary', description: 'General purpose temporary flag. Reused frequently by scripts.' },

  // --- Hidden Item Flags (0xC00 - 0xCFF) - Comprehensive coverage ---
  { hex_id: '0xC00', name: 'FLAG_HIDDEN_ITEM_LITTLEROOT_TOWN_POTION', category: 'Hidden Items', description: 'Hidden Potion in a tree southwest of home in Littleroot Town.' },
  { hex_id: '0xC01', name: 'FLAG_HIDDEN_ITEM_ROUTE_104_POTION', category: 'Hidden Items', description: 'Hidden Potion on Route 104 near Petalburg Woods entrance.' },
  { hex_id: '0xC02', name: 'FLAG_HIDDEN_ITEM_ROUTE_104_ANTIDOTE', category: 'Hidden Items', description: 'Hidden Antidote on Route 104 south section.' },
  { hex_id: '0xC03', name: 'FLAG_HIDDEN_ITEM_ROUTE_104_HEART_SCALE', category: 'Hidden Items', description: 'Hidden Heart Scale on Route 104 beach (requires Surf).' },
  { hex_id: '0xC04', name: 'FLAG_HIDDEN_ITEM_ROUTE_105_HEART_SCALE', category: 'Hidden Items', description: 'Hidden Heart Scale on small island in Route 105.' },
  { hex_id: '0xC05', name: 'FLAG_HIDDEN_ITEM_ROUTE_106_PECHA_BERRY', category: 'Hidden Items', description: 'Hidden Pecha Berry on Route 106 beach.' },
  { hex_id: '0xC06', name: 'FLAG_HIDDEN_ITEM_ROUTE_108_RARE_CANDY', category: 'Hidden Items', description: 'Hidden Rare Candy on Route 108 small island.' },
  { hex_id: '0xC07', name: 'FLAG_HIDDEN_ITEM_ROUTE_109_HEART_SCALE_1', category: 'Hidden Items', description: 'Hidden Heart Scale on Route 109 beach (first one).' },
  { hex_id: '0xC08', name: 'FLAG_HIDDEN_ITEM_ROUTE_109_HEART_SCALE_2', category: 'Hidden Items', description: 'Hidden Heart Scale on Route 109 beach (second one).' },
  { hex_id: '0xC09', name: 'FLAG_HIDDEN_ITEM_ROUTE_109_HEART_SCALE_3', category: 'Hidden Items', description: 'Hidden Heart Scale on Route 109 beach (third one).' },
  { hex_id: '0xC0A', name: 'FLAG_HIDDEN_ITEM_ROUTE_110_FULL_HEAL', category: 'Hidden Items', description: 'Hidden Full Heal on Route 110 near Cycling Road.' },
  { hex_id: '0xC0B', name: 'FLAG_HIDDEN_ITEM_ROUTE_110_REVIVE', category: 'Hidden Items', description: 'Hidden Revive on Route 110 Cycling Road.' },
  { hex_id: '0xC0C', name: 'FLAG_HIDDEN_ITEM_ROUTE_111_STARDUST', category: 'Hidden Items', description: 'Hidden Stardust in Route 111 desert.' },
  { hex_id: '0xC0D', name: 'FLAG_HIDDEN_ITEM_ROUTE_111_PROTEIN', category: 'Hidden Items', description: 'Hidden Protein in Route 111 desert.' },
  { hex_id: '0xC0E', name: 'FLAG_HIDDEN_ITEM_ROUTE_113_ETHER', category: 'Hidden Items', description: 'Hidden Ether in ash pile on Route 113.' },
  { hex_id: '0xC0F', name: 'FLAG_HIDDEN_ITEM_ROUTE_113_ULTRA_BALL', category: 'Hidden Items', description: 'Hidden Ultra Ball in ash pile on Route 113.' },
  { hex_id: '0xC10', name: 'FLAG_HIDDEN_ITEM_ROUTE_114_CARBOS', category: 'Hidden Items', description: 'Hidden Carbos on Route 114.' },
  { hex_id: '0xC11', name: 'FLAG_HIDDEN_ITEM_ROUTE_115_HEART_SCALE', category: 'Hidden Items', description: 'Hidden Heart Scale on Route 115 beach.' },
  { hex_id: '0xC12', name: 'FLAG_HIDDEN_ITEM_ROUTE_116_HP_UP', category: 'Hidden Items', description: 'Hidden HP Up on Route 116.' },
  { hex_id: '0xC13', name: 'FLAG_HIDDEN_ITEM_ROUTE_117_REPEL', category: 'Hidden Items', description: 'Hidden Repel on Route 117.' },
  { hex_id: '0xC14', name: 'FLAG_HIDDEN_ITEM_ROUTE_118_HEART_SCALE', category: 'Hidden Items', description: 'Hidden Heart Scale on Route 118 (requires Surf).' },
  { hex_id: '0xC15', name: 'FLAG_HIDDEN_ITEM_ROUTE_119_CALCIUM', category: 'Hidden Items', description: 'Hidden Calcium on Route 119.' },
  { hex_id: '0xC16', name: 'FLAG_HIDDEN_ITEM_ROUTE_120_ZINC', category: 'Hidden Items', description: 'Hidden Zinc on Route 120.' },
  { hex_id: '0xC17', name: 'FLAG_HIDDEN_ITEM_ROUTE_120_RARE_CANDY_1', category: 'Hidden Items', description: 'Hidden Rare Candy on Route 120 (first one).' },
  { hex_id: '0xC18', name: 'FLAG_HIDDEN_ITEM_ROUTE_120_RARE_CANDY_2', category: 'Hidden Items', description: 'Hidden Rare Candy on Route 120 (second one).' },
  { hex_id: '0xC19', name: 'FLAG_HIDDEN_ITEM_ROUTE_121_NUGGET', category: 'Hidden Items', description: 'Hidden Nugget on Route 121.' },
  { hex_id: '0xC1A', name: 'FLAG_HIDDEN_ITEM_ROUTE_123_SUPER_REPEL', category: 'Hidden Items', description: 'Hidden Super Repel on Route 123.' },
  { hex_id: '0xC1B', name: 'FLAG_HIDDEN_ITEM_ROUTE_125_BIG_PEARL', category: 'Hidden Items', description: 'Hidden Big Pearl underwater on Route 125.' },
  { hex_id: '0xC1C', name: 'FLAG_HIDDEN_ITEM_ROUTE_127_ZINC', category: 'Hidden Items', description: 'Hidden Zinc underwater on Route 127.' },
  { hex_id: '0xC1D', name: 'FLAG_HIDDEN_ITEM_ROUTE_128_HEART_SCALE', category: 'Hidden Items', description: 'Hidden Heart Scale underwater on Route 128.' },

  // --- Location-Specific Hidden Items ---
  { hex_id: '0xC20', name: 'FLAG_HIDDEN_ITEM_PETALBURG_WOODS_POTION', category: 'Hidden Items', description: 'Hidden Potion in Petalburg Woods.' },
  { hex_id: '0xC21', name: 'FLAG_HIDDEN_ITEM_PETALBURG_WOODS_TINY_MUSHROOM_1', category: 'Hidden Items', description: 'Hidden Tiny Mushroom in Petalburg Woods (first).' },
  { hex_id: '0xC22', name: 'FLAG_HIDDEN_ITEM_PETALBURG_WOODS_TINY_MUSHROOM_2', category: 'Hidden Items', description: 'Hidden Tiny Mushroom in Petalburg Woods (second).' },
  { hex_id: '0xC23', name: 'FLAG_HIDDEN_ITEM_RUSTURF_TUNNEL_MAX_ETHER', category: 'Hidden Items', description: 'Hidden Max Ether in Rusturf Tunnel.' },
  { hex_id: '0xC24', name: 'FLAG_HIDDEN_ITEM_GRANITE_CAVE_ESCAPE_ROPE', category: 'Hidden Items', description: 'Hidden Escape Rope in Granite Cave B1F.' },
  { hex_id: '0xC25', name: 'FLAG_HIDDEN_ITEM_GRANITE_CAVE_EVERSTONE', category: 'Hidden Items', description: 'Hidden Everstone in Granite Cave B2F.' },
  { hex_id: '0xC26', name: 'FLAG_HIDDEN_ITEM_MT_CHIMNEY_RARE_CANDY', category: 'Hidden Items', description: 'Hidden Rare Candy at Mt. Chimney summit.' },
  { hex_id: '0xC27', name: 'FLAG_HIDDEN_ITEM_JAGGED_PASS_BURN_HEAL', category: 'Hidden Items', description: 'Hidden Burn Heal on Jagged Pass.' },
  { hex_id: '0xC28', name: 'FLAG_HIDDEN_ITEM_FIERY_PATH_FIRE_STONE', category: 'Hidden Items', description: 'Hidden Fire Stone in Fiery Path.' },
  { hex_id: '0xC29', name: 'FLAG_HIDDEN_ITEM_NEW_MAUVILLE_ESCAPE_ROPE', category: 'Hidden Items', description: 'Hidden Escape Rope in New Mauville.' },
  { hex_id: '0xC2A', name: 'FLAG_HIDDEN_ITEM_ABANDONED_SHIP_LUXURY_BALL', category: 'Hidden Items', description: 'Hidden Luxury Ball in Abandoned Ship.' },
  { hex_id: '0xC2B', name: 'FLAG_HIDDEN_ITEM_SEAFLOOR_CAVERN_PEARL', category: 'Hidden Items', description: 'Hidden Pearl in Seafloor Cavern.' },
  { hex_id: '0xC2C', name: 'FLAG_HIDDEN_ITEM_CAVE_OF_ORIGIN_MAX_REVIVE', category: 'Hidden Items', description: 'Hidden Max Revive in Cave of Origin.' },
  { hex_id: '0xC2D', name: 'FLAG_HIDDEN_ITEM_VICTORY_ROAD_MAX_ELIXIR', category: 'Hidden Items', description: 'Hidden Max Elixir in Victory Road.' },
  { hex_id: '0xC2E', name: 'FLAG_HIDDEN_ITEM_VICTORY_ROAD_PP_UP', category: 'Hidden Items', description: 'Hidden PP Up in Victory Road.' },

  // --- Town/City Hidden Items ---
  { hex_id: '0xC30', name: 'FLAG_HIDDEN_ITEM_RUSTBORO_CITY_X_DEFEND', category: 'Hidden Items', description: 'Hidden X Defend in Rustboro City.' },
  { hex_id: '0xC31', name: 'FLAG_HIDDEN_ITEM_DEWFORD_TOWN_SUPER_POTION', category: 'Hidden Items', description: 'Hidden Super Potion behind house in Dewford Town.' },
  { hex_id: '0xC32', name: 'FLAG_HIDDEN_ITEM_SLATEPORT_CITY_HEART_SCALE', category: 'Hidden Items', description: 'Hidden Heart Scale in Slateport City beach area.' },
  { hex_id: '0xC33', name: 'FLAG_HIDDEN_ITEM_MAUVILLE_CITY_X_SPEED', category: 'Hidden Items', description: 'Hidden X Speed in Mauville City.' },
  { hex_id: '0xC34', name: 'FLAG_HIDDEN_ITEM_VERDANTURF_TOWN_MAX_ETHER', category: 'Hidden Items', description: 'Hidden Max Ether in Verdanturf Town.' },
  { hex_id: '0xC35', name: 'FLAG_HIDDEN_ITEM_PACIFIDLOG_TOWN_MAX_REVIVE', category: 'Hidden Items', description: 'Hidden Max Revive in Pacifidlog Town.' },
  { hex_id: '0xC36', name: 'FLAG_HIDDEN_ITEM_SOOTOPOLIS_CITY_ZINC', category: 'Hidden Items', description: 'Hidden Zinc in Sootopolis City.' },

  // --- Safari Zone Hidden Items ---
  { hex_id: '0xC40', name: 'FLAG_HIDDEN_ITEM_SAFARI_ZONE_NUGGET', category: 'Hidden Items', description: 'Hidden Nugget in Safari Zone Area 1.' },
  { hex_id: '0xC41', name: 'FLAG_HIDDEN_ITEM_SAFARI_ZONE_TINY_MUSHROOM', category: 'Hidden Items', description: 'Hidden Tiny Mushroom in Safari Zone Area 2.' },
  { hex_id: '0xC42', name: 'FLAG_HIDDEN_ITEM_SAFARI_ZONE_CALCIUM', category: 'Hidden Items', description: 'Hidden Calcium in Safari Zone Area 3.' },
  { hex_id: '0xC43', name: 'FLAG_HIDDEN_ITEM_SAFARI_ZONE_BIG_MUSHROOM', category: 'Hidden Items', description: 'Hidden Big Mushroom in Safari Zone Area 4.' },

  // --- Battle Frontier Hidden Items ---
  { hex_id: '0xC50', name: 'FLAG_HIDDEN_ITEM_FRONTIER_ACCESS_PP_MAX', category: 'Hidden Items', description: 'Hidden PP Max in Battle Frontier entrance area.' },
  { hex_id: '0xC51', name: 'FLAG_HIDDEN_ITEM_ARTISAN_CAVE_CALCIUM', category: 'Hidden Items', description: 'Hidden Calcium in Artisan Cave.' }
];

// Additional categories for better organization
export const flagCategories = [
  "All", "System", "Badges", "Story", "Item", "Location", "Contest", 
  "Battle Frontier", "Special Events", "Hidden Items", "Temporary", "Custom"
];

// Flag usage statistics for ROM hackers
export const flagUsageNotes = {
  temporaryFlags: "Flags 0x860-0x86F are constantly reused by the game engine. Never rely on these maintaining their values across different scripts or map changes.",
  systemFlags: "System flags (0x001-0x0FF) control core game functionality. Modifying these can have widespread effects on game behavior.",
  storyFlags: "Story flags (0x100-0x3FF) track major game progression. These are safe to reference in custom scripts for progression checks.",
  hiddenItemFlags: "Hidden item flags (0xC00-0xCFF) are set when the player finds hidden items. Each flag corresponds to a specific hidden item location.",
  customSafeRange: "Flags 0x900-0x9FF are generally safe for custom ROM hack use without conflicting with vanilla game systems."
};