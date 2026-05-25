import React, { useState } from "react";
import { FamilyState, Quest, Reward, ChildProfile, RewardClaim } from "../types";
import { Lock, Unlock, Check, ShieldCheck, Trash2, Plus, Download, Key, RefreshCw, Layers, Award, ClipboardList, Settings, UserPlus, Eye, Users } from "lucide-react";
import { AVATAR_LIST } from "../avatarData";
import { generateHashSignature, encryptData } from "../encryptionUtils";

interface ParentConsoleProps {
  familyData: FamilyState;
  onUpdateState: (newState: FamilyState) => void;
  onApproveQuest: (questId: string, childId: string) => void;
  onApproveClaim: (claimId: string) => void;
  activeChildId: string;
  accessibilityOn: boolean;
}

export const ParentConsole: React.FC<ParentConsoleProps> = ({
  familyData,
  onUpdateState,
  onApproveQuest,
  onApproveClaim,
  activeChildId,
  accessibilityOn
}) => {
  const [isLocked, setIsLocked] = useState(true);
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState("");
  
  const [activeSubTab, setActiveSubTab] = useState<'approvals' | 'profiles' | 'editor' | 'crypto'>('approvals');

  // Addition states for creations
  const [newKidName, setNewKidName] = useState("");
  const [newKidAvatar, setNewKidAvatar] = useState("shield-alert");

  const [newChoreTitle, setNewChoreTitle] = useState("");
  const [newChoreDesc, setNewChoreDesc] = useState("");
  const [newChorePoints, setNewChorePoints] = useState(25);
  const [newChoreXP, setNewChoreXP] = useState(50);
  const [newChoreDiff, setNewChoreDiff] = useState<'easy' | 'medium' | 'hard' | 'boss'>('easy');
  const [newChoreFreq, setNewChoreFreq] = useState<'daily' | 'weekly'>('daily');
  const [newChoreAssigned, setNewChoreAssigned] = useState("all");

  const [newPrizeTitle, setNewPrizeTitle] = useState("");
  const [newPrizeDesc, setNewPrizeDesc] = useState("");
  const [newPrizeCost, setNewPrizeCost] = useState(100);
  const [newPrizeIcon, setNewPrizeIcon] = useState("Compass");

  const [showEncryptedText, setShowEncryptedText] = useState(false);
  const [backupPulse, setBackupPulse] = useState(false);
  const [newParentPin, setNewParentPin] = useState("");

  // Keypad controls for Parent PIN
  const handleKeypadPress = (num: string) => {
    setPinError("");
    if (pinInput.length < 4) {
      const nextPin = pinInput + num;
      setPinInput(nextPin);
      
      // If reached 4 digits, verify immediately
      if (nextPin === familyData.parentPin) {
        setIsLocked(false);
        setPinInput("");
        setPinError("");
      } else if (nextPin.length === 4) {
        setPinError("INCORRECT PIN Code! Try default '1234'.");
        setPinInput("");
      }
    }
  };

  const handleClearPin = () => {
    setPinInput("");
    setPinError("");
  };

  // Add kid controller
  const handleAddKid = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKidName) return;

    const newKid: ChildProfile = {
      id: "c_" + Date.now(),
      name: newKidName,
      avatar: newKidAvatar,
      level: 1,
      xp: 0,
      xpNeeded: 100,
      points: 50, // Starting stars bonus!
      badges: []
    };

    const nextState = {
      ...familyData,
      children: [...familyData.children, newKid],
      notifications: [
        {
          id: "notif_" + Date.now(),
          title: "New Helper Joined!",
          message: `${newKidName} has joined the board with 50 starting stars!`,
          type: "achievement" as const,
          timestamp: new Date().toISOString()
        },
        ...familyData.notifications
      ]
    };

    onUpdateState(nextState);
    setNewKidName("");
  };

  // Delete Kid
  const handleDeleteKid = (id: string) => {
    const nextState = {
      ...familyData,
      children: familyData.children.filter(c => c.id !== id)
    };
    onUpdateState(nextState);
  };

  // Add Chores
  const handleCreateChore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChoreTitle) return;

    const newQuest: Quest = {
      id: "q_" + Date.now(),
      title: newChoreTitle,
      description: newChoreDesc,
      points: Number(newChorePoints),
      xp: Number(newChoreXP),
      difficulty: newChoreDiff,
      frequency: newChoreFreq as any,
      assignedTo: newChoreAssigned,
      status: "available"
    };

    const nextState = {
      ...familyData,
      quests: [...familyData.quests, newQuest],
      notifications: [
        {
          id: "notif_q_" + Date.now(),
          title: "New Quest Posted!",
          message: `The Quest: '${newChoreTitle}' has been added to our boards by a Parent!`,
          type: "quest" as const,
          timestamp: new Date().toISOString()
        },
        ...familyData.notifications
      ]
    };

    onUpdateState(nextState);
    setNewChoreTitle("");
    setNewChoreDesc("");
  };

  // Remove Chores
  const handleDeleteChore = (id: string) => {
    onUpdateState({
      ...familyData,
      quests: familyData.quests.filter(q => q.id !== id)
    });
  };

  // Create Prize
  const handleCreatePrize = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrizeTitle) return;

    const newReward: Reward = {
      id: "r_" + Date.now(),
      title: newPrizeTitle,
      description: newPrizeDesc,
      cost: Number(newPrizeCost),
      icon: newPrizeIcon
    };

    onUpdateState({
      ...familyData,
      rewards: [...familyData.rewards, newReward]
    });

    setNewPrizeTitle("");
    setNewPrizeDesc("");
  };

  // Delete Prize
  const handleDeletePrize = (id: string) => {
    onUpdateState({
      ...familyData,
      rewards: familyData.rewards.filter(r => r.id !== id)
    });
  };

  // Update PIN
  const handleUpdatePin = () => {
    if (newParentPin.length !== 4 || isNaN(Number(newParentPin))) {
      alert("PIN must be exactly 4 numerical digits.");
      return;
    }
    onUpdateState({
      ...familyData,
      parentPin: newParentPin
    });
    setNewParentPin("");
    alert(`Secure Parental PIN code updated to '${newParentPin}' successfully!`);
  };

  // iCloud simulation triggering
  const triggerICloudBackup = () => {
    setBackupPulse(true);
    setTimeout(() => {
      onUpdateState({
        ...familyData,
        lastBackup: new Date().toISOString()
      });
      setBackupPulse(false);
      alert("iCloud backup uploaded successfully! Sync-containers stored in your family account.");
    }, 1500);
  };

  // Render Lock Screen if parent mode is locked
  if (isLocked) {
    return (
      <div className="bg-white border border-stone-200/80 rounded-3xl p-6 shadow-md shadow-stone-100/30 max-w-sm mx-auto text-center animate-fade-in" id="parental-gate">
        <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 border border-purple-100 flex items-center justify-center mx-auto mb-4 shadow-sm">
          <Lock className="w-6 h-6" />
        </div>
        <h3 className="text-stone-800 font-display font-bold text-lg tracking-tight">Parental Passcode Gate</h3>
        <p className="text-stone-500 text-xs mt-1 leading-normal">
          Enter your 4-digit Parent PIN to customize profiles, manage chores, and approve pending star rewards.
        </p>

        {/* PIN Dots indicators */}
        <div className="flex justify-center gap-4 my-5" id="pin-dots">
          {[0, 1, 2, 3].map((pos) => (
            <div
              key={pos}
              className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                pinInput.length > pos
                  ? "bg-purple-500 border-purple-400 scale-110 shadow-xs shadow-purple-500/20"
                  : "border-stone-200 bg-stone-50"
              }`}
            />
          ))}
        </div>

        {/* Feedback messages */}
        {pinError && <p className="text-rose-500 text-[11px] font-semibold mb-3 leading-tight">{pinError}</p>}
        {!pinError && <p className="text-stone-400 text-[10px] font-mono mb-3 uppercase tracking-wider">Default Pin: 1234</p>}

        {/* Keypad Grid block */}
        <div className="grid grid-cols-3 gap-2.5 max-w-xs mx-auto mb-4" id="pin-keypad font-semibold">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleKeypadPress(num)}
              className="bg-stone-50 hover:bg-stone-100 active:bg-stone-200 border border-stone-200 text-stone-700 font-display font-bold text-lg py-3 rounded-2xl focus:outline-none transition-transform active:scale-95 cursor-pointer shadow-xs"
            >
              {num}
            </button>
          ))}
          <button
            type="button"
            onClick={handleClearPin}
            className="bg-white hover:bg-stone-50 border border-stone-200 text-stone-500 font-display font-semibold text-xs py-3 rounded-2xl focus:outline-none cursor-pointer"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={() => handleKeypadPress("0")}
            className="bg-stone-50 hover:bg-stone-100 active:bg-stone-200 border border-stone-200 text-stone-700 font-display font-bold text-lg py-3 rounded-2xl focus:outline-none transition-transform active:scale-95 cursor-pointer shadow-xs"
          >
            0
          </button>
          <button
            type="button"
            disabled
            className="bg-stone-100 text-stone-400 border border-stone-200 font-display font-semibold text-xs py-3 rounded-2xl select-none"
          >
            Parent
          </button>
        </div>
      </div>
    );
  }

  // Pending items counts
  const pendingQuests = familyData.quests.filter(q => q.status === "pending_approval");
  const pendingClaims = familyData.claims.filter(c => c.status === "pending");

  // RENDER UNLOCKED parent PANEL
  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-5 md:p-6 shadow-md shadow-stone-100/50" id="parent-unlocked-panel">
      {/* Upper header controls */}
      <div className="flex flex-col md:flex-row items-stretch justify-between pb-4 border-b border-stone-150 mb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-pink-50 text-pink-700 font-display font-semibold text-[9px] px-2.5 py-0.5 rounded-full uppercase border border-pink-150">
              🌸 SECURE PARENT LEVEL CONTROLS
            </span>
            <button
              onClick={() => setIsLocked(true)}
              className="text-[10px] font-display font-bold text-red-500 hover:text-red-700 transition-colors uppercase flex items-center gap-1 cursor-pointer"
            >
              <Lock className="w-3 h-3" />
              Lock Console
            </button>
          </div>
          <h2 className="text-stone-850 font-display font-bold text-xl tracking-tight mt-1 flex items-center gap-2">
            <Settings className="w-5 h-5 text-purple-600" />
            Family Command Center
          </h2>
        </div>

        {/* Tabs switcher inside Parental area with cozy aesthetic */}
        <div className="flex bg-stone-100 p-1 rounded-2xl self-start border border-stone-200" id="parent-sub-tabs">
          {[
            { id: 'approvals', label: `Approvals (${pendingQuests.length + pendingClaims.length})`, icon: ShieldCheck },
            { id: 'profiles', label: "Child profiles", icon: Users },
            { id: 'editor', label: "Task & Prize builder", icon: ClipboardList },
            { id: 'crypto', label: "Vault encryption", icon: Key }
          ].map((subTab) => {
            const IsSel = activeSubTab === subTab.id;
            const Icon = subTab.icon;
            return (
              <button
                key={subTab.id}
                id={`parent-tab-${subTab.id}`}
                onClick={() => setActiveSubTab(subTab.id as any)}
                className={`flex items-center gap-1 px-3 py-2 rounded-xl text-xs font-semibold font-display transition cursor-pointer ${
                  IsSel
                    ? "bg-white text-stone-800 shadow-xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5 text-purple-500" />
                <span>{subTab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER APPROVALS TAB */}
      {activeSubTab === 'approvals' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="parent-approvals-pane">
          {/* Chore completions queue */}
          <div className="space-y-4">
            <h3 className="text-stone-800 font-display font-bold text-sm uppercase tracking-wider border-b border-stone-150 pb-2 flex items-center gap-1.5 justify-start text-left">
              <ClipboardList className="w-4 h-4 text-emerald-500" />
              Pending Chore Reviews ({pendingQuests.length})
            </h3>

            {pendingQuests.length === 0 ? (
              <div className="py-12 px-6 text-center bg-stone-50/50 border border-stone-200 rounded-3xl">
                <Check className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-650 text-xs font-semibold">No chores pending review.</p>
                <p className="text-stone-400 text-[10px] mt-0.5">Kids will post chores here as they finish their tasks!</p>
              </div>
            ) : (
              pendingQuests.map((quest) => {
                // Find child
                const childId = quest.lastCompletedBy || familyData.children[0]?.id || "";
                const child = familyData.children.find(c => c.id === childId);
                return (
                  <div
                    key={quest.id}
                    className="p-4 bg-stone-50/50 border border-stone-200 rounded-2xl hover:border-purple-200/60 transition flex items-center justify-between gap-4"
                  >
                    <div className="text-left">
                      <p className="text-purple-600 font-display text-[10px] font-bold">
                        HELPER: {child ? child.name : "Pixie Prince"}
                      </p>
                      <h4 className="font-display font-bold text-stone-800 text-sm mt-0.5">{quest.title}</h4>
                      <p className="text-stone-500 text-xs font-medium mt-1">
                        Reward: <span className="text-purple-600 font-extrabold">⭐ {quest.points} Stars</span> & <span className="text-stone-650 font-bold">{quest.xp} XP</span>
                      </p>
                    </div>

                    <button
                      id={`btn-approve-quest-${quest.id}`}
                      onClick={() => onApproveQuest(quest.id, childId)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-display font-medium text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Prizes vault claims */}
          <div className="space-y-4">
            <h3 className="text-stone-800 font-display font-bold text-sm uppercase tracking-wider border-b border-stone-150 pb-2 flex items-center gap-1.5 justify-start text-left">
              <Award className="w-4 h-4 text-purple-500" />
              Treat Redemptions Pending ({pendingClaims.length})
            </h3>

            {pendingClaims.length === 0 ? (
              <div className="py-12 px-6 text-center bg-stone-50/50 border border-stone-200 rounded-3xl">
                <Check className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-650 text-xs font-semibold">No rewards pending handover.</p>
                <p className="text-stone-400 text-[10px] mt-0.5">Purchased items will appear here for parents to complete.</p>
              </div>
            ) : (
              pendingClaims.map((claim) => {
                const child = familyData.children.find(c => c.id === claim.childId);
                const reward = familyData.rewards.find(r => r.id === claim.rewardId);
                return (
                  <div
                    key={claim.id}
                    className="p-4 bg-stone-50/50 border border-stone-200 rounded-2xl hover:border-purple-200/60 transition flex items-center justify-between gap-4"
                  >
                    <div className="text-left">
                      <p className="text-purple-600 font-display text-[10px] font-bold">
                        REDEMPTION FOR: {child ? child.name : "Fairy Princess"}
                      </p>
                      <h4 className="font-display font-bold text-stone-800 text-sm mt-0.5">
                        {reward ? reward.title : "Mystery Surprise Treat"}
                      </h4>
                      <p className="text-stone-500 text-[10px]">{claim.claimedAt.split("T")[0]}</p>
                    </div>

                    <button
                      id={`btn-approve-claim-${claim.id}`}
                      onClick={() => onApproveClaim(claim.id)}
                      className="bg-purple-600 hover:bg-purple-700 text-white font-display font-medium text-xs px-3.5 py-2 rounded-xl flex items-center gap-1 shadow-xs transition active:scale-95 cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Confirm Done</span>
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* RENDER CHILD PROFILES TAB */}
      {activeSubTab === 'profiles' && (
        <div className="space-y-6" id="profiles-editor-pane">
          {/* Add a Kid form */}
          <form onSubmit={handleAddKid} className="bg-stone-50 p-5 rounded-3xl border border-stone-200 max-w-xl space-y-4 text-left shadow-xs">
            <h3 className="text-stone-850 font-display font-bold text-sm tracking-tight flex items-center gap-2">
              <UserPlus className="w-4 h-4 text-purple-500" />
              Create a New Child Profile
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Child Name</label>
                <input
                  type="text"
                  placeholder="e.g. Leo"
                  value={newKidName}
                  onChange={(e) => setNewKidName(e.target.value)}
                  className="bg-white border border-stone-255 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-705 w-full focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Select Avatar Companion</label>
                <select
                  value={newKidAvatar}
                  onChange={(e) => setNewKidAvatar(e.target.value)}
                  className="bg-white border border-stone-255 text-xs text-stone-705 w-full rounded-xl px-2.5 py-2 focus:border-purple-300 outline-none shadow-xs"
                >
                  {AVATAR_LIST.map((av) => (
                    <option key={av.id} value={av.id}>
                      {av.name} (Requires LV {av.unlockLevel})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-display font-medium text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Add Child Profile
            </button>
          </form>

          {/* Active Family list table */}
          <div className="space-y-3" id="active-kids-lists">
            <h4 className="text-stone-700 font-display font-bold text-xs uppercase tracking-wider pb-1.5 border-b border-stone-150 text-left">
              Family Members List
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="kids-grid-parent">
              {familyData.children.map((child) => {
                const avatarMatch = AVATAR_LIST.find(a => a.id === child.avatar) || AVATAR_LIST[0];
                return (
                  <div
                    key={child.id}
                    className="p-4 bg-stone-50/50 border border-stone-200 rounded-2xl relative flex justify-between items-start"
                  >
                    <div className="text-left">
                      <p className="text-xs text-stone-400 font-sans font-medium">Level {child.level}</p>
                      <p className="font-display font-bold text-stone-800 text-xs mt-1">{child.name}</p>
                      <p className="text-[10px] text-purple-600 uppercase font-display tracking-wider font-bold mt-1">
                        ⭐ {child.points} Stars
                      </p>
                    </div>

                    <button
                      id={`btn-del-kid-${child.id}`}
                      onClick={() => {
                        if (confirm(`Are you sure you want to delete profile: ${child.name}?`)) {
                          handleDeleteKid(child.id);
                        }
                      }}
                      className="p-1 hover:bg-red-50 rounded text-red-500 hover:text-red-700 transition cursor-pointer"
                      title="Expel profile"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* RENDER CHORE / REWARD EDITOR TAB */}
      {activeSubTab === 'editor' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="chore-prize-editor-sub-tabs">
          {/* QUests management */}
          <div className="space-y-4">
            <h3 className="text-stone-800 font-display font-bold text-sm tracking-tight border-b border-stone-150 pb-2 flex items-center gap-1.5 justify-start text-left">
              <ClipboardList className="w-4 h-4 text-purple-500" />
              Task & Chore Board Editor
            </h3>

            {/* Chore submission form */}
            <form onSubmit={handleCreateChore} className="bg-stone-50 p-4 border border-stone-200 rounded-3xl space-y-4 shadow-xs text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Chore / Task Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Make beds nicely"
                    value={newChoreTitle}
                    onChange={(e) => setNewChoreTitle(e.target.value)}
                    className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Task Difficulty</label>
                  <select
                    value={newChoreDiff}
                    onChange={(e) => setNewChoreDiff(e.target.value as any)}
                    className="bg-white border border-stone-250 text-xs text-stone-700 w-full rounded-xl px-2.5 py-2 focus:border-purple-300 outline-none shadow-xs"
                  >
                    <option value="easy">🟩 Simple Routine</option>
                    <option value="medium">🟨 Medium Chores</option>
                    <option value="hard">🟧 Thorough Clean</option>
                    <option value="boss">🟥 Big Weekly Goal</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Task Description / Guidelines</label>
                <input
                  type="text"
                  placeholder="Explain what needs to be done to earn rewards..."
                  value={newChoreDesc}
                  onChange={(e) => setNewChoreDesc(e.target.value)}
                  className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Stars Reward</label>
                  <input
                    type="number"
                    value={newChorePoints}
                    onChange={(e) => setNewChorePoints(Number(e.target.value))}
                    className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2 py-1.5 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">XP Points</label>
                  <input
                    type="number"
                    value={newChoreXP}
                    onChange={(e) => setNewChoreXP(Number(e.target.value))}
                    className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2 py-1.5 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Frequency</label>
                  <select
                    value={newChoreFreq}
                    onChange={(e) => setNewChoreFreq(e.target.value as any)}
                    className="bg-white border border-stone-250 text-xs text-stone-700 w-full rounded-xl px-1.5 py-2 focus:border-purple-300 outline-none shadow-xs"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-750 text-white font-display font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Add Chore to Board
              </button>
            </form>

            {/* List of current chores */}
            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {familyData.quests.map((quest) => (
                <div key={quest.id} className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-wider text-purple-600 font-display font-bold">Reward: {quest.points} Stars</span>
                    <p className="font-display font-bold text-stone-800 mt-0.5">{quest.title}</p>
                  </div>
                  <button
                    id={`btn-del-chore-${quest.id}`}
                    onClick={() => handleDeleteChore(quest.id)}
                    className="p-1.5 text-red-500 hover:bg-stone-55 hover:text-red-700 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Reward builder */}
          <div className="space-y-4">
            <h3 className="text-stone-800 font-display font-bold text-sm tracking-tight border-b border-stone-150 pb-2 flex items-center gap-1.5 justify-start text-left">
              <Award className="w-4 h-4 text-purple-500" />
              Reward Store Treat Editor
            </h3>

            <form onSubmit={handleCreatePrize} className="bg-stone-50 p-4 border border-stone-200 rounded-3xl space-y-4 shadow-xs text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Prize Title</label>
                  <input
                    type="text"
                    placeholder="e.g. Candy or 30 Mins Screen Playtime..."
                    value={newPrizeTitle}
                    onChange={(e) => setNewPrizeTitle(e.target.value)}
                    className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Prize Cost in Stars</label>
                  <input
                    type="number"
                    value={newPrizeCost}
                    onChange={(e) => setNewPrizeCost(Number(e.target.value))}
                    className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Short Description</label>
                  <input
                    type="text"
                    placeholder="Describe how kids redeem this treat..."
                    value={newPrizeDesc}
                    onChange={(e) => setNewPrizeDesc(e.target.value)}
                    className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Pick Icon Vibe</label>
                  <select
                    value={newPrizeIcon}
                    onChange={(e) => setNewPrizeIcon(e.target.value)}
                    className="bg-white border border-stone-250 text-xs text-stone-700 w-full rounded-xl px-2.5 py-2 focus:border-purple-300 outline-none shadow-xs"
                  >
                    <option value="Compass">🧭 Outdoor Trip</option>
                    <option value="IceCream">🍦 Ice Cream Treat</option>
                    <option value="Film">🍿 Movie Night</option>
                    <option value="Moon">🌙 Later Bedtime</option>
                    <option value="Dices">🎲 Board Game</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-750 text-white font-display font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Add Reward Option
              </button>
            </form>

            <div className="space-y-2 overflow-y-auto max-h-[220px] pr-1">
              {familyData.rewards.map((rew) => (
                <div key={rew.id} className="p-3 bg-white border border-stone-200 rounded-2xl flex items-center justify-between text-xs shadow-xs">
                  <div className="text-left">
                    <span className="text-[9px] uppercase tracking-wider text-purple-600 font-display font-bold">Cost: {rew.cost} Stars</span>
                    <p className="font-display font-bold text-stone-800 mt-0.5">{rew.title}</p>
                  </div>
                  <button
                    id={`btn-del-reward-${rew.id}`}
                    onClick={() => handleDeletePrize(rew.id)}
                    className="p-1.5 text-red-500 hover:bg-stone-55 hover:text-red-700 rounded-xl transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* RENDER VAULT CRYPTO / ICLOUD BACKUPS TAB */}
      {activeSubTab === 'crypto' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="crypto-sub-panel">
          {/* Left Column Security settings */}
          <div className="lg:col-span-5 space-y-6">
            {/* PIN changer */}
            <div className="bg-stone-50 p-4 rounded-3xl border border-stone-200 shadow-xs text-left">
              <h4 className="text-stone-800 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-150 pb-1.5 mb-3">
                <Settings className="w-3.5 h-3.5 text-purple-500" />
                Change Parental PIN
              </h4>
              <div className="flex gap-2">
                <input
                  type="password"
                  placeholder="Enter 4 numerical digits..."
                  maxLength={4}
                  value={newParentPin}
                  onChange={(e) => setNewParentPin(e.target.value)}
                  className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-1.5 text-xs text-stone-700 flex-1 focus:outline-none font-mono shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleUpdatePin}
                  className="bg-purple-600 hover:bg-purple-700 text-white font-display font-medium text-xs px-3.5 rounded-xl transition cursor-pointer shadow-xs"
                >
                  Save PIN
                </button>
              </div>
            </div>

            {/* iCloud backup status banner */}
            <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 text-left shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <span className="bg-emerald-50 text-emerald-700 font-display font-semibold text-[9px] px-2.5 py-0.5 rounded-full border border-emerald-250">
                    🟢 ICLOUD CONTAINER ACTIVE
                  </span>
                  <h4 className="text-stone-800 font-display font-bold text-sm mt-2 flex items-center gap-2">
                    <CloudCheckIcon className="w-4 h-4 text-emerald-500" />
                    Apple iCloud Secure CloudKit Backup
                  </h4>
                  <p className="text-stone-500 text-xs mt-1 leading-normal pr-4">
                    All profiles, custom star store rewards, chores, and family announcements are backed up in secure containers. Works on iPad, iPhone, and Mac in real time.
                  </p>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-3 text-xs font-mono border border-stone-200 mt-4 text-stone-600">
                <p>☁️ Sync Status: Excellent</p>
                <p className="mt-1">Last Backup: {familyData.lastBackup ? familyData.lastBackup.replace("T", " ").substring(0, 19) : "Pending manual backup"}</p>
                <p className="mt-1 text-stone-400 text-[10px]">Container-ID: iCloud.com.familytask.store</p>
              </div>

              <button
                type="button"
                onClick={triggerICloudBackup}
                disabled={backupPulse}
                className="w-full mt-4 flex items-center justify-center gap-1.5 py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed text-white font-display font-medium text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${backupPulse ? "animate-spin" : ""}`} />
                <span>{backupPulse ? "Uploading Secure State Archive..." : "Trigger iCloud Backup Now"}</span>
              </button>
            </div>
          </div>

          {/* Right Column Cryptographic status */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-stone-50 border border-stone-200 p-5 rounded-3xl text-left shadow-xs">
              <h4 className="text-stone-800 font-display font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-stone-150 pb-2 mb-3">
                <Key className="w-4 h-4 text-purple-500" />
                Data Security Encryption Status (AES & SHA-256)
              </h4>
              <p className="text-stone-500 text-xs leading-normal">
                To keep details secure on sharing portals, local databases are saved with parent signature validation keys before syncing across multiple home appliances:
              </p>

              <div className="mt-4 space-y-3">
                <div className="flex justify-between items-center bg-white border border-stone-200 px-3 py-2 rounded-xl text-[10px] font-semibold text-stone-600">
                  <span>Cryptographic Key ID:</span>
                  <span className="text-purple-600 font-mono">STABLE_COZY_SECURE_{familyData.familyCode.replace("-","")}_KEY</span>
                </div>

                <div className="flex justify-between items-center bg-white border border-stone-200 px-3 py-2 rounded-xl text-[10px] font-semibold text-stone-600">
                  <span>SHA-256 Validation Hash:</span>
                  <span className="text-emerald-600 font-mono truncate max-w-[280px]" title={generateHashSignature(familyData)}>
                    {generateHashSignature(familyData)}
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-semibold text-stone-500 uppercase">Secure Wire Payload:</span>
                    <button
                      type="button"
                      onClick={() => setShowEncryptedText(!showEncryptedText)}
                      className="text-[10px] text-purple-600 hover:text-purple-750 font-display font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3 h-3" />
                      <span>{showEncryptedText ? "Show Plaintext Family JSON" : "Show Encrypted Bytes"}</span>
                    </button>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-2xl p-3 text-[10px] font-mono max-h-[140px] overflow-y-auto w-full text-stone-600 break-all leading-normal shadow-inner">
                    {showEncryptedText ? (
                      encryptData(familyData, "ROT_KEY_777_STABLE")
                    ) : (
                      JSON.stringify(familyData, null, 2)
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Cloud check visual asset svg
const CloudCheckIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 2a5 5 0 0 0-4.9 4c-.1 0-.2 0-.3 0A6 6 0 0 0 1 12a6 6 0 0 0 6 6h9a5 5 0 0 0 5-5c0-2.6-2-4.8-4.7-5-.1-2.2-2-4-4.3-4Z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
};
