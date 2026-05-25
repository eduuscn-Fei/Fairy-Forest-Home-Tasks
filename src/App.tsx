import { useState, useEffect, useRef } from "react";
import { FamilyState, Quest, Reward, ChildProfile, CalendarEvent, GroceryItem, SkylightNote, AppNotification, RewardClaim, QuestDifficulty } from "./types";
import { AVATAR_LIST } from "./avatarData";
import { encryptData, generateHashSignature } from "./encryptionUtils";
import { speakText, playSyntheticBeep } from "./voiceUtils";

// Import custom sub-components
import { ChildSelector } from "./components/ChildSelector";
import { QuestMap } from "./components/QuestMap";
import { TreasureVault } from "./components/TreasureVault";
import { SkylightBoard } from "./components/SkylightBoard";
import { ParentConsole } from "./components/ParentConsole";

// Icons imports
import {
  ShieldAlert,
  WandSparkles,
  Zap,
  Flame,
  Sparkles,
  Crown,
  Gamepad,
  IceCream,
  Film,
  Moon,
  Dices,
  Calendar as CalendarIcon,
  ShoppingCart,
  StickyNote,
  Plus,
  Trash2,
  Check,
  User,
  Clock,
  Shield,
  Gift,
  AlertCircle,
  LayoutGrid,
  Settings,
  Bell,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Sun,
  Award,
  RefreshCw,
  Copy,
  ChevronRight,
  Tablet,
  X,
  HelpCircle
} from "lucide-react";

