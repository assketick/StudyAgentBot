"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, FunnelChart, Funnel, LabelList,
} from "recharts";
import { api, type Stats } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Navbar from "@/components/Navbar";

const COLORS = ["#3b82f6", "#22c55e", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    api.stats.get().then(setStats).finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center text-gray-400">Загрузка...</div>
      </div>
    );
  }

  if (!stats) return null;

  const funnelData = [
    { name: "Всего", value: stats.total, fill: "#3b82f6" },
    { name: "Активных", value: stats.active, fill: "#22c55e" },
    { name: "Выполнено", value: stats.done, fill: "#8b5cf6" },
    { name: "Просрочено", value: stats.overdue, fill: "#ef4444" },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-4xl mx-auto w-full px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-8">Статистика</h1>

        {/* Summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <SummaryCard label="Всего" value={stats.total} color="blue" />
          <SummaryCard label="Активных" value={stats.active} color="green" />
          <SummaryCard label="Выполнено" value={stats.done} color="purple" />
          <SummaryCard label="Просрочено" value={stats.overdue} color="red" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* By subject */}
          {stats.by_subject.length > 0 && (
            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold mb-4">По предметам</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stats.by_subject} layout="vertical">
                  <XAxis type="number" allowDecimals={false} />
                  <YAxis type="category" dataKey="subject" width={100} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {stats.by_subject.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Funnel */}
          <div className="bg-white rounded-2xl shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Воронка</h2>
            <ResponsiveContainer width="100%" height={220}>
              <FunnelChart>
                <Tooltip />
                <Funnel dataKey="value" data={funnelData} isAnimationActive>
                  <LabelList position="right" fill="#374151" stroke="none" dataKey="name" />
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </div>
      </main>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    purple: "bg-purple-50 text-purple-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-xl p-4 text-center shadow-sm ${colorMap[color] || "bg-gray-50 text-gray-700"}`}>
      <p className="text-3xl font-bold">{value}</p>
      <p className="text-sm mt-1">{label}</p>
    </div>
  );
}
