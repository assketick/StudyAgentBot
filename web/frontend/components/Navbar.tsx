"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { clearToken } from "@/lib/auth";

export default function Navbar() {
  const router = useRouter();

  const logout = () => {
    clearToken();
    router.replace("/");
  };

  return (
    <nav className="bg-white border-b px-6 py-3 flex items-center justify-between shadow-sm">
      <Link href="/dashboard" className="text-blue-600 font-bold text-lg">
        StudyBot
      </Link>
      <div className="flex gap-6 text-sm font-medium">
        <Link href="/dashboard" className="hover:text-blue-600 transition">Дедлайны</Link>
        <Link href="/chats" className="hover:text-blue-600 transition">Чаты</Link>
        <Link href="/stats" className="hover:text-blue-600 transition">Статистика</Link>
        <button onClick={logout} className="text-gray-400 hover:text-red-500 transition">
          Выйти
        </button>
      </div>
    </nav>
  );
}
