const mockSchedule = [
  {
    id: 1,
    time: "07:30",
    type: "共感ポスト",
    status: "scheduled",
    note: "朝の通勤時間帯向け。軽い体験談＋学び1つ。",
  },
  {
    id: 2,
    time: "12:15",
    type: "ノウハウスレッド",
    status: "draft",
    note: "保存を狙った5〜7ツイートのスレッド案。",
  },
  {
    id: 3,
    time: "21:00",
    type: "実績＋オファー",
    status: "scheduled",
    note: "プロフィール遷移とDM相談を狙うCTA付き。",
  },
] as const;

export default function SchedulerPage() {
  const scheduledCount = mockSchedule.filter((s) => s.status === "scheduled").length;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-100">投稿スケジュール</h1>
          <p className="mt-1 max-w-prose text-xs text-slate-400">
            いつ・どんな目的で投稿するかを決め、予約投稿API（後続）につなげます。
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800"
          >
            今週のプランをAIに提案（接続予定）
          </button>
          <button
            type="button"
            className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400"
          >
            新しい枠を追加
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>今日のスケジュール（ダミー）</span>
          <span className="text-[11px]">
            予約済み:{" "}
            <span className="font-medium text-emerald-300">{scheduledCount}件</span>
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {mockSchedule.map((slot) => (
            <div
              key={slot.id}
              className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-sm font-semibold text-slate-100">{slot.time}</span>
                  <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300">
                    {slot.type}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{slot.note}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                    slot.status === "scheduled"
                      ? "border border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border border-amber-500/40 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  {slot.status === "scheduled" ? "scheduled" : "draft"}
                </span>
                <button
                  type="button"
                  className="text-[11px] text-slate-400 hover:text-slate-200"
                >
                  詳細・編集
                </button>
              </div>

            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
