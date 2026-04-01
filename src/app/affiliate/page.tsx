"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { AffiliateSettings, AmazonProduct } from "@/types/affiliate";

const LS_PRODUCTS = "xge-v1-amazon-products";
const LS_SETTINGS = "xge-v1-affiliate-settings";

const defaultSettings: AffiliateSettings = {
  accountTheme: "朝ガジェ・会社員向け",
  disclosure:
    "※当ポストはアフィリエイト広告を含みます（Amazonアソシエイト）。",
};

function newId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadProducts(): AmazonProduct[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(LS_PRODUCTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as AmazonProduct[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveProducts(items: AmazonProduct[]) {
  window.localStorage.setItem(LS_PRODUCTS, JSON.stringify(items));
}

function loadSettings(): AffiliateSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = window.localStorage.getItem(LS_SETTINGS);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw) as Partial<AffiliateSettings>;
    return {
      accountTheme: parsed.accountTheme?.trim() || defaultSettings.accountTheme,
      disclosure: parsed.disclosure?.trim() || defaultSettings.disclosure,
    };
  } catch {
    return defaultSettings;
  }
}

function saveSettings(s: AffiliateSettings) {
  window.localStorage.setItem(LS_SETTINGS, JSON.stringify(s));
}

export default function AmazonAffiliatePage() {
  const [mounted, setMounted] = useState(false);
  const [products, setProducts] = useState<AmazonProduct[]>([]);
  const [settings, setSettings] = useState<AffiliateSettings>(defaultSettings);

  const [title, setTitle] = useState("");
  const [affiliateUrl, setAffiliateUrl] = useState("");
  const [memo, setMemo] = useState("");
  const [tags, setTags] = useState("");

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [style, setStyle] = useState<"short" | "thread_hint">("short");
  const [draft, setDraft] = useState("");
  const [source, setSource] = useState<"idle" | "openai" | "template">("idle");
  const [loading, setLoading] = useState(false);
  const [copyState, setCopyState] = useState<"idle" | "ok" | "err">("idle");

  useEffect(() => {
    setMounted(true);
    setProducts(loadProducts());
    setSettings(loadSettings());
  }, []);

  const selected = useMemo(
    () => products.find((p) => p.id === selectedId) ?? null,
    [products, selectedId],
  );

  useEffect(() => {
    if (!mounted) return;
    saveProducts(products);
  }, [mounted, products]);

  useEffect(() => {
    if (!mounted) return;
    saveSettings(settings);
  }, [mounted, settings]);

  const addProduct = useCallback(() => {
    if (!title.trim() || !affiliateUrl.trim()) return;
    const item: AmazonProduct = {
      id: newId(),
      title: title.trim(),
      affiliateUrl: affiliateUrl.trim(),
      memo: memo.trim(),
      tags: tags.trim(),
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [item, ...prev]);
    setSelectedId(item.id);
    setTitle("");
    setAffiliateUrl("");
    setMemo("");
    setTags("");
  }, [title, affiliateUrl, memo, tags]);

  const removeProduct = useCallback((id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setSelectedId((cur) => (cur === id ? null : cur));
  }, []);

  const generateDraft = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    setCopyState("idle");
    try {
      const res = await fetch("/api/affiliate/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: selected, settings, style }),
      });
      const data = (await res.json()) as { text?: string; source?: string; error?: string };
      if (!res.ok) {
        setDraft(data.error || "生成に失敗しました");
        setSource("idle");
        return;
      }
      setDraft(data.text || "");
      setSource(data.source === "openai" ? "openai" : "template");
    } catch {
      setDraft("通信エラー。接続を確認してください。");
      setSource("idle");
    } finally {
      setLoading(false);
    }
  }, [selected, settings, style]);

  const copyDraft = useCallback(async () => {
    if (!draft.trim()) return;
    try {
      await navigator.clipboard.writeText(draft);
      setCopyState("ok");
      setTimeout(() => setCopyState("idle"), 1500);
    } catch {
      setCopyState("err");
    }
  }, [draft]);

  if (!mounted) {
    return (
      <div className="text-sm text-slate-400">読み込み中…</div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 pb-24">
      <header className="space-y-2">
        <h1 className="text-lg font-semibold text-slate-100">Amazonアソシエイト</h1>
        <p className="text-sm leading-relaxed text-slate-400">
          商品はスマホでも登録できます（この端末のブラウザに保存）。リンクはAmazonの正規ツールで作ったものを貼ってください。
          文案は<strong className="font-medium text-slate-300">APIキーなしでもテンプレ生成</strong>、
          Vercelに<code className="mx-1 rounded bg-slate-900 px-1.5 py-0.5 text-xs">OPENAI_API_KEY</code>
          を入れるとAI生成に切り替わります。
        </p>
        <p className="text-xs text-slate-500">
          運用イメージ：週末夜に3件登録 → 文案生成 → X公式アプリに貼って予約投稿（X APIは後で接続）。
        </p>
      </header>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-slate-200">アカウント設定</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <label className="block text-xs text-slate-400">
            テーマ（例：朝ガジェ）
            <input
              value={settings.accountTheme}
              onChange={(e) =>
                setSettings((s) => ({ ...s, accountTheme: e.target.value }))
              }
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/40"
            />
          </label>
          <label className="block text-xs text-slate-400 sm:col-span-2">
            開示（固定で文末に付きます・表現はご自身で調整）
            <textarea
              value={settings.disclosure}
              onChange={(e) =>
                setSettings((s) => ({ ...s, disclosure: e.target.value }))
              }
              rows={2}
              className="mt-1 w-full resize-y rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/40"
            />
          </label>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-slate-200">商品を追加</h2>
        <div className="mt-3 grid gap-3">
          <label className="block text-xs text-slate-400">
            商品名
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：Anker モバイルバッテリー 10000mAh"
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/40"
            />
          </label>
          <label className="block text-xs text-slate-400">
            アフィリエイトURL（正規）
            <input
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://amzn.to/xxxx など"
              inputMode="url"
              autoComplete="off"
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/40"
            />
          </label>
          <label className="block text-xs text-slate-400">
            メモ（用途・こんな人向け）
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              rows={2}
              className="mt-1 w-full resize-y rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/40"
            />
          </label>
          <label className="block text-xs text-slate-400">
            タグ（任意・カンマ区切り）
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="通勤, 仕事, iPhone"
              className="mt-1 w-full rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-emerald-500/40"
            />
          </label>
          <button
            type="button"
            onClick={addProduct}
            disabled={!title.trim() || !affiliateUrl.trim()}
            className="rounded-lg bg-emerald-500/90 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            ライブラリに保存
          </button>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <h2 className="text-sm font-semibold text-slate-200">ライブラリ</h2>
          <p className="text-xs text-slate-500">{products.length}件</p>
        </div>
        {products.length === 0 ? (
          <p className="mt-3 text-sm text-slate-500">まだありません。上から追加してください。</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {products.map((p) => {
              const active = p.id === selectedId;
              return (
                <li
                  key={p.id}
                  className={`rounded-lg border px-3 py-2 ${
                    active
                      ? "border-emerald-500/40 bg-emerald-500/5"
                      : "border-slate-800 bg-slate-950/60"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => setSelectedId(p.id)}
                      className="min-w-0 flex-1 text-left"
                    >
                      <div className="text-sm font-medium text-slate-100">{p.title}</div>
                      {p.tags ? (
                        <div className="mt-1 text-[11px] text-slate-500">{p.tags}</div>
                      ) : null}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      className="shrink-0 rounded-md border border-slate-800 px-2 py-1 text-[11px] text-slate-400 hover:border-rose-500/40 hover:text-rose-200"
                    >
                      削除
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <h2 className="text-sm font-semibold text-slate-200">投稿文案</h2>
        <p className="mt-1 text-xs text-slate-500">
          生成後はコピーしてXに貼り付け。内容は必ず目視で確認してください。
        </p>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-xs text-slate-300">
            <span className="text-slate-500">体裁</span>
            <select
              value={style}
              onChange={(e) =>
                setStyle(e.target.value === "thread_hint" ? "thread_hint" : "short")
              }
              className="rounded-lg border border-slate-800 bg-slate-950 px-2 py-2 text-xs text-slate-100 outline-none"
            >
              <option value="short">短文（朝の1ポスト向け）</option>
              <option value="thread_hint">スレ用・少し長めの素</option>
            </select>
          </label>
          <button
            type="button"
            onClick={generateDraft}
            disabled={!selected || loading}
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-sm font-medium text-slate-100 hover:bg-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "生成中…" : "文案を生成"}
          </button>
          {source !== "idle" ? (
            <span className="text-[11px] text-slate-500">
              モード: {source === "openai" ? "OpenAI" : "テンプレ（APIキーなし）"}
            </span>
          ) : null}
        </div>

        <textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={12}
          placeholder={selected ? "「文案を生成」を押してください" : "ライブラリで商品を選んでください"}
          className="mt-3 w-full resize-y rounded-lg border border-slate-800 bg-slate-950 px-3 py-2 font-mono text-xs leading-relaxed text-slate-100 outline-none focus:border-emerald-500/40"
        />

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={copyDraft}
            disabled={!draft.trim()}
            className="rounded-lg bg-emerald-500/90 px-4 py-2.5 text-sm font-medium text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            コピー
          </button>
          {copyState === "ok" ? (
            <span className="text-xs text-emerald-300">コピーしました</span>
          ) : null}
          {copyState === "err" ? (
            <span className="text-xs text-rose-300">コピーできませんでした（手動選択でコピーしてください）</span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
