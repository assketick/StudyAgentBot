import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center flex-1 px-4 py-24 text-center bg-gradient-to-b from-blue-600 to-blue-400 text-white">
        <h1 className="text-5xl font-bold mb-4">StudyBot</h1>
        <p className="text-xl mb-2 max-w-lg">Твой AI-помощник для учёбы</p>
        <p className="text-blue-100 mb-10 max-w-lg">
          Дедлайны из Telegram-чатов, умные напоминания и голосовой ввод — всё в одном месте.
        </p>
        <Link
          href="/login"
          className="bg-white text-blue-600 font-semibold px-8 py-3 rounded-full shadow hover:bg-blue-50 transition"
        >
          Войти через Telegram
        </Link>
      </section>

      {/* Features */}
      <section className="py-20 px-4 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center mb-12">Возможности</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard
            icon="📅"
            title="Дедлайны"
            desc="Бот автоматически извлекает дедлайны из сообщений в групповых чатах."
          />
          <FeatureCard
            icon="🔔"
            title="Напоминания"
            desc="Получай уведомления заранее — не пропусти ни одного задания."
          />
          <FeatureCard
            icon="🎙️"
            title="Голосовой ввод"
            desc="Добавляй задания голосом — бот распознает и сохранит дедлайн."
          />
        </div>
      </section>

      <footer className="text-center py-6 text-sm text-gray-400">
        © 2026 StudyBot
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <div className="bg-white rounded-2xl shadow p-6 flex flex-col items-center text-center gap-3">
      <span className="text-4xl">{icon}</span>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-gray-500 text-sm">{desc}</p>
    </div>
  );
}
