"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { saveToken, isLoggedIn, clearToken } from "@/lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoggedIn()) return;
    api.auth.me()
      .then(() => router.replace("/dashboard"))
      .catch(() => clearToken());
  }, [router]);

  useEffect(() => {
    (window as any).onTelegramAuth = async (user: Record<string, string>) => {
      try {
        const { access_token } = await api.auth.telegram(user);
        saveToken(access_token);
        router.replace("/dashboard");
      } catch {
        alert("Ошибка авторизации");
      }
    };
  }, [router]);

  useEffect(() => {
    const botName = process.env.NEXT_PUBLIC_BOT_NAME;
    if (!botName || !containerRef.current) return;

    const script = document.createElement("script");
    script.src = "https://telegram.org/js/telegram-widget.js?22";
    script.setAttribute("data-telegram-login", botName);
    script.setAttribute("data-size", "large");
    script.setAttribute("data-onauth", "onTelegramAuth(user)");
    script.setAttribute("data-request-access", "write");
    script.async = true;
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) containerRef.current.innerHTML = "";
    };
  }, []);

  const botName = process.env.NEXT_PUBLIC_BOT_NAME || "";

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-600 to-blue-400">
      <div className="bg-white rounded-2xl shadow-xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4">
        <h1 className="text-3xl font-bold text-blue-600">StudyBot</h1>
        <p className="text-gray-500 text-center">Войдите через Telegram чтобы управлять дедлайнами</p>

        {botName ? (
          <div ref={containerRef} />
        ) : (
          <p className="text-red-500 text-sm text-center">
            Укажите NEXT_PUBLIC_BOT_NAME в .env.local
          </p>
        )}
      </div>
    </main>
  );
}
