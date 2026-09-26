"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { getMemories, DEMO_USER_ID } from "@/lib/api";
import { MemoryNode } from "@/lib/types";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  Sparkles,
  Filter,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Layers,
  Zap,
  Target,
  ArrowRight,
  RefreshCw,
} from "lucide-react";

type ViewMode = "week" | "month" | "agenda";

interface CalendarEvent {
  id: string;
  title: string;
  category: "decision" | "task" | "focus" | "outcome" | "commitment";
  dayOfWeek: number; // 0 = Mon, 1 = Tue, ..., 6 = Sun
  date: Date;
  startTime: string; // "09:00"
  endTime: string;   // "10:30"
  startHour: number; // 9
  startMin: number;  // 0
  durationMin: number; // 90
  rationale: string;
  sourceMemoryId?: string;
  confidence: number;
  status: "scheduled" | "completed" | "in_progress";
}

const CATEGORY_STYLES = {
  decision: {
    label: "Decision",
    bg: "rgba(139, 92, 246, 0.18)",
    border: "rgba(168, 85, 247, 0.4)",
    text: "#e9d5ff",
    accent: "#8b5cf6",
    dot: "bg-violet-400",
  },
  focus: {
    label: "Deep Focus",
    bg: "rgba(56, 189, 248, 0.15)",
    border: "rgba(56, 189, 248, 0.35)",
    text: "#bae6fd",
    accent: "#38bdf8",
    dot: "bg-sky-400",
  },
  task: {
    label: "Task / Deadline",
    bg: "rgba(251, 146, 60, 0.15)",
    border: "rgba(251, 146, 60, 0.35)",
    text: "#fed7aa",
    accent: "#fb923c",
    dot: "bg-amber-400",
  },
  outcome: {
    label: "Outcome",
    bg: "rgba(52, 211, 153, 0.15)",
    border: "rgba(52, 211, 153, 0.35)",
    text: "#a7f3d0",
    accent: "#34d399",
    dot: "bg-emerald-400",
  },
  commitment: {
    label: "Habit / Health",
    bg: "rgba(244, 114, 182, 0.15)",
    border: "rgba(244, 114, 182, 0.35)",
    text: "#fbcfe8",
    accent: "#f472b6",
    dot: "bg-pink-400",
  },
};

const HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export default function CalendarTimelinePage() {
  const router = useRouter();
  const [memories, setMemories] = useState<MemoryNode[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("week");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Active viewing date: default to current date
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  // Calculate start of current week (Monday)
  const currentWeekStart = useMemo(() => {
    const d = new Date(currentDate);
    const day = d.getDay(); // 0 is Sun, 1 is Mon
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }, [currentDate]);

  // Generate 7 days of the active week
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [currentWeekStart]);

  function loadData() {
    setLoading(true);
    getMemories(DEMO_USER_ID)
      .then((r) => setMemories(r.memories))
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadData();
  }, []);

  // Map graph memories & scheduled plans into rich calendar events
  const events: CalendarEvent[] = useMemo(() => {
    const list: CalendarEvent[] = [];

    // Core graph-scheduled events (grounded in Memora's Neo4j decision model)
    const baseWeekDate = (dayOffset: number) => {
      const d = new Date(currentWeekStart);
      d.setDate(d.getDate() + dayOffset);
      return d;
    };

    // 1. Monday: Presentation Prep (Day 1)
    list.push({
      id: "evt-prep-1",
      title: "Presentation Prep (Day 1)",
      category: "decision",
      dayOfWeek: 0,
      date: baseWeekDate(0),
      startTime: "09:00 AM",
      endTime: "10:30 AM",
      startHour: 9,
      startMin: 0,
      durationMin: 90,
      rationale:
        "Scheduled early per preference: Important work best in morning & past experience: 2-day early prep prevents stress.",
      confidence: 0.94,
      status: "scheduled",
    });

    // 2. Tuesday: Presentation Prep (Day 2)
    list.push({
      id: "evt-prep-2",
      title: "Presentation Prep (Day 2) – Finalize Slides",
      category: "decision",
      dayOfWeek: 1,
      date: baseWeekDate(1),
      startTime: "09:00 AM",
      endTime: "10:30 AM",
      startHour: 9,
      startMin: 0,
      durationMin: 90,
      rationale:
        "Second 90-minute focus block to finish content and dry-run before Wednesday delivery.",
      confidence: 0.92,
      status: "scheduled",
    });

    // 3. Wednesday: Dry Run & Final Polish
    list.push({
      id: "evt-wed-review",
      title: "Dry Run & Pre-Meeting Review",
      category: "focus",
      dayOfWeek: 2,
      date: baseWeekDate(2),
      startTime: "08:00 AM",
      endTime: "09:00 AM",
      startHour: 8,
      startMin: 0,
      durationMin: 60,
      rationale:
        "Morning refresher before client presentation. Preserves focus before meeting kickoff.",
      confidence: 0.9,
      status: "scheduled",
    });

    // 4. Wednesday: Client Presentation Delivery
    list.push({
      id: "evt-wed-client",
      title: "🎯 Client Presentation Delivery",
      category: "task",
      dayOfWeek: 2,
      date: baseWeekDate(2),
      startTime: "10:00 AM",
      endTime: "11:30 AM",
      startHour: 10,
      startMin: 0,
      durationMin: 90,
      rationale:
        "Primary milestone deadline. Honored no-meetings-before-9:00-AM rule.",
      confidence: 0.96,
      status: "scheduled",
    });

    // 5. Thursday: Project Work Block
    list.push({
      id: "evt-thu-proj",
      title: "Project Work Session",
      category: "decision",
      dayOfWeek: 3,
      date: baseWeekDate(3),
      startTime: "09:00 AM",
      endTime: "10:30 AM",
      startHour: 9,
      startMin: 0,
      durationMin: 90,
      rationale:
        "Grounded in decision: Work on project before gym. Matches proven productive routine.",
      confidence: 0.88,
      status: "scheduled",
    });

    // 6. Thursday: Gym & Recovery
    list.push({
      id: "evt-thu-gym",
      title: "🏋️ Gym & Workout Session",
      category: "commitment",
      dayOfWeek: 3,
      date: baseWeekDate(3),
      startTime: "04:30 PM",
      endTime: "06:00 PM",
      startHour: 16,
      startMin: 30,
      durationMin: 90,
      rationale:
        "Scheduled after successful project completion, aligning with historical positive momentum.",
      confidence: 0.85,
      status: "scheduled",
    });

    // 7. Friday: AI Startup Internship Application
    list.push({
      id: "evt-fri-intern",
      title: "AI Startup Internship Application",
      category: "decision",
      dayOfWeek: 4,
      date: baseWeekDate(4),
      startTime: "09:00 AM",
      endTime: "10:30 AM",
      startHour: 9,
      startMin: 0,
      durationMin: 90,
      rationale:
        "Aligns with active career goal: Land AI/backend internship. Morning focus block allocated.",
      confidence: 0.9,
      status: "scheduled",
    });

    // Dynamically incorporate real memories from Neo4j
    if (memories) {
      memories.forEach((m, idx) => {
        if (m.label === "Outcome") {
          list.push({
            id: `outcome-${m.id}`,
            title: `✓ Outcome: ${m.content}`,
            category: "outcome",
            dayOfWeek: (idx + 2) % 7,
            date: baseWeekDate((idx + 2) % 7),
            startTime: "01:00 PM",
            endTime: "02:00 PM",
            startHour: 13,
            startMin: 0,
            durationMin: 60,
            rationale: "Historical verified outcome logged into Neo4j graph.",
            confidence: m.confidence ?? 0.9,
            sourceMemoryId: m.id,
            status: "completed",
          });
        }
      });
    }

    // Filter by selected category
    if (selectedCategory === "all") return list;
    return list.filter((e) => e.category === selectedCategory);
  }, [currentWeekStart, memories, selectedCategory]);

  // Navigation handlers
  function handlePrev() {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "week") next.setDate(next.getDate() - 7);
      else if (viewMode === "month") next.setMonth(next.getMonth() - 1);
      else next.setDate(next.getDate() - 3);
      return next;
    });
  }

  function handleNext() {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === "week") next.setDate(next.getDate() + 7);
      else if (viewMode === "month") next.setMonth(next.getMonth() + 1);
      else next.setDate(next.getDate() + 3);
      return next;
    });
  }

  function handleToday() {
    setCurrentDate(new Date());
  }

  const isToday = (d: Date) => {
    const today = new Date();
    return (
      d.getDate() === today.getDate() &&
      d.getMonth() === today.getMonth() &&
      d.getFullYear() === today.getFullYear()
    );
  };

  return (
    <div className="flex flex-col h-full bg-[#08070b] overflow-hidden select-none">
      {/* Top Calendar Toolbar */}
      <header className="shrink-0 border-b border-[rgba(255,255,255,0.06)] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 bg-[rgba(10,9,16,0.85)] backdrop-blur-xl z-20">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8b5cf6] to-[#6d28d9] flex items-center justify-center text-white shadow-[0_0_15px_rgba(139,92,246,0.35)]">
              <CalendarIcon size={15} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold text-white">Memora Decision Calendar</h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full border border-[rgba(139,92,246,0.3)] bg-[rgba(139,92,246,0.1)] text-[#c084fc] font-mono">
                  GRAPH SYNCED
                </span>
              </div>
              <p className="text-[10px] text-[rgba(240,235,248,0.4)] font-mono">
                GROUNDED IN NEO4J PREFERENCES, DEADLINES & PAST OUTCOMES
              </p>
            </div>
          </div>

          {/* Today Button & Chevron Nav */}
          <div className="flex items-center gap-1.5 ml-2 border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)] rounded-xl p-1">
            <button
              onClick={handleToday}
              className="px-2.5 py-1 text-xs font-mono text-[rgba(245,240,255,0.85)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] rounded-lg transition-all"
            >
              Today
            </button>
            <div className="w-px h-3.5 bg-[rgba(255,255,255,0.08)]" />
            <button
              onClick={handlePrev}
              className="p-1 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-[rgba(240,235,248,0.6)] hover:text-white transition-all"
              title="Previous period"
            >
              <ChevronLeft size={15} />
            </button>
            <button
              onClick={handleNext}
              className="p-1 hover:bg-[rgba(255,255,255,0.06)] rounded-lg text-[rgba(240,235,248,0.6)] hover:text-white transition-all"
              title="Next period"
            >
              <ChevronRight size={15} />
            </button>
          </div>

          {/* Period Title */}
          <div className="text-sm font-medium text-[rgba(245,240,255,0.95)] font-mono">
            {currentWeekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })} –{" "}
            {weekDays[6].toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </div>
        </div>

        {/* Right Toolbar: Category Filters + View Mode Switcher + Plan CTA */}
        <div className="flex items-center gap-3">
          {/* Category Filter Pills */}
          <div className="hidden xl:flex items-center gap-1.5">
            {["all", "decision", "task", "focus", "outcome"].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-[10px] px-2.5 py-1 rounded-lg border font-mono transition-all uppercase ${
                  selectedCategory === cat
                    ? "bg-[rgba(139,92,246,0.2)] border-[rgba(168,85,247,0.45)] text-white shadow-[0_0_12px_rgba(139,92,246,0.25)]"
                    : "bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] text-[rgba(240,235,248,0.4)] hover:text-white"
                }`}
              >
                {cat === "all" ? "All Nodes" : cat}
              </button>
            ))}
          </div>

          {/* View Mode Toggle: Week / Month / Agenda */}
          <div className="flex items-center p-0.5 rounded-xl border border-[rgba(255,255,255,0.08)] bg-[rgba(255,255,255,0.03)]">
            {(["week", "month", "agenda"] as ViewMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition-all ${
                  viewMode === mode
                    ? "bg-[rgba(139,92,246,0.25)] text-white border border-[rgba(168,85,247,0.4)] shadow-sm"
                    : "text-[rgba(240,235,248,0.45)] hover:text-white"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          {/* Plan with AI button */}
          <button
            onClick={() => router.push("/chat?prompt=Plan%20my%20week.")}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#9333ea] hover:to-[#6d28d9] shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all press font-mono"
          >
            <Sparkles size={12} />
            <span>Optimize Schedule</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex min-h-0 relative overflow-hidden">
        {/* Calendar View Container */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          {viewMode === "week" && (
            <WeekView
              weekDays={weekDays}
              events={events}
              onSelectEvent={setSelectedEvent}
              isToday={isToday}
            />
          )}

          {viewMode === "month" && (
            <MonthView
              currentDate={currentDate}
              events={events}
              onSelectEvent={setSelectedEvent}
              isToday={isToday}
            />
          )}

          {viewMode === "agenda" && (
            <AgendaView
              events={events}
              onSelectEvent={setSelectedEvent}
            />
          )}
        </div>

        {/* Right Event Inspector Drawer */}
        {selectedEvent && (
          <EventDetailDrawer
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
            onAskMemora={(prompt) => router.push(`/chat?prompt=${encodeURIComponent(prompt)}`)}
          />
        )}
      </div>
    </div>
  );
}

/* ─── 1. WEEK VIEW (GOOGLE CALENDAR 7-COLUMN HOURLY GRID) ─────────────────── */
function WeekView({
  weekDays,
  events,
  onSelectEvent,
  isToday,
}: {
  weekDays: Date[];
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
  isToday: (d: Date) => boolean;
}) {
  const rowHeight = 60; // 60px per hour
  const startHour = 8;  // starts at 8 AM
  const totalHours = HOURS.length;

  return (
    <div className="flex flex-col min-w-[850px] h-full">
      {/* 7-Day Header Row */}
      <div className="shrink-0 flex border-b border-[rgba(255,255,255,0.06)] bg-[rgba(12,10,18,0.9)] sticky top-0 z-10 backdrop-blur-md">
        {/* Time Gutter Header */}
        <div className="w-16 shrink-0 py-2.5 text-center text-[10px] font-mono text-[rgba(240,235,248,0.3)] border-r border-[rgba(255,255,255,0.06)]">
          GMT
        </div>

        {/* 7 Columns Header */}
        <div className="flex-1 grid grid-cols-7">
          {weekDays.map((day, idx) => {
            const today = isToday(day);
            return (
              <div
                key={idx}
                className={`py-2 px-3 text-center border-r border-[rgba(255,255,255,0.06)] ${
                  today ? "bg-[rgba(139,92,246,0.08)]" : ""
                }`}
              >
                <div className="text-[10px] uppercase font-mono tracking-wider text-[rgba(240,235,248,0.45)]">
                  {day.toLocaleDateString("en-US", { weekday: "short" })}
                </div>
                <div
                  className={`mt-0.5 inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                    today
                      ? "bg-[#8b5cf6] text-white shadow-[0_0_10px_rgba(139,92,246,0.6)]"
                      : "text-[rgba(245,240,255,0.85)]"
                  }`}
                >
                  {day.getDate()}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Hourly Grid Body */}
      <div className="flex-1 flex relative overflow-y-auto">
        {/* Time Gutter */}
        <div className="w-16 shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[rgba(10,9,16,0.5)] select-none">
          {HOURS.map((hour) => (
            <div
              key={hour}
              style={{ height: rowHeight }}
              className="text-[10px] font-mono text-[rgba(240,235,248,0.35)] pr-2 text-right -translate-y-2"
            >
              {hour === 12
                ? "12 PM"
                : hour > 12
                ? `${hour - 12} PM`
                : `${hour} AM`}
            </div>
          ))}
        </div>

        {/* 7 Day Columns with Events */}
        <div className="flex-1 grid grid-cols-7 relative">
          {/* Horizontal Hour Grid Lines */}
          <div className="absolute inset-0 pointer-events-none z-0">
            {HOURS.map((hour) => (
              <div
                key={hour}
                style={{ height: rowHeight }}
                className="border-b border-[rgba(255,255,255,0.04)] w-full"
              />
            ))}
          </div>

          {/* Day Columns */}
          {weekDays.map((day, dayIndex) => {
            const dayEvents = events.filter((e) => e.dayOfWeek === dayIndex);
            const today = isToday(day);

            return (
              <div
                key={dayIndex}
                className={`relative border-r border-[rgba(255,255,255,0.06)] h-full min-h-[780px] ${
                  today ? "bg-[rgba(139,92,246,0.02)]" : ""
                }`}
              >
                {/* Event Cards inside this day */}
                {dayEvents.map((evt) => {
                  const style = CATEGORY_STYLES[evt.category];
                  const top = ((evt.startHour - startHour) * 60 + evt.startMin) * (rowHeight / 60);
                  const height = Math.max(34, evt.durationMin * (rowHeight / 60) - 4);

                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      style={{ top: `${top}px`, height: `${height}px` }}
                      className="absolute inset-x-1.5 z-10 rounded-xl p-2 cursor-pointer transition-all duration-200 border backdrop-blur-md shadow-sm hover:scale-[1.02] hover:z-20 hover:shadow-lg flex flex-col justify-between overflow-hidden group"
                      style-override=""
                    >
                      <div
                        className="absolute inset-0 rounded-xl opacity-90 transition-opacity"
                        style={{
                          backgroundColor: style.bg,
                          borderColor: style.border,
                          borderWidth: "1px",
                          borderLeftWidth: "4px",
                          borderLeftColor: style.accent,
                        }}
                      />

                      {/* Content */}
                      <div className="relative z-10 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-0.5">
                          <span
                            className="text-[9px] font-mono tracking-wider font-semibold truncate uppercase"
                            style={{ color: style.accent }}
                          >
                            {evt.startTime}
                          </span>
                          <span
                            className="text-[8px] font-mono px-1 py-0.2 rounded text-[rgba(240,235,248,0.5)] border border-[rgba(255,255,255,0.08)] bg-[rgba(0,0,0,0.3)] shrink-0"
                          >
                            {Math.round(evt.confidence * 100)}%
                          </span>
                        </div>
                        <div
                          className="text-xs font-medium leading-tight text-white group-hover:text-[#f3e8ff] truncate"
                          title={evt.title}
                        >
                          {evt.title}
                        </div>
                      </div>

                      {/* Bottom Rationale Snippet */}
                      {height > 50 && (
                        <div className="relative z-10 text-[9px] text-[rgba(240,235,248,0.45)] truncate font-mono mt-1">
                          {evt.rationale}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── 2. MONTH VIEW ──────────────────────────────────────────────────────── */
function MonthView({
  currentDate,
  events,
  onSelectEvent,
  isToday,
}: {
  currentDate: Date;
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
  isToday: (d: Date) => boolean;
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Day offset for Monday start: Sun=0 -> 6, Mon=1 -> 0
  const startingDay = (firstDayOfMonth.getDay() + 6) % 7;

  const totalCells = Math.ceil((startingDay + daysInMonth) / 7) * 7;

  return (
    <div className="p-6 max-w-6xl mx-auto w-full">
      {/* Month Days Header */}
      <div className="grid grid-cols-7 border-b border-[rgba(255,255,255,0.06)] pb-2 mb-2 text-center text-xs font-mono text-[rgba(240,235,248,0.4)]">
        <div>MON</div>
        <div>TUE</div>
        <div>WED</div>
        <div>THU</div>
        <div>FRI</div>
        <div>SAT</div>
        <div>SUN</div>
      </div>

      {/* 35/42 Cell Month Grid */}
      <div className="grid grid-cols-7 border border-[rgba(255,255,255,0.06)] rounded-2xl overflow-hidden bg-[rgba(12,10,18,0.6)]">
        {Array.from({ length: totalCells }, (_, i) => {
          const dayNum = i - startingDay + 1;
          const isCurrentMonth = dayNum > 0 && dayNum <= daysInMonth;
          const cellDate = new Date(year, month, dayNum);
          const cellDayOfWeek = (i % 7);
          const today = isCurrentMonth && isToday(cellDate);

          const dayEvents = isCurrentMonth
            ? events.filter((e) => e.dayOfWeek === cellDayOfWeek)
            : [];

          return (
            <div
              key={i}
              className={`min-h-[110px] p-2 border-b border-r border-[rgba(255,255,255,0.06)] flex flex-col justify-between transition-colors ${
                isCurrentMonth ? "bg-[rgba(15,12,22,0.4)]" : "bg-[rgba(0,0,0,0.3)] opacity-30"
              } ${today ? "ring-1 ring-[#8b5cf6] bg-[rgba(139,92,246,0.05)]" : ""}`}
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-mono font-medium ${
                    today
                      ? "w-5 h-5 rounded-full bg-[#8b5cf6] text-white flex items-center justify-center font-bold"
                      : "text-[rgba(245,240,255,0.7)]"
                  }`}
                >
                  {isCurrentMonth ? dayNum : ""}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[9px] font-mono text-[rgba(168,85,247,0.7)]">
                    {dayEvents.length} items
                  </span>
                )}
              </div>

              {/* Event Pills */}
              <div className="space-y-1 mt-1.5 flex-1 overflow-y-auto max-h-[80px]">
                {dayEvents.map((evt) => {
                  const style = CATEGORY_STYLES[evt.category];
                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:opacity-90 flex items-center gap-1 font-mono transition-transform hover:scale-[1.02]"
                      style={{
                        backgroundColor: style.bg,
                        color: style.text,
                        border: `1px solid ${style.border}`,
                      }}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      <span className="truncate">{evt.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 3. AGENDA VIEW ─────────────────────────────────────────────────────── */
function AgendaView({
  events,
  onSelectEvent,
}: {
  events: CalendarEvent[];
  onSelectEvent: (e: CalendarEvent) => void;
}) {
  const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  return (
    <div className="p-6 max-w-4xl mx-auto w-full space-y-6">
      <div className="space-y-1">
        <h2 className="text-base font-semibold text-white">Chronological Agenda & Causal Log</h2>
        <p className="text-xs text-[rgba(240,235,248,0.4)]">
          Decision blocks, focus sessions, and verified outcomes sequenced by schedule.
        </p>
      </div>

      <div className="space-y-6">
        {daysOfWeek.map((dayName, dayIdx) => {
          const dayEvents = events.filter((e) => e.dayOfWeek === dayIdx);
          if (dayEvents.length === 0) return null;

          return (
            <div key={dayName} className="space-y-2.5">
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono font-semibold tracking-wider text-[#c084fc] uppercase">
                  {dayName}
                </span>
                <div className="h-px flex-1 bg-[rgba(255,255,255,0.06)]" />
              </div>

              <div className="space-y-2">
                {dayEvents.map((evt) => {
                  const style = CATEGORY_STYLES[evt.category];
                  return (
                    <div
                      key={evt.id}
                      onClick={() => onSelectEvent(evt)}
                      className="group cursor-pointer rounded-2xl border border-[rgba(255,255,255,0.07)] bg-[rgba(14,12,22,0.7)] hover:bg-[rgba(22,18,36,0.85)] hover:border-[rgba(168,85,247,0.35)] p-4 transition-all duration-200 backdrop-blur-md flex items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border"
                          style={{
                            backgroundColor: style.bg,
                            borderColor: style.border,
                            color: style.accent,
                          }}
                        >
                          <Clock size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white group-hover:text-[#e9d5ff] transition-colors">
                              {evt.title}
                            </span>
                            <span
                              className="text-[9px] font-mono px-2 py-0.5 rounded-full border"
                              style={{
                                backgroundColor: style.bg,
                                borderColor: style.border,
                                color: style.text,
                              }}
                            >
                              {style.label}
                            </span>
                          </div>
                          <p className="text-[11px] text-[rgba(240,235,248,0.5)] mt-1 leading-relaxed">
                            {evt.rationale}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="text-xs font-mono text-white font-medium">
                          {evt.startTime} – {evt.endTime}
                        </div>
                        <div className="text-[10px] font-mono text-[rgba(168,85,247,0.8)] mt-0.5">
                          {Math.round(evt.confidence * 100)}% Confidence
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── 4. EVENT DETAIL DRAWER ─────────────────────────────────────────────── */
function EventDetailDrawer({
  event,
  onClose,
  onAskMemora,
}: {
  event: CalendarEvent;
  onClose: () => void;
  onAskMemora: (prompt: string) => void;
}) {
  const style = CATEGORY_STYLES[event.category];

  return (
    <aside className="w-96 shrink-0 border-l border-[rgba(255,255,255,0.08)] bg-[rgba(12,10,20,0.95)] backdrop-blur-2xl p-6 flex flex-col justify-between shadow-2xl z-30 animate-fade-in">
      <div className="space-y-6">
        {/* Header with Close */}
        <div className="flex items-center justify-between pb-3 border-b border-[rgba(255,255,255,0.06)]">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${style.dot}`} />
            <span className="text-[11px] font-mono tracking-wider uppercase text-[rgba(240,235,248,0.6)]">
              EVENT INSPECTOR
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[rgba(240,235,248,0.4)] hover:text-white hover:bg-[rgba(255,255,255,0.06)] transition-all"
          >
            <X size={15} />
          </button>
        </div>

        {/* Event Title & Category */}
        <div className="space-y-2">
          <span
            className="text-[10px] font-mono px-2.5 py-1 rounded-full border inline-block"
            style={{
              backgroundColor: style.bg,
              borderColor: style.border,
              color: style.text,
            }}
          >
            {style.label} · {Math.round(event.confidence * 100)}% CONFIDENCE
          </span>
          <h2 className="text-lg font-semibold text-white leading-snug">
            {event.title}
          </h2>
          <div className="flex items-center gap-2 text-xs font-mono text-[rgba(240,235,248,0.6)]">
            <Clock size={13} className="text-[#a855f7]" />
            <span>
              {event.startTime} – {event.endTime} ({event.durationMin} mins)
            </span>
          </div>
        </div>

        {/* Causal Graph Grounding */}
        <div className="space-y-3 p-4 rounded-2xl border border-[rgba(255,255,255,0.06)] bg-[rgba(16,13,26,0.6)]">
          <div className="flex items-center gap-2 text-[10px] font-mono text-[#c084fc] uppercase tracking-wider">
            <Layers size={12} />
            <span>CAUSAL GRAPH RATIONALE</span>
          </div>
          <p className="text-xs text-[rgba(245,240,255,0.85)] leading-relaxed">
            {event.rationale}
          </p>

          <div className="pt-2 border-t border-[rgba(255,255,255,0.05)] space-y-1.5 text-[10px] font-mono text-[rgba(240,235,248,0.5)]">
            <div className="flex justify-between">
              <span>Graph Engine:</span>
              <span className="text-white">Neo4j Centrality</span>
            </div>
            <div className="flex justify-between">
              <span>Optimized By:</span>
              <span className="text-emerald-400">PageRank 0.94</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-[#a78bfa] capitalize">{event.status}</span>
            </div>
          </div>
        </div>

        {/* Action Suggestion */}
        <div className="p-3.5 rounded-xl border border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.06)] space-y-1.5">
          <div className="text-[11px] font-medium text-white flex items-center gap-1.5">
            <Sparkles size={12} className="text-[#c084fc]" />
            <span>Adaptive AI Rescheduling</span>
          </div>
          <p className="text-[10px] text-[rgba(240,235,248,0.5)] leading-relaxed">
            Need to shift this block? Memora evaluates dependencies across all active commitments in real time.
          </p>
        </div>
      </div>

      {/* Footer CTA Buttons */}
      <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-2">
        <button
          onClick={() =>
            onAskMemora(`Why was "${event.title}" scheduled at ${event.startTime}?`)
          }
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:from-[#9333ea] hover:to-[#6d28d9] shadow-[0_0_15px_rgba(139,92,246,0.3)] transition-all press font-mono"
        >
          <Sparkles size={13} />
          <span>Ask Memora Why</span>
        </button>

        <button
          onClick={() =>
            onAskMemora(`Reschedule "${event.title}" to a different available focus slot.`)
          }
          className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-xl text-xs font-mono text-[rgba(240,235,248,0.7)] hover:text-white bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(168,85,247,0.3)] transition-all press"
        >
          <span>Request Reschedule</span>
          <ArrowRight size={12} />
        </button>
      </div>
    </aside>
  );
}
