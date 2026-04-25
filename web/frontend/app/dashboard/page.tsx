"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type Deadline } from "@/lib/api";
import { isLoggedIn, clearToken } from "@/lib/auth";
import Navbar from "@/components/Navbar";

type Urgency = "overdue" | "urgent" | "soon" | "ok";

function getUrgency(due_at: string, status: string): Urgency {
  if (status !== "active") return "ok";
  const diff = new Date(due_at).getTime() - Date.now();
  if (diff < 0) return "overdue";
  if (diff < 24 * 60 * 60 * 1000) return "urgent";
  if (diff < 7 * 24 * 60 * 60 * 1000) return "soon";
  return "ok";
}

const urgencyStyle: Record<Urgency, string> = {
  overdue: "border-l-4 border-red-500 bg-red-50",
  urgent: "border-l-4 border-orange-400 bg-orange-50",
  soon: "border-l-4 border-yellow-400 bg-yellow-50",
  ok: "border-l-4 border-green-400 bg-green-50",
};

const urgencyLabel: Record<Urgency, string> = {
  overdue: "Просрочен",
  urgent: "Срочно",
  soon: "Скоро",
  ok: "На неделе",
};

export default function DashboardPage() {
  const router = useRouter();
  const [deadlines, setDeadlines] = useState<Deadline[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    api.deadlines.list()
      .then(setDeadlines)
      .catch((e) => {
        if (e.message?.includes("401") || e.message?.toLowerCase().includes("unauthorized")) {
          clearToken();
          router.replace("/login");
        }
      })
      .finally(() => setLoading(false));
  }, [router]);

  const markDone = async (id: number) => {
    await api.deadlines.patch(id, { status: "done" });
    setDeadlines((prev) => prev.map((d) => d.id === id ? { ...d, status: "done" } : d));
  };

  const remove = async (id: number) => {
    await api.deadlines.delete(id);
    setDeadlines((prev) => prev.filter((d) => d.id !== id));
  };

  const active = deadlines.filter((d) => d.status === "active");
  const done = deadlines.filter((d) => d.status === "done");
  const overdue = active.filter((d) => new Date(d.due_at) < new Date());

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
        {/* Stats bar */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Всего" value={deadlines.length} color="blue" />
          <StatCard label="Активных" value={active.length} color="green" />
          <StatCard label="Просрочено" value={overdue.length} color="red" />
        </div>

        <h2 className="text-xl font-semibold mb-4">Активные дедлайны</h2>

        {loading && <p className="text-gray-400">Загрузка...</p>}

        {!loading && active.length === 0 && (
          <p className="text-gray-400">Нет активных дедлайнов</p>
        )}

        <div className="flex flex-col gap-3">
          {active.map((d) => {
            const urgency = getUrgency(d.due_at, d.status);
            return (
              <div key={d.id} className={`rounded-xl p-4 shadow-sm flex justify-between items-start ${urgencyStyle[urgency]}`}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-500">{urgencyLabel[urgency]}</span>
                    {d.subject && <span className="text-xs bg-white rounded px-2 py-0.5 border">{d.subject}</span>}
                  </div>
                  <p className="font-medium truncate">{d.title}</p>
                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(d.due_at).toLocaleString("ru-RU", { dateStyle: "medium", timeStyle: "short" })}
                  </p>
                </div>
                <div className="flex gap-2 ml-4 shrink-0">
                  <button
                    onClick={() => markDone(d.id)}
                    className="text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Готово
                  </button>
                  <button
                    onClick={() => remove(d.id)}
                    className="text-xs bg-gray-200 hover:bg-red-500 hover:text-white px-3 py-1.5 rounded-lg transition"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {done.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-8 mb-4 text-gray-400">Выполненные</h2>
            <div className="flex flex-col gap-2">
              {done.map((d) => (
                <div key={d.id} className="rounded-xl p-4 bg-white shadow-sm opacity-60 flex justify-between items-center">
                  <div>
                    <p className="font-medium line-through text-gray-400">{d.title}</p>
                    {d.subject && <p className="text-xs text-gray-400">{d.subject}</p>}
                  </div>
                  <button onClick={() => remove(d.id)} className="text-xs text-gray-300 hover:text-red-500 transition">
                    Удалить
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string; value: number; color: "blue" | "green" | "red" }) {
  const colorMap = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-xl p-4 text-center shadow-sm ${colorMap[color]}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1">{label}</p>
    </div>
  );
}
