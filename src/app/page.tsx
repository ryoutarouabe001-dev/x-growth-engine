import type { ReactNode } from "react";
import { Bookmark, MessageCircle, TrendingUp, Users } from "lucide-react";

const mockStats = {
  impressionsToday: 12840,
  followersDelta: 124,
  engagementRate: 5.4,
  saves: 312,
};

const mockSuggestions = [
  {
    id: 1,
    type: "スレッド",
    title: "副業で月5万円を達成するまでに本当にやったことだけを書く",
  },
  {
    id: 2,
    type: "単発",
    title: "「伸びないX運用」がやりがちな3つのミスと、1つだけ意識すべきこと",
  },
  {
    id: 3,
    type: "単発",
    title: "AIを“丸投げ”してる人ほど伸びない理由と、正しい使い方",
  },
];

const mockTopTweets = [
  {
    id: "a",
    title: "毎日投稿してるのに伸びない人の特徴は…",
    impressions: 26800,
    engagementRate: 7.8,
  },
  {
    id: "b",
    title: "副業で月5万稼ぐより、まずは“1万円の作り方”を覚えるべき理由",
    impressions: 18400,
    engagementRate: 6.2,
  },
  {
    id: "c",
    title: "AIに丸投げする前に、“ここ”だけは自分で決めるべき",
    impressions: 15200,
    engagementRate: 5.9,
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" aria-hidden />}
          label="本日のインプレッション（例）"
          value={mockStats.impressionsToday.toLocaleString()}
          note="サンプル数値。API接続後に置き換え"
        />
        <StatCard
          icon={<Users className="h-4 w-4 text-sky-400" aria-hidden />}
          label="本日のフォロワー増（例）"
          value={`+${mockStats.followersDelta.toLocaleString()}`}
          note="目標は運用設計で設定"
        />
        <StatCard
          icon={<MessageCircle className="h-4 w-4 text-violet-400" aria-hidden />}
          label="エンゲージメント率（例）"
          value={`${mockStats.engagementRate.toFixed(1)}%`}
          note="リプ・いいね・引用などの比率イメージ"
        />
        <StatCard
          icon={<Bookmark className="h-4 w-4 text-amber-400" aria-hidden />}
          label="保存（ブクマ）"
          value={mockStats.saves.toLocaleString()}
          note="資産になる投稿の蓄積"
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <h2 className="text-sm font-semibold text-slate-200">
            今日の運用プラン（例）
          </h2>
          <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
            <ol className="space-y-3 text-sm text-slate-200">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-emerald-500/60 text-[10px] text-emerald-300">
                  1
                </span>
                <div>
                  <div className="font-medium">朝：共感を狙った体験談ポスト</div>
                  <p className="mt-1 text-xs text-slate-400">
                    通勤帯向け。短文＋学び1つで軽く刺さる構成。
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-sky-500/60 text-[10px] text-sky-300">
                  2
                </span>
                <div>
                  <div className="font-medium">昼：保存を狙ったノウハウ系スレッド</div>
                  <p className="mt-1 text-xs text-slate-400">
                    手順・チェックリスト型はブクマされやすい。
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full border border-violet-500/60 text-[10px] text-violet-300">
                  3
                </span>
                <div>
                  <div className="font-medium">夜：実績＋次の一歩（CTA）</div>
                  <p className="mt-1 text-xs text-slate-400">
                    プロフィール遷移やDM相談につながる一文を添える。
                  </p>
                </div>
              </li>
            </ol>
          </div>

          <h2 className="mt-6 text-sm font-semibold text-slate-200">
            伸びた投稿イメージ（表）
          </h2>
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/40">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs text-slate-400">
                  <th className="py-2 pl-4 pr-2 font-medium">内容</th>
                  <th className="px-2 text-right font-medium">インプレ（例）</th>
                  <th className="px-2 pr-4 text-right font-medium">反応率（例）</th>
                </tr>
              </thead>
              <tbody>
                {mockTopTweets.map((t) => (
                  <tr key={t.id} className="border-b border-slate-900/60 last:border-0">
                    <td className="py-2 pl-4 pr-2 align-top">
                      <div className="line-clamp-2 text-xs text-slate-200">{t.title}</div>
                    </td>
                    <td className="px-2 text-right text-xs text-slate-300">
                      {t.impressions.toLocaleString()}
                    </td>
                    <td className="px-2 pr-4 text-right text-xs text-emerald-300">
                      {t.engagementRate.toFixed(1)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-200">ツイート案（例）</h2>
          <div className="space-y-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3">
            {mockSuggestions.map((s) => (
              <div
                key={s.id}
                className="rounded-lg border border-slate-800 bg-slate-900/80 p-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] uppercase tracking-[0.16em] text-slate-400">
                    {s.type}
                  </span>
                  <button
                    type="button"
                    className="text-[11px] text-emerald-300 hover:text-emerald-200"
                  >
                    開く
                  </button>
                </div>
                <p className="mt-2 line-clamp-3 text-xs text-slate-200">{s.title}</p>
              </div>
            ))}
            <button
              type="button"
              className="mt-2 w-full rounded-lg bg-emerald-500/90 py-2 text-xs font-medium text-slate-950 transition-colors hover:bg-emerald-400"
            >
              AIで案を追加（接続予定）
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function StatCard(props: {
  icon: ReactNode;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
      <div className="flex items-center gap-2 text-xs text-slate-400">
        {props.icon}
        <span>{props.label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-50">{props.value}</div>
      {props.note ? (
        <div className="mt-1 text-[11px] text-slate-500">{props.note}</div>
      ) : null}
    </div>
  );
}
