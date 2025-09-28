export function buildLocalScriptFromPreset(presetKey, nSections = 1) {
  const sec = Math.max(1, Math.min(10, nSections | 0));
  const lines = [];
  const S = (id) => `section${id}: # 000000`;

  const pushCommon = (id) => {
    lines.push(S(id));
    if (id === 1) lines.push('faceplayer');
    lines.push('msgbox.npc <greeting>');
  };

  const basicNpc = () => {
    for (let i = 1; i <= sec; i++) {
      pushCommon(i);
      if (i === 1) {
        lines.push('if.yes.goto <branch_yes>');
        lines.push('msgbox.npc <no_text>');
        lines.push('return');
        lines.push('branch_yes:');
        lines.push('msgbox.npc <yes_text>');
      } else {
        lines.push('call <do_action>');
        lines.push('msgbox.npc <after_action>');
      }
      lines.push('return');
    }
    lines.push('end');
  };

  const branchingNpc = () => {
    for (let i = 1; i <= sec; i++) {
      pushCommon(i);
      lines.push('msgbox.yesno <ask_choice>');
      lines.push('if.yes.goto <yes_path>');
      lines.push('msgbox.npc <no_path>');
      lines.push('return');
      lines.push('yes_path:');
      lines.push('setflag SOME_INTERACTION_FLAG');
      lines.push('msgbox.npc <yes_path_text>');
      lines.push('return');
    }
    lines.push('end');
  };

  const shopNpc = () => {
    for (let i = 1; i <= sec; i++) {
      pushCommon(i);
      lines.push('msgbox.yesno <shop_greeting>');
      lines.push('if.no.goto <decline>');
      lines.push('special StartMart <shop_items>');
      lines.push('msgbox.npc <after_shop>');
      lines.push('return');
      lines.push('decline:');
      lines.push('msgbox.npc <decline_text>');
      lines.push('return');
    }
    lines.push('end');
  };

  const gymLeader = () => {
    pushCommon(1);
    lines.push('msgbox.npc <pre_battle>');
    lines.push('single.battle.continue.silent GymLeader <defeat_text> <victory_text> <section>');
    lines.push('msgbox.npc <badge_text>');
    lines.push('fanfare mus_obtain_badge');
    lines.push('waitfanfare');
    lines.push('setflag BADGE_FLAG');
    lines.push('return');
    for (let i = 2; i <= sec; i++) {
      lines.push(S(i));
      lines.push('msgbox.npc <after_ceremony>');
      lines.push('return');
    }
    lines.push('end');
  };

  const trainerBattle = () => {
    pushCommon(1);
    lines.push('msgbox.npc <pre_battle>');
    lines.push('single.battle.continue.silent Trainer <defeat_text> <victory_text> <section>');
    lines.push('msgbox.npc <after_battle>');
    lines.push('return');
    for (let i = 2; i <= sec; i++) {
      lines.push(S(i));
      lines.push('msgbox.npc <extra_comment>');
      lines.push('return');
    }
    lines.push('end');
  };

  const simpleCutscene = () => {
    lines.push(S(1));
    lines.push('lockall');
    lines.push('applymovement npc <movement_data>');
    lines.push('waitmovement npc');
    lines.push('msgbox.npc <cutscene_text>');
    lines.push('return');
    for (let i = 2; i <= sec; i++) {
      lines.push(S(i));
      lines.push('msgbox.npc <cutscene_more>');
      lines.push('return');
    }
    lines.push('release');
    lines.push('end');
  };

  const epicCutscene = () => {
    lines.push(S(1));
    lines.push('lockall');
    lines.push('special SpawnCameraObject');
    lines.push('move.camera <camera_movement>');
    lines.push('move.npc 1 <npc_movement>');
    lines.push('move.player <player_movement>');
    lines.push('sound se_effect');
    lines.push('pause 60');
    lines.push('msgbox.npc <epic_dialogue>');
    lines.push('return');
    for (let i = 2; i <= sec; i++) {
      lines.push(S(i));
      lines.push('msgbox.npc <epic_more>');
      lines.push('return');
    }
    lines.push('release');
    lines.push('end');
  };

  const itemBall = () => {
    pushCommon(1);
    lines.push('npc.item ITEM_NAME 1');
    lines.push('if.no.goto <bag_full>');
    lines.push('setflag ITEM_FLAG');
    lines.push('msgbox.npc <found_item>');
    lines.push('return');
    lines.push('bag_full:');
    lines.push('msgbox.npc <bag_full_text>');
    lines.push('return');
    for (let i = 2; i <= sec; i++) {
      lines.push(S(i));
      lines.push('return');
    }
    lines.push('end');
  };

  const hiddenItem = () => {
    pushCommon(1);
    lines.push('npc.item ITEM_NAME 1');
    lines.push('if.no.goto <bag_full>');
    lines.push('setflag ITEM_FLAG');
    lines.push('hidesprite SPRITE_ID');
    lines.push('msgbox.npc <found_hidden_item>');
    lines.push('return');
    lines.push('bag_full:');
    lines.push('msgbox.npc <bag_full_text>');
    lines.push('return');
    for (let i = 2; i <= sec; i++) {
      lines.push(S(i));
      lines.push('return');
    }
    lines.push('end');
  };

  const legendary = () => {
    lines.push(S(1));
    lines.push('lockall');
    lines.push('setweather Storm');
    lines.push('doweather');
    lines.push('cry LEGENDARY_SPECIES 2');
    lines.push('pause 120');
    lines.push('single.battle.continue.silent LEGENDARY_SPECIES <fled> <caught> <section>');
    lines.push('hidesprite LEGENDARY_SPRITE');
    lines.push('setflag LEGENDARY_FLAG');
    lines.push('return');
    for (let i = 2; i <= sec; i++) {
      lines.push(S(i));
      lines.push('msgbox.npc <aftermath>');
      lines.push('return');
    }
    lines.push('release');
    lines.push('end');
  };

  switch (presetKey) {
    case 'basic_npc': basicNpc(); break;
    case 'branching_npc': branchingNpc(); break;
    case 'shop_npc': shopNpc(); break;
    case 'gym_leader': gymLeader(); break;
    case 'trainer_battle': trainerBattle(); break;
    case 'simple_cutscene': simpleCutscene(); break;
    case 'epic_cutscene': epicCutscene(); break;
    case 'item_ball': itemBall(); break;
    case 'hidden_item': hiddenItem(); break;
    case 'legendary_encounter': legendary(); break;
    default: basicNpc();
  }
  return lines.join('\n');
}
