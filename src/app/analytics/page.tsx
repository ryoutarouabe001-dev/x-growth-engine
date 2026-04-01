const mockSummary = [
  { label: "フォロワー（例）", value: "12,480", delta: "+124（7日）" },
  { label: "プロフィールクリック（例）", value: "820", delta: "+9.2%" },
  { label: "保存率（例）", value: "4.1%", delta: "先週比 +0.3pt" },
  { label: "最強の時間帯（例）", value: "火 21:00", delta: "反応率が高い" },
] as const;

const mockTop = [
  { title: "「毎日投稿してるのに伸びない」原因3選", score: "反応率 7.8%" },
  { title: "副業で最初にやるべきは「月5万」じゃなく〇〇", score: "保存数 高" },
  { title: "AIを丸投げするほど伸びない理由", score: "リプ率 高" },
] as const;

export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-base font-semibold text-slate-100">分析</h1>
        <p className="mt-1 max-w-prose text-xs text-slate-400">
          X の指標を集計し、「増やすべき投稿タイプ」と「弱い時間帯」を週次でまとめます（後続）。
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {mockSummary.map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-slate-800 bg-slate-900/40 p-4"
          >
            <div className="text-xs text-slate-400">{item.label}</div>
            <div className="mt-2 text-xl font-semibold text-slate-50">{item.value}</div>
            <div className="mt-1 text-[11px] text-slate-500">{item.delta}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm font-semibold text-slate-200">伸びた投稿（ダミーランキング）</div>
          <ol className="mt-3 space-y-2">
            {mockTop.map((row, i) => (
              <li
                key={row.title}
                className="flex items-start justify-between gap-3 rounded-lg border border-slate-800 bg-slate-950/60 p-3"
              >
                <div className="min-w-0">
                  <div className="text-[11px] text-slate-500">#{i + 1}</div>
                  <div className="mt-1 text-xs text-slate-200">{row.title}</div>
                </div>
                <div className="shrink-0 text-[11px] text-emerald-300">{row.score}</div>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="text-sm font-semibold text-slate-200">AIインサイト（例）</div>
          <div className="mt-3 space-y-3 text-xs leading-relaxed text-slate-300">
            <p>
              直近7日は「失敗談→学び→次の一手」の3段構成が保存率が高い傾向があります。週2本はその型に寄せるのがおすすめです。
            </p>
            <p>
              木曜の昼はインプレッションは取れる一方、リプ率が低めです。短い質問を最後に添えると会話が始まりやすくなります。
            </p>
            <p className="text-slate-500">
              本番では X API のメトリクスを取り込み、ここを自動更新します。
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
