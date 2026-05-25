import React, { useState, useEffect } from "react";
import { ChildProfile } from "../types";
import { AVATAR_LIST } from "../avatarData";
import { ShieldCheck, Sparkles, Zap, Award, Star, Trophy, Moon, ChevronRight, Pencil, Check, X } from "lucide-react";

interface ChildSelectorProps {
  childrenList: ChildProfile[];
  activeChildId: string;
  onSelectChild: (id: string) => void;
  onUnlockAvatarClick?: () => void;
  accessibilityOn: boolean;
  onRenameChild?: (id: string, newName: string) => void;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  childrenList,
  activeChildId,
  onSelectChild,
  onUnlockAvatarClick,
  accessibilityOn,
  onRenameChild
}) => {
  const activeChild = childrenList.find(c => c.id === activeChildId) || childrenList[0];

  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");

  useEffect(() => {
    if (activeChild) {
      setEditedName(activeChild.name);
    }
  }, [activeChildId, activeChild]);

  const handleSaveRename = () => {
    if (editedName.trim() && onRenameChild && activeChild) {
      onRenameChild(activeChild.id, editedName.trim());
    }
    setIsEditing(false);
  };

  // Helper to map avatar string to Lucide icon
  const getAvatarIcon = (iconName: string) => {
    switch (iconName) {
      case "ShieldAlert": return <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-blue-100" id="icon-shield" />;
      case "WandSparkles": return <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-purple-100" id="icon-wand" />;
      case "Zap": return <Zap className="w-8 h-8 md:w-10 md:h-10 text-amber-100" id="icon-zap" />;
      case "Flame": return <Award className="w-8 h-8 md:w-10 md:h-10 text-red-100" id="icon-flame" />;
      case "Sparkles": return <Star className="w-8 h-8 md:w-10 md:h-10 text-teal-100" id="icon-sparkles" />;
      case "Crown": return <Trophy className="w-8 h-8 md:w-10 md:h-10 text-yellow-100" id="icon-crown" />;
      default: return <ShieldCheck className="w-8 h-8 md:w-10 md:h-10 text-slate-100" id="icon-fallback" />;
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case "Sword": return <ShieldCheck className="w-5 h-5 text-indigo-500" />;
      case "Sparkles": return <Sparkles className="w-5 h-5 text-amber-500" />;
      case "BookOpen": return <Award className="w-5 h-5 text-emerald-500" />;
      default: return <Trophy className="w-5 h-5 text-blue-500" />;
    }
  };

  // Find Avatar config
  const activeAvatarConfig = AVATAR_LIST.find(a => a.id === activeChild?.avatar) || AVATAR_LIST[0];

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-5 md:p-6 shadow-md shadow-stone-100/50" id="child-profile-hub">
      {/* Horizontal Switcher of Children */}
      <div className="flex flex-wrap items-center gap-3 mb-6" id="profiles-switcher-header">
        <span className="text-stone-500 font-display text-xs uppercase tracking-wider mr-2 font-semibold">Active Member:</span>
        <div className="flex flex-wrap gap-2">
          {childrenList.map((child) => {
            const isSelected = child.id === activeChildId;
            const avatarMatch = AVATAR_LIST.find(a => a.id === child.avatar) || AVATAR_LIST[0];
            return (
              <button
                key={child.id}
                id={`btn-select-child-${child.id}`}
                onClick={() => onSelectChild(child.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl transition-all duration-300 font-sans border text-sm cursor-pointer ${
                  isSelected
                    ? "bg-purple-100 text-purple-900 border-purple-300 shadow-sm shadow-purple-500/10 scale-[1.03]"
                    : "bg-stone-50 hover:bg-stone-100 text-stone-600 border-stone-200"
                }`}
              >
                <div className={`p-1.5 rounded-xl bg-gradient-to-tr ${avatarMatch.color} text-white shadow-sm`}>
                  {getAvatarIcon(avatarMatch.icon)}
                </div>
                <div className="text-left font-display">
                  <p className="font-bold text-xs md:text-sm">{child.name.split(" ")[0]}</p>
                  <p className="text-[10px] opacity-85 font-medium">Lv. {child.level}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Stats of Active Child */}
      {activeChild && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch" id="hero-status-details">
          {/* Avatar Orb */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center bg-stone-50 border border-stone-200/60 rounded-2xl p-6 text-center relative overflow-hidden" id="hero-orb">
            {/* Background glow decoration */}
            <div className={`absolute -inset-10 bg-gradient-to-tr ${activeAvatarConfig.color} opacity-10 blur-xl`}></div>
            
            <div className={`w-20 h-20 md:w-24 md:h-24 rounded-full bg-gradient-to-tr ${activeAvatarConfig.color} flex items-center justify-center shadow-md border-2 ${activeAvatarConfig.border} mb-4 relative z-10 animate-bounce-slow`}>
              {getAvatarIcon(activeAvatarConfig.icon)}
              <div className="absolute -bottom-1 -right-1 bg-amber-400 text-amber-950 font-extrabold font-sans text-xs px-2.5 py-1 rounded-full shadow border-2 border-white">
                Lv. {activeChild.level}
              </div>
            </div>

            <div className="relative z-10 w-full flex flex-col items-center">
              {isEditing ? (
                <div className="flex items-center gap-1.5 justify-center max-w-full">
                  <input
                    type="text"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    className="px-2 py-1 text-sm border border-stone-300 rounded-xl outline-none text-stone-800 font-display font-medium text-center focus:border-purple-400 max-w-[150px]"
                    placeholder="Enter name"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveRename();
                      if (e.key === "Escape") setIsEditing(false);
                    }}
                  />
                  <button
                    onClick={handleSaveRename}
                    className="p-1 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-250 cursor-pointer"
                    id="save-rename-btn"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedName(activeChild.name);
                    }}
                    className="p-1 rounded-lg bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors border border-stone-250 cursor-pointer"
                    id="cancel-rename-btn"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className={`font-display font-bold text-stone-800 uppercase tracking-wide ${accessibilityOn ? 'text-2xl' : 'text-lg'}`}>
                    {activeChild.name}
                  </h3>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 rounded-full text-stone-400 hover:text-purple-600 hover:bg-stone-100 transition-colors cursor-pointer"
                    title="Rename Profile"
                    id="rename-active-child-btn"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <p className="text-stone-500 font-sans text-xs mt-1 italic text-center">
                "{activeAvatarConfig.sub}"
              </p>
            </div>

            <button
              id="btn-unlocks-catalog"
              onClick={onUnlockAvatarClick}
              className="mt-4 text-xs font-semibold text-purple-600 hover:text-purple-700 flex items-center gap-1 transition-colors cursor-pointer relative z-10 font-display"
            >
              <span>Change Companion Persona</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gamification Core Stats */}
          <div className="lg:col-span-8 flex flex-col justify-between space-y-4" id="hero-xp-purse">
            {/* XP status */}
            <div className="bg-sky-50/70 border border-sky-100 rounded-2xl p-4 flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sky-900 font-semibold font-display text-sm flex items-center gap-1.5 animate-pulse">
                  <Star className="w-4 h-4 text-sky-500 fill-sky-200" />
                  Activity Progress to Next Level
                </span>
                <span className="text-sky-800 font-mono font-bold text-xs">
                  {activeChild.xp} / {activeChild.xpNeeded} XP
                </span>
              </div>
              <div className="w-full bg-white rounded-full h-4.5 overflow-hidden border border-sky-200 p-0.5" id="xp-meter-outer">
                <div
                  className="bg-gradient-to-r from-sky-400 via-purple-300 to-pink-300 h-full rounded-full transition-all duration-1000 ease-out shadow-inner relative"
                  style={{ width: `${Math.min(100, (activeChild.xp / activeChild.xpNeeded) * 100)}%` }}
                  id="xp-meter-inner"
                >
                  <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                </div>
              </div>
              <p className="text-[11px] text-sky-850 mt-2 font-sans font-medium">
                🌟 Finish {Math.ceil((activeChild.xpNeeded - activeChild.xp) / 25)} more activities to reach Level {activeChild.level + 1}!
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Point purse */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex items-center gap-4 shadow-sm" id="coins-pouch">
                <div className="w-12 h-12 rounded-full bg-white border-2 border-amber-300 flex items-center justify-center shadow-inner">
                  <span className="text-amber-500 font-black text-xl select-none" id="coin-spinning">⭐</span>
                </div>
                <div>
                  <p className="text-amber-800 font-display font-medium text-xs uppercase tracking-wider">Family Points</p>
                  <p className="text-stone-800 font-black text-3xl font-display tracking-tight" id="points-count-digits">
                    {activeChild.points} <span className="text-amber-600 text-sm font-semibold">Stars</span>
                  </p>
                </div>
              </div>

              {/* Collectible Badges cabinet */}
              <div className="bg-emerald-50/60 border border-emerald-150 rounded-2xl p-4 flex flex-col justify-start" id="badges-trophy">
                <p className="text-emerald-800 font-display font-semibold text-xs uppercase tracking-wider mb-2 flex items-center gap-1.5 border-b border-emerald-200/55 pb-1">
                  <Trophy className="w-3.5 h-3.5 text-emerald-600" />
                  Fairy World Badges ({activeChild.badges.length})
                </p>
                <div className="flex flex-wrap gap-2 overflow-y-auto max-h-20 pr-1 py-1" id="badges-icons-rack">
                  {activeChild.badges.length === 0 ? (
                    <span className="text-stone-500 text-xs italic">No badges earned yet. Fairy tasks will unlock them!</span>
                  ) : (
                    activeChild.badges.map((badge) => (
                      <div
                        key={badge.id}
                        className="group relative flex items-center justify-center w-8 h-8 rounded-lg bg-white border border-emerald-200 shadow-sm cursor-help hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                        title={`${badge.name}: ${badge.description}`}
                      >
                        {getBadgeIcon(badge.icon)}
                        {/* Custom visual tooltip inside cozy UI */}
                        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-stone-900 text-white text-[10px] rounded-xl px-2.5 py-1.5 w-40 z-30 shadow-md pointer-events-none border border-stone-800">
                          <p className="font-bold text-amber-300 font-display">{badge.name}</p>
                          <p className="text-stone-200 font-light text-[9px] mt-0.5 leading-tight">{badge.description}</p>
                          <p className="text-stone-400 text-[8px] font-mono mt-1 pt-1 border-t border-stone-850">Earned: {badge.unlockedAt}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
