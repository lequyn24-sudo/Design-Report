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
  UI: "bg-purple-100 text-purple-800",
  UX: "bg-amber-100 text-amber-800",
  Branding: "bg-emerald-100 text-emerald-800",
  Research: "bg-orange-100 text-orange-800",
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

const PROJECT_COLORS = ["#1D9E75", "#534AB7", "#BA7517", "#E05C5C", "#2D7DD2"];

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
  { name: "Design system v2", pct: 60, color: "#534AB7", link: "" },
  { name: "Landing page – Q3", pct: 30, color: "#BA7517", link: "" },
];

export default function Home() {
  const [view, setView] = useState<View>("weekly");
  const [savedWeeks, setSavedWeeks] = useState<WeekSnapshot[]>(() => loadSaved()?.savedWeeks ?? []);
  const [name, setName] = useState(() => loadSaved()?.name ?? "Nguyễn Minh Anh");
  const [role, setRole] = useState(() => loadSaved()?.role ?? "UI/UX Designer");
  const defaultDates = getDefaultDates();
  const [dateFrom, setDateFrom] = useState(() => loadSaved()?.dateFrom ?? defaultDates.from);
  const [dateTo, setDateTo] = useState(() => loadSaved()?.dateTo ?? defaultDates.to);
  const [tasks, setTasks] = useState<Task[]>(() => loadSaved()?.tasks ?? DEFAULT_TASKS);
  const [projects, setProjects] = useState<Project[]>(() => loadSaved()?.projects ?? DEFAULT_PROJECTS);
  const [channels, setChannels] = useState<Channel[]>(() => loadSaved()?.channels ?? DEFAULT_CHANNELS);
  const [nextWeek, setNextWeek] = useState(() => loadSaved()?.nextWeek ?? "• Hoàn thiện prototype checkout\n• Họp review với stakeholder\n• Bắt đầu visual design landing page");
  const [blockers, setBlockers] = useState(() => loadSaved()?.blockers ?? "• Chờ copy từ team content cho landing page\n• Cần xác nhận brand color mới từ marketing");
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      name, role, dateFrom, dateTo, tasks, projects, channels, nextWeek, blockers, savedWeeks,
    }));
  }, [name, role, dateFrom, dateTo, tasks, projects, channels, nextWeek, blockers, savedWeeks]);

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
    <main className="min-h-screen bg-[#f8f7f5] py-10 px-4 print:bg-white print:py-0 print:px-0">

      {/* Toolbar */}
      <div className="max-w-2xl mx-auto mb-4 flex justify-between items-center print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5 text-sm">
            <button onClick={() => setView("weekly")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${view === "weekly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Tuần này
            </button>
            <button onClick={() => setView("monthly")}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors ${view === "monthly" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"}`}>
              Tháng này
              {savedWeeks.length > 0 && <span className="ml-1 text-xs bg-purple-100 text-purple-700 px-1.5 rounded-full">{savedWeeks.length}</span>}
            </button>
          </div>
          <button onClick={() => { if (confirm("Reset về dữ liệu mẫu?")) { setName("Nguyễn Minh Anh"); setRole("UI/UX Designer"); const d = getDefaultDates(); setDateFrom(d.from); setDateTo(d.to); setTasks(DEFAULT_TASKS); setProjects(DEFAULT_PROJECTS); setChannels(DEFAULT_CHANNELS); setNextWeek("• Hoàn thiện prototype checkout\n• Họp review với stakeholder\n• Bắt đầu visual design landing page"); setBlockers("• Chờ copy từ team content cho landing page\n• Cần xác nhận brand color mới từ marketing"); } }}
            className="text-xs text-gray-400 hover:text-gray-600">Reset</button>
        </div>
        <div className="flex items-center gap-2">
          {view === "weekly" && (
            <button onClick={() => { if (confirm(`Lưu tuần ${formatWeekLabel(dateFrom, dateTo)} vào báo cáo tháng?`)) saveWeek(); }}
              className="text-sm border border-purple-300 text-purple-600 hover:bg-purple-50 px-3 py-2 rounded-lg font-medium transition-colors">
              Lưu tuần →
            </button>
          )}
          <button onClick={() => window.print()}
            className="text-sm bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            Export PDF
          </button>
        </div>
      </div>

      {view === "monthly" && (
        <div className="max-w-2xl mx-auto space-y-4">
          {savedWeeks.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
              <div className="text-gray-400 text-sm mb-1">Chưa có tuần nào được lưu</div>
              <div className="text-gray-300 text-xs">Bấm &quot;Lưu tuần →&quot; sau khi điền xong báo cáo tuần.</div>
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
                <div key={weeks[0].id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none">
                  <div className="flex justify-between items-center mb-6 pb-5 border-b border-gray-100">
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Báo cáo tháng</div>
                      <h2 className="text-xl font-medium text-gray-900">{getMonthLabel(weeks[0].dateTo)}</h2>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-medium text-gray-900">{totalDone}<span className="text-base text-gray-400">/{totalAll}</span></div>
                      <div className="text-xs text-gray-400">tasks hoàn thành</div>
                    </div>
                  </div>
                  <div className="mb-6">
                    <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Theo tuần</div>
                    <div className="space-y-1">
                      {weeks.map(w => {
                        const done = w.tasks.filter(t => t.status === "done").length;
                        return (
                          <div key={w.id}
                            onClick={() => loadWeekForEdit(w)}
                            className="flex items-center gap-4 py-2.5 px-3 -mx-3 rounded-lg border-b border-gray-50 last:border-0 hover:bg-purple-50 cursor-pointer transition-colors group/week print:hover:bg-transparent print:cursor-default">
                            <span className="text-xs text-gray-400 w-36 flex-shrink-0">{formatWeekLabel(w.dateFrom, w.dateTo)}</span>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${done === w.tasks.length && w.tasks.length > 0 ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"}`}>
                              {done}/{w.tasks.length} tasks
                            </span>
                            <div className="flex gap-1.5 flex-wrap flex-1">
                              {w.channels.map(c => (
                                <span key={c.id} className={`text-xs px-2 py-0.5 rounded-full ${c.done >= c.total ? "bg-emerald-100 text-emerald-700" : "bg-purple-50 text-purple-600"}`}>
                                  {c.name.split(" ")[0]}: {c.done}/{c.total}
                                </span>
                              ))}
                            </div>
                            <span className="text-xs text-purple-400 opacity-0 group-hover/week:opacity-100 transition-opacity print:hidden flex-shrink-0">Chỉnh sửa →</span>
                            <button
                              onClick={e => { e.stopPropagation(); setSavedWeeks(prev => prev.filter(sw => sw.id !== w.id)); }}
                              className="text-xs text-gray-300 hover:text-red-400 print:hidden flex-shrink-0 ml-1"
                              title="Xóa tuần này"
                            >✕</button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-6 mb-6">
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Daily output tổng</div>
                      <div className="space-y-2">
                        {Object.entries(channelTotals).map(([cname, stat]) => (
                          <div key={cname} className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 w-28 truncate">{cname}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${Math.min(100, (stat.done / stat.total) * 100)}%`, background: stat.done >= stat.total ? "#1D9E75" : "#a78bfa" }} />
                            </div>
                            <span className="text-xs text-gray-500">{stat.done}/{stat.total}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Tiến độ dự án</div>
                      <div className="space-y-2">
                        {latestProjects.map((p, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 truncate w-28">{p.name}</span>
                            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full" style={{ width: `${p.pct}%`, background: p.color }} />
                            </div>
                            <span className="text-xs text-gray-500 w-8 text-right">{p.pct}%</span>
                            {p.link && <a href={p.link} target="_blank" rel="noreferrer" className="text-xs text-purple-500 print:hidden">↗</a>}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-xs text-gray-300">Monthly Report · Design Team</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {view === "weekly" && <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 print:shadow-none print:border-none print:rounded-none print:p-6">

        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Weekly design report</h1>
            <div className="flex gap-2 mt-2 flex-wrap items-center">
              <input value={name} onChange={e => setName(e.target.value)}
                className="text-sm text-gray-500 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-purple-400 w-40 print:border-none" />
              <span className="text-sm text-gray-400">·</span>
              <input value={role} onChange={e => setRole(e.target.value)}
                className="text-sm text-gray-500 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-purple-400 w-36 print:border-none" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <div className="text-xs font-medium bg-purple-50 text-purple-800 px-3 py-1.5 rounded-lg print:block hidden">
              {formatWeekLabel(dateFrom, dateTo)}
            </div>
            <div className="flex items-center gap-1.5 print:hidden">
              <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
                className="text-xs text-purple-800 bg-purple-50 border-none rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer" />
              <span className="text-xs text-purple-400">–</span>
              <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
                className="text-xs text-purple-800 bg-purple-50 border-none rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-200 cursor-pointer" />
            </div>
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-8">
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">Tasks hoàn thành</div>
            <div className="text-2xl font-medium text-gray-900">{tasksDone}/{tasks.length}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">Đang thực hiện</div>
            <div className="text-2xl font-medium text-amber-500">{tasks.filter(t => t.status === "inprogress").length}</div>
          </div>
          <div className="bg-gray-50 rounded-xl p-3">
            <div className="text-xs text-gray-500 mb-1">Chưa bắt đầu</div>
            <div className="text-2xl font-medium text-gray-400">{tasks.filter(t => t.status === "todo").length}</div>
          </div>
        </div>

        {/* Projects */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Tiến độ dự án</div>
            <button onClick={addProject} className="text-xs text-purple-600 hover:text-purple-800 font-medium print:hidden">+ Thêm dự án</button>
          </div>
          <div className="space-y-3">
            {projects.map((p, i) => (
              <div key={i} className="group">
                <div className="flex items-center gap-3">
                  <input value={p.name} onChange={e => updateProject(i, "name", e.target.value)}
                    className="text-sm text-gray-700 bg-transparent focus:outline-none w-44 border-b border-dashed border-gray-200 focus:border-purple-400 print:border-none flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                  </div>
                  <input type="number" min={0} max={100} value={p.pct}
                    onChange={e => updateProject(i, "pct", Math.min(100, Number(e.target.value)))}
                    className="text-xs text-gray-500 w-10 text-right bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                  <span className="text-xs text-gray-400">%</span>
                  <button onClick={() => removeProject(i)}
                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs print:hidden">✕</button>
                </div>
                <div className="flex items-center gap-1.5 mt-1 ml-0">
                  {p.link ? (
                    <>
                      <a href={p.link} target="_blank" rel="noreferrer"
                        className="text-xs text-purple-500 hover:text-purple-700 truncate max-w-xs print:text-gray-500">
                        {p.link}
                      </a>
                      <input value={p.link} onChange={e => updateProject(i, "link", e.target.value)}
                        className="sr-only" />
                      <button onClick={() => updateProject(i, "link", "")}
                        className="text-gray-300 hover:text-red-400 text-xs flex-shrink-0 print:hidden">✕</button>
                    </>
                  ) : (
                    <input
                      value={p.link}
                      onChange={e => updateProject(i, "link", e.target.value)}
                      placeholder="Dán link Figma / Drive..."
                      className="text-xs text-gray-400 bg-transparent focus:outline-none placeholder-gray-200 w-full print:hidden"
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
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Công việc trong tuần</div>
            <button onClick={addTask} className="text-xs text-purple-600 hover:text-purple-800 font-medium print:hidden">+ Thêm task</button>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`} />
                  <input value={task.name} onChange={e => updateTask(task.id, "name", e.target.value)}
                    className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none min-w-0" />
                  <select value={task.tag} onChange={e => updateTask(task.id, "tag", e.target.value as Tag)}
                    className={`text-xs px-2 py-0.5 rounded font-medium border-none focus:outline-none cursor-pointer ${TAG_COLORS[task.tag]}`}>
                    {TAGS.map(t => <option key={t}>{t}</option>)}
                  </select>
                  <select value={task.status} onChange={e => updateTask(task.id, "status", e.target.value as Status)}
                    className="text-xs text-gray-500 bg-transparent border-none focus:outline-none cursor-pointer">
                    {(["done", "inprogress", "todo"] as Status[]).map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                  <input value={task.hours} onChange={e => updateTask(task.id, "hours", e.target.value)}
                    className="text-xs text-gray-400 w-8 text-right bg-transparent focus:outline-none" />
                  <button onClick={() => removeTask(task.id)}
                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-1 print:hidden">✕</button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 ml-5">
                  <span className="text-gray-300 text-xs print:hidden">↗</span>
                  <input
                    value={task.note}
                    onChange={e => updateTask(task.id, "note", e.target.value)}
                    placeholder="Link hoặc ghi chú..."
                    className="flex-1 text-xs text-gray-400 bg-transparent focus:outline-none placeholder-gray-200 print:placeholder-transparent"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily output */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Daily output – Banner</div>
            <button onClick={addChannel} className="text-xs text-purple-600 hover:text-purple-800 font-medium print:hidden">+ Thêm kênh</button>
          </div>
          <div className="space-y-2.5">
            {channels.map(c => {
              const pct = c.total > 0 ? Math.min(100, (c.done / c.total) * 100) : 0;
              const allDone = c.done >= c.total && c.total > 0;
              return (
                <div key={c.id} className="flex items-center gap-3 group">
                  <input value={c.name} onChange={e => updateChannel(c.id, "name", e.target.value)}
                    className="text-sm text-gray-700 bg-transparent focus:outline-none w-40 border-b border-dashed border-gray-200 focus:border-purple-400 print:border-none flex-shrink-0" />
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, background: allDone ? "#1D9E75" : "#a78bfa" }} />
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <input type="number" min={0} max={c.total} value={c.done}
                      onChange={e => updateChannel(c.id, "done", Math.min(c.total, Number(e.target.value)))}
                      className="text-xs text-gray-700 font-medium w-6 text-right bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                    <span className="text-xs text-gray-400">/</span>
                    <input type="number" min={1} value={c.total}
                      onChange={e => updateChannel(c.id, "total", Math.max(1, Number(e.target.value)))}
                      className="text-xs text-gray-400 w-6 bg-transparent focus:outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none" />
                    <span className="text-xs text-gray-300 ml-0.5">posts</span>
                  </div>
                  <button onClick={() => removeChannel(c.id)}
                    className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs print:hidden">✕</button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Next week + Blockers */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Kế hoạch tuần tới</div>
            <textarea value={nextWeek} onChange={e => setNextWeek(e.target.value)}
              rows={5} className="w-full text-sm text-gray-700 bg-transparent resize-none focus:outline-none leading-relaxed placeholder-gray-300"
              placeholder="• Thêm kế hoạch..." />
          </div>
          <div className="border border-gray-100 rounded-xl p-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Blockers / cần hỗ trợ</div>
            <textarea value={blockers} onChange={e => setBlockers(e.target.value)}
              rows={5} className="w-full text-sm text-gray-700 bg-transparent resize-none focus:outline-none leading-relaxed placeholder-gray-300"
              placeholder="• Thêm blocker..." />
          </div>
        </div>

        {/* Legend + Footer */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <div className="flex gap-4">
            {(["done", "inprogress", "todo"] as Status[]).map(s => (
              <span key={s} className="flex items-center gap-1.5 text-xs text-gray-400">
                <span className={`w-2 h-2 rounded-full ${STATUS_COLORS[s]}`} />
                {STATUS_LABELS[s]}
              </span>
            ))}
          </div>
          <div className="text-xs text-gray-300">Weekly Report · Design Team</div>
        </div>

      </div>}
    </main>
  );
}
