import { useState, useRef, useEffect } from "react";
import { Plus, Trash2, Check, Pencil, ListChecks } from "lucide-react";

const PRIORITIES = {
  low: { label: "ต่ำ", badge: "bg-emerald-50 text-emerald-700 border-emerald-200", dot: "bg-emerald-500", bar: "border-l-emerald-400" },
  medium: { label: "กลาง", badge: "bg-amber-50 text-amber-700 border-amber-200", dot: "bg-amber-500", bar: "border-l-amber-400" },
  high: { label: "สูง", badge: "bg-rose-50 text-rose-700 border-rose-200", dot: "bg-rose-500", bar: "border-l-rose-400" },
};
const ORDER = ["low", "medium", "high"];

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

function TodoItem({ todo, onToggle, onDelete, onEdit, onCyclePriority }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const inputRef = useRef(null);
  const p = PRIORITIES[todo.priority];

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
        maxHeight: hidden ? 0 : 120,
        opacity: hidden ? 0 : 1,
        transform: todo.leaving ? "translateX(24px)" : "none",
        marginBottom: hidden ? 0 : 10,
        transition: "all 280ms ease",
        overflow: "hidden",
      }}
    >
      <div className={`flex items-center gap-3 bg-white rounded-xl shadow-sm border border-gray-100 border-l-4 ${p.bar} px-3 py-3 sm:px-4`}>
        <button
          onClick={() => onToggle(todo.id)}
          aria-label={todo.done ? "ทำเครื่องหมายว่ายังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จแล้ว"}
          className={`shrink-0 w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
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
        </div>

        <button
          onClick={() => onCyclePriority(todo.id)}
          title="คลิกเพื่อเปลี่ยนระดับความสำคัญ"
          className={`shrink-0 inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${p.badge}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${p.dot}`} />
          {p.label}
        </button>

        {!editing && (
          <button
            onClick={() => setEditing(true)}
            aria-label="แก้ไข"
            className="shrink-0 p-1.5 rounded-md text-gray-300 hover:text-gray-600 hover:bg-gray-100 transition-colors hidden sm:block"
          >
            <Pencil size={16} />
          </button>
        )}
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

export default function TodoApp() {
  const [todos, setTodos] = useState([
    { id: 1, text: "ตอบอีเมลลูกค้า", done: false, priority: "high" },
    { id: 2, text: "ซื้อของเข้าบ้าน", done: false, priority: "medium" },
    { id: 3, text: "อ่านหนังสือ 20 หน้า", done: true, priority: "low" },
  ]);
  const [text, setText] = useState("");
  const [priority, setPriority] = useState("medium");
  const [filter, setFilter] = useState("all");
  const nextId = useRef(4);

  const add = () => {
    const t = text.trim();
    if (!t) return;
    const id = nextId.current++;
    setTodos((prev) => [{ id, text: t, done: false, priority, entering: true }, ...prev]);
    setText("");
    // let the item mount collapsed, then expand
    setTimeout(() => {
      setTodos((prev) => prev.map((x) => (x.id === id ? { ...x, entering: false } : x)));
    }, 20);
  };

  const toggle = (id) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
  const edit = (id, newText) => setTodos((p) => p.map((t) => (t.id === id ? { ...t, text: newText } : t)));
  const cycle = (id) =>
    setTodos((p) =>
      p.map((t) => (t.id === id ? { ...t, priority: ORDER[(ORDER.indexOf(t.priority) + 1) % 3] } : t))
    );

  const remove = (id) => {
    setTodos((p) => p.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
    setTimeout(() => setTodos((p) => p.filter((t) => t.id !== id)), 300);
  };

  const clearCompleted = () => {
    const ids = todos.filter((t) => t.done).map((t) => t.id);
    setTodos((p) => p.map((t) => (t.done ? { ...t, leaving: true } : t)));
    setTimeout(() => setTodos((p) => p.filter((t) => !ids.includes(t.id))), 300);
  };

  const remaining = todos.filter((t) => !t.done).length;
  const completedCount = todos.filter((t) => t.done).length;
  const visible = todos.filter((t) =>
    filter === "all" ? true : filter === "active" ? !t.done : t.done
  );

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-3 sm:py-12 sm:px-4" style={{ fontFamily: "'Noto Sans Thai', 'Sarabun', system-ui, sans-serif" }}>
      <div className="max-w-xl mx-auto">
        <header className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center">
            <ListChecks size={22} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">รายการสิ่งที่ต้องทำ</h1>
        </header>

        {/* Add form */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-3 sm:p-4 mb-5">
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
          <div className="flex items-center gap-2 mt-3">
            <span className="text-sm text-gray-500">ความสำคัญ:</span>
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
          </div>
        </div>

        {/* Filter tabs */}
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

        {/* List */}
        {visible.length === 0 ? (
          <div className="bg-white rounded-xl border border-dashed border-gray-200 py-10 text-center text-gray-400">
            {EMPTY[filter]}
          </div>
        ) : (
          <ul>
            {visible.map((t) => (
              <TodoItem key={t.id} todo={t} onToggle={toggle} onDelete={remove} onEdit={edit} onCyclePriority={cycle} />
            ))}
          </ul>
        )}

        {/* Footer */}
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
        <p className="text-xs text-gray-400 text-center mt-6">ดับเบิลคลิกที่ข้อความเพื่อแก้ไข • คลิกป้ายความสำคัญเพื่อเปลี่ยนระดับ</p>
      </div>
    </div>
  );
}
