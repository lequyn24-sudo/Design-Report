"use client";
import { useState } from "react";

const TAGS = ["UI", "UX", "Branding", "Research", "Motion"] as const;
type Tag = typeof TAGS[number];
type Status = "done" | "inprogress" | "todo";

interface Task {
  id: number;
  name: string;
  tag: Tag;
  status: Status;
  hours: string;
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

interface Project {
  name: string;
  pct: number;
  color: string;
}

const defaultTasks: Task[] = [
  { id: 1, name: "Thiết kế luồng thanh toán (checkout flow)", tag: "UI", status: "done", hours: "8h" },
  { id: 2, name: "Cập nhật icon set trong design system", tag: "Branding", status: "done", hours: "4h" },
  { id: 3, name: "User testing – màn hình onboarding", tag: "Research", status: "done", hours: "3h" },
  { id: 4, name: "Wireframe landing page Q3 campaign", tag: "UX", status: "inprogress", hours: "5h" },
  { id: 5, name: "Handoff file cho dev – sprint 12", tag: "UI", status: "todo", hours: "—" },
];

const defaultProjects: Project[] = [
  { name: "App redesign – Checkout", pct: 85, color: "#1D9E75" },
  { name: "Design system v2", pct: 60, color: "#534AB7" },
  { name: "Landing page – Q3", pct: 30, color: "#BA7517" },
];

export default function Home() {
  const [name, setName] = useState("Nguyễn Minh Anh");
  const [role, setRole] = useState("UI/UX Designer");
  const [weekLabel, setWeekLabel] = useState("16 – 20/06/2025");
  const [tasks, setTasks] = useState<Task[]>(defaultTasks);
  const [projects, setProjects] = useState<Project[]>(defaultProjects);
  const [nextWeek, setNextWeek] = useState("• Hoàn thiện prototype checkout\n• Họp review với stakeholder\n• Bắt đầu visual design landing page");
  const [blockers, setBlockers] = useState("• Chờ copy từ team content cho landing page\n• Cần xác nhận brand color mới từ marketing");
  const [metrics, setMetrics] = useState({ tasks: 8, total: 10, hours: 32, screens: 24, reviews: 3 });

  const addTask = () => {
    setTasks(prev => [...prev, { id: Date.now(), name: "Task mới", tag: "UI", status: "todo", hours: "—" }]);
  };

  const updateTask = (id: number, field: keyof Task, value: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const removeTask = (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const updateProject = (i: number, field: keyof Project, value: string | number) => {
    setProjects(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p));
  };

  return (
    <main className="min-h-screen bg-[#f8f7f5] py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8">

        {/* Header */}
        <div className="flex justify-between items-start mb-8 pb-6 border-b border-gray-100">
          <div>
            <h1 className="text-xl font-medium text-gray-900">Weekly design report</h1>
            <div className="flex gap-2 mt-2 flex-wrap">
              <input value={name} onChange={e => setName(e.target.value)}
                className="text-sm text-gray-500 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-purple-400 w-40" />
              <span className="text-sm text-gray-400">·</span>
              <input value={role} onChange={e => setRole(e.target.value)}
                className="text-sm text-gray-500 bg-transparent border-b border-dashed border-gray-300 focus:outline-none focus:border-purple-400 w-36" />
            </div>
          </div>
          <input value={weekLabel} onChange={e => setWeekLabel(e.target.value)}
            className="text-xs font-medium bg-purple-50 text-purple-800 px-3 py-1.5 rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-purple-200 text-center w-36" />
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Tasks hoàn thành", value: `${metrics.tasks}/${metrics.total}`, key: "tasks" },
            { label: "Giờ thiết kế", value: `${metrics.hours}h`, key: "hours" },
            { label: "Screens / frames", value: metrics.screens, key: "screens" },
            { label: "Feedback rounds", value: metrics.reviews, key: "reviews" },
          ].map(m => (
            <div key={m.key} className="bg-gray-50 rounded-xl p-3">
              <div className="text-xs text-gray-500 mb-1">{m.label}</div>
              <div className="text-2xl font-medium text-gray-900">{m.value}</div>
            </div>
          ))}
        </div>

        {/* Projects */}
        <div className="mb-8">
          <div className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Tiến độ dự án</div>
          <div className="space-y-3">
            {projects.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <input value={p.name} onChange={e => updateProject(i, "name", e.target.value)}
                  className="text-sm text-gray-700 bg-transparent focus:outline-none w-44 border-b border-dashed border-gray-200 focus:border-purple-400" />
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${p.pct}%`, background: p.color }} />
                </div>
                <input type="number" min={0} max={100} value={p.pct}
                  onChange={e => updateProject(i, "pct", Number(e.target.value))}
                  className="text-xs text-gray-500 w-10 text-right bg-transparent focus:outline-none" />
                <span className="text-xs text-gray-400">%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-3">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wider">Công việc trong tuần</div>
            <button onClick={addTask} className="text-xs text-purple-600 hover:text-purple-800 font-medium">+ Thêm task</button>
          </div>
          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-3 hover:border-gray-200 transition-colors group">
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
                  className="text-gray-300 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity text-xs ml-1">✕</button>
              </div>
            ))}
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
      </div>
    </main>
  );
}
