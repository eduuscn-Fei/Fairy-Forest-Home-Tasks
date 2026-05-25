import React, { useState } from "react";
import { CalendarEvent, GroceryItem, SkylightNote } from "../types";
import { Calendar, ShoppingCart, StickyNote, Plus, Trash2, Check, User, Clock, Palette } from "lucide-react";

interface SkylightBoardProps {
  calendar: CalendarEvent[];
  groceryList: GroceryItem[];
  notes: SkylightNote[];
  onAddCalendarEvent: (event: Omit<CalendarEvent, "id">) => void;
  onAddGrocery: (item: Omit<GroceryItem, "id" | "completed">) => void;
  onToggleGrocery: (id: string) => void;
  onClearGroceries: () => void;
  onAddNote: (note: Omit<SkylightNote, "id" | "date">) => void;
  onDeleteNote: (id: string) => void;
  activeUser: string; // active hero or "Parent"
  accessibilityOn: boolean;
}

export const SkylightBoard: React.FC<SkylightBoardProps> = ({
  calendar,
  groceryList,
  notes,
  onAddCalendarEvent,
  onAddGrocery,
  onToggleGrocery,
  onClearGroceries,
  onAddNote,
  onDeleteNote,
  activeUser,
  accessibilityOn
}) => {
  const [activeTab, setActiveTab] = useState<'calendar' | 'groceries' | 'bulletin'>('bulletin');

  // New item states
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventDate, setNewEventDate] = useState(new Date().toISOString().split("T")[0]);
  const [newEventTime, setNewEventTime] = useState("12:00");
  const [newEventType, setNewEventType] = useState<'general' | 'chore' | 'fun' | 'important'>('general');

  const [newGroceryName, setNewGroceryName] = useState("");
  const [newGroceryQty, setNewGroceryQty] = useState("");

  const [newNoteText, setNewNoteText] = useState("");
  const [newNoteColor, setNewNoteColor] = useState("#fef08a"); // Yellow postit

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle) return;
    onAddCalendarEvent({
      title: newEventTitle,
      date: newEventDate,
      time: newEventTime,
      type: newEventType
    });
    setNewEventTitle("");
  };

  const handleAddGrocery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroceryName) return;
    onAddGrocery({
      name: newGroceryName,
      qty: newGroceryQty || "1 count"
    });
    setNewGroceryName("");
    setNewGroceryQty("");
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText) return;
    onAddNote({
      text: newNoteText,
      author: activeUser,
      color: newNoteColor
    });
    setNewNoteText("");
  };

  return (
    <div className="bg-white border border-stone-200/80 rounded-3xl p-5 md:p-6 shadow-md shadow-stone-100/50" id="skylight-smart-grid">
      {/* Smart Device Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-stone-150 mb-6 gap-4">
        <div>
          <span className="bg-purple-50 text-purple-700 font-display font-semibold text-[10px] tracking-wider px-3 py-1 rounded-full uppercase border border-purple-200 shadow-xs">
            🌻 FAMILY MESSAGE BOARD & SCHEDULE
          </span>
          <h2 className="text-stone-800 font-display font-bold text-xl tracking-tight mt-1.5 flex items-center gap-2">
            <LayoutGridIcon className="w-5 h-5 text-[#9D8FEF]" />
            Family Digital Board
          </h2>
        </div>

        {/* Custom Tab Switcher styled like smart-screen buttons with pastel themes */}
        <div className="flex bg-stone-100 p-1 rounded-2xl border border-stone-200" id="smart-board-switch">
          {[
            { id: 'bulletin', title: 'Lovely Sticky Notes', icon: StickyNote, color: 'text-amber-500' },
            { id: 'calendar', title: 'Family Calendar', icon: Calendar, color: 'text-sky-500' },
            { id: 'groceries', title: 'Grocery list', icon: ShoppingCart, color: 'text-pink-500' }
          ].map((item) => {
            const IsSel = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                id={`skylight-board-tab-${item.id}`}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold font-display transition cursor-pointer ${
                  IsSel
                    ? "bg-white text-stone-800 shadow-xs border border-stone-200"
                    : "text-stone-500 hover:text-stone-800"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${item.color}`} />
                <span>{item.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* RENDER BULLETIN BOARD PANEL */}
      {activeTab === 'bulletin' && (
        <div className="space-y-6" id="notes-sub-pane">
          {/* Note Input card */}
          <form onSubmit={handleAddNote} className="bg-stone-50 p-4 border border-stone-200 rounded-3xl max-w-xl flex flex-col gap-3 shadow-xs">
            <p className="text-stone-700 font-display font-semibold text-xs uppercase tracking-wide">📌 Pin a new reminder note</p>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Write a message to the family board..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="bg-white border border-stone-200 focus:border-purple-300 rounded-xl px-3 py-2 text-sm text-stone-700 flex-1 focus:outline-none shadow-xs"
              />
              <button
                type="submit"
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 rounded-xl font-display font-medium text-xs flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>PinIt</span>
              </button>
            </div>
            
            {/* Color selector */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-stone-500 font-sans">Sticky color:</span>
              <div className="flex gap-1.5">
                {[
                  { value: "#fef08a", name: "Yellow" }, // Yellow-200
                  { value: "#bbf7d0", name: "Green" },  // Green-200
                  { value: "#bfdbfe", name: "Blue" },   // Blue-200
                  { value: "#fbcfe8", name: "Pink" },   // Pink-200
                ].map((col) => (
                  <button
                    key={col.value}
                    type="button"
                    onClick={() => setNewNoteColor(col.value)}
                    className={`w-5 h-5 rounded-full border cursor-pointer transition-all ${
                      newNoteColor === col.value ? "ring-2 ring-purple-400 scale-110 border-white" : "border-stone-300"
                    }`}
                    style={{ backgroundColor: col.value }}
                    title={col.name}
                  />
                ))}
              </div>
            </div>
          </form>

          {/* Sticky Notes Corkboard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5" id="sticky-notes-rack">
            {notes.length === 0 ? (
              <div className="col-span-full py-12 text-center border border-dashed border-stone-200 rounded-3xl bg-stone-50/50">
                <StickyNote className="w-12 h-12 text-stone-300 mx-auto mb-2" />
                <p className="text-stone-650 font-display font-bold text-sm">Clean Message Wall</p>
                <p className="text-stone-400 text-xs mt-0.5">Use the block above to stick sweet messages to the board.</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  id={`sticky-${note.id}`}
                  style={{ backgroundColor: note.color }}
                  className="rounded-2xl shadow-sm p-4 min-h-[140px] flex flex-col justify-between text-stone-850 border border-stone-300/60 select-none hover:rotate-1 relative transition transform hover:-translate-y-1"
                >
                  <p className="font-sans font-semibold text-sm leading-snug whitespace-pre-line text-stone-800">
                    {note.text}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-black/5 pt-2 mt-4 text-[10px] font-bold text-stone-700">
                    <span className="flex items-center gap-1 opacity-80 uppercase tracking-wider">
                      <User className="w-3.5 h-3.5 text-stone-600" />
                      {note.author}
                    </span>
                    <button
                      id={`btn-del-note-${note.id}`}
                      onClick={() => onDeleteNote(note.id)}
                      className="p-1 hover:bg-black/5 rounded text-red-700 hover:text-red-950 transition cursor-pointer"
                      title="Pin-off note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* RENDER CALENDAR PANEL */}
      {activeTab === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6" id="calendar-container">
          {/* Calendar Insertion Form left column */}
          <div className="lg:col-span-4 bg-stone-50 p-5 rounded-3xl border border-stone-200 shadow-xs">
            <h3 className="text-stone-800 font-display font-bold text-sm uppercase tracking-wider mb-4 border-b border-stone-250 pb-2 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-sky-500" />
              Schedule Family Event
            </h3>
            <form onSubmit={handleAddEvent} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. Pizza game night!"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Date</label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2 py-1.5 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Time</label>
                  <input
                    type="time"
                    value={newEventTime}
                    onChange={(e) => setNewEventTime(e.target.value)}
                    className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2 py-1.5 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Event Category</label>
                <select
                  value={newEventType}
                  onChange={(e) => setNewEventType(e.target.value as any)}
                  className="bg-white border border-stone-250 text-xs text-stone-700 w-full rounded-xl px-2 py-2 focus:border-purple-300 outline-none shadow-xs"
                >
                  <option value="general">🌻 General Event</option>
                  <option value="chore">🧺 Chore / Clean Activity</option>
                  <option value="fun">🎉 Fun Movie / Dinner</option>
                  <option value="important">🚨 Important Reminder</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-sky-500 hover:bg-sky-600 text-white font-display font-medium text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Schedule Event
              </button>
            </form>
          </div>

          {/* Calendar Dates Grid Agenda */}
          <div className="lg:col-span-8 space-y-3" id="calendar-agenda">
            <h3 className="text-stone-700 font-display font-bold text-xs uppercase tracking-wider mb-2 flex items-center gap-1 text-left">
              <Clock className="w-3.5 h-3.5 text-sky-500" />
              Upcoming Calendar Schedules
            </h3>

            {calendar.length === 0 ? (
              <div className="bg-stone-50 border border-stone-200 py-12 rounded-3xl text-center">
                <Calendar className="w-12 h-12 text-stone-200 mx-auto mb-2" />
                <p className="text-stone-605 font-display font-bold text-sm">Our calendar is clear!</p>
                <p className="text-stone-400 text-xs mt-0.5">Let's schedule weekend fun or pizza nights!</p>
              </div>
            ) : (
              // Sort events chronological
              [...calendar]
                .sort((a, b) => b.date.localeCompare(a.date))
                .slice(0, 8)
                .map((event) => {
                  let badgeColor = "bg-sky-50 text-sky-850 border-sky-200";
                  if (event.type === "chore") badgeColor = "bg-amber-50 text-amber-850 border-amber-200";
                  if (event.type === "fun") badgeColor = "bg-emerald-50 text-emerald-850 border-emerald-200";
                  if (event.type === "important") badgeColor = "bg-rose-50 text-rose-850 border-rose-200 animate-pulse";

                  return (
                    <div
                      key={event.id}
                      className="bg-stone-50/50 border border-stone-200 hover:bg-stone-50 hover:border-purple-200/80 p-4 rounded-3xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="space-y-1 text-left">
                        <span className={`px-2 py-0.5 font-display text-[9px] font-semibold uppercase rounded-full border ${badgeColor}`}>
                          {event.type}
                        </span>
                        <h4 className={`text-stone-800 font-display font-bold leading-tight ${accessibilityOn ? 'text-lg' : 'text-sm'}`}>
                          {event.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 font-display text-[10px] font-semibold text-sky-850 bg-white border border-stone-200 px-3 py-1.5 rounded-xl w-fit shadow-xs">
                        <span>📅 {event.date}</span>
                        <span>at {event.time}</span>
                      </div>
                    </div>
                  );
                })
            )}
          </div>
        </div>
      )}

      {/* RENDER GROCERY CHECKLIST PANEL */}
      {activeTab === 'groceries' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="grocery-sub-panel">
          {/* Left Column Input */}
          <div className="bg-stone-50 p-5 rounded-3xl border border-stone-200 shadow-xs">
            <h3 className="text-stone-800 font-display font-bold text-sm uppercase tracking-wider mb-4 border-b border-stone-250 pb-2 flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-pink-500" />
              Add Provisions
            </h3>
            <form onSubmit={handleAddGrocery} className="space-y-4 text-left">
              <div>
                <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Item Title</label>
                <input
                  type="text"
                  placeholder="e.g. Crisp Apples..."
                  value={newGroceryName}
                  onChange={(e) => setNewGroceryName(e.target.value)}
                  className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-display font-semibold text-stone-500 uppercase mb-1">Quantity / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. 1 Pack or 4 count..."
                  value={newGroceryQty}
                  onChange={(e) => setNewGroceryQty(e.target.value)}
                  className="bg-white border border-stone-250 focus:border-purple-300 rounded-xl px-2.5 py-2 text-xs text-stone-700 w-full focus:outline-none shadow-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-pink-500 hover:bg-pink-600 text-white font-display font-medium text-xs rounded-xl shadow-xs transition cursor-pointer"
              >
                Add Grocery Item
              </button>

              <button
                type="button"
                onClick={onClearGroceries}
                className="w-full py-2 border border-stone-200 hover:bg-stone-100 text-stone-500 font-display font-semibold text-[11px] rounded-xl transition cursor-pointer"
              >
                Clear Completed Items
              </button>
            </form>
          </div>

          {/* Right Column List */}
          <div className="lg:col-span-2 space-y-3" id="groceries-list-items">
            <div className="flex items-center justify-between border-b border-stone-250 pb-2 text-left">
              <h3 className="text-stone-700 font-display font-bold text-xs uppercase tracking-wider">Shopping checklist</h3>
              <span className="text-stone-500 font-display text-xs font-semibold">
                {groceryList.filter(g => g.completed).length} / {groceryList.length} Gathered
              </span>
            </div>

            {groceryList.length === 0 ? (
              <div className="bg-stone-50 border border-stone-200 py-12 rounded-3xl text-center items-center flex flex-col justify-center">
                <ShoppingCart className="w-12 h-12 text-stone-200 mb-2" />
                <p className="text-stone-650 font-display font-bold text-sm">Pantry is full!</p>
                <p className="text-stone-400 text-xs mt-0.5">Use the block to make lists and check off items.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" id="provisions-box">
                {groceryList.map((item) => (
                  <button
                    key={item.id}
                    id={`btn-grocery-${item.id}`}
                    onClick={() => onToggleGrocery(item.id)}
                    className={`p-3.5 rounded-2xl border text-left flex items-start justify-between gap-4 transition cursor-pointer ${
                      item.completed
                        ? "bg-emerald-50 border-emerald-250 text-stone-400 line-through"
                        : "bg-white border-stone-200 text-stone-850 hover:border-purple-250 hover:bg-stone-50/50"
                    }`}
                  >
                    <div className="text-left">
                      <p className={`font-display font-bold ${accessibilityOn ? 'text-lg' : 'text-xs md:text-sm text-stone-800'}`}>
                        {item.name}
                      </p>
                      <p className="text-[10px] text-stone-500 mt-0.5 font-sans font-medium">{item.qty}</p>
                    </div>

                    <div className={`w-5 h-5 rounded-lg border flex items-center justify-center transition shadow-xs ${
                      item.completed
                        ? "bg-emerald-500 border-emerald-400 text-white"
                        : "border-stone-300 bg-white"
                    }`}>
                      {item.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Quick custom icon representer for Skylight boards
const LayoutGridIcon: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
};
