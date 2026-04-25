"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type AvailableChat } from "@/lib/api";
import { isLoggedIn } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export default function ChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<AvailableChat[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/login"); return; }
    api.chats.available().then(setChats).finally(() => setLoading(false));
  }, [router]);

  const toggle = async (chat: AvailableChat) => {
    setToggling(chat.chat_id);
    try {
      if (chat.subscribed) {
        await api.chats.unsubscribe(chat.chat_id);
      } else {
        await api.chats.subscribe(chat.chat_id);
      }
      setChats((prev) =>
        prev.map((c) => c.chat_id === chat.chat_id ? { ...c, subscribed: !c.subscribed } : c)
      );
    } finally {
      setToggling(null);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="max-w-2xl mx-auto w-full px-4 py-8 flex-1">
        <h1 className="text-2xl font-bold mb-2">Чаты</h1>
        <p className="text-gray-500 mb-6 text-sm">
          Включите мониторинг чатов, в которых бот должен отслеживать дедлайны для вас.
        </p>

        {loading && <p className="text-gray-400">Загрузка...</p>}

        {!loading && chats.length === 0 && (
          <div className="bg-white rounded-xl p-6 text-center shadow-sm text-gray-400">
            Нет доступных чатов. Добавьте бота в групповой чат.
          </div>
        )}

        <div className="flex flex-col gap-3">
          {chats.map((chat) => (
            <div
              key={chat.chat_id}
              className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-medium">{chat.chat_title || `Чат ${chat.chat_id}`}</p>
                <p className="text-xs text-gray-400">ID: {chat.chat_id}</p>
              </div>
              <button
                onClick={() => toggle(chat)}
                disabled={toggling === chat.chat_id}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                  chat.subscribed ? "bg-blue-500" : "bg-gray-200"
                } ${toggling === chat.chat_id ? "opacity-50" : ""}`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    chat.subscribed ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
