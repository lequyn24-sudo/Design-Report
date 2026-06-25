"use client";
import { useState, useEffect } from "react";

const TAGS = ["UI", "UX", "Branding", "Research", "Motion"] as const;
type Tag = typeof TAGS[number];
type Status = "done" | "inprogress" | "todo";
type View = "weekly" | "monthly";

interface WeekSnapshot {
  id: string;
  dateFrom: string;
  dateTo: string;
  tasks: Task[];
  channels: Channel[];
  projects: Project[];
  nextWeek: string;
  blockers: string;
}

interface Task {
  id: number;
  name: string;
  tag: Tag;
  status: Status;
  hours: string;
  note: string;
}

interface Project {
  name: string;
  pct: number;
  color: string;
  link: string;
}

interface Channel {
  id: number;
  name: string;
  done: number;
  total: number;
}

const TAG_COLORS: Record<Tag, string> = {
  UI: "bg-[#00F0FF]/20 text-[#00F0FF]",
  UX: "bg-amber-100 text-amber-800",
  Branding: "bg-emerald-100 text-emerald-800",
  Research: "bg-sky-100 text-sky-800",
  Motion: "bg-pink-100 text-pink-800",
};

const STATUS_COLORS: Record<Status, string> = {
  done: "bg-emerald-500",
  inprogress: "bg-amber-500",
  todo: "bg-gray-400",
};

const STATUS_LABELS: Record<Status, string> = {
  done: "Hoàn thành",
  inprogress: "Đang làm",
  todo: "Chưa bắt đầu",
};

const PROJECT_COLORS = ["#1D9E75", "#E85002", "#BA7517", "#E05C5C", "#2D7DD2"];

function getDefaultDates() {
  const today = new Date();
  const day = today.getDay();
  const daysToLastFriday = (day + 2) % 7;
  const fri = new Date(today);
  fri.setDate(today.getDate() - daysToLastFriday);
  const thu = new Date(fri);
  thu.setDate(fri.getDate() + 6);
  const toISO = (d: Date) => d.toISOString().slice(0, 10);
  return { from: toISO(fri), to: toISO(thu) };
}

function getMonthLabel(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `Tháng ${d.getMonth() + 1} · ${d.getFullYear()}`;
}

function getWeekInMonth(dateTo: string) {
  const d = new Date(dateTo + "T00:00:00");
  return Math.ceil(d.getDate() / 7);
}

function formatWeekLabel(from: string, to: string) {
  if (!from || !to) return "";
  const f = new Date(from + "T00:00:00");
  const t = new Date(to + "T00:00:00");
  const dd = (d: Date) => String(d.getDate()).padStart(2, "0");
  const mm = (d: Date) => String(d.getMonth() + 1).padStart(2, "0");
  return `${dd(f)}/${mm(f)} – ${dd(t)}/${mm(t)}/${t.getFullYear()}`;
}

const STORAGE_KEY = "weekly-design-report";

function loadSaved() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const DEFAULT_TASKS: Task[] = [
  { id: 1, name: "Thiết kế luồng thanh toán (checkout flow)", tag: "UI", status: "done", hours: "8h", note: "" },
  { id: 2, name: "Cập nhật icon set trong design system", tag: "Branding", status: "done", hours: "4h", note: "" },
  { id: 3, name: "User testing – màn hình onboarding", tag: "Research", status: "done", hours: "3h", note: "" },
  { id: 4, name: "Wireframe landing page Q3 campaign", tag: "UX", status: "inprogress", hours: "5h", note: "" },
  { id: 5, name: "Handoff file cho dev – sprint 12", tag: "UI", status: "todo", hours: "—", note: "" },
];

const DEFAULT_CHANNELS: Channel[] = [
  { id: 1, name: "Coincu Insight", done: 0, total: 5 },
  { id: 2, name: "Aptops Verse", done: 0, total: 5 },
  { id: 3, name: "Memeverse", done: 0, total: 5 },
];

