const mockThreads = [
  {
    id: "t1",
    handle: "@user_alpha",
    last: "この投稿の〇〇の部分、もう少し具体例ある？",
    unread: true,
  },
  {
    id: "t2",
    handle: "@user_beta",
    last: "記事のリンク送ってくれてありがとう、保存しました",
    unread: false,
  },
  {
    id: "t3",
    handle: "@user_gamma",
    last: "同じく副業やってます、仲良くしましょう",
    unread: true,
  },
] as const;

const mockReplies = [
  "ありがとうございます。具体例は次のツイートで図解します！",
  "了解です。要点は「毎日やることは1つだけ」に絞ることですね。",
  "助かります。同じ方向性の人が増えると情報の質も上がるので嬉しいです。",
] as const;

export default function InboxPage() {
  return (
    <div className="space-y-4">
      <header>
        <h1 className="text-base font-semibold text-slate-100">リプ / メンション</h1>
        <p className="mt-1 max-w-prose text-xs text-slate-400">
          X API で取得した会話をここに並べ、返信候補はワンタップ送信（後続）にします。
        </p>
      </header>

      <div className="grid gap-4 lg:grid-cols-5">
        <section className="rounded-xl border border-slate-800 bg-slate-900/40 lg:col-span-2">
          <div className="border-b border-slate-800 px-3 py-2 text-xs text-slate-400">
            スレッド一覧（ダミー）
          </div>
          <ul className="divide-y divide-slate-900/60">
            {mockThreads.map((t) => (
              <li key={t.id}>
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-2 px-3 py-3 text-left hover:bg-slate-900/50"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-slate-100">{t.handle}</span>
                      {t.unread ? (
                        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] text-emerald-300">
                          未読
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 line-clamp-2 text-[11px] text-slate-400">{t.last}</p>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-slate-800 bg-slate-900/40 lg:col-span-3">
          <div className="border-b border-slate-800 px-4 py-2 text-xs text-slate-400">
            会話プレビュー（ダミー）／返信候補
          </div>
          <div className="grid gap-4 p-4 lg:grid-cols-2">
            <div className="space-y-3">
              <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-xs text-slate-200">
                <div className="text-[11px] text-slate-500">相手</div>
                <p className="mt-1 leading-relaxed">
                  この投稿の〇〇の部分、もう少し具体例ある？
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/25 bg-emerald-500/5 p-3 text-xs text-slate-200">
                <div className="text-[11px] text-slate-500">あなた（下書き）</div>
                <p className="mt-1 leading-relaxed">
                  了解。次は「Before/After」を1枚図にして投稿するね。
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-200">返信候補（AI・接続予定）</div>
              <div className="space-y-2">
                {mockReplies.map((text) => (
                  <button
                    key={text}
                    type="button"
                    className="w-full rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-left text-xs text-slate-200 hover:border-slate-700 hover:bg-slate-900/60"
                  >
                    {text}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="w-full rounded-lg bg-emerald-500/90 py-2 text-xs font-medium text-slate-950 hover:bg-emerald-400"
              >
                送信（API接続後）
              </button>
              <p className="text-[11px] leading-relaxed text-slate-500">
                完全自動送信はスパム判定のリスクがあるため、送信は必ず人の最終確認を前提にします。
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
