import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { FamilyState } from "./src/types";

const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "family_data.json");

// Default initial state generator
function createDefaultFamilyState(code: string): FamilyState {
  return {
    familyCode: code.toUpperCase(),
    parentPin: "1234",
    children: [
      {
        id: "c1",
        name: "Pixie Prince",
        avatar: "shield-alert", // will correspond to map of icons/emojis
        level: 2,
        xp: 60,
        xpNeeded: 100,
        points: 150,
        badges: [
          {
            id: "b1",
            name: "First Blood",
            icon: "Sword",
            description: "Completed your very first quest!",
            unlockedAt: new Date().toISOString().split("T")[0]
          },
          {
            id: "b2",
            name: "Bed Tamer",
            icon: "Sparkles",
            description: "Tucked in the Sleeping Feather Dragon masterfully.",
            unlockedAt: new Date().toISOString().split("T")[0]
          }
        ]
      },
      {
        id: "c2",
        name: "Fairy Princess",
        avatar: "wand-sparkles",
        level: 1,
        xp: 85,
        xpNeeded: 100,
        points: 40,
        badges: [
          {
            id: "b3",
            name: "Mind Fortress",
            icon: "BookOpen",
            description: "Read quietly for 30 minutes.",
            unlockedAt: new Date().toISOString().split("T")[0]
          }
        ]
      }
    ],
    quests: [
      {
        id: "q1",
        title: "🛏️ Tuck in the Sleeping Feather Dragon",
        description: "Make your bed beautifully! Fluff pillows and pull up the sheets.",
        points: 15,
        xp: 30,
        difficulty: "easy",
        frequency: "daily",
        assignedTo: "all",
        status: "available"
      },
      {
        id: "q2",
        title: "📜 Study the Magic Wizard Scrolls",
        description: "Read your favorite book or practice schoolwork for 30 peaceful minutes.",
        points: 20,
        xp: 40,
        difficulty: "easy",
        frequency: "daily",
        assignedTo: "all",
        status: "available"
      },
      {
        id: "q3",
        title: "🧼 Wash the Royal Crystal Chalices",
        description: "Wash dishes after dinner or fully load/unload the magic dishwashing machine.",
        points: 30,
        xp: 60,
        difficulty: "medium",
        frequency: "daily",
        assignedTo: "all",
        status: "available"
      },
      {
        id: "q4",
        title: "🧺 Fold the Enchanted Pixie Cloaks",
        description: "Sort, fold, and beautifully put away your clean garments in drawers.",
        points: 40,
        xp: 75,
        difficulty: "medium",
        frequency: "weekly",
        assignedTo: "all",
        status: "available"
      },
      {
        id: "q5",
        title: "🧹 Sweep the Pixie Dust from the Chamber",
        description: "Clean up all toys from the chamber floor, dust surfaces, and align objects.",
        points: 50,
        xp: 100,
        difficulty: "medium",
        frequency: "weekly",
        assignedTo: "all",
        status: "available"
      },
      {
        id: "q6",
        title: "🌳 Tidy the Enchanted Garden Paths",
        description: "Rake scattered leaves, clear weed invaders, or sweep the pathways outside.",
        points: 100,
        xp: 250,
        difficulty: "boss",
        frequency: "weekly",
        assignedTo: "all",
        status: "available"
      }
    ],
    rewards: [
      {
        id: "r1",
        title: "🎮 30 Minutes iPad Screen Time",
        description: "Unlock the magical digital scrolls for games or animated shows.",
        cost: 100,
        icon: "Gamepad"
      },
      {
        id: "r2",
        title: "🍦 Legendary Frozen Treats Quest",
        description: "Embark on an expedition to the local parlor/freezer for gourmet ice cream.",
        cost: 150,
        icon: "IceCream"
      },
      {
        id: "r3",
        title: "🍿 Family Cinema Commander",
        description: "Choose the film we watch for family movie night and secure the optimal seat.",
        cost: 120,
        icon: "Film"
      },
      {
        id: "r4",
        title: "🌙 Midnight Scroll (Sleep 30mins late)",
        description: "Earn the right to extend your evening bedtime by 30 extra minutes.",
        cost: 200,
        icon: "Moon"
      },
      {
        id: "r5",
        title: "🎲 Board Game Captain",
        description: "Choose and captain any parlor game during the family board game meetup.",
        cost: 80,
        icon: "Dices"
      }
    ],
    claims: [],
    calendar: [
      {
        id: "e1",
        title: "🍕 Legendary Family Pizza & Board Game Night",
        date: new Date().toISOString().split("T")[0],
        time: "18:00",
        type: "fun"
      },
      {
        id: "e2",
        title: "🦷 Dentist Hero Checkup (No cavities quest!)",
        date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
        time: "14:30",
        type: "general"
      },
      {
        id: "e3",
        title: "🧹 Grand Castle Dust sweep day",
        date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
        time: "10:00",
        type: "chore"
      }
    ],
    groceryList: [
      { id: "g1", name: "Crispy Red Apples", qty: "6 count", completed: false },
      { id: "g2", name: "Fresh Royal Milk", qty: "1 Gallon", completed: true },
      { id: "g3", name: "Gladiator Mozzarella Pizza", qty: "2 boxes", completed: false },
      { id: "g4", name: "Bubble-berry Ice Cream Tub", qty: "1 Tub", completed: false }
    ],
    notes: [
      {
        id: "n1",
        text: "👋 Welcome to the Family Skylight Board! Work as a team to complete quests and level up! Parents, turn on Parental Controls (Default PIN: 1234) at the top right to customize tasks or approve rewards.",
        author: "Grandmaster Parent",
        color: "#fef08a",
        date: new Date().toISOString().split("T")[0]
      },
      {
        id: "n2",
        text: "Remember: Sunday is chore approval audit. Quests pending approval will be reviewed for extra XP bonuses! Good luck heroes! 🏆",
        author: "Commander Mom",
        color: "#bbf7d0",
        date: new Date().toISOString().split("T")[0]
      }
    ],
    notifications: [
      {
        id: "notif1",
        title: "Level Up!",
        message: "Pixie Prince reached Level 2! Royal status upgraded.",
        type: "achievement",
        timestamp: new Date().toISOString()
      },
      {
        id: "notif2",
        title: "New Quest Available",
        message: "The mythical 'Tidy the Enchanted Garden Paths' is active on the map!",
        type: "quest",
        timestamp: new Date().toISOString()
      }
    ],
    encryptionActive: true,
    lastBackup: new Date().toISOString()
  };
}

