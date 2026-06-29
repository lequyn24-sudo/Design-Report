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
  projectName: string;
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
  link?: string;
  pct?: number | string;
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
  { id: 1, projectName: "App redesign – Checkout", name: "Thiết kế luồng thanh toán (checkout flow)", tag: "UI", status: "done", hours: "8h", note: "" },
  { id: 2, projectName: "Design system v2", name: "Cập nhật icon set trong design system", tag: "Branding", status: "done", hours: "4h", note: "" },
  { id: 3, projectName: "App redesign – Checkout", name: "User testing – màn hình onboarding", tag: "Research", status: "done", hours: "3h", note: "" },
  { id: 4, projectName: "Landing page – Q3", name: "Wireframe landing page Q3 campaign", tag: "UX", status: "inprogress", hours: "5h", note: "" },
  { id: 5, projectName: "App redesign – Checkout", name: "Handoff file cho dev – sprint 12", tag: "UI", status: "todo", hours: "—", note: "" },
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
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isMonthlyOnly, setIsMonthlyOnly] = useState(false);

  useEffect(() => {
    let hashSaved = null;

    const shareId = typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("share")
      : null;

    if (shareId) {
      fetch(`/api/share/${shareId}`)
        .then(res => res.ok ? res.json() : null)
        .then(parsed => {
          if (parsed) {
            setIsMonthlyOnly(true);
            setIsReadOnly(true);
            document.body.classList.add("is-readonly");
            if (parsed.savedWeeks) setSavedWeeks(parsed.savedWeeks);
            if (parsed.name) setName(parsed.name);
            if (parsed.role) setRole(parsed.role);
            setView("monthly");
          }
          setIsLoaded(true);
        })
        .catch(() => setIsLoaded(true));
      return;
    }

    if (typeof window !== "undefined" && window.location.hash.startsWith("#monthly=")) {
      try {
        const base64 = window.location.hash.replace("#monthly=", "");
        const parsed = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
        setIsMonthlyOnly(true);
        setIsReadOnly(true);
        document.body.classList.add("is-readonly");
        if (parsed.savedWeeks) setSavedWeeks(parsed.savedWeeks);
        if (parsed.name) setName(parsed.name);
        if (parsed.role) setRole(parsed.role);
        setView("monthly");
        setIsLoaded(true);
        return;
      } catch {
        console.error("Invalid monthly share link");
      }
    }

    if (typeof window !== "undefined" && window.location.hash.startsWith("#data=")) {
      try {
        const base64 = window.location.hash.replace("#data=", "");
        hashSaved = JSON.parse(decodeURIComponent(escape(window.atob(base64))));
        setIsReadOnly(true);
        document.body.classList.add("is-readonly");
      } catch {
        console.error("Invalid share link");
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const applyData = (saved: any) => {
      if (saved.savedWeeks) {
        setSavedWeeks(saved.savedWeeks.map((w: WeekSnapshot) => {
          const oldProjects = w.projects?.map((p: Project) => ({ ...p, id: p.id || Date.now() + Math.random() })) || [];
          return {
            ...w,
            projects: oldProjects,
            tasks: w.tasks?.map((t: Task & { projectId?: number }) => {
              let pName = t.projectName || "";
              if (!pName && t.projectId) {
                const p = oldProjects.find((x: Project) => x.id === t.projectId);
                if (p) pName = p.name;
              }
              return { ...t, projectName: pName };
            }) || []
          };
        }));
      }
      if (saved.name) setName(saved.name);
      if (saved.role) setRole(saved.role);
      if (saved.dateFrom) setDateFrom(saved.dateFrom);
      if (saved.dateTo) setDateTo(saved.dateTo);
      if (saved.tasks) {
        setTasks(saved.tasks.map((t: Task & { projectId?: number }) => {
          let pName = t.projectName || "";
          if (!pName && t.projectId && saved.projects) {
            const p = saved.projects.find((x: Project) => x.id === t.projectId);
            if (p) pName = p.name;
          }
          return { ...t, projectName: pName };
        }));
      }
      if (saved.projects) setProjects(saved.projects.map((p: Project) => ({ ...p, id: p.id || Date.now() + Math.random() })));
      if (saved.channels) setChannels(saved.channels);
      if (saved.nextWeek) setNextWeek(saved.nextWeek);
      if (saved.blockers) setBlockers(saved.blockers);
      setIsLoaded(true);
    };

    if (hashSaved) {
      applyData(hashSaved);
    } else {
      fetch('/api/report')
        .then(res => res.json())
        .then(data => {
          if (data && data.tasks) {
            applyData(data);
          } else {
            const local = loadSaved();
            if (local) applyData(local);
            else setIsLoaded(true);
          }
        })
        .catch(err => {
          console.error("Lỗi tải từ mây", err);
          const local = loadSaved();
          if (local) applyData(local);
          else setIsLoaded(true);
        });
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || isReadOnly) return;
    const data = { name, role, dateFrom, dateTo, tasks, projects, channels, nextWeek, blockers, savedWeeks };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    
    const timer = setTimeout(() => {
      fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      }).catch(err => console.error("Lỗi đồng bộ mây", err));
    }, 2000);
    return () => clearTimeout(timer);
  }, [name, role, dateFrom, dateTo, tasks, projects, channels, nextWeek, blockers, savedWeeks, isLoaded, isReadOnly]);

  const handleShare = async () => {
    if (savedWeeks.length === 0) {
      alert("Chưa có tuần nào được lưu.\nHãy nhập báo cáo tuần và bấm \"Lưu tuần →\" trước nhé.");
      return;
    }
    try {
      const res = await fetch('/api/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, role, savedWeeks }),
      });
      if (res.ok) {
        const { id } = await res.json();
        const url = window.location.origin + window.location.pathname + "?share=" + id;
        await navigator.clipboard.writeText(url);
        alert("Đã copy link!\nSếp mở link sẽ chỉ thấy báo cáo tháng — nhấp vào từng tuần để xem chi tiết.");
        return;
      }
    } catch { /* fallback below */ }
    // fallback: base64 in URL
    const data = JSON.stringify({ name, role, savedWeeks });
    const base64 = window.btoa(unescape(encodeURIComponent(data)));
    const url = window.location.origin + window.location.pathname + "#monthly=" + base64;
    await navigator.clipboard.writeText(url);
    alert("Đã copy link!");
  };

  const tasksDone = tasks.filter(t => t.status === "done").length;

  const addTask = () =>
    setTasks(prev => [...prev, { id: Date.now(), projectName: "", name: "Task mới", tag: "UI", status: "todo", hours: "—", note: "" }]);

  const updateTask = (id: number, field: keyof Task, value: string | number | null) =>
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));

  const removeTask = (id: number) =>
    setTasks(prev => prev.filter(t => t.id !== id));

  const updateProject = (name: string, field: keyof Project, value: string | number) => {
    setProjects(prev => {
      const idx = prev.findIndex(p => p.name === name);
      if (idx >= 0) {
        return prev.map((p, i) => i === idx ? { ...p, [field]: value } : p);
      } else {
        const color = PROJECT_COLORS[prev.length % PROJECT_COLORS.length];
        return [...prev, { id: Date.now(), name, color, link: "", [field]: value }];
      }
    });
  };

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
      return updated.sort((a, b) => (a.dateFrom as string).localeCompare(b.dateFrom as string));
    });
    // reset for next week: carry over uncompleted tasks
    setTasks(tasks.filter(t => t.status !== "done"));
    setChannels(prev => prev.map(c => ({ ...c, done: 0 })));
    setNextWeek("");
    setBlockers("");
    
    // Shift dates by 7 days
    const f = new Date(dateFrom + "T00:00:00");
    f.setDate(f.getDate() + 7);
    const t = new Date(dateTo + "T00:00:00");
    t.setDate(t.getDate() + 7);
    const toISO = (d: Date) => d.toISOString().slice(0, 10);
    setDateFrom(toISO(f));
    setDateTo(toISO(t));
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
        {isMonthlyOnly ? (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-lg">
              Báo cáo tháng · Chỉ xem
            </span>
          </div>
        ) : (
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
              className="hide-on-readonly text-xs text-slate-500 hover:text-slate-500">Reset</button>
          </div>
        )}
        <div className="flex items-center gap-2">
          {!isMonthlyOnly && view === "weekly" && (
            <button onClick={() => { if (confirm(`Lưu tuần ${formatWeekLabel(dateFrom, dateTo)} vào báo cáo tháng?`)) saveWeek(); }}
              className="hide-on-readonly text-sm border border-[#E85002]/40 text-[#E85002] hover:bg-[#E85002]/10 px-3 py-2 rounded-lg font-medium transition-colors">
              Lưu tuần →
            </button>
          )}
          {!isMonthlyOnly && (
            <button onClick={handleShare}
              className="text-sm border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-3 py-2 rounded-lg font-medium transition-colors print:hidden flex items-center gap-1.5 shadow-sm">
              Chia sẻ báo cáo tháng
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
            <div className="bg-white shadow-sm border border-slate-200 rounded-2xl p-12 text-center">
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
                <div key={weeks[0].id} className="bg-white shadow-sm border border-slate-200 rounded-2xl p-8 print:shadow-none print:border-none print:bg-white">
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
                            onClick={() => isMonthlyOnly ? setPreviewWeek(w) : loadWeekForEdit(w)}
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
                            {isMonthlyOnly ? (
                              <span className="text-xs text-slate-400 flex-shrink-0 print:hidden">Xem chi tiết →</span>
                            ) : (
                              <div className="flex items-center gap-2 opacity-0 group-hover/week:opacity-100 transition-opacity print:hidden flex-shrink-0">
                                <button
                                  onClick={e => { e.stopPropagation(); setPreviewWeek(w); }}
                                  className="text-xs text-slate-500 hover:text-slate-800 border border-[#444444] hover:border-[#666666] px-2 py-0.5 rounded-md"
                                >Xem</button>
                                <span className="text-xs text-[#E85002]">Sửa →</span>
                              </div>
                            )}
                            {!isMonthlyOnly && (
                              <button
                                onClick={e => { e.stopPropagation(); setSavedWeeks(prev => prev.filter(sw => sw.id !== w.id)); }}
                                className="text-xs text-slate-500 hover:text-red-400 print:hidden flex-shrink-0 ml-1"
                                title="Xóa tuần này"
                              >✕</button>
                            )}
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
                          const allTasksRaw = [...savedWeeks.flatMap(w => w.tasks), ...tasks];
                          const latestTasksMap = new Map<number, Task>();
                          allTasksRaw.forEach(t => latestTasksMap.set(t.id, t));
                          const allTasks = Array.from(latestTasksMap.values()).filter(t => t.projectName === p.name);
                          
                          const doneTasks = allTasks.filter(t => t.status === "done").length;
                          const pct = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : (p.pct !== undefined ? Number(p.pct) : 0);
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
                      const allTasksRaw = [...savedWeeks.flatMap(w => w.tasks), ...tasks];
                      const latestTasksMap = new Map<number, Task>();
                      allTasksRaw.forEach(t => latestTasksMap.set(t.id, t));
                      const allTasks = Array.from(latestTasksMap.values()).filter(t => t.projectName === p.name);
                      
                      const doneTasks = allTasks.filter(t => t.status === "done").length;
                      const pct = allTasks.length > 0 ? Math.round((doneTasks / allTasks.length) * 100) : (p.pct !== undefined ? Number(p.pct) : 0);
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

      {view === "weekly" && <div className="max-w-2xl mx-auto bg-white shadow-sm border border-slate-200 rounded-2xl p-8 print:shadow-none print:border-none print:rounded-none print:p-6 print:bg-white">

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
          </div>
          <div className="space-y-3">
            {Array.from(new Set(tasks.map(t => t.projectName).filter(Boolean))).map((pName) => {
              const p = projects.find(proj => proj.name === pName) || 
                        savedWeeks.flatMap(w => w.projects || []).find(proj => proj.name === pName) ||
                        { id: Date.now(), name: pName, color: PROJECT_COLORS[Math.floor(Math.random() * PROJECT_COLORS.length)], link: "" };
              
              const doneTasks = tasks.filter(t => t.projectName === pName && t.status === "done").length;
              const totalTasks = tasks.filter(t => t.projectName === pName).length;
              const isDone = totalTasks > 0 && doneTasks === totalTasks;
              const pct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : (p.pct !== undefined ? Number(p.pct) : 0);

              return (
              <div key={pName} className="group relative">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-800 w-48 truncate">{pName}</span>
                  <div className="flex-1 h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: p.color }} />
                  </div>
                  <div className="flex items-center justify-end w-24">
                    <span className="text-sm font-medium text-slate-800 w-8 text-right">{pct}</span>
                    <span className="text-xs text-slate-500">%</span>
                    {isDone && <span className="ml-2 text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded font-medium">Hoàn thành</span>}
                  </div>
                </div>
                <div className="mt-1 ml-[204px] flex items-center gap-2">
                  {p.link ? (
                    <>
                      <a href={p.link} target="_blank" rel="noreferrer"
                        className="text-xs text-[#E85002] hover:text-[#E85002] truncate max-w-xs print:text-slate-500">
                        {p.link}
                      </a>
                      <input value={p.link} onChange={e => updateProject(pName, "link", e.target.value)}
                        placeholder="Đổi link..."
                        className="text-xs text-slate-500 bg-transparent border-b border-dashed border-[#444444] focus:outline-none focus:border-[#E85002] w-24 print:hidden" />
                      <button onClick={() => updateProject(pName, "link", "")}
                        className="hide-on-readonly text-slate-500 hover:text-red-400 text-xs flex-shrink-0 print:hidden">✕</button>
                    </>
                  ) : (
                    <input value={p.link || ""} onChange={e => updateProject(pName, "link", e.target.value)}
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
            <button onClick={addTask} className="hide-on-readonly text-xs text-[#E85002] hover:text-[#E85002] font-medium print:hidden">+ Thêm task</button>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="border border-slate-200 rounded-xl px-4 py-3 hover:border-[#444444] transition-colors group">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_COLORS[task.status]}`} />
                  <input value={task.name} onChange={e => updateTask(task.id, "name", e.target.value)}
                    className="flex-1 text-sm text-slate-800 bg-transparent focus:outline-none min-w-0" />
                  <input value={task.projectName} onChange={e => updateTask(task.id, "projectName", e.target.value)}
                    list="project-names"
                    placeholder="-- Tên dự án --"
                    className="text-xs text-slate-500 bg-transparent border-b border-dashed border-slate-300 focus:outline-none focus:border-[#E85002] max-w-[140px] truncate" />
                  <datalist id="project-names">
                    {Array.from(new Set([...projects.map(p => p.name), ...savedWeeks.flatMap(w => w.projects?.map(p => p.name) || [])])).filter(Boolean).map(name => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
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
                    className="hide-on-readonly text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-1 print:hidden">✕</button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 ml-5">
                  {(task.note ?? "").startsWith("http") ? (
                    <>
                      <a href={task.note} target="_blank" rel="noreferrer"
                        className="flex-1 text-xs text-[#E85002] hover:text-[#E85002] hover:underline truncate print:text-slate-500">
                        {task.note}
                      </a>
                      <button onClick={() => updateTask(task.id, "note", "")}
                        className="hide-on-readonly text-slate-500 hover:text-red-400 text-xs flex-shrink-0 print:hidden">✕</button>
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


