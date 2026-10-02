import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Check, Search, CalendarDays, X } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", bar: "border-l-emerald-400" },
  medium: { label: "กลาง", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", bar: "border-l-amber-400" },
  high: { label: "สูง", badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", bar: "border-l-rose-400" },
};
const ORDER = ["low", "medium", "high"];

const CATEGORIES = {
  work: { label: "งาน", tag: "bg-sky-50 text-sky-700" },
  personal: { label: "ส่วนตัว", tag: "bg-violet-50 text-violet-700" },
  shopping: { label: "ช็อปปิ้ง", tag: "bg-pink-50 text-pink-700" },
  health: { label: "สุขภาพ", tag: "bg-teal-50 text-teal-700" },
};
const CAT_KEYS = Object.keys(CATEGORIES);

const FILTERS = [
  { key: "all", label: "ทั้งหมด" },
  { key: "active", label: "ยังไม่เสร็จ" },
  { key: "completed", label: "เสร็จแล้ว" },
];

const EMPTY = {
  all: "ยังไม่มีรายการ เพิ่มงานแรกของคุณด้านบนได้เลย",
  active: "ไม่มีงานค้าง เยี่ยมมาก!",
  completed: "ยังไม่มีงานที่เสร็จ",
};

const fmt = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const dayOffset = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return fmt(d);
};
const shortDate = (s) =>
  new Date(s + "T00:00:00").toLocaleDateString("th-TH", { day: "numeric", month: "short" });

function dueBadge(todo, today) {
  if (!todo.due) return null;
  const d = shortDate(todo.due);
  if (todo.done) return { text: d, cls: "bg-gray-100 text-gray-500 border-gray-200" };
  if (todo.due < today) return { text: `เลยกำหนด ${d}`, cls: "bg-red-50 text-red-700 border-red-200" };
  if (todo.due === today) return { text: "ครบกำหนดวันนี้", cls: "bg-yellow-50 text-yellow-800 border-yellow-300" };
  return { text: d, cls: "bg-gray-50 text-gray-600 border-gray-200" };
}

function TodoItem({ todo, today, onToggle, onDelete, onEdit, onCyclePriority, onCycleCategory }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];
  const c = CATEGORIES[todo.category];
  const due = dueBadge(todo, today);

  useEffect(() => {
    if (editing) inputRef.current?.select();
  }, [editing]);

  const save = () => {
    const t = draft.trim();
    if (t) onEdit(todo.id, t);
    else setDraft(todo.text);
    setEditing(false);
  };
  const cancel = () => {
    setDraft(todo.text);
    setEditing(false);
  };

  const hidden = todo.leaving || todo.entering;

  return (
    <li
      style={{
        maxHeight: hidden ? 0 : 160,
        opacity: hidden ? 0 : 1,
        transform: todo.leaving ? "translateX(24px)" : "none",
        marginBottom: hidden ? 0 : 10,
        transition: "all 280ms ease",
        overflow: "hidden",
      }}
    >
      <div className={`flex items-start gap-3 bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${p.bar} px-3 py-3 sm:px-4`}>
        <button
          onClick={() => onToggle(todo.id)}
          aria-label={todo.done ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จแล้ว"}
          className={`shrink-0 mt-0.5 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
            todo.done ? "bg-gray-800 border-gray-800" : "bg-white border-gray-300 hover:border-gray-500"
          }`}
        >
          {todo.done && <Check size={14} className="text-white" strokeWidth={3} />}
        </button>

        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              ref={inputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={save}
              onKeyDown={(e) => {
                if (e.key === "Enter") save();
                if (e.key === "Escape") cancel();
              }}
              className="w-full px-2 py-1 -my-1 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800"
            />
          ) : (
            <span
              onDoubleClick={() => setEditing(true)}
              title="ดับเบิลคลิกเพื่อแก้ไข"
              className={`block break-words cursor-text select-none transition-colors ${
                todo.done ? "line-through text-gray-400" : "text-gray-800"
              }`}
            >
              {todo.text}
            </span>
          )}
          <div className="flex flex-wrap items-center gap-1.5 mt-2">
            <button
              onClick={() => onCyclePriority(todo.id)}
              title="คลิกเพื่อเปลี่ยนระดับความสำคัญ"
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-0.5 rounded-full border ${p.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
              {p.label}
            </button>
            <button
              onClick={() => onCycleCategory(todo.id)}
              title="คลิกเพื่อเปลี่ยนหมวดหมู่"
              className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${c.tag}`}
            >
              {c.label}
            </button>
            {due && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${due.cls}`}>
                <CalendarDays size={12} />
                {due.text}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => onDelete(todo.id)}
          aria-label="ลบ"
          className="shrink-0 p-1.5 rounded-md text-gray-300 hover:text-rose-600 hover:bg-rose-50 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
    </li>
  );
}

