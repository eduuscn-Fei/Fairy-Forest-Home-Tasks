export interface AvatarOption {
  id: string;
  name: string;
  sub: string;
  icon: string; // Lucide icon identifier
  color: string; // Background visual gradients
  border: string; // Tailwind border styling
  unlockLevel: number;
}

export const AVATAR_LIST: AvatarOption[] = [
  {
    id: "shield-alert",
    name: "Forest Elf",
    sub: "Fairy helper for sweeping and tidy paths",
    icon: "ShieldAlert",
    color: "from-emerald-500 to-teal-600",
    border: "border-emerald-300 shadow-emerald-500/10",
    unlockLevel: 1
  },
  {
    id: "wand-sparkles",
    name: "Woodland Sprite",
    sub: "Fairy helper for bed making and folding sheets",
    icon: "WandSparkles",
    color: "from-purple-500 to-indigo-600",
    border: "border-purple-300 shadow-purple-500/10",
    unlockLevel: 1
  },
  {
    id: "zap",
    name: "Breeze Pixie",
    sub: "Fairy helper for dusting and vacuuming",
    icon: "Zap",
    color: "from-amber-400 to-orange-500",
    border: "border-amber-300 shadow-amber-500/10",
    unlockLevel: 2
  },
  {
    id: "flame",
    name: "Hearth Sprite",
    sub: "Fairy helper for yard cleanup and plants",
    icon: "Flame",
    color: "from-red-400 to-rose-500",
    border: "border-rose-300 shadow-rose-500/10",
    unlockLevel: 3
  },
  {
    id: "star",
    name: "River Pixie",
    sub: "Fairy helper for washing dishes and water chores",
    icon: "Sparkles",
    color: "from-sky-400 to-blue-500",
    border: "border-sky-300 shadow-sky-450/10",
    unlockLevel: 4
  },
  {
    id: "crown",
    name: "Fairy King",
    sub: "Fairy leader for team projects and laundry",
    icon: "Crown",
    color: "from-yellow-400 to-amber-500",
    border: "border-yellow-400 shadow-yellow-500/20 animate-pulse",
    unlockLevel: 5
  }
];
