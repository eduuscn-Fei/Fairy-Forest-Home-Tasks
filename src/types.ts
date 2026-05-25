export interface ChildProfile {
  id: string;
  name: string;
  avatar: string; // key of avatar types
  level: number;
  xp: number;
  points: number;
  xpNeeded: number;
  badges: Array<{
    id: string;
    name: string;
    icon: string;
    description: string;
    unlockedAt: string;
  }>;
}

export type QuestDifficulty = 'easy' | 'medium' | 'hard' | 'boss';
type QuestFrequency = 'daily' | 'weekly' | 'one-time';

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  xp: number;
  difficulty: QuestDifficulty;
  frequency: QuestFrequency;
  assignedTo: string; // 'all' or ChildProfile ID
  status: 'available' | 'pending_approval' | 'completed';
  lastCompletedBy?: string;
  lastCompletedAt?: string;
}

export interface Reward {
  id: string;
  title: string;
  description: string;
  cost: number;
  icon: string;
}

export interface RewardClaim {
  id: string;
  rewardId: string;
  childId: string;
  status: 'pending' | 'approved';
  claimedAt: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string;
  type: 'general' | 'chore' | 'fun' | 'important';
}

export interface GroceryItem {
  id: string;
  name: string;
  qty: string;
  completed: boolean;
}

export interface SkylightNote {
  id: string;
  text: string;
  author: string;
  color: string;
  date: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'quest' | 'reward' | 'calendar';
  timestamp: string;
}

export interface FamilyState {
  familyCode: string;
  parentPin: string;
  children: ChildProfile[];
  quests: Quest[];
  rewards: Reward[];
  claims: RewardClaim[];
  calendar: CalendarEvent[];
  groceryList: GroceryItem[];
  notes: SkylightNote[];
  notifications: AppNotification[];
  encryptionActive: boolean;
  lastBackup: string | null;
}