const DEFAULT_PROJECTS: Project[] = [
  { name: "App redesign – Checkout", pct: 85, color: "#1D9E75", link: "" },
  { name: "Design system v2", pct: 60, color: "#E85002", link: "" },
  { name: "Landing page – Q3", pct: 30, color: "#BA7517", link: "" },
];

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [view, setView] = useState<View>("weekly");
  const [savedWeeks, setSavedWeeks] = useState<WeekSnapshot[]>([]);
  const [previewWeek, setPreviewWeek] = useState<WeekSnapshot | null>(null);
  const [name, setName] = useState("Nguyễn Minh Anh");
  const [role, setRole] = useState("UI/UX Designer");
  const defaultDates = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(defaultDates.from);
  const [dateTo, setDateTo] = useState(defaultDates.to);
  const [tasks, setTasks] = useState<Task[]>(DEFAULT_TASKS);
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [channels, setChannels] = useState<Channel[]>(DEFAULT_CHANNELS);
  const [nextWeek, setNextWeek] = useState("• Hoàn thiện prototype checkout\n• Họp review với stakeholder\n• Bắt đầu visual design landing page");
  const [blockers, setBlockers] = useState("• Chờ copy từ team content cho landing page\n• Cần xác nhận brand color mới từ marketing");

  useEffect(() => {
    const saved = loadSaved();
    if (saved) {
      if (saved.savedWeeks) setSavedWeeks(saved.savedWeeks);
      if (saved.name) setName(saved.name);
      if (saved.role) setRole(saved.role);
      if (saved.dateFrom) setDateFrom(saved.dateFrom);
      if (saved.dateTo) setDateTo(saved.dateTo);
      if (saved.tasks) setTasks(saved.tasks);
      if (saved.projects) setProjects(saved.projects);
      if (saved.channels) setChannels(saved.channels);
      if (saved.nextWeek) setNextWeek(saved.nextWeek);
      if (saved.blockers) setBlockers(saved.blockers);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name, role, dateFrom, dateTo, tasks, projects, channels, nextWeek, blockers, savedWeeks,
    }));
  }, [name, role, dateFrom, dateTo, tasks, projects, channels, nextWeek, blockers, savedWeeks, isLoaded]);

  const tasksDone = tasks.filter(t => t.status === "done").length;

  const addTask = () =>
    setTasks(prev => [...prev, { id: Date.now(), name: "Task mới", tag: "UI", status: "todo", hours: "—", note: "" }]);

  const updateTask = (id: number, field: keyof Task, value: string) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

  const removeTask = (id: number) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const addProject = () => {
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    setProjects(prev => [...prev, { name: "Dự án mới", pct: 0, color, link: "" }]);
  };

  const updateProject = (i: number, field: keyof Project, value: string | number) =>
    setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));

  const removeProject = (i: number) =>
    setProjects(prev => prev.filter((_, idx) => idx !== i));

  const addChannel = () =>
    setChannels(prev => [...prev, { id: Date.now(), name: "Kênh mới", done: 0, total: 5 }]);

  const updateChannel = (id: number, field: keyof Channel, value: string | number) =>
    setChannels(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));

  const removeChannel = (id: number) =>
    setChannels(prev => prev.filter(c => c.id !== id));

  const loadWeekForEdit = (w: WeekSnapshot) => {
    setDateFrom(w.dateFrom);
    setDateTo(w.dateTo);
    setTasks(w.tasks);
    setChannels(w.channels);
    setProjects(w.projects);
    setNextWeek(w.nextWeek);
    setBlockers(w.blockers);
    setView("weekly");
  };

  const saveWeek = () => {
    const snapshot: WeekSnapshot = {
      id: dateFrom, dateFrom, dateTo,
      tasks: [...tasks], channels: [...channels], projects: [...projects],
      nextWeek, blockers,
    };
    setSavedWeeks(prev => {
      const idx = prev.findIndex(w => w.id === snapshot.id);
      const updated = idx >= 0 ? prev.map((w, i) => i === idx ? snapshot : w) : [...prev, snapshot];
      return updated.sort((a, b) => a.dateFrom.localeCompare(b.dateFrom));
    });
    const nextFri = new Date(dateTo + "T00:00:00");
    nextFri.setDate(nextFri.getDate() + 1);
    const nextThu = new Date(nextFri);
    nextThu.setDate(nextFri.getDate() + 6);
    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    setDateFrom(toISO(nextFri));
    setDateTo(toISO(nextThu));
    setTasks([]);
    setChannels(prev => prev.map(c => ({ ...c, done: 0 })));
    setNextWeek("");
    setBlockers("");
    setView("weekly");
  };

  const weeksByMonth = savedWeeks.reduce((acc, week) => {
    const d = new Date(week.dateTo + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(week);
    return acc;
  }, {} as Record<string, WeekSnapshot[]>);

  return (
    <main className="min-h-screen bg-transparent py-10 px-4 print:bg-white print:py-0 print:px-0">

      {/* Toolbar */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-0.5 text-sm">
            <button onClick={() => setView("weekly")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${view === "weekly" ? "bg-white/20 text-[#F9F9F9] shadow-sm" : "text-[#999999] hover:text-[#CCCCCC]"}`}>
              Tuần này
            </button>
            <button onClick={() => setView("monthly")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${view === "monthly" ? "bg-white/20 text-[#F9F9F9] shadow-sm" : "text-[#999999] hover:text-[#CCCCCC]"}`}>
              Tháng này
              {savedWeeks.length > 0 && <span className="ml-1 text-xs bg-[#00F0FF]/20 text-[#00F0FF] px-1.5 rounded-full">{savedWeeks.length}</span>}
            </button>
          </div>
          <button onClick={() => { if (confirm("Reset về dữ liệu mẫu?")) { setName("Nguyễn Minh Anh"); setRole("UI/UX Designer"); const d = getDefaultDates(); setDateFrom(d.from); setDateTo(d.to); setTasks(DEFAULT_TASKS); setProjects(DEFAULT_PROJECTS); setChannels(DEFAULT_CHANNELS); setNextWeek("• Hoàn thiện prototype checkout\n• Họp review với stakeholder\n• Bắt đầu visual design landing page"); setBlockers("• Chờ copy từ team content cho landing page\n• Cần xác nhận brand color mới từ marketing"); } }}
            className="text-xs text-[#999999] hover:text-[#888888]">Reset</button>
        </div>
        <div className="flex items-center gap-2">
          {view === "weekly" && (
            <button onClick={() => { if (confirm(`Lưu tuần ${formatWeekLabel(dateFrom, dateTo)} vào báo cáo tháng?`)) saveWeek(); }}
              className="text-sm border border-[#E85002]/40 text-[#00F0FF] hover:bg-[#00F0FF]/10 px-3 py-2 rounded-lg font-medium transition-colors">
              Lưu tuần →
            </button>
          )}
          <button onClick={() => window.print()}
            className="text-sm bg-[#00F0FF] hover:bg-[#C10801] text-[#000000] px-4 py-2 rounded-lg font-semibold transition-colors">
            Export PDF
          </button>
        </div>
      </div>

      {view === "monthly" && (
        <div className="max-w-2xl mx-auto space-y-4">
          {savedWeeks.length === 0 ? (
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl border border-white/10 p-12 text-center">
              <div className="text-[#999999] text-sm mb-1">Chưa có tuần nào được lưu</div>
              <div className="text-[#999999] text-xs">Bấm &quot;Lưu tuần →&quot; sau khi điền xong báo cáo tuần.</div>
            </div>
          ) : (
            Object.entries(weeksByMonth).sort((a, b) => b[0].localeCompare(a[0])).map(([, weeks]) => {
              const totalDone = weeks.reduce((s, w) => s + w.tasks.filter(t => t.status === "done").length, 0);
              const totalAll = weeks.reduce((s, w) => s + w.tasks.length, 0);
              const channelTotals: Record<string, { done: number; total: number }> = {};
              weeks.forEach(w => w.channels.forEach(c => {
                if (!channelTotals[c.name]) channelTotals[c.name] = { done: 0, total: 0 };
                channelTotals[c.name].done += c.done;
                channelTotals[c.name].total += c.total;
              }));
              const latestProjects = weeks[weeks.length - 1].projects;
              return (
                <div key={weeks[0].id} className="bg-white/5 backdrop-blur-lg rounded-2xl shadow-sm border border-white/10 p-8 print:shadow-none print:border-none print:bg-white">
                  <div className="flex justify-between items-center mb-6 pb-5 border-b border-white/10">
                    <div>
                      <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-1">Báo cáo tháng</div>
                      <h2 className="text-xl font-medium text-[#F9F9F9]">{getMonthLabel(weeks[0].dateTo)}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-medium text-[#F9F9F9]">{totalDone}<span className="text-base text-[#999999]">/{totalAll}</span></div>
                      <div className="text-xs text-[#999999]">tasks hoàn thành</div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">Theo tuần</div>
                    <div className="space-y-1">
                      {weeks.map(w => {
                        const done = w.tasks.filter(t => t.status === "done").length;
                        return (
                          <div key={w.id}
                            onClick={() => loadWeekForEdit(w)}
                            className="flex items-center gap-4 py-2.5 px-3 -mx-3 rounded-lg border-b border-white/10 last:border-0 hover:bg-[#00F0FF]/10 cursor-pointer transition-colors group/week print:hover:bg-transparent print:cursor-default">
                            <div className="flex flex-col w-36 flex-shrink-0">
                              <span className="text-xs font-medium text-[#CCCCCC]">Tuần {getWeekInMonth(w.dateTo)}</span>
                              <span className="text-xs text-[#999999]">{formatWeekLabel(w.dateFrom, w.dateTo)}</span>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${done === w.tasks.length && w.tasks.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-white/10 text-[#888888]"}`}>
                              {done}/{w.tasks.length} tasks
                            </span>
                            <div className="flex gap-1.5 flex-wrap flex-1">
                              {w.channels.map(c => (
                                <span key={c.id} className={`text-xs px-2 py-0.5 rounded-full ${c.done >= c.total ? "bg-emerald-100 text-emerald-700" : "bg-[#00F0FF]/10 text-[#00F0FF]"}`}>
                                  {c.name.split(" ")[0]}: {c.done}/{c.total}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover/week:opacity-100 transition-opacity print:hidden flex-shrink-0">
                              <button
                                onClick={e => { e.stopPropagation(); setPreviewWeek(w); }}
                                className="text-xs text-[#999999] hover:text-[#CCCCCC] border border-[#444444] hover:border-[#666666] px-2 py-0.5 rounded-md"
                              >Xem</button>
                              <span className="text-xs text-[#00F0FF]">Sửa →</span>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); setSavedWeeks(prev => prev.filter(sw => sw.id !== w.id)); }}
                              className="text-xs text-[#999999] hover:text-red-400 print:hidden flex-shrink-0 ml-1"
                              title="Xóa tuần này"
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">Daily output tổng</div>
                      <div className="space-y-2">
                        {Object.entries(channelTotals).map(([cname, stat]) => (
                          <div key={cname} className="flex items-center gap-2">
                            <span className="text-sm text-[#CCCCCC] w-28 truncate">{cname}</span>
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (stat.done / stat.total) * 100)}%`, background: stat.done >= stat.total ? "#1D9E75" : "#E85002" }} />
                            </div>
                            <span className="text-xs text-[#999999]">{stat.done}/{stat.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">Tiến độ dự án</div>
                      <div className="space-y-2">
                        {latestProjects.map((p, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm text-[#CCCCCC] truncate w-28">{p.name}</span>
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                            </div>
                            <span className="text-xs text-[#999999] w-8 text-right">{p.pct}%</span>
                            {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-[#00F0FF] print:hidden">↗</a>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <div className="text-xs text-[#999999]">Monthly Report · Design Team</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Preview modal */}
      {previewWeek && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:hidden" onClick={() => setPreviewWeek(null)}>
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="relative bg-white/5 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="sticky top-0 bg-white/5 backdrop-blur-lg border-b border-white/10 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
              <div>
                <div className="text-xs font-bold text-[#00F0FF] uppercase tracking-wider tracking-widest">Tuần {getWeekInMonth(previewWeek.dateTo)}</div>
                <div className="text-sm font-semibold text-[#F9F9F9]">{formatWeekLabel(previewWeek.dateFrom, previewWeek.dateTo)}</div>
              </div>
              <button onClick={() => setPreviewWeek(null)} className="text-[#999999] hover:text-[#CCCCCC] text-lg leading-none">✕</button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Hoàn thành", value: `${previewWeek.tasks.filter(t => t.status === "done").length}/${previewWeek.tasks.length}`, color: "text-[#F9F9F9]" },
                  { label: "Đang thực hiện", value: previewWeek.tasks.filter(t => t.status === "inprogress").length, color: "text-amber-500" },
                  { label: "Chưa bắt đầu", value: previewWeek.tasks.filter(t => t.status === "todo").length, color: "text-[#999999]" },
                ].map(m => (
                  <div key={m.label} className="bg-white/10 rounded-xl p-3">
                    <div className="text-xs text-[#999999] mb-1">{m.label}</div>
                    <div className={`text-2xl font-medium ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Projects */}
              {previewWeek.projects.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">Tiến độ dự án</div>
                  <div className="space-y-2.5">
                    {previewWeek.projects.map((p, i) => (
                      <div key={i}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-[#CCCCCC] w-44 truncate flex-shrink-0">{p.name}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                          </div>
                          <span className="text-xs text-[#999999] w-8 text-right">{p.pct}%</span>
                        </div>
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-[#00F0FF] hover:underline ml-0 mt-0.5 block truncate">{p.link}</a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {previewWeek.tasks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">Công việc trong tuần</div>
                  <div className="space-y-2">
                    {previewWeek.tasks.map(task => (
                      <div key={task.id} className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${task.status === "done" ? "border-emerald-100 bg-emerald-50/40" : task.status === "inprogress" ? "border-amber-100 bg-amber-50/40" : "border-white/10"}`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${STATUS_COLORS[task.status]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-[#CCCCCC]">{task.name}</div>
                          {task.note && (
                            (task.note ?? "").startsWith("http") ? (
                              <a href={task.note} target="_blank" rel="noreferrer"
                                className="text-xs text-[#00F0FF] hover:underline mt-0.5 truncate block">
                                {task.note}
                              </a>
                            ) : (
                              <div className="text-xs text-[#999999] mt-0.5 truncate">{task.note}</div>
                            )
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${TAG_COLORS[task.tag]}`}>{task.tag}</span>
                        <span className="text-xs text-[#999999] flex-shrink-0">{task.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily output */}
              {previewWeek.channels.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">Daily output – Banner</div>
                  <div className="space-y-2">
                    {previewWeek.channels.map(c => {
                      const pct = c.total > 0 ? Math.min(100, (c.done / c.total) * 100) : 0;
                      const allDone = c.done >= c.total && c.total > 0;
                      return (
                        <div key={c.id} className="flex items-center gap-3">
                          <span className="text-sm text-[#CCCCCC] w-40 flex-shrink-0">{c.name}</span>
                          <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: allDone ? "#1D9E75" : "#E85002" }} />
                          </div>
                          <span className="text-xs text-[#999999] flex-shrink-0">{c.done}/{c.total} posts</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Next week + Blockers */}
              {(previewWeek.nextWeek || previewWeek.blockers) && (
                <div className="grid grid-cols-2 gap-4">
                  {previewWeek.nextWeek && (
                    <div className="border border-white/10 rounded-xl p-4">
                      <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2">Kế hoạch tuần tới</div>
                      <p className="text-sm text-[#CCCCCC] whitespace-pre-line leading-relaxed">{previewWeek.nextWeek}</p>
                    </div>
                  )}
                  {previewWeek.blockers && (
                    <div className="border border-white/10 rounded-xl p-4">
                      <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-2">Blockers / cần hỗ trợ</div>
                      <p className="text-sm text-[#CCCCCC] whitespace-pre-line leading-relaxed">{previewWeek.blockers}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === "weekly" && <div className="max-w-2xl mx-auto bg-white/5 backdrop-blur-lg rounded-2xl shadow-sm border border-white/10 p-8 print:shadow-none print:border-none print:rounded-none print:p-6 print:bg-white">

        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-white/10">
          <div>
            <h1 className="text-xl font-medium text-[#F9F9F9]">Weekly design report</h1>
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <input value={name} onChange={e => setName(e.target.value)}
                className="text-sm text-[#999999] bg-transparent border-b border-dashed border-[#444444] focus:outline-none focus:border-[#E85002] w-40 print:border-none" />
              <span className="text-sm text-[#999999]">·</span>
              <input value={role} onChange={e => setRole(e.target.value)}
                className="text-sm text-[#999999] bg-transparent border-b border-dashed border-[#444444] focus:outline-none focus:border-[#E85002] w-36 print:border-none" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs font-medium bg-[#00F0FF]/10 text-[#00F0FF] px-3 py-1.5 rounded-lg print:block hidden">
              {formatWeekLabel(dateFrom, dateTo)}
            </div>
            <div className="flex items-center gap-1.5 print:hidden">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="text-xs text-[#00F0FF] bg-[#00F0FF]/10 border-none rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/20 cursor-pointer" />
              <span className="text-xs text-[#00F0FF]">–</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="text-xs text-[#00F0FF] bg-[#00F0FF]/10 border-none rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#00F0FF]/20 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xs text-[#999999] mb-1">Tasks hoàn thành</div>
            <div className="text-2xl font-medium text-[#F9F9F9]">{tasksDone}/{tasks.length}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xs text-[#999999] mb-1">Đang thực hiện</div>
            <div className="text-2xl font-medium text-amber-500">{tasks.filter(t => t.status === "inprogress").length}</div>
          </div>
          <div className="bg-white/10 rounded-xl p-3">
            <div className="text-xs text-[#999999] mb-1">Chưa bắt đầu</div>
            <div className="text-2xl font-medium text-[#999999]">{tasks.filter(t => t.status === "todo").length}</div>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Tiến độ dự án</div>
            <button onClick={addProject} className="text-xs text-[#00F0FF] hover:text-[#00F0FF] font-medium print:hidden">+ Thêm dự án</button>
          </div>
          <div className="space-y-3">
            {projects.map((p, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-3">
                  <input value={p.name} onChange={e => updateProject(i, "name", e.target.value)}
                    className="text-sm text-[#CCCCCC] bg-transparent focus:outline-none w-44 border-b border-dashed border-[#444444] focus:border-[#E85002] print:border-none flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                  <input type="number" min={0} max={100} value={p.pct}
                    onChange={e => updateProject(i, "pct", Math.min(100, Number(e.target.value)))}
                    className="text-xs text-[#999999] w-10 text-right bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  <span className="text-xs text-[#999999]">%</span>
                  <button onClick={() => removeProject(i)}
                    className="text-[#999999] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs print:hidden">✕</button>
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-0">
                  {p.link ? (
                    <>
                      <a href={p.link} target="_blank" rel="noreferrer"
                        className="text-xs text-[#00F0FF] hover:text-[#00F0FF] truncate max-w-xs print:text-[#999999]">
                        {p.link}
                      </a>
                      <input value={p.link} onChange={e => updateProject(i, "link", e.target.value)}
                        className="sr-only" />
                      <button onClick={() => updateProject(i, "link", "")}
                        className="text-[#999999] hover:text-red-400 text-xs flex-shrink-0 print:hidden">✕</button>
                    </>
                  ) : (
                    <input
                      value={p.link}
                      onChange={e => updateProject(i, "link", e.target.value)}
                      placeholder="Dán link Figma / Drive..."
                      className="text-xs text-[#999999] bg-transparent focus:outline-none placeholder-[#555555] w-full print:hidden"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Công việc trong tuần</div>
            <button onClick={addTask} className="text-xs text-[#00F0FF] hover:text-[#00F0FF] font-medium print:hidden">+ Thêm task</button>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="border border-white/10 rounded-xl px-4 py-3 hover:border-[#444444] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`} />
                  <input value={task.name} onChange={e => updateTask(task.id, "name", e.target.value)}
                    className="flex-1 text-sm text-[#CCCCCC] bg-transparent focus:outline-none min-w-0" />
                  <select value={task.tag} onChange={e => updateTask(task.id, "tag", e.target.value as Tag)}
                    className={`text-xs px-2 py-0.5 rounded font-medium border-none focus:outline-none cursor-pointer ${TAG_COLORS[task.tag]}`}>
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select value={task.status} onChange={e => updateTask(task.id, "status", e.target.value as Status)}
                    className="text-xs text-[#999999] bg-transparent border-none focus:outline-none cursor-pointer">
                    {(["done", "inprogress", "todo"] as Status[]).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <input value={task.hours} onChange={e => updateTask(task.id, "hours", e.target.value)}
                    className="text-xs text-[#999999] w-8 text-right bg-transparent focus:outline-none" />
                  <button onClick={() => removeTask(task.id)}
                    className="text-[#999999] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-1 print:hidden">✕</button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 ml-5">
                  {(task.note ?? "").startsWith("http") ? (
                    <>
                      <a href={task.note} target="_blank" rel="noreferrer"
                        className="flex-1 text-xs text-[#00F0FF] hover:text-[#00F0FF] hover:underline truncate print:text-[#999999]">
                        {task.note}
                      </a>
                      <button onClick={() => updateTask(task.id, "note", "")}
                        className="text-[#999999] hover:text-red-400 text-xs flex-shrink-0 print:hidden">✕</button>
                    </>
                  ) : (
                    <>
                      <span className="text-[#999999] text-xs print:hidden">↗</span>
                      <input
                        value={task.note}
                        onChange={e => updateTask(task.id, "note", e.target.value)}
                        placeholder="Link hoặc ghi chú..."
                        className="flex-1 text-xs text-[#999999] bg-transparent focus:outline-none placeholder-[#555555] print:placeholder-transparent"
                      />
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily output */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider">Daily output – Banner</div>
            <button onClick={addChannel} className="text-xs text-[#00F0FF] hover:text-[#00F0FF] font-medium print:hidden">+ Thêm kênh</button>
          </div>
          <div className="space-y-2.5">
            {channels.map(c => {
              const pct = c.total > 0 ? Math.min(100, (c.done / c.total) * 100) : 0;
              const allDone = c.done >= c.total && c.total > 0;
              return (
                <div key={c.id} className="flex items-center gap-3 group">
                  <input value={c.name} onChange={e => updateChannel(c.id, "name", e.target.value)}
                    className="text-sm text-[#CCCCCC] bg-transparent focus:outline-none w-40 border-b border-dashed border-[#444444] focus:border-[#E85002] print:border-none flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: allDone ? "#1D9E75" : "#E85002" }} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input type="number" min={0} max={c.total} value={c.done}
                      onChange={e => updateChannel(c.id, "done", Math.min(c.total, Number(e.target.value)))}
                      className="text-xs text-[#CCCCCC] font-medium w-6 text-right bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                    <span className="text-xs text-[#999999]">/</span>
                    <input type="number" min={1} value={c.total}
                      onChange={e => updateChannel(c.id, "total", Math.max(1, Number(e.target.value)))}
                      className="text-xs text-[#999999] w-6 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                    <span className="text-xs text-[#999999] ml-0.5">posts</span>
                  </div>
                  <button onClick={() => removeChannel(c.id)}
                    className="text-[#999999] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs print:hidden">✕</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next week + Blockers */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-white/10 rounded-xl p-4">
            <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">Kế hoạch tuần tới</div>
            <textarea value={nextWeek} onChange={e => setNextWeek(e.target.value)}
              rows={5} className="w-full text-sm text-[#CCCCCC] bg-transparent resize-none focus:outline-none leading-relaxed placeholder-[#555555]"
              placeholder="• Thêm kế hoạch..." />
          </div>
          <div className="border border-white/10 rounded-xl p-4">
            <div className="text-xs font-semibold text-[#999999] uppercase tracking-wider mb-3">Blockers / cần hỗ trợ</div>
            <textarea value={blockers} onChange={e => setBlockers(e.target.value)}
              rows={5} className="w-full text-sm text-[#CCCCCC] bg-transparent resize-none focus:outline-none leading-relaxed placeholder-[#555555]"
              placeholder="• Thêm blocker..." />
          </div>
        </div>

        {/* Legend + Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-white/10">
          <div className="flex gap-4">
            {(["done", "inprogress", "todo"] as Status[]).map(s => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-[#999999]">
                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
          <div className="text-xs text-[#999999]">Weekly Report · Design Team</div>
        </div>

      </div>}
    </main>
  );
}