export default function App() {
  // Family Code representation for real-time synchronization
  const [familyCode, setFamilyCode] = useState(() => {
    return localStorage.getItem("familyCode") || "COZY-HOME-42";
  });
  const [tempCode, setTempCode] = useState(familyCode);
  const [isEditingCode, setIsEditingCode] = useState(false);

  // Core application state
  const [state, setState] = useState<FamilyState | null>(null);
  const [activeChildId, setActiveChildId] = useState<string>("c1");
  const [activeTab, setActiveTab] = useState<'quests' | 'shop' | 'skylight' | 'parent' | 'companion'>('quests');
  
  // App options - cozy pastel apps look best in Light Mode by default!
  const [darkMode, setDarkMode] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [voiceSpeechEnabled, setVoiceSpeechEnabled] = useState(true);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);
  const [showAvatarsShopModal, setShowAvatarsShopModal] = useState(false);
  const [showSyncInfoBar, setShowSyncInfoBar] = useState(true);

  // Simulated Twin Device Split view for showing sync in real-time on single screen!
  const [enableTwinPreview, setEnableTwinPreview] = useState(false);
  const [twinActiveChildId, setTwinActiveChildId] = useState<string>("c2");
  const [twinActiveTab, setTwinActiveTab] = useState<'quests' | 'shop' | 'skylight'>('quests');

  // Voice command status states
  const [microphoneListening, setMicrophoneListening] = useState(false);
  const [voiceHeardLog, setVoiceHeardLog] = useState("");
  const [voiceAssistantReply, setVoiceAssistantReply] = useState("Hello there! Click above or press the mic to give voice commands for your tasks!");

  const recognitionRef = useRef<any>(null);

  // Sync state with server on mount / code change
  const fetchFamilyState = async (codeToFetch = familyCode) => {
    try {
      const res = await fetch(`/api/family/${codeToFetch}`);
      if (res.ok) {
        const data = (await res.json()) as FamilyState;
        setState(data);
        
        // Ensure child selections are valid
        if (data.children && data.children.length > 0) {
          const hasChild = data.children.some(c => c.id === activeChildId);
          if (!hasChild) {
            setActiveChildId(data.children[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Local full-stack sync failed, continuing offline.", err);
    }
  };

  // Push updated state to server and save
  const pushFamilyState = async (nextState: FamilyState) => {
    setState(nextState); // client optimization
    try {
      await fetch(`/api/family/${familyCode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nextState)
      });
    } catch (err) {
      console.error("Failed to push synced model state. Stored locally.", err);
    }
  };

  // Setup Event Streams & polling fallback for real-time synchronization
  useEffect(() => {
    fetchFamilyState(familyCode);
    localStorage.setItem("familyCode", familyCode);

    // Integrate live Server Sent Events for instantaneous syncing
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource(`/api/sync-stream/${familyCode}`);
      eventSource.onmessage = (event) => {
        try {
          const parsed = JSON.parse(event.data);
          if (parsed.updated) {
            fetchFamilyState(familyCode);
          }
        } catch (err) {
          // parse skip
        }
      };
    } catch (err) {
      console.warn("SSE connection error, relying on automatic backing interval.");
    }

    // Set polling backup interval for maximum reliability (every 3 seconds)
    const poller = setInterval(() => {
      fetchFamilyState(familyCode);
    }, 3000);

    return () => {
      if (eventSource) eventSource.close();
      clearInterval(poller);
    };
  }, [familyCode]);

  // Handle active child change
  const handleSelectChild = (id: string) => {
    setActiveChildId(id);
    playSyntheticBeep("click");
    
    if (state) {
      const child = state.children.find(c => c.id === id);
      if (child) {
        speakText(`${child.name.split(" ")[0]} selected! Ready for forest adventures!`, voiceSpeechEnabled);
      }
    }
  };

  // Quest submission callback
  const handleSubmitQuestForApproval = (questId: string) => {
    if (!state) return;
    playSyntheticBeep("success");

    const updatedQuests = state.quests.map((quest) => {
      if (quest.id === questId) {
        return {
          ...quest,
          status: "pending_approval" as const,
          lastCompletedBy: activeChildId,
          lastCompletedAt: new Date().toISOString()
        };
      }
      return quest;
    });

    const activeChild = state.children.find(c => c.id === activeChildId);
    const questItem = state.quests.find(q => q.id === questId);

    const newNotif: AppNotification = {
      id: "notif_" + Date.now(),
      title: "Chore Done Pending Approval!",
      message: `${activeChild?.name.split(" ")[0] || "Helper"} finished: '${questItem?.title || "Chore"}'! Waiting on parents PIN confirmation.`,
      type: "quest",
      timestamp: new Date().toISOString()
    };

    const nextState: FamilyState = {
      ...state,
      quests: updatedQuests,
      notifications: [newNotif, ...state.notifications]
    };

    pushFamilyState(nextState);
    speakText("Great job completing your chore! Sent to mom and dad for review.", voiceSpeechEnabled);
  };

  // Add a new chore/task directly from the board
  const handleAddTask = (title: string, description: string, points: number, xp: number, difficulty: QuestDifficulty, frequency: 'daily' | 'weekly' | 'one-time') => {
    if (!state) return;
    playSyntheticBeep("success");

    const newQuest: Quest = {
      id: "q_board_" + Date.now(),
      title,
      description,
      points,
      xp,
      difficulty,
      frequency,
      assignedTo: 'all',
      status: 'available'
    };

    const nextState: FamilyState = {
      ...state,
      quests: [...state.quests, newQuest],
      notifications: [
        {
          id: "notif_q_b_" + Date.now(),
          title: "New Chore Added!",
          message: `The Chore: '${title}' was added directly to our boards!`,
          type: "quest",
          timestamp: new Date().toISOString()
        },
        ...state.notifications
      ]
    };

    pushFamilyState(nextState);
    speakText(`New task added: ${title}`, voiceSpeechEnabled);
  };

  // Rename an existing chore/task
  const handleRenameQuest = (questId: string, newTitle: string) => {
    if (!state) return;
    playSyntheticBeep("click");

    const updatedQuests = state.quests.map((q) => {
      if (q.id === questId) {
        return { ...q, title: newTitle };
      }
      return q;
    });

    pushFamilyState({
      ...state,
      quests: updatedQuests
    });
    speakText("Chore renamed successfully.", voiceSpeechEnabled);
  };

  // Rename a child profile
  const handleRenameChild = (childId: string, newName: string) => {
    if (!state) return;
    playSyntheticBeep("click");

    const updatedChildren = state.children.map((c) => {
      if (c.id === childId) {
        return { ...c, name: newName };
      }
      return c;
    });

    pushFamilyState({
      ...state,
      children: updatedChildren
    });
    speakText(`Member renamed to ${newName}.`, voiceSpeechEnabled);
  };

  // Claim Reward logic
  const handleClaimReward = (rewardId: string) => {
    if (!state) return;

    const reward = state.rewards.find(r => r.id === rewardId);
    const child = state.children.find(c => c.id === activeChildId);

    if (!reward || !child) return;
    if (child.points < reward.cost) {
      playSyntheticBeep("click");
      alert("Not enough Stars! Complete some chores to earn more.");
      return;
    }

    playSyntheticBeep("coin");

    // Deduct coins
    const updatedChildren = state.children.map((c) => {
      if (c.id === activeChildId) {
        return { ...c, points: c.points - reward.cost };
      }
      return c;
    });

    // Add claim ticket
    const newClaimTicket: RewardClaim = {
      id: "claim_" + Date.now(),
      rewardId: rewardId,
      childId: activeChildId,
      status: "pending",
      claimedAt: new Date().toISOString()
    };

    const newNotif: AppNotification = {
      id: "notif_" + Date.now(),
      title: "Reward Claimed!",
      message: `${child.name.split(" ")[0]} claimed reward '${reward.title}' for ${reward.cost} Stars.`,
      type: "reward",
      timestamp: new Date().toISOString()
    };

    const nextState: FamilyState = {
      ...state,
      children: updatedChildren,
      claims: [newClaimTicket, ...state.claims],
      notifications: [newNotif, ...state.notifications]
    };

    pushFamilyState(nextState);
    speakText(`Great job! Claimed ${reward.title} for ${reward.cost} Stars! Waiting for parent approval.`, voiceSpeechEnabled);
  };

  // Parental triggers approval of Chores
  const handleApproveQuest = (questId: string, childId: string) => {
    if (!state) return;

    const quest = state.quests.find(q => q.id === questId);
    const child = state.children.find(c => c.id === childId);
    if (!quest || !child) return;

    playSyntheticBeep("levelUp");

    // Award XP and coins
    let nextXP = child.xp + quest.xp;
    let nextLevel = child.level;
    let leveledUp = false;
    let earnedBadges = [...child.badges];

    if (nextXP >= child.xpNeeded) {
      nextXP = nextXP - child.xpNeeded;
      nextLevel += 1;
      leveledUp = true;
      
      // Trigger avatar unlock notifications / awards
      const unlockedAvatar = AVATAR_LIST.find(av => av.unlockLevel === nextLevel);
      if (unlockedAvatar) {
        earnedBadges.push({
          id: "badge_av_" + Date.now(),
          name: `${unlockedAvatar.name} Recruits`,
          icon: unlockedAvatar.icon,
          description: `Unlocked the epic ${unlockedAvatar.name} avatar class at Level ${nextLevel}!`,
          unlockedAt: new Date().toISOString().split("T")[0]
        });
      }
    }

    const updatedChildren = state.children.map((c) => {
      if (c.id === childId) {
        return {
          ...c,
          level: nextLevel,
          xp: nextXP,
          points: c.points + quest.points,
          badges: earnedBadges
        };
      }
      return c;
    });

    // Reset quest status
    const updatedQuests = state.quests.map((q) => {
      if (q.id === questId) {
        return { ...q, status: "available" as const }; // Recycle chore item for next time
      }
      return q;
    });

    const newNotif: AppNotification = {
      id: "notif_" + Date.now(),
      title: leveledUp ? "✨ LEVEL UP!" : "Chore Approved! ⭐",
      message: leveledUp
        ? `Amazing! ${child.name.split(" ")[0]} has reached Level ${nextLevel}! Unlocked cozy companion badges.`
        : `Stars rewarded! ${child.name.split(" ")[0]} earned +${quest.points} stars for finishing '${quest.title}'.`,
      type: "achievement",
      timestamp: new Date().toISOString()
    };

    const nextState: FamilyState = {
      ...state,
      children: updatedChildren,
      quests: updatedQuests,
      notifications: [newNotif, ...state.notifications]
    };

    pushFamilyState(nextState);
    
    if (leveledUp) {
      speakText(`Awesome! ${child.name.split(" ")[0]} reached Level ${nextLevel}! Tremendous helper!`, voiceSpeechEnabled);
    } else {
      speakText(`Chore approved! Added ${quest.points} stars and ${quest.xp} experience to ${child.name.split(" ")[0]}.`, voiceSpeechEnabled);
    }
  };

  // Parent confirms given Reward
  const handleApproveClaim = (claimId: string) => {
    if (!state) return;

    playSyntheticBeep("success");

    const nextClaims = state.claims.map((claim) => {
      if (claim.id === claimId) {
        return { ...claim, status: "approved" as const };
      }
      return claim;
    });

    const claimObj = state.claims.find(c => c.id === claimId);
    const child = state.children.find(c => c.id === claimObj?.childId);
    const reward = state.rewards.find(r => r.id === claimObj?.rewardId);

    const newNotif: AppNotification = {
      id: "notif_" + Date.now(),
      title: "Treasure Handed Over!",
      message: `Parent confirmed handover of '${reward?.title || "Treasure"}' to ${child?.name.split(" ")[0]}.`,
      type: "achievement",
      timestamp: new Date().toISOString()
    };

    pushFamilyState({
      ...state,
      claims: nextClaims,
      notifications: [newNotif, ...state.notifications]
    });

    speakText(`Wonderful! Handover of ${reward?.title || "prize"} to ${child?.name.split(" ")[0]} verified.`, voiceSpeechEnabled);
  };

  // Smart Board insertions / edits
  const handleAddCalendarEvent = (newEvent: Omit<CalendarEvent, "id">) => {
    if (!state) return;
    playSyntheticBeep("click");

    const eventObj: CalendarEvent = {
      id: "event_" + Date.now(),
      ...newEvent
    };

    const nextState = {
      ...state,
      calendar: [eventObj, ...state.calendar],
      notifications: [
        {
          id: "notif_ev_" + Date.now(),
          title: "New Calendar QuestScheduled!",
          message: `Added: '${newEvent.title}' scheduled on ${newEvent.date} at ${newEvent.time}.`,
          type: "calendar" as const,
          timestamp: new Date().toISOString()
        },
        ...state.notifications
      ]
    };

    pushFamilyState(nextState);
    speakText(`Event scheduled on ${newEvent.date} at ${newEvent.time}!`, voiceSpeechEnabled);
  };

  const handleAddGrocery = (newGrocery: Omit<GroceryItem, "id" | "completed">) => {
    if (!state) return;
    playSyntheticBeep("click");

    const groceryObj: GroceryItem = {
      id: "grocery_" + Date.now(),
      name: newGrocery.name,
      qty: newGrocery.qty,
      completed: false
    };

    pushFamilyState({
      ...state,
      groceryList: [groceryObj, ...state.groceryList]
    });
  };

  const handleToggleGrocery = (id: string) => {
    if (!state) return;
    playSyntheticBeep("success");

    const nextList = state.groceryList.map((g) => {
      if (g.id === id) {
        return { ...g, completed: !g.completed };
      }
      return g;
    });

    pushFamilyState({
      ...state,
      groceryList: nextList
    });
  };

  const handleClearGroceryCompleted = () => {
    if (!state) return;
    playSyntheticBeep("click");
    pushFamilyState({
      ...state,
      groceryList: state.groceryList.filter(g => !g.completed)
    });
  };

  const handleAddNote = (newNote: Omit<SkylightNote, "id" | "date">) => {
    if (!state) return;
    playSyntheticBeep("click");

    const noteObj: SkylightNote = {
      id: "note_" + Date.now(),
      text: newNote.text,
      author: newNote.author,
      color: newNote.color,
      date: new Date().toISOString().split("T")[0]
    };

    pushFamilyState({
      ...state,
      notes: [noteObj, ...state.notes]
    });
  };

  const handleDeleteNote = (id: string) => {
    if (!state) return;
    playSyntheticBeep("click");

    pushFamilyState({
      ...state,
      notes: state.notes.filter(n => n.id !== id)
    });
  };

  // Switch or Join Family codes
  const handleJoinFamilyCode = () => {
    if (!tempCode) return;
    setFamilyCode(tempCode.toUpperCase().trim());
    setIsEditingCode(false);
    playSyntheticBeep("success");
    alert(`Joined Family group under Sync-Code: ${tempCode.trim().toUpperCase()}`);
  };

  // Toggle Accessibility Mode
  const toggleLargeText = () => {
    setLargeText(!largeText);
    playSyntheticBeep("click");
    speakText(largeText ? "Text size set to standard" : "Accessibility enlarged typography print is activated", voiceSpeechEnabled);
  };

  const toggleVoiceSpeech = () => {
    const nextVal = !voiceSpeechEnabled;
    setVoiceSpeechEnabled(nextVal);
    playSyntheticBeep("click");
    if (nextVal) {
      speakText("Voice helper is turned on. Welcome!", true);
    }
  };

  // INTEGRATED VOICE COMMAND CENTRE
  const handleTriggerVoiceSpeechCommand = (commandText: string) => {
    setVoiceHeardLog(commandText);
    const cmd = commandText.toLowerCase().trim();

    if (!state) return;
    const childObj = state.children.find(c => c.id === activeChildId) || state.children[0];

    // Parser actions
    if (cmd.includes("quests") || cmd.includes("task") || cmd.includes("chore")) {
      setActiveTab("quests");
      setVoiceAssistantReply("Sure thing! Showing your chores and tasks board.");
      speakText("Showing your chores board.", voiceSpeechEnabled);
    } 
    else if (cmd.includes("shop") || cmd.includes("reward") || cmd.includes("treasure") || cmd.includes("vault")) {
      setActiveTab("shop");
      setVoiceAssistantReply("Opening the family rewards store.");
      speakText("Opening the family store.", voiceSpeechEnabled);
    } 
    else if (cmd.includes("skylight") || cmd.includes("smartboard") || cmd.includes("bulletin") || cmd.includes("grocery") || cmd.includes("calendar")) {
      setActiveTab("skylight");
      setVoiceAssistantReply("Opening the family schedule, announcements, and shopping list.");
      speakText("Opening the family dashboard.", voiceSpeechEnabled);
    } 
    else if (cmd.includes("parent") || cmd.includes("setting") || cmd.includes("control")) {
      setActiveTab("parent");
      setVoiceAssistantReply("Opening parental controls. Passcode PIN is required.");
      speakText("Opening parental controls.", voiceSpeechEnabled);
    }
    else if (cmd.includes("dark mode") || cmd.includes("night mode") || cmd.includes("reduce strain")) {
      setDarkMode(true);
      setVoiceAssistantReply("Switched to dark mode.");
      speakText("Switched to dark mode.", voiceSpeechEnabled);
    }
    else if (cmd.includes("light mode") || cmd.includes("bright mode")) {
      setDarkMode(false);
      setVoiceAssistantReply("Switched to bright light mode.");
      speakText("Switched to light mode.", voiceSpeechEnabled);
    }
    else if (cmd.includes("large text") || cmd.includes("big words") || cmd.includes("enlarge")) {
      setLargeText(true);
      setVoiceAssistantReply("Made the text size larger.");
      speakText("Enlarged text.", voiceSpeechEnabled);
    }
    else if (cmd.includes("make bed") || cmd.includes("make-bed") || cmd.includes("clean bed")) {
      // Find the first matching available quest and submit
      const bedQuest = state.quests.find(q => q.title.toLowerCase().includes("bed") || q.id === "q1");
      if (bedQuest && bedQuest.status === "available") {
        handleSubmitQuestForApproval(bedQuest.id);
        setVoiceAssistantReply("Great job making your bed! I have submitted this to mom and dad for star rewards.");
      } else {
        setVoiceAssistantReply("The bed-making task is already finished or waiting review.");
        speakText("The task is already submitted.", voiceSpeechEnabled);
      }
    }
    else {
      // Casual playful responses
      const dynamicPhrases = [
        `You're doing fantastic today, ${childObj?.name.split(" ")[0]}! Complete your chores to earn stars!`,
        `Did you vacuum your room floor yet? There's +45 Stars waiting for you!`,
        `Remember to put away your toys and drink plenty of fresh water!`,
        `Need help? Just say 'open store' or 'show tasks' and I will help you find the right page.`
      ];
      const randomIdx = Math.floor(Math.random() * dynamicPhrases.length);
      setVoiceAssistantReply(dynamicPhrases[randomIdx]);
      speakText(dynamicPhrases[randomIdx], voiceSpeechEnabled);
    }
  };

  // Browser standard Speech Recognition hook if permission allowed
  const startStandardSpeechRecognition = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      alert("Traditional microphone dictation speech recognition is not supported in this frame. Use the interactive fast-assistant keys instead!");
      return;
    }

    try {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }

      const rec = new SpeechRecognitionAPI();
      rec.continuous = false;
      rec.interimResults = false;
      rec.lang = "en-US";

      rec.onstart = () => {
        setMicrophoneListening(true);
        playSyntheticBeep("success");
      };

      rec.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleTriggerVoiceSpeechCommand(transcript);
      };

      rec.onerror = () => {
        setMicrophoneListening(false);
      };

      rec.onend = () => {
        setMicrophoneListening(false);
      };

      recognitionRef.current = rec;
      rec.start();
    } catch (err) {
      console.warn("Speech initiation blocked:", err);
      setMicrophoneListening(false);
    }
  };

  // Loading Screen
  if (!state) {
    return (
      <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center text-stone-800" id="splash-screen">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-400 flex items-center justify-center animate-spin">
            <RefreshCw className="w-8 h-8 text-purple-600" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center text-lg">🧚</div>
        </div>
        <h2 className="font-display font-semibold text-xl tracking-tight animate-pulse text-stone-700">Loading Family Chore Boards...</h2>
        <p className="text-stone-400 text-xs mt-2">Checking real-time sync & databases</p>
      </div>
    );
  }

  // Active child configurations helper
  const activeChildObj = state.children.find(c => c.id === activeChildId) || state.children[0];

  // Global base typography sizes depending on Accessibility Mode
  const textSizeClass = largeText ? "font-sans text-lg" : "font-sans text-sm";
  const headingSizeClass = largeText ? "font-display font-black text-2xl md:text-3xl" : "font-display font-black text-xl md:text-2xl";

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${
      darkMode ? "bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"
    }`} id="application-body-hub">

      {/* TOP NOTIFICATIONS ALERT OVERLAY BANNER */}
      {showSyncInfoBar && (
        <div className="bg-gradient-to-r from-indigo-900/90 via-purple-900/90 to-indigo-950 text-white text-xs px-4 py-3 border-b border-indigo-500/20 shadow-lg flex items-center justify-between" id="sync-info-stripe">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span className="font-bold">Real-time Multi-Device Sync Active:</span>
            <span className="text-slate-300 font-mono">Any changes instantly refresh on multiple iPads, laptops, or iPhones in execution.</span>
            <span className="bg-slate-950/60 font-black px-2.5 py-1 rounded inline-flex items-center gap-1.5 text-[11px] font-mono border border-slate-800">
              Sync Code: {familyCode}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(familyCode);
                  playSyntheticBeep("success");
                  alert("Sync code copied to clipboard! Share with your iPad or other tabs.");
                }}
                className="hover:text-indigo-300 p-0.5 cursor-pointer"
                title="Copy Family Code"
              >
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
              </button>
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Spawn secondary simulator */}
            <button
              onClick={() => {
                setEnableTwinPreview(!enableTwinPreview);
                playSyntheticBeep("click");
              }}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[11px] px-3 py-1.5 rounded-lg border border-indigo-400/30 flex items-center gap-1 cursor-pointer transition"
              title="Spawn simulated twin device to test immediate real-time sync!"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>{enableTwinPreview ? "Hide Sync iPad" : "Spawn Sync iPad"}</span>
            </button>

            <button
              onClick={() => setShowSyncInfoBar(false)}
              className="text-slate-400 hover:text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* CORE DISPLAY STAGE SPLIT WRAPPER FOR MULTI-DEVICE SIMULATOR TESTING */}
      <div className={`grid grid-cols-1 ${enableTwinPreview ? 'lg:grid-cols-12' : ''} gap-6 ${enableTwinPreview ? 'p-2' : 'p-0'}`}>
        
        {/* LEFTHAND/PRIMARY FIELD - 70% if split preview */}
        <div className={`${enableTwinPreview ? 'lg:col-span-8' : 'max-w-7xl mx-auto w-full'} p-4 md:p-6 space-y-6 flex-1`}>
          
          {/* PRIMARY GRAPHICAL HEADER & LOGISTICS BAR */}
          <header className={`flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b ${
            darkMode ? 'border-slate-800/80' : 'border-slate-300'
          } gap-4`} id="primary-hud-bar">
            
            {/* Brand Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-pink-500 flex items-center justify-center shadow-lg border border-purple-400/20">
                <span className="text-xl select-none" id="logo-fairy">🧚</span>
              </div>
              <div>
                <h1 className="font-display font-bold text-lg md:text-xl text-purple-700 tracking-tight">
                  Fairy Forest Home
                </h1>
                <p className="text-[10px] text-stone-500 font-display uppercase tracking-wider font-semibold">
                  Family Chore Board
                </p>
              </div>
            </div>

            {/* Quick settings and Code controllers */}
            <div className="flex flex-wrap items-center gap-2 md:gap-3" id="quick-settings-rack">
              {/* Family Code selection switch */}
              {isEditingCode ? (
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-lg">
                  <input
                    type="text"
                    value={tempCode}
                    onChange={(e) => setTempCode(e.target.value)}
                    className="bg-slate-950 border-0 focus:outline-none text-xs text-white font-bold p-1 rounded w-28 font-mono uppercase"
                    placeholder="Enter Code"
                  />
                  <button
                    onClick={handleJoinFamilyCode}
                    className="bg-indigo-600 text-white font-bold text-[10px] px-2 py-1 rounded cursor-pointer transition hover:bg-indigo-500"
                  >
                    Join
                  </button>
                  <button
                    onClick={() => {
                      setIsEditingCode(false);
                      setTempCode(familyCode);
                    }}
                    className="text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingCode(true)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                    darkMode
                      ? 'bg-slate-900/60 border-slate-800 text-indigo-400 hover:bg-slate-800'
                      : 'bg-white border-slate-300 text-indigo-600 hover:bg-slate-100'
                  }`}
                  title="Change family synchronization group ID"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span className="font-mono">GROUP: {familyCode}</span>
                </button>
              )}

              {/* Theme selectors */}
              <button
                onClick={() => {
                  setDarkMode(!darkMode);
                  playSyntheticBeep("click");
                }}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  darkMode ? 'bg-slate-900/60 border-slate-800 text-amber-400 hover:bg-slate-800' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
                title="Toggle visual lights"
                id="btn-theme-toggle"
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-purple-600" />}
              </button>

              {/* Text Size Scale Toggle */}
              <button
                onClick={toggleLargeText}
                className={`p-2 rounded-lg border text-xs font-bold transition cursor-pointer ${
                  largeText ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
                id="btn-accessibility-text"
                title="Accessibility: Large text modes for younger children"
              >
                <TypographyIcon className="w-4 h-4" />
              </button>

              {/* Speech Sound feedback toggle */}
              <button
                onClick={toggleVoiceSpeech}
                className={`p-2 rounded-lg border transition cursor-pointer ${
                  voiceSpeechEnabled ? 'bg-emerald-600/20 border-emerald-500 text-emerald-400' : 'bg-slate-900/60 border-slate-800 text-slate-500 hover:bg-slate-800'
                }`}
                title="Accessibility: Voice response readouts"
              >
                {voiceSpeechEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>

              {/* Trigger Notification icon */}
              <button
                onClick={() => {
                  setShowNotificationDrawer(!showNotificationDrawer);
                  playSyntheticBeep("click");
                }}
                className="p-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 relative transition cursor-pointer"
                title="Family Event alerts and completion logs"
              >
                <Bell className="w-4 h-4" />
                {state.notifications.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-pink-500 text-white font-extrabold text-[8px] font-mono w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-slate-950 animate-bounce">
                    {state.notifications.slice(0, 5).length}
                  </span>
                )}
              </button>
            </div>
          </header>

          {/* DYNAMIC NOTIFICATIONS PUSH BANNER LIST (Reminders) */}
          {state.notifications.length > 0 && (
            <div className="bg-amber-500/10 border border-amber-500/10 rounded-xl p-3.5 flex items-start gap-3 shadow-inner" id="announcement-banner">
              <div className="p-1 rounded bg-amber-500/15">
                <Bell className="w-4 h-4 text-amber-500 animate-swing" />
              </div>
              <div className="flex-1">
                <p className="text-amber-500 font-extrabold text-xs uppercase tracking-wide font-sans">Latest Family Bulletin Reminder:</p>
                <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-800'} mt-0.5 leading-snug font-medium`}>
                  "{state.notifications[0].message}"
                </p>
                <p className="text-[10px] text-slate-500 font-mono mt-1">Push Alert Logged at: {new Date(state.notifications[0].timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
          )}

          {/* ACTIVE MEMBER PROFILE DISPLAY */}
          <section id="child-profile-panel">
            <ChildSelector
              childrenList={state.children}
              activeChildId={activeChildId}
              onSelectChild={handleSelectChild}
              onUnlockAvatarClick={() => setShowAvatarsShopModal(true)}
              accessibilityOn={largeText}
              onRenameChild={handleRenameChild}
            />
          </section>

          {/* MAIN CENTER PIECE SLATE NAVIGATIONAL TAB SELECTORS */}
          <nav className="flex flex-wrap border-b border-stone-200 gap-1 md:gap-2 pt-2" id="family-view-tabs">
            {[
              { id: 'quests', label: "🌸 Chore Board", style: "border-purple-500 text-purple-600 bg-purple-50/40" },
              { id: 'shop', label: "⭐ Reward Store", style: "border-pink-500 text-pink-600 bg-pink-50/40" },
              { id: 'skylight', label: "🏠 Family Board", style: "border-sky-500 text-sky-600 bg-sky-50/40" },
              { id: 'companion', label: "🐱 Companion", style: "border-emerald-500 text-emerald-600 bg-emerald-50/50" },
              { id: 'parent', label: "🔒 Parent Room", style: "border-stone-500 text-stone-700 bg-stone-100" }
            ].map((tabConfig) => {
              const IsAct = activeTab === tabConfig.id;
              return (
                <button
                  key={tabConfig.id}
                  id={`main-tab-button-${tabConfig.id}`}
                  onClick={() => {
                    setActiveTab(tabConfig.id as any);
                    playSyntheticBeep("click");
                  }}
                  className={`px-4 py-3 border-b-2 font-display font-bold text-xs md:text-sm tracking-tight transition cursor-pointer rounded-t-xl ${
                    IsAct
                      ? tabConfig.style
                      : "border-transparent text-stone-500 hover:text-stone-800 hover:bg-stone-50"
                  }`}
                >
                  {tabConfig.label}
                </button>
              );
            })}
          </nav>

          {/* ACTIVE RENDER SCREEN ROUTING PANELS */}
          <main className="space-y-6" id="primary-rendered-content">
            {activeTab === 'quests' && (
              <QuestMap
                quests={state.quests}
                activeChild={activeChildObj}
                onSubmitForApproval={handleSubmitQuestForApproval}
                accessibilityOn={largeText}
                onRenameQuest={handleRenameQuest}
                onAddTask={handleAddTask}
              />
            )}

            {activeTab === 'shop' && (
              <TreasureVault
                rewards={state.rewards}
                activeChild={activeChildObj}
                claims={state.claims}
                onClaimReward={handleClaimReward}
                accessibilityOn={largeText}
              />
            )}

            {activeTab === 'skylight' && (
              <SkylightBoard
                calendar={state.calendar}
                groceryList={state.groceryList}
                notes={state.notes}
                onAddCalendarEvent={handleAddCalendarEvent}
                onAddGrocery={handleAddGrocery}
                onToggleGrocery={handleToggleGrocery}
                onClearGroceries={handleClearGroceryCompleted}
                onAddNote={handleAddNote}
                onDeleteNote={handleDeleteNote}
                activeUser={activeChildObj ? activeChildObj.name.split(" ")[0] : "Explorer"}
                accessibilityOn={largeText}
              />
            )}

            {activeTab === 'parent' && (
              <ParentConsole
                familyData={state}
                onUpdateState={pushFamilyState}
                onApproveQuest={handleApproveQuest}
                onApproveClaim={handleApproveClaim}
                activeChildId={activeChildId}
                accessibilityOn={largeText}
              />
            )}

            {activeTab === 'companion' && (
              <div className="bg-white border border-stone-200/80 rounded-3xl p-5 md:p-6 shadow-md shadow-stone-100/50" id="companion-chat-pane">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  
                  {/* Companion woodland sprite visual artwork illustration */}
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-5 text-center bg-stone-50 rounded-2xl border border-stone-200 relative overflow-hidden shadow-xs">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-100/50 to-pink-100/50 animate-pulse"></div>
                    <div className="w-24 h-24 bg-gradient-to-tr from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg text-4xl border-4 border-white relative z-10 animate-pulse">
                      🧚
                    </div>
                    <div className="mt-3 relative z-10">
                      <h4 className="font-display font-bold text-stone-800 text-base">Fairy Helper</h4>
                      <p className="text-purple-600 font-display text-[10px] uppercase font-bold tracking-wider">Voice Assistant & Sound Guide</p>
                    </div>
                    
                    {/* Speech active bubble indicators */}
                    <div className={`mt-3 h-6 flex gap-1 items-center justify-center transition-opacity px-2 rounded-xl bg-purple-50 border border-purple-150 ${microphoneListening ? "opacity-100" : "opacity-0"}`} id="audio-rippler">
                      <span className="w-1.5 h-3 bg-purple-500 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.1s]"></span>
                      <span className="w-1.5 h-2.5 bg-purple-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="text-[9px] font-bold text-purple-600 uppercase font-display ml-1">Listening</span>
                    </div>
                  </div>

                  {/* Vocal chat response display box */}
                  <div className="md:col-span-8 space-y-4">
                    <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 text-xs text-left">
                      <p className="text-stone-400 uppercase font-semibold text-[10px] tracking-wider">Voice Command Heard:</p>
                      <p className="text-stone-700 font-display font-medium text-sm min-h-[20px] mt-1 italic">
                        {voiceHeardLog ? `"${voiceHeardLog}"` : "Waiting for voice commands..."}
                      </p>
                    </div>

                    <div className="bg-purple-50 border border-purple-200/60 p-5 rounded-2xl text-xs space-y-2 text-left">
                      <p className="text-purple-600 font-bold uppercase tracking-wider text-[10px]">Fairy Assistant Response:</p>
                      <p className="text-stone-800 text-sm font-medium leading-relaxed italic" id="dragon-text-box">
                        "{voiceAssistantReply}"
                      </p>
                    </div>

                    {/* Speech command action triggers */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button
                        onClick={startStandardSpeechRecognition}
                        className={`px-5 py-3 rounded-xl text-xs font-display font-bold flex items-center justify-center gap-2 transition cursor-pointer ${
                          microphoneListening
                            ? "bg-red-500 text-white animate-pulse"
                            : "bg-purple-600 hover:bg-purple-700 text-white shadow-xs"
                        }`}
                        title="Say 'open quests', 'open shop' or 'I finished making my bed'"
                      >
                        {microphoneListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 fill-current" />}
                        <span>{microphoneListening ? "Stop Listening" : "Speak Voice Command"}</span>
                      </button>

                      {/* Manual Quick speech commands click selection for easy navigation */}
                      <span className="text-stone-400 font-display font-medium text-[10px] w-full mt-2 block border-t border-stone-150 pt-3 text-left">
                        💡 Tap these quick templates to test the Accessibility Voice Assistant:
                      </span>
                      {[
                        { title: "🗺️ Show Chores", text: " quests board" },
                        { title: "💎 Show Rewards Store", text: " treasure shop" },
                        { title: "📺 Show Family Board", text: " open smartboard" },
                        { title: "🛌 Finished Bed Task", text: "tame Bed Dragon" },
                        { title: "🌙 Activate Dark mode shadow-screens", text: "dark mode" },
                        { title: "🔠 Activate Large text size mode", text: "enlarge text" }
                      ].map((preset) => (
                        <button
                          key={preset.text}
                          id={`preset-cmd-${preset.text}`}
                          onClick={() => handleTriggerVoiceSpeechCommand(preset.text)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700/80 text-[11px] text-slate-300 font-sans font-bold rounded border border-slate-700 transition cursor-pointer"
                        >
                          {preset.title}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}
          </main>
        </div>

        {/* RIGHTHAND SIMULATED twin DEV-PREVIEW drawer (splits browser screen if enabled) */}
        {enableTwinPreview && (
          <div className="lg:col-span-4 bg-slate-900 border-l border-indigo-500/20 p-4 space-y-4 rounded-xl shadow-2xl relative" id="twin-tablet-simulator">
            <div className="sticky top-4 space-y-4">
              
              {/* Simulator Indicator Title */}
              <div className="flex justify-between items-center bg-indigo-600/10 border border-indigo-500/25 px-3 py-2.5 rounded-lg text-xs" id="tablet-sim-header">
                <div className="flex items-center gap-1.5 font-bold text-indigo-400">
                  <Tablet className="w-4 h-4 animate-bounce" />
                  <span>SIMULATED iPAD TABLET VIEW</span>
                </div>
                <button
                  onClick={() => setEnableTwinPreview(false)}
                  className="text-slate-400 hover:text-white cursor-pointer"
                  title="Close frame"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Explanatory subtitle */}
              <div className="text-[11px] text-slate-400 leading-normal p-3 bg-slate-950/60 rounded border border-slate-800">
                🚀 <span className="text-emerald-400 font-bold">Try this Test:</span> Complete chores or check provisions in the Main panel (left), and witness this iPad mirror changes <span className="text-white font-extrabold underline decoration-emerald-400">instantly in real-time</span> using our backend SSE synchronization!
              </div>

              {/* Sub-iPad visual boundary window container representing native applet */}
              <div className="border-[6px] border-slate-950 bg-slate-950 rounded-2xl p-3 min-h-[480px] shadow-2xl space-y-4 overflow-y-auto max-h-[80vh] relative">
                
                {/* Visual hardware speaker detail */}
                <div className="w-16 h-1 bg-slate-800 rounded-full mx-auto mb-4"></div>

                <div className="flex justify-between items-center bg-slate-900 px-2 py-1.5 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400">
                  <span>📶 familyquest-wifi</span>
                  <span className="text-indigo-400 animate-pulse font-extrabold flex items-center gap-1">
                    🟢 REAL-TIME SYNCED
                  </span>
                </div>

                <div className="flex justify-between items-center bg-slate-900 p-2.5 rounded-xl text-xs">
                  <div>
                    <h5 className="font-extrabold text-white">iPad Companion</h5>
                    <p className="text-[10px] text-slate-500 font-bold">Group: {familyCode}</p>
                  </div>
                  
                  {/* Quick Profile switcher inside simulator */}
                  <select
                    value={twinActiveChildId}
                    onChange={(e) => setTwinActiveChildId(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-[10px] text-slate-300 rounded px-1.5 py-1 outline-none"
                  >
                    {state.children.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* mini child stats card */}
                {(() => {
                  const twinChild = state.children.find(c => c.id === twinActiveChildId) || state.children[0];
                  if (!twinChild) return null;
                  const avatarC = AVATAR_LIST.find(a => a.id === twinChild.avatar) || AVATAR_LIST[0];
                  return (
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between gap-2.5 text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full bg-gradient-to-tr ${avatarC.color} flex items-center justify-center text-sm shadow`}>
                          🦖
                        </div>
                        <div>
                          <p className="font-bold text-white leading-tight">{twinChild.name.split(" ")[0]}</p>
                          <p className="text-[9px] text-violet-400 font-mono">Level {twinChild.level}</p>
                        </div>
                      </div>

                      <div className="bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded text-[10px] font-mono font-black text-amber-400">
                        🪙 {twinChild.points}g
                      </div>
                    </div>
                  );
                })()}

                {/* Simulated navigation */}
                <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 justify-around text-[10px]" id="sim-tabs">
                  {[
                    { id: 'quests', label: "Quests Board" },
                    { id: 'shop', label: "Shop Vault" },
                    { id: 'skylight', label: "Smart-Board" }
                  ].map((sub) => (
                    <button
                      key={sub.id}
                      onClick={() => setTwinActiveTab(sub.id as any)}
                      className={`px-2 py-1 rounded text-[9px] font-bold cursor-pointer uppercase ${
                        twinActiveTab === sub.id ? "bg-indigo-600 text-white" : "text-slate-400"
                      }`}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>

                {/* Simulated tab interiors */}
                <div className="space-y-2 mt-2">
                  {twinActiveTab === "quests" && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-indigo-400 font-mono tracking-wider font-extrabold uppercase mb-1">Available chores:</p>
                      {state.quests.slice(0, 4).map(quest => (
                        <div key={quest.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-[11px] text-xs">
                          <div>
                            <p className="font-bold text-white leading-tight">{quest.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">Reward: +{quest.points} Stars</p>
                          </div>
                          {quest.status === "available" ? (
                            <button
                              onClick={() => {
                                const twinChild = state.children.find(c => c.id === twinActiveChildId) || state.children[0];
                                playSyntheticBeep("success");
                                const updatedQuests = state.quests.map((q) => {
                                  if (q.id === quest.id) {
                                    return {
                                      ...q,
                                      status: "pending_approval" as const,
                                      lastCompletedBy: twinChild.id,
                                      lastCompletedAt: new Date().toISOString()
                                    };
                                  }
                                  return q;
                                });
                                pushFamilyState({
                                  ...state,
                                  quests: updatedQuests,
                                  notifications: [
                                    {
                                      id: "notif_twin_" + Date.now(),
                                      title: "Twin iPad task completed!",
                                      message: `${twinChild.name.split(" ")[0]} submitted chore '${quest.title}' from the simulated tablet!`,
                                      type: "quest",
                                      timestamp: new Date().toISOString()
                                    },
                                    ...state.notifications
                                  ]
                                });
                              }}
                              className="px-2 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[9px] font-bold rounded cursor-pointer transition"
                            >
                              ⚔️ Complete
                            </button>
                          ) : (
                            <span className="text-[10px] text-amber-500 font-mono animate-pulse">Pending check...</span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {twinActiveTab === "shop" && (
                    <div className="space-y-2">
                      <p className="text-[10px] text-pink-400 font-mono font-bold uppercase tracking-wider">Treasures Catalog:</p>
                      {state.rewards.slice(0, 3).map(reward => (
                        <div key={reward.id} className="p-2 bg-slate-900 border border-slate-800 rounded flex items-center justify-between text-[11px]">
                          <div>
                            <p className="font-semibold text-white truncate max-w-[130px]">{reward.title}</p>
                            <span className="text-[9px] text-amber-400">Cost: 🪙 {reward.cost}g</span>
                          </div>
                          <button
                            onClick={() => {
                              const twinChild = state.children.find(c => c.id === twinActiveChildId) || state.children[0];
                              if (twinChild.points >= reward.cost) {
                                playSyntheticBeep("coin");
                                const updatedCh = state.children.map(c => {
                                  if (c.id === twinChild.id) {
                                    return { ...c, points: c.points - reward.cost };
                                  }
                                  return c;
                                });
                                const newClaim: RewardClaim = {
                                  id: "claim_twin_" + Date.now(),
                                  rewardId: reward.id,
                                  childId: twinChild.id,
                                  status: "pending",
                                  claimedAt: new Date().toISOString()
                                };
                                pushFamilyState({
                                  ...state,
                                  children: updatedCh,
                                  claims: [newClaim, ...state.claims]
                                });
                              } else {
                                alert("Insufficient Coins on iPad!");
                              }
                            }}
                            className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-1 rounded cursor-pointer"
                          >
                            Redeem
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {twinActiveTab === "skylight" && (
                    <div className="space-y-2">
                      {/* Groceries snippet in ipad */}
                      <p className="text-[10px] text-pink-400 font-mono font-bold uppercase tracking-widest">Shared Provisions list:</p>
                      <div className="space-y-1.5 text-[11px] max-h-[200px] overflow-y-auto">
                        {state.groceryList.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleToggleGrocery(item.id)}
                            className={`p-2 w-full text-left rounded border flex justify-between items-center transition cursor-pointer ${
                              item.completed ? "bg-emerald-950/20 border-emerald-500/20 text-slate-500 line-through" : "bg-slate-900 border-slate-800 text-white"
                            }`}
                          >
                            <span>{item.name}</span>
                            <span className="font-mono text-[9px] opacity-70">({item.qty})</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          </div>
        )}

      </div>

      {/* AVATAR CATALOG REWARDS EXPANSION MODAL */}
      {showAvatarsShopModal && (
        <div className="fixed inset-0 bg-stone-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" id="shop-catalog-modal">
          <div className="bg-white border border-stone-200 w-full max-w-2xl rounded-3xl p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3">
              <div>
                <h3 className="font-display font-bold text-stone-850 text-base md:text-lg flex items-center gap-1.5">
                  <Award className="w-5 h-5 text-purple-600" />
                  Fairy Companions
                </h3>
                <p className="text-stone-500 text-xs mt-0.5">Gain helper experience to unlock fairy companions.</p>
              </div>
              <button
                onClick={() => setShowAvatarsShopModal(false)}
                className="text-stone-400 hover:text-stone-700 p-2 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="avatar-catalog-grid">
              {AVATAR_LIST.map((av) => {
                const isUnlocked = activeChildObj.level >= av.unlockLevel;
                const isActive = activeChildObj.avatar === av.id;
                const companionEmoji = av.id === "shield-alert" ? "🧝" : av.id === "wand-sparkles" ? "🧚" : av.id === "zap" ? "✨" : av.id === "flame" ? "🐉" : av.id === "star" ? "💧" : "👑";
                return (
                  <div
                    key={av.id}
                    className={`p-4 rounded-2xl border flex flex-col justify-between text-center relative overflow-hidden transition-all ${
                      isActive
                        ? "bg-purple-100/40 border-purple-300 shadow-sm ring-2 ring-purple-500/10"
                        : isUnlocked
                        ? "bg-stone-50 border-stone-200/80 hover:border-stone-300"
                        : "bg-stone-100/50 border-stone-200/40 opacity-55"
                    }`}
                  >
                    <div>
                      {/* Round icon background */}
                      <div className={`w-14 h-14 rounded-full bg-gradient-to-tr ${av.color} border-2 ${av.border} flex items-center justify-center text-2xl mx-auto mb-3 shadow-inner`}>
                        {companionEmoji}
                      </div>
                      <h4 className="text-stone-800 font-display font-bold text-sm">{av.name}</h4>
                      <p className="text-[10px] text-purple-600 font-display mt-1 font-semibold leading-tight">{av.sub}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-stone-200">
                      {isActive ? (
                        <span className="text-purple-600 font-bold font-sans text-[10px] uppercase block tracking-wider">
                          ✨ ACTIVE COMPANION
                        </span>
                      ) : isUnlocked ? (
                        <button
                          onClick={() => {
                            const updatedChildren = state.children.map(ch => {
                              if (ch.id === activeChildId) {
                                return { ...ch, avatar: av.id };
                              }
                              return ch;
                            });
                            pushFamilyState({ ...state, children: updatedChildren });
                            playSyntheticBeep("success");
                            setShowAvatarsShopModal(false);
                            speakText(`Character avatar updated to ${av.name}!`, voiceSpeechEnabled);
                          }}
                          className="w-full py-1.5 bg-purple-600 hover:bg-purple-700 font-bold text-[10px] text-white rounded transition cursor-pointer"
                        >
                          SELECT COMPANION
                        </button>
                      ) : (
                        <span className="text-red-400 font-bold font-mono text-[10px] uppercase flex items-center justify-center gap-1">
                          🔒 REQUIRES LV. {av.unlockLevel}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* DETAILED ACCESSIBLE TOOLTIP LEGENDS IN FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 py-12 border-t border-stone-200 mt-12 flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-stone-500 text-center md:text-left">
        <div>
          <p className="font-extrabold text-stone-600 uppercase tracking-widest text-[10px]">Fairy Forest Home Adventures 🌲</p>
          <p className="mt-1 font-medium text-stone-500 font-display">
            An enchanted family chore board and smart companion dashboard. Designed to turn daily household helping into a delightful forest path journey.
          </p>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => {
              playSyntheticBeep("coin");
              alert("Fairy Forest Home Help: Children complete tasks on the chore board to earn Star rewards. Parents can enter the default PIN '1234' in the 'Parent Room' to approve tasks, customize rewards, and manage notifications!");
            }}
            className="text-stone-600 hover:text-stone-950 flex items-center gap-1 font-bold cursor-pointer transition-colors"
          >
            <HelpCircle className="w-4 h-4 text-purple-500" />
            <span>Adventures Handbook</span>
          </button>
        </div>
      </footer>

    </div>
  );
}

// Quick custom representation block for accessibility character sizes
const TypographyIcon = ({ className }: { className?: string }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d=" m3 4 5 12h2l5-12" />
      <path d="M5 12h8" />
      <circle cx="18" cy="12" r="3" />
      <path d="M21 9v6" />
    </svg>
  );
};