// In-Memory storage of family states (loaded from JSON if exists)
let database: Record<string, FamilyState> = {};

// Helper to load db
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, "utf-8");
      database = JSON.parse(raw);
      console.log(`Loaded ${Object.keys(database).length} families from state file.`);
    }
  } catch (error) {
    console.error("Error loading database file, initializing empty:", error);
    database = {};
  }
}

// Helper to save db
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(database, null, 2), "utf-8");
  } catch (error) {
    console.error("Error writing database file:", error);
  }
}

loadDB();

async function startServer() {
  const app = express();
  app.use(express.json());

  // SSE client registrations
  let sseClients: { res: any; familyCode: string }[] = [];

  // API handler to fetch state for a given family
  app.get("/api/family/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    if (!database[code]) {
      database[code] = createDefaultFamilyState(code);
      saveDB();
    }
    res.json(database[code]);
  });

  // API handler to save/replace state
  app.post("/api/family/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    const newState = req.body as FamilyState;

    if (!newState || !newState.children || !newState.quests) {
      res.status(400).json({ error: "Invalid state template loaded" });
      return;
    }

    // Assign on server
    database[code] = newState;
    saveDB();

    // Trigger SSE real-time announcements to other active tabs with SAME code
    const alertList = sseClients.filter(c => c.familyCode === code);
    alertList.forEach(client => {
      try {
        client.res.write(`data: ${JSON.stringify({ updated: true })}\n\n`);
      } catch (err) {
        // dynamic cleaning done by handler
      }
    });

    res.json({ success: true, timestamp: Date.now() });
  });

  // Server Sent Events route for instant multi-device syncing
  app.get("/api/sync-stream/:code", (req, res) => {
    const code = req.params.code.toUpperCase();
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const client = { res, familyCode: code };
    sseClients.push(client);

    // Ping check
    const pingInterval = setInterval(() => {
      res.write(`data: ${JSON.stringify({ ping: true })}\n\n`);
    }, 15000);

    req.on("close", () => {
      clearInterval(pingInterval);
      sseClients = sseClients.filter(c => c.res !== res);
    });
  });

  // Check health setup
  app.get("/api/health", (req, res) => {
    res.json({ status: "running", port: PORT, databaseRecords: Object.keys(database).length });
  });

  // Client static assets & SPA fallback setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[FamilyQuest] Server executing at http://0.0.0.0:${PORT} in Node.js runtime.`);
  });
}

// Bootstrap server
startServer().catch(err => {
  console.error("Critical server failure:", err);
});
