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
  projectId: number | null;
  name: string;
  tag: Tag;
  status: Status;
  hours: string;
  note: string;
}

interface Project {
  id: number;
  name: string;
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
  UI: "bg-[#E85002]/20 text-[#E85002]",
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
  { id: 1, projectId: 1, name: "Thiết kế luồng thanh toán (checkout flow)", tag: "UI", status: "done", hours: "8h", note: "" },
  { id: 2, projectId: 2, name: "Cập nhật icon set trong design system", tag: "Branding", status: "done", hours: "4h", note: "" },
  { id: 3, projectId: 1, name: "User testing – màn hình onboarding", tag: "Research", status: "done", hours: "3h", note: "" },
  { id: 4, projectId: 3, name: "Wireframe landing page Q3 campaign", tag: "UX", status: "inprogress", hours: "5h", note: "" },
  { id: 5, projectId: 1, name: "Handoff file cho dev – sprint 12", tag: "UI", status: "todo", hours: "—", note: "" },
];

const DEFAULT_CHANNELS: Channel[] = [
  { id: 1, name: "Coincu Insight", done: 0, total: 5 },
  { id: 2, name: "Aptops Verse", done: 0, total: 5 },
  { id: 3, name: "Memeverse", done: 0, total: 5 },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: 1, name: "App redesign – Checkout", color: "#1D9E75", link: "" },
  { id: 2, name: "Design system v2", color: "#E85002", link: "" },
  { id: 3, name: "Landing page – Q3", color: "#BA7517", link: "" },
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
    setTasks(prev => [...prev, { id: Date.now(), projectId: null, name: "Task mới", tag: "UI", status: "todo", hours: "—", note: "" }]);

  const updateTask = (id: number, field: keyof Task, value: string | number | null) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

  const removeTask = (id: number) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const addProject = () => {
    const color = PROJECT_COLORS[projects.length % PROJECT_COLORS.length];
    setProjects(prev => [...prev, { id: Date.now(), name: "Dự án mới", color, link: "" }]);
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
    <main className="min-h-screen bg-[#F8FAFC] py-10 px-4 print:bg-white print:py-0 print:px-0">

      {/* Toolbar */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex bg-white shadow-sm border border-slate-200 rounded-lg p-0.5 text-sm">
            <button onClick={() => setView("weekly")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${view === "weekly" ? "bg-white/20 text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              Tuần này
            </button>
            <button onClick={() => setView("monthly")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${view === "monthly" ? "bg-white/20 text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>
              Tháng này
              {savedWeeks.length > 0 && <span className="ml-1 text-xs bg-[#E85002]/20 text-[#E85002] px-1.5 rounded-full">{savedWeeks.length}</span>}
            </button>
          </div>
          <button onClick={() => { if (confirm("Reset về dữ liệu mẫu?")) { setName("Nguyễn Minh Anh"); setRole("UI/UX Designer"); const d = getDefaultDates(); setDateFrom(d.from); setDateTo(d.to); setTasks(DEFAULT_TASKS); setProjects(DEFAULT_PROJECTS); setChannels(DEFAULT_CHANNELS); setNextWeek("• Hoàn thiện prototype checkout\n• Họp review với stakeholder\n• Bắt đầu visual design landing page"); setBlockers("• Chờ copy từ team content cho landing page\n• Cần xác nhận brand color mới từ marketing"); } }}
            className="text-xs text-slate-500 hover:text-slate-500">Reset</button>
        </div>
        <div className="flex items-center gap-2">
          {view === "weekly" && (
            <button onClick={() => { if (confirm(`Lưu tuần ${formatWeekLabel(dateFrom, dateTo)} vào báo cáo tháng?`)) saveWeek(); }}
              className="text-sm border border-[#E85002]/40 text-[#E85002] hover:bg-[#E85002]/10 px-3 py-2 rounded-lg font-medium transition-colors">
              Lưu tuần →
            </button>
          )}
          <button onClick={() => window.print()}
            className="text-sm bg-[#E85002] hover:bg-[#C10801] text-white px-4 py-2 rounded-lg font-semibold transition-colors">
            Export PDF
          </button>
        </div>
      </div>

      {view === "monthly" && (
        <div className="max-w-2xl mx-auto space-y-4">
          {savedWeeks.length === 0 ? (
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl border border-slate-200 p-12 text-center">
              <div className="text-slate-500 text-sm mb-1">Chưa có tuần nào được lưu</div>
              <div className="text-slate-500 text-xs">Bấm &quot;Lưu tuần →&quot; sau khi điền xong báo cáo tuần.</div>
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
                <div key={weeks[0].id} className="bg-white shadow-sm border border-slate-200 rounded-2xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:bg-white">
                  <div className="flex justify-between items-center mb-6 pb-5 border-b border-slate-200">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Báo cáo tháng</div>
                      <h2 className="text-xl font-medium text-slate-900">{getMonthLabel(weeks[0].dateTo)}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-medium text-slate-900">{totalDone}<span className="text-base text-slate-500">/{totalAll}</span></div>
                      <div className="text-xs text-slate-500">tasks hoàn thành</div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Theo tuần</div>
                    <div className="space-y-1">
                      {weeks.map(w => {
                        const done = w.tasks.filter(t => t.status === "done").length;
                        return (
                          <div key={w.id}
                            onClick={() => loadWeekForEdit(w)}
                            className="flex items-center gap-4 py-2.5 px-3 -mx-3 rounded-lg border-b border-slate-200 last:border-0 hover:bg-[#E85002]/10 cursor-pointer transition-colors group/week print:hover:bg-transparent print:cursor-default">
                            <div className="flex flex-col w-36 flex-shrink-0">
                              <span className="text-xs font-medium text-slate-800">Tuần {getWeekInMonth(w.dateTo)}</span>
                              <span className="text-xs text-slate-500">{formatWeekLabel(w.dateFrom, w.dateTo)}</span>
                            </div>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${done === w.tasks.length && w.tasks.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-50 text-slate-500"}`}>
                              {done}/{w.tasks.length} tasks
                            </span>
                            <div className="flex gap-1.5 flex-wrap flex-1">
                              {w.channels.map(c => (
                                <span key={c.id} className={`text-xs px-2 py-0.5 rounded-full ${c.done >= c.total ? "bg-emerald-100 text-emerald-700" : "bg-[#E85002]/10 text-[#E85002]"}`}>
                                  {c.name.split(" ")[0]}: {c.done}/{c.total}
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover/week:opacity-100 transition-opacity print:hidden flex-shrink-0">
                              <button
                                onClick={e => { e.stopPropagation(); setPreviewWeek(w); }}
                                className="text-xs text-slate-500 hover:text-slate-800 border border-[#444444] hover:border-[#666666] px-2 py-0.5 rounded-md"
                              >Xem</button>
                              <span className="text-xs text-[#E85002]">Sửa →</span>
                            </div>
                            <button
                              onClick={e => { e.stopPropagation(); setSavedWeeks(prev => prev.filter(sw => sw.id !== w.id)); }}
                              className="text-xs text-slate-500 hover:text-red-400 print:hidden flex-shrink-0 ml-1"
                              title="Xóa tuần này"
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Daily output tổng</div>
                      <div className="space-y-2">
                        {Object.entries(channelTotals).map(([cname, stat]) => (
                          <div key={cname} className="flex items-center gap-2">
                            <span className="text-sm text-slate-800 w-28 truncate">{cname}</span>
                            <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (stat.done / stat.total) * 100)}%`, background: stat.done >= stat.total ? "#1D9E75" : "#E85002" }} />
                            </div>
                            <span className="text-xs text-slate-500">{stat.done}/{stat.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tiến độ dự án</div>
                      <div className="space-y-2">
                        {latestProjects.map((p, i) => {
                          const allTasks = [...savedWeeks.flatMap(w => w.tasks), ...tasks].filter(t => t.projectId === p.id);
                          const doneTasks = allTasks.filter(t => t.status === "done").length;
                          const pct = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;
                          return (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm text-slate-800 truncate w-28">{p.name}</span>
                            <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                            </div>
                            <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                            {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-[#E85002] print:hidden">↗</a>}
                          </div>
                        )})}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-slate-200">
                    <div className="text-xs text-slate-500">Monthly Report · Design Team</div>
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
          <div className="relative bg-white shadow-sm border border-slate-200 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Modal header */}
            <div className="sticky top-0 bg-white shadow-sm border border-slate-200 border-b border-slate-200 px-6 py-4 flex justify-between items-center rounded-t-2xl z-10">
              <div>
                <div className="text-xs font-bold text-[#E85002] uppercase tracking-wider tracking-widest">Tuần {getWeekInMonth(previewWeek.dateTo)}</div>
                <div className="text-sm font-semibold text-slate-900">{formatWeekLabel(previewWeek.dateFrom, previewWeek.dateTo)}</div>
              </div>
              <button onClick={() => setPreviewWeek(null)} className="text-slate-500 hover:text-slate-800 text-lg leading-none">✕</button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Metrics */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Hoàn thành", value: `${previewWeek.tasks.filter(t => t.status === "done").length}/${previewWeek.tasks.length}`, color: "text-slate-900" },
                  { label: "Đang thực hiện", value: previewWeek.tasks.filter(t => t.status === "inprogress").length, color: "text-amber-500" },
                  { label: "Chưa bắt đầu", value: previewWeek.tasks.filter(t => t.status === "todo").length, color: "text-slate-500" },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-3">
                    <div className="text-xs text-slate-500 mb-1">{m.label}</div>
                    <div className={`text-2xl font-medium ${m.color}`}>{m.value}</div>
                  </div>
                ))}
              </div>

              {/* Projects */}
              {previewWeek.projects.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Tiến độ dự án</div>
                  <div className="space-y-2.5">
                    {previewWeek.projects.map((p, i) => {
                      const allTasks = [...savedWeeks.flatMap(w => w.tasks), ...tasks].filter(t => t.projectId === p.id);
                      const doneTasks = allTasks.filter(t => t.status === "done").length;
                      const pct = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;
                      return (
                      <div key={i}>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-slate-800 w-44 truncate flex-shrink-0">{p.name}</span>
                          <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: p.color }} />
                          </div>
                          <span className="text-xs text-slate-500 w-8 text-right">{pct}%</span>
                        </div>
                        {p.link && (
                          <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-[#E85002] hover:underline ml-0 mt-0.5 block truncate">{p.link}</a>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              )}

              {/* Tasks */}
              {previewWeek.tasks.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Công việc trong tuần</div>
                  <div className="space-y-2">
                    {previewWeek.tasks.map(task => (
                      <div key={task.id} className={`flex items-start gap-3 rounded-xl px-4 py-3 border ${task.status === "done" ? "border-emerald-100 bg-emerald-50/40" : task.status === "inprogress" ? "border-amber-100 bg-amber-50/40" : "border-slate-200"}`}>
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1 ${STATUS_COLORS[task.status]}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-slate-800">{task.name}</div>
                          {task.note && (
                            (task.note ?? "").startsWith("http") ? (
                              <a href={task.note} target="_blank" rel="noreferrer"
                                className="text-xs text-[#E85002] hover:underline mt-0.5 truncate block">
                                {task.note}
                              </a>
                            ) : (
                              <div className="text-xs text-slate-500 mt-0.5 truncate">{task.note}</div>
                            )
                          )}
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded font-medium flex-shrink-0 ${TAG_COLORS[task.tag]}`}>{task.tag}</span>
                        <span className="text-xs text-slate-500 flex-shrink-0">{task.hours}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daily output */}
              {previewWeek.channels.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Daily output – Banner</div>
                  <div className="space-y-2">
                    {previewWeek.channels.map(c => {
                      const pct = c.total > 0 ? Math.min(100, (c.done / c.total) * 100) : 0;
                      const allDone = c.done >= c.total && c.total > 0;
                      return (
                        <div key={c.id} className="flex items-center gap-3">
                          <span className="text-sm text-slate-800 w-40 flex-shrink-0">{c.name}</span>
                          <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${pct}%`, background: allDone ? "#1D9E75" : "#E85002" }} />
                          </div>
                          <span className="text-xs text-slate-500 flex-shrink-0">{c.done}/{c.total} posts</span>
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
                    <div className="border border-slate-200 rounded-xl p-4">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Kế hoạch tuần tới</div>
                      <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{previewWeek.nextWeek}</p>
                    </div>
                  )}
                  {previewWeek.blockers && (
                    <div className="border border-slate-200 rounded-xl p-4">
                      <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Blockers / cần hỗ trợ</div>
                      <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{previewWeek.blockers}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {view === "weekly" && <div className="max-w-2xl mx-auto bg-white shadow-sm border border-slate-200 rounded-2xl shadow-sm border border-slate-200 p-8 print:shadow-none print:border-none print:rounded-none print:p-6 print:bg-white">

        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-slate-200">
          <div>
            <h1 className="text-xl font-medium text-slate-900">Weekly design report</h1>
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <input value={name} onChange={e => setName(e.target.value)}
                className="text-sm text-slate-500 bg-transparent border-b border-dashed border-[#444444] focus:outline-none focus:border-[#E85002] w-40 print:border-none" />
              <span className="text-sm text-slate-500">·</span>
              <input value={role} onChange={e => setRole(e.target.value)}
                className="text-sm text-slate-500 bg-transparent border-b border-dashed border-[#444444] focus:outline-none focus:border-[#E85002] w-36 print:border-none" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs font-medium bg-[#E85002]/10 text-[#E85002] px-3 py-1.5 rounded-lg print:block hidden">
              {formatWeekLabel(dateFrom, dateTo)}
            </div>
            <div className="flex items-center gap-1.5 print:hidden">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="text-xs text-[#E85002] bg-[#E85002]/10 border-none rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E85002]/20 cursor-pointer" />
              <span className="text-xs text-[#E85002]">–</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="text-xs text-[#E85002] bg-[#E85002]/10 border-none rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#E85002]/20 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-1">Tasks hoàn thành</div>
            <div className="text-2xl font-medium text-slate-900">{tasksDone}/{tasks.length}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-1">Đang thực hiện</div>
            <div className="text-2xl font-medium text-amber-500">{tasks.filter(t => t.status === "inprogress").length}</div>
          </div>
          <div className="bg-slate-50 rounded-xl p-3">
            <div className="text-xs text-slate-500 mb-1">Chưa bắt đầu</div>
            <div className="text-2xl font-medium text-slate-500">{tasks.filter(t => t.status === "todo").length}</div>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiến độ dự án</div>
            <button onClick={addProject} className="text-xs text-[#E85002] hover:text-[#E85002] font-medium print:hidden">+ Thêm dự án</button>
          </div>
          <div className="space-y-3">
            {projects.map((p, i) => {
              const allTasks = [...savedWeeks.flatMap(w => w.tasks), ...tasks].filter(t => t.projectId === p.id);
              const doneTasks = allTasks.filter(t => t.status === "done").length;
              const pct = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : 0;
              const isDone = pct === 100 && allTasks.length > 0;
              return (
              <div key={p.id} className="group relative">
                <div className="flex items-center gap-3">
                  <input value={p.name} onChange={e => updateProject(i, "name", e.target.value)}
                    className="text-sm text-slate-800 bg-transparent focus:outline-none w-44 border-b border-dashed border-[#444444] focus:border-[#E85002] print:border-none flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <span className="text-sm font-medium text-slate-800 w-8 text-right">{pct}</span>
                    <span className="text-xs text-slate-500">%</span>
                    {isDone && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Hoàn thành</span>}
                  </div>
                  <button onClick={() => removeProject(i)}
                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs print:hidden">✕</button>
                </div>
                <div className="mt-1 ml-[188px] flex items-center gap-2">
                  {p.link ? (
                    <>
                      <a href={p.link} target="_blank" rel="noreferrer"
                        className="text-xs text-[#E85002] hover:text-[#E85002] truncate max-w-xs print:text-slate-500">
                        {p.link}
                      </a>
                      <input value={p.link} onChange={e => updateProject(i, "link", e.target.value)}
                        placeholder="Đổi link..."
                        className="text-xs text-slate-500 bg-transparent border-b border-dashed border-[#444444] focus:outline-none focus:border-[#E85002] w-24 print:hidden" />
                      <button onClick={() => updateProject(i, "link", "")}
                        className="text-slate-500 hover:text-red-400 text-xs flex-shrink-0 print:hidden">✕</button>
                    </>
                  ) : (
                    <input value={p.link} onChange={e => updateProject(i, "link", e.target.value)}
                      placeholder="Dán link Figma / Drive..."
                      className="text-xs text-slate-500 bg-transparent focus:outline-none placeholder-[#555555] w-full print:hidden" />
                  )}
                </div>
              </div>
            )})}
          </div>
        </div>

        {/* Tasks */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Công việc trong tuần</div>
            <button onClick={addTask} className="text-xs text-[#E85002] hover:text-[#E85002] font-medium print:hidden">+ Thêm task</button>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="border border-slate-200 rounded-xl px-4 py-3 hover:border-[#444444] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`} />
                  <input value={task.name} onChange={e => updateTask(task.id, "name", e.target.value)}
                    className="flex-1 text-sm text-slate-800 bg-transparent focus:outline-none min-w-0" />
                  <select value={task.projectId || ""} onChange={e => updateTask(task.id, "projectId", e.target.value ? Number(e.target.value) : null)}
                    className="text-xs text-slate-500 bg-transparent border-none focus:outline-none cursor-pointer max-w-[120px] truncate">
                    <option value="">-- Dự án --</option>
                    {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <select value={task.tag} onChange={e => updateTask(task.id, "tag", e.target.value as Tag)}
                    className={`text-xs px-2 py-0.5 rounded font-medium border-none focus:outline-none cursor-pointer ${TAG_COLORS[task.tag]}`}>
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select value={task.status} onChange={e => updateTask(task.id, "status", e.target.value as Status)}
                    className="text-xs text-slate-500 bg-transparent border-none focus:outline-none cursor-pointer">
                    {(["done", "inprogress", "todo"] as Status[]).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <input value={task.hours} onChange={e => updateTask(task.id, "hours", e.target.value)}
                    className="text-xs text-slate-500 w-8 text-right bg-transparent focus:outline-none" />
                  <button onClick={() => removeTask(task.id)}
                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-1 print:hidden">✕</button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 ml-5">
                  {(task.note ?? "").startsWith("http") ? (
                    <>
                      <a href={task.note} target="_blank" rel="noreferrer"
                        className="flex-1 text-xs text-[#E85002] hover:text-[#E85002] hover:underline truncate print:text-slate-500">
                        {task.note}
                      </a>
                      <button onClick={() => updateTask(task.id, "note", "")}
                        className="text-slate-500 hover:text-red-400 text-xs flex-shrink-0 print:hidden">✕</button>
                    </>
                  ) : (
                    <>
                      <span className="text-slate-500 text-xs print:hidden">↗</span>
                      <input
                        value={task.note}
                        onChange={e => updateTask(task.id, "note", e.target.value)}
                        placeholder="Link hoặc ghi chú..."
                        className="flex-1 text-xs text-slate-500 bg-transparent focus:outline-none placeholder-[#555555] print:placeholder-transparent"
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
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Daily output – Banner</div>
            <button onClick={addChannel} className="text-xs text-[#E85002] hover:text-[#E85002] font-medium print:hidden">+ Thêm kênh</button>
          </div>
          <div className="space-y-2.5">
            {channels.map(c => {
              const pct = c.total > 0 ? Math.min(100, (c.done / c.total) * 100) : 0;
              const allDone = c.done >= c.total && c.total > 0;
              return (
                <div key={c.id} className="flex items-center gap-3 group">
                  <input value={c.name} onChange={e => updateChannel(c.id, "name", e.target.value)}
                    className="text-sm text-slate-800 bg-transparent focus:outline-none w-40 border-b border-dashed border-[#444444] focus:border-[#E85002] print:border-none flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: allDone ? "#1D9E75" : "#E85002" }} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input type="number" min={0} max={c.total} value={c.done}
                      onChange={e => updateChannel(c.id, "done", Math.min(c.total, Number(e.target.value)))}
                      className="text-xs text-slate-800 font-medium w-6 text-right bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                    <span className="text-xs text-slate-500">/</span>
                    <input type="number" min={1} value={c.total}
                      onChange={e => updateChannel(c.id, "total", Math.max(1, Number(e.target.value)))}
                      className="text-xs text-slate-500 w-6 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                    <span className="text-xs text-slate-500 ml-0.5">posts</span>
                  </div>
                  <button onClick={() => removeChannel(c.id)}
                    className="text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs print:hidden">✕</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next week + Blockers */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Kế hoạch tuần tới</div>
            <textarea value={nextWeek} onChange={e => setNextWeek(e.target.value)}
              rows={5} className="w-full text-sm text-slate-800 bg-transparent resize-none focus:outline-none leading-relaxed placeholder-[#555555]"
              placeholder="• Thêm kế hoạch..." />
          </div>
          <div className="border border-slate-200 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Blockers / cần hỗ trợ</div>
            <textarea value={blockers} onChange={e => setBlockers(e.target.value)}
              rows={5} className="w-full text-sm text-slate-800 bg-transparent resize-none focus:outline-none leading-relaxed placeholder-[#555555]"
              placeholder="• Thêm blocker..." />
          </div>
        </div>

        {/* Legend + Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-slate-200">
          <div className="flex gap-4">
            {(["done", "inprogress", "todo"] as Status[]).map(s => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
          <div className="text-xs text-slate-500">Weekly Report · Design Team</div>
        </div>

      </div>}
    </main>
  );
}


