import React, { useState } from "react";
import { Quest, ChildProfile, QuestDifficulty } from "../types";
import { Shield, Sparkles, Flame, Play, Clock, Check, Users, ShieldAlert, Award, Plus, Pencil, X } from "lucide-react";

interface QuestMapProps {
  quests: Quest[];
  activeChild: ChildProfile;
  onSubmitForApproval: (questId: string) => void;
  accessibilityOn: boolean;
  onRenameQuest?: (id: string, newTitle: string) => void;
  onAddTask?: (title: string, description: string, points: number, xp: number, difficulty: QuestDifficulty, frequency: 'daily' | 'weekly' | 'one-time') => void;
}

export const QuestMap: React.FC<QuestMapProps> = ({
  quests,
  activeChild,
  onSubmitForApproval,
  accessibilityOn,
  onRenameQuest,
  onAddTask
}) => {
  const [filterFreq, setFilterFreq] = useState<'all' | 'daily' | 'weekly'>('all');

  // New task form fields state
  const [showAddForm, setShowAddForm] = useState(false);
  const [addTitle, setAddTitle] = useState("");
  const [addDesc, setAddDesc] = useState("");
  const [addPoints, setAddPoints] = useState(50);
  const [addXp, setAddXp] = useState(25);
  const [addDifficulty, setAddDifficulty] = useState<QuestDifficulty>("medium");
  const [addFrequency, setAddFrequency] = useState<'daily' | 'weekly' | 'one-time'>("daily");

  // Editing existing task title state
  const [editingQuestId, setEditingQuestId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addTitle.trim()) return;
    if (onAddTask) {
      onAddTask(
        addTitle.trim(),
        addDesc.trim(),
        addPoints,
        addXp,
        addDifficulty,
        addFrequency
      );
    }
    // Reset Form
    setAddTitle("");
    setAddDesc("");
    setAddPoints(50);
    setAddXp(25);
    setAddDifficulty("medium");
    setAddFrequency("daily");
    setShowAddForm(false);
  };

  const handleSaveRename = (questId: string) => {
    if (editingTitle.trim() && onRenameQuest) {
      onRenameQuest(questId, editingTitle.trim());
    }
    setEditingQuestId(null);
  };

  // Filtered list
  const filteredQuests = quests.filter(q => {
    // Frequency filter
    if (filterFreq !== 'all' && q.frequency !== filterFreq) return false;
    // Assignment filter (assigned to 'all' or this specific child)
    if (q.assignedTo !== 'all' && q.assignedTo !== activeChild.id) return false;
    return true;
  });

  const getDifficultyStyles = (diff: QuestDifficulty) => {
    switch (diff) {
      case "easy":
        return {
          bg: "bg-emerald-50/60",
          border: "border-emerald-200/80",
          tagBg: "bg-emerald-100 text-emerald-800 border-emerald-200",
          label: "🧚 Pixie Task"
        };
      case "medium":
        return {
          bg: "bg-sky-50/60",
          border: "border-sky-200/80",
          tagBg: "bg-sky-100 text-sky-800 border-sky-200",
          label: "🍄 Fairy Chore"
        };
      case "hard":
        return {
          bg: "bg-amber-50/60",
          border: "border-amber-200/80",
          tagBg: "bg-amber-100 text-amber-800 border-amber-250",
          label: "🧝 Elf Adventure"
        };
      case "boss":
        return {
          bg: "bg-pink-50/60",
          border: "border-pink-200/80",
          tagBg: "bg-pink-100 text-pink-800 border-pink-200 font-bold",
          label: "👑 Enchanted Quest"
        };
    }
  };

  return (
    <div className="space-y-6" id="quest-board-section">
      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 border border-stone-200 rounded-3xl shadow-sm" id="quest-filters">
        <div>
          <h2 className="font-display font-bold text-stone-850 text-lg tracking-tight flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#9D8FEF]" />
            Active Tasks & Activities
          </h2>
          <p className="text-stone-500 text-xs mt-0.5">Let's do tasks around the house to earn Stars and make our avatars grow!</p>
        </div>

        {/* Add Task Button & Filter Selection buttons */}
        <div className="flex flex-wrap items-center gap-3" id="quest-controls-row">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs border border-purple-500 font-display"
            id="add-task-board-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>

          <div className="flex gap-1 bg-stone-100 p-1 rounded-2xl border border-stone-200 animate-pulse-slow" id="freq-tabs">
            {[
              { id: 'all', title: 'All' },
              { id: 'daily', title: 'Daily Tasks' },
              { id: 'weekly', title: 'Weekly Goals' }
            ].map((item) => (
              <button
                key={item.id}
                id={`freq-btn-${item.id}`}
                onClick={() => setFilterFreq(item.id as any)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer font-display ${
                  filterFreq === item.id
                    ? "bg-white text-stone-800 shadow-sm border border-stone-200"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                {item.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Inline Add Task Form */}
      {showAddForm && (
        <form onSubmit={handleCreateTask} className="bg-purple-50/50 border border-purple-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 max-w-2xl mx-auto" id="inline-add-task-form">
          <div className="flex justify-between items-center border-b border-purple-150 pb-2">
            <h3 className="font-display font-bold text-purple-900 text-sm flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-purple-600" />
              Add Fairy Chore Task
            </h3>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-purple-400 hover:text-purple-700 p-1 rounded-full cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Chore Title</label>
              <input
                type="text"
                required
                value={addTitle}
                onChange={(e) => setAddTitle(e.target.value)}
                placeholder="e.g. Empty the Recycling Bin"
                className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-400 text-stone-800 font-display font-medium"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Stars Reward</label>
                <input
                  type="number"
                  min="5"
                  max="1000"
                  required
                  value={addPoints}
                  onChange={(e) => setAddPoints(Number(e.target.value))}
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-300 text-stone-800 font-mono"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">XP Reward</label>
                <input
                  type="number"
                  min="5"
                  max="500"
                  required
                  value={addXp}
                  onChange={(e) => setAddXp(Number(e.target.value))}
                  className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-300 text-stone-800 font-mono"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Description</label>
            <input
              type="text"
              value={addDesc}
              onChange={(e) => setAddDesc(e.target.value)}
              placeholder="Fairy tip or checklist instructions..."
              className="w-full bg-white border border-purple-200 rounded-xl px-3 py-2 text-xs outline-none focus:border-purple-300 text-stone-800 font-display font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Difficulty Tier</label>
              <select
                value={addDifficulty}
                onChange={(e) => setAddDifficulty(e.target.value as any)}
                className="w-full bg-white border border-purple-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-purple-300 text-stone-700 font-display"
              >
                <option value="easy">🧚 Pixie Task (Easy)</option>
                <option value="medium">🍄 Fairy Chore (Medium)</option>
                <option value="hard">🧝 Elf Adventure (Hard)</option>
                <option value="boss">👑 Enchanted Quest (Boss)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-purple-700 tracking-wider">Frequency</label>
              <select
                value={addFrequency}
                onChange={(e) => setAddFrequency(e.target.value as any)}
                className="w-full bg-white border border-purple-200 rounded-xl px-2.5 py-2 text-xs outline-none focus:border-purple-300 text-stone-700 font-display"
              >
                <option value="daily">Daily Chores</option>
                <option value="weekly">Weekly Goals</option>
                <option value="one-time">One-Time Adventures</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-150 hover:bg-purple-200 rounded-xl transition-all cursor-pointer font-display"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-all cursor-pointer font-display"
              id="submit-inline-task-btn"
            >
              Enchant Task ✨
            </button>
          </div>
        </form>
      )}

      {/* Grid of Quests */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="quests-deck-grid">
        {filteredQuests.length === 0 ? (
          <div className="col-span-full bg-stone-50 border border-stone-200 py-12 px-4 rounded-3xl text-center">
            <ShieldAlert className="w-12 h-12 text-stone-300 mx-auto mb-3" />
            <p className="text-stone-650 font-display font-bold text-sm">No tasks in this list right now!</p>
            <p className="text-stone-400 text-xs mt-1">Check back later or ask Mom or Dad in the Parent Console.</p>
          </div>
        ) : (
          filteredQuests.map((quest) => {
            const diffStyles = getDifficultyStyles(quest.difficulty);
            return (
              <div
                key={quest.id}
                id={`quest-card-${quest.id}`}
                className={`flex flex-col justify-between rounded-3xl border p-5 ${diffStyles.bg} ${diffStyles.border} bg-white shadow-sm hover:shadow-md duration-300 transition-all hover:scale-[1.01]`}
              >
                <div>
                  {/* Card Header Tags */}
                  <div className="flex items-center justify-between mb-3.5">
                    <span className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1 rounded-xl border font-display ${diffStyles.tagBg}`}>
                      {diffStyles.label}
                    </span>
                    <span className="text-stone-400 text-[10px] font-display font-bold flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-blue-400" />
                      {quest.frequency.toUpperCase()}
                    </span>
                  </div>

                  {/* Title & Description */}
                  {editingQuestId === quest.id ? (
                    <div className="flex items-center gap-1 mb-2">
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="flex-1 px-2.5 py-1 text-xs border border-purple-300 rounded-xl outline-none text-stone-850 font-display font-medium focus:border-purple-500"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSaveRename(quest.id);
                          if (e.key === "Escape") setEditingQuestId(null);
                        }}
                      />
                      <button
                        onClick={() => handleSaveRename(quest.id)}
                        className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors border border-emerald-250 cursor-pointer shrink-0"
                        title="Save"
                        type="button"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingQuestId(null)}
                        className="p-1.5 rounded-lg bg-stone-50 text-stone-600 hover:bg-stone-100 transition-colors border border-stone-250 cursor-pointer shrink-0"
                        title="Cancel"
                        type="button"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2">
                      <h3 className={`font-display font-bold text-stone-850 hover:text-purple-700 transition-colors ${accessibilityOn ? 'text-lg md:text-xl font-extrabold' : 'text-sm font-bold'}`}>
                        {quest.title}
                      </h3>
                      {onRenameQuest && (
                        <button
                          onClick={() => {
                            setEditingQuestId(quest.id);
                            setEditingTitle(quest.title);
                          }}
                          className="p-1 rounded-full text-stone-450 hover:text-purple-600 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                          title="Rename Task"
                          type="button"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}
                  <p className="text-stone-600 text-xs leading-relaxed mt-2">
                    {quest.description}
                  </p>

                  {/* Rewards Row */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 border-t border-stone-200/50 pt-3">
                    <span className="text-amber-800 font-display font-semibold text-xs flex items-center gap-1.5 bg-white border border-amber-200 px-2 py-1 rounded-xl shadow-xs">
                      <span className="select-none text-xs">⭐</span>
                      +{quest.points} Stars
                    </span>
                    <span className="text-sky-850 font-display font-semibold text-xs flex items-center gap-1.5 bg-white border border-sky-200 px-2 py-1 rounded-xl shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                      +{quest.xp} XP
                    </span>
                    {quest.assignedTo === 'all' ? (
                      <span className="text-blue-800 font-display font-semibold text-xs flex items-center gap-1 bg-white border border-blue-200 px-2 py-1 rounded-xl shadow-xs ml-auto">
                        <Users className="w-3 h-3 text-blue-400" />
                        Everyone
                      </span>
                    ) : (
                      <span className="text-purple-800 font-display font-semibold text-xs flex items-center gap-1 bg-white border border-purple-200 px-2 py-1 rounded-xl shadow-xs ml-auto">
                        Personal
                      </span>
                    )}
                  </div>
                </div>

                {/* Submit completion Action Buttons */}
                <div className="mt-5 border-t border-stone-200/50 pt-4" id={`quest-actions-${quest.id}`}>
                  {quest.status === "available" && (
                    <button
                      id={`btn-launch-quest-${quest.id}`}
                      onClick={() => onSubmitForApproval(quest.id)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 active:scale-[0.98] text-white font-display font-medium text-sm rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      Complete Activity
                    </button>
                  )}

                  {quest.status === "pending_approval" && (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-stone-50 border border-amber-250 text-amber-800 font-display font-medium text-xs rounded-2xl animate-pulse">
                      <span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></span>
                      Waiting for Parents to Approve...
                    </div>
                  )}

                  {quest.status === "completed" && (
                    <div className="w-full flex items-center justify-center gap-2 py-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 font-display font-bold text-xs rounded-2xl">
                      <Check className="w-4 h-4 text-emerald-500" />
                      Activity Accomplished! (XP Paid)
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