function Donut({ segments, percent }) {
  const R = 40;
  const C = 2 * Math.PI * R;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let offset = 0;
  return (
    <svg viewBox="0 0 100 100" className="w-24 h-24 shrink-0" role="img" aria-label={`เสร็จแล้ว ${percent}%`}>
      <circle cx="50" cy="50" r={R} fill="none" stroke="#f3f4f6" strokeWidth="12" />
      {total > 0 &&
        segments.map((s) => {
          const len = (s.value / total) * C;
          const el = (
            <circle
              key={s.label}
              cx="50"
              cy="50"
              r={R}
              fill="none"
              stroke={s.color}
              strokeWidth="12"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-offset}
              transform="rotate(-90 50 50)"
            />
          );
          offset += len;
          return s.value > 0 ? el : null;
        })}
      <text x="50" y="55" textAnchor="middle" fontSize="18" fontWeight="700" fill="#111827">
        {percent}%
      </text>
    </svg>
  );
}

export default function TodoApp() {
  const today = fmt(new Date());
  const [todos, setTodos] = useState([
    { id: 1, text: "ตอบอีเมลลูกค้า", done: false, priority: "high", category: "work", due: dayOffset(0) },
    { id: 2, text: "ซื้อของเข้าบ้าน", done: false, priority: "medium", category: "shopping", due: dayOffset(2) },
    { id: 3, text: "อ่านหนังสือ 20 หน้า", done: true, priority: "low", category: "personal", due: dayOffset(-1) },
    { id: 4, text: "ส่งรายงานประจำสัปดาห์", done: false, priority: "high", category: "work", due: dayOffset(-2) },
    { id: 5, text: "วิ่งสวนสาธารณะ 30 นาที", done: false, priority: "low", category: "health", due: "" },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [category, setCategory] = useState("personal");
  const [due, setDue] = useState("");
  const [filter, setFilter] = useState("all");
  const [catFilter, setCatFilter] = useState("all");
  const [query, setQuery] = useState("");
  const nextId = useRef(6);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    const id = nextId.current++;
    setTodos((prev) => [{ id, text: t, done: false, priority, category, due, entering: true }, ...prev]);
    setText("");
    setDue("");
    setTimeout(() => {
      setTodos((prev) => prev.map((x) => (x.id === id ? { ...x, entering: false } : x)));
    }, 20);
  };

  const patch = (id, fn) => setTodos((p) => p.map((t) => (t.id === id ? fn(t) : t)));
  const toggle = (id) => patch(id, (t) => ({ ...t, done: !t.done }));
  const edit = (id, newText) => patch(id, (t) => ({ ...t, text: newText }));
  const cyclePriority = (id) => patch(id, (t) => ({ ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] }));
  const cycleCategory = (id) => patch(id, (t) => ({ ...t, category: CAT_KEYS[(CAT_KEYS.indexOf(t.category) + 1) % CAT_KEYS.length] }));

  const remove = (id) => {
    patch(id, (t) => ({ ...t, leaving: true }));
    setTimeout(() => setTodos((p) => p.filter((t) => t.id !== id)), 300);
  };
  const clearCompleted = () => {
    const ids = todos.filter((t) => t.done).map((t) => t.id);
    setTodos((p) => p.map((t) => (t.done ? { ...t, leaving: true } : t)));
    setTimeout(() => setTodos((p) => p.filter((t) => !ids.includes(t.id))), 300);
  };

  const total = todos.length;
  const completedCount = todos.filter((t) => t.done).length;
  const overdueCount = todos.filter((t) => !t.done && t.due && t.due < today).length;
  const remaining = total - completedCount;
  const percent = total ? Math.round((completedCount / total) * 100) : 0;
  const segments = [
    { label: "เสร็จแล้ว", value: completedCount, color: "#10b981" },
    { label: "ค้างอยู่", value: remaining - overdueCount, color: "#94a3b8" },
    { label: "เลยกำหนด", value: overdueCount, color: "#ef4444" },
  ];

  const q = query.trim().toLowerCase();
  const visible = todos.filter(
    (t) =>
      (filter === "all" ? true : filter === "active" ? !t.done : t.done) &&
      (catFilter === "all" || t.category === catFilter) &&
      (!q || t.text.toLowerCase().includes(q))
  );
  const filtering = q || catFilter !== "all";

  const catItems = [{ key: "all", label: "ทุกหมวด", count: total }].concat(
    CAT_KEYS.map((k) => ({ key: k, label: CATEGORIES[k].label, count: todos.filter((t) => t.category === k).length }))
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:py-10 sm:px-4" style={{ fontFamily: "'Noto Sans Thai', 'Sarabun', system-ui, sans-serif" }}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-5">รายการสิ่งที่ต้องทำ</h1>

        <div className="flex flex-col md:flex-row gap-5">
          {/* Sidebar */}
          <aside className="md:w-56 shrink-0 space-y-4">
            <nav className="flex md:flex-col gap-2 overflow-x-auto pb-1 md:pb-0">
              {catItems.map((c) => (
                <button
                  key={c.key}
                  onClick={() => setCatFilter(c.key)}
                  className={`shrink-0 flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    catFilter === c.key ? "bg-gray-900 text-white" : "bg-white text-gray-600 border border-gray-100 shadow-sm hover:bg-gray-100"
                  }`}
                >
                  <span>{c.label}</span>
                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${catFilter === c.key ? "bg-white bg-opacity-20" : "bg-gray-100 text-gray-500"}`}>
                    {c.count}
                  </span>
                </button>
              ))}
            </nav>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center gap-4">
                <Donut segments={segments} percent={percent} />
                <dl className="text-sm space-y-1">
                  <div className="flex gap-2"><dt className="text-gray-500">ทั้งหมด</dt><dd className="font-semibold text-gray-900">{total}</dd></div>
                  <div className="flex gap-2"><dt className="text-gray-500">เสร็จแล้ว</dt><dd className="font-semibold text-gray-900">{percent}%</dd></div>
                </dl>
              </div>
              <ul className="mt-3 space-y-1 text-xs text-gray-600">
                {segments.map((s) => (
                  <li key={s.label} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                      {s.label}
                    </span>
                    <span className="font-medium">{s.value}</span>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main */}
          <main className="flex-1 min-w-0">
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 mb-4">
              <div className="flex gap-2">
                <input
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && add()}
                  placeholder="เพิ่มงานใหม่..."
                  className="flex-1 min-w-0 px-3 py-2.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800 placeholder-gray-400"
                />
                <button
                  onClick={add}
                  disabled={!text.trim()}
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 sm:px-4 py-2.5 rounded-lg bg-gray-900 text-white font-medium hover:bg-gray-700 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
                >
                  <Plus size={18} />
                  <span className="hidden sm:inline">เพิ่ม</span>
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {ORDER.map((k) => (
                  <button
                    key={k}
                    onClick={() => setPriority(k)}
                    className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition-all ${
                      priority === k ? PRIORITIES[k].badge + " ring-2 ring-offset-1 ring-gray-200" : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${PRIORITIES[k].dot}`} />
                    {PRIORITIES[k].label}
                  </button>
                ))}
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label="หมวดหมู่"
                  className="text-sm px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                >
                  {CAT_KEYS.map((k) => (
                    <option key={k} value={k}>{CATEGORIES[k].label}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  aria-label="วันครบกำหนด"
                  className="text-sm px-2 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              </div>
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ค้นหางาน..."
                className="w-full pl-10 pr-9 py-2.5 rounded-xl border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-gray-300 text-gray-800 placeholder-gray-400"
              />
              {query && (
                <button onClick={() => setQuery("")} aria-label="ล้างคำค้นหา" className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600">
                  <X size={16} />
                </button>
              )}
            </div>

            <div className="flex gap-1 p-1 bg-gray-200 bg-opacity-60 rounded-xl mb-4">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  onClick={() => setFilter(f.key)}
                  className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                    filter === f.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>

            {visible.length === 0 ? (
              <div className="bg-white rounded-xl border border-dashed border-gray-200 py-10 text-center text-gray-400">
                {filtering ? "ไม่พบรายการที่ตรงกับตัวกรอง" : EMPTY[filter]}
              </div>
            ) : (
              <ul>
                {visible.map((t) => (
                  <TodoItem
                    key={t.id}
                    todo={t}
                    today={today}
                    onToggle={toggle}
                    onDelete={remove}
                    onEdit={edit}
                    onCyclePriority={cyclePriority}
                    onCycleCategory={cycleCategory}
                  />
                ))}
              </ul>
            )}

            <div className="flex items-center justify-between mt-4 px-1 text-sm">
              <span className="text-gray-500">เหลืออีก {remaining} งาน</span>
              <button
                onClick={clearCompleted}
                disabled={completedCount === 0}
                className="text-gray-500 hover:text-rose-600 disabled:text-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                ล้างงานที่เสร็จแล้ว ({completedCount})
              </button>
            </div>
            <p className="text-xs text-gray-400 text-center mt-6">
              ดับเบิลคลิกที่ข้อความเพื่อแก้ไข • คลิกป้ายความสำคัญหรือหมวดหมู่เพื่อเปลี่ยน
            </p>
          </main>
        </div>
      </div>
    </div>
  );
}
