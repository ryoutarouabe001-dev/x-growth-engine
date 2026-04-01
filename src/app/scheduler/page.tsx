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
];

export default function SchedulerPage() {
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-semibold text-slate-100">
            投稿スケジュール
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            「いつ・どんな意図で」投稿するかを設計し、X運用を自動化します。
          </p>
        </div>
        <div className="flex gap-2">
          <button className="rounded-lg border border-slate-700 bg-slate-900/60 px-3 py-1.5 text-xs text-slate-200 hover:bg-slate-800">
            今週のプランをAIに提案させる
          </button>
          <button className="rounded-lg bg-emerald-500/90 px-3 py-1.5 text-xs font-medium text-slate-950 hover:bg-emerald-400">
            新しい枠を追加
          </button>
        </div>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>今日のスケジュール</span>
          <span className="text-[11px]">
            自動投稿:{" "}
            <span className="text-emerald-300 font-medium">
              {mockSchedule.filter((s) => s.status === "scheduled").length}件
            </span>
          </span>
        </div>

        <div className="mt-3 space-y-2">
          {mockSchedule.map((slot) => (
            <div
              key={slot.id}
              className="flex items-start justify-between rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2"
            >
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-slate-100">
                    {slot.time}
                  </span>
                  <span className="rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[11px] text-slate-300">
                    {slot.type}
                  </span>
                </div>
                <p className="mt-1 text-[11px] text-slate-400">{slot.note}</p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] ${
                    slot.status === "scheduled"
                      ? "border border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                      : "border border-amber-500/40 bg-amber-500/10 text-amber-200"
                  }`}
                >
                  {slot.status === "scheduled" ? "SCHEDULED" : "DRAFT"}
                </span>
                <button className="text-[11px] text-slate-400 hover:text-slate-200">
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
