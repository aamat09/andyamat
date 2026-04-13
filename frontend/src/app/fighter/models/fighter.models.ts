export interface Fighter {
  id: string;
  name: string;
  char_type: 'knight' | 'rogue' | 'mage' | 'berserker';
  weapon: 'iron_sword' | 'war_hammer' | 'shadow_dagger';
  level: number;
  xp: number;
  hp: number;
  atk: number;
  def: number;
  spd: number;
  crt: number;
  lck: number;
  elo: number;
  wins: number;
  losses: number;
  created_at: string;
}

export interface TurnAction {
  actor: string;
  type: 'basic' | 'skill' | 'dodge' | 'stunned';
  skill?: string;
  damage: number;
  crit: boolean;
  dodged: boolean;
  stun?: boolean;
  poison?: number;
  absorb?: number;
  def_buff?: number;
  self_damage?: number;
  atk_boost?: number;
}

export interface StatusEffect {
  target: string;
  type: string;
  damage?: number;
  turns_left?: number;
}

export interface BattleTurn {
  turn: number;
  first: string;
  actions: TurnAction[];
  hp_after: Record<string, number>;
  effects: StatusEffect[];
}

export interface FighterSnapshot {
  id: string;
  name: string;
  char_type: string;
  weapon: string;
  hp: number;
  atk: number;
  def: number;
  spd: number;
}

export interface BattleResult {
  match_id: string;
  fought_at: string;
  winner_id: string;
  elo_change: number;
  battle_log: BattleTurn[];
  fighter1: FighterSnapshot;
  fighter2: FighterSnapshot;
}

export interface MatchSummary {
  match_id: string;
  fighter1_id: string;
  fighter2_id: string;
  f1_name: string;
  f2_name: string;
  f1_type: string;
  f2_type: string;
  winner_id: string;
  elo_change: number;
  fought_at: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  char_type: string;
  weapon: string;
  level: number;
  elo: number;
  wins: number;
  losses: number;
}

export type CharType = 'knight' | 'rogue' | 'mage' | 'berserker';
export type WeaponType = 'iron_sword' | 'war_hammer' | 'shadow_dagger';

export const CHAR_INFO: Record<CharType, { label: string; color: string; desc: string }> = {
  knight:    { label: 'Knight',    color: '#4A90D9', desc: 'High DEF, tanky' },
  rogue:     { label: 'Rogue',     color: '#7B68EE', desc: 'Fast, critical hits' },
  mage:      { label: 'Mage',      color: '#E74C3C', desc: 'Burst damage' },
  berserker: { label: 'Berserker', color: '#F39C12', desc: 'Escalating power' },
};

export const WEAPON_INFO: Record<WeaponType, { label: string; desc: string }> = {
  iron_sword:    { label: 'Iron Sword',    desc: 'ATK+4 SPD+1 Balanced' },
  war_hammer:    { label: 'War Hammer',    desc: 'ATK+6 DEF+2 SPD-2 Stun' },
  shadow_dagger: { label: 'Shadow Dagger', desc: 'ATK+2 SPD+4 CRT+5' },
};
