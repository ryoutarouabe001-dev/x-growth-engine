"use client";

import {
  Check,
  Copy,
  HelpCircle,
  PackagePlus,
  Settings2,
  Sparkles,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { AffiliateSettings, AmazonProduct } from "@/types/affiliate";
import { cn } from "@/lib/utils";

const LS_PRODUCTS = "xge-v1-amazon-products";
const LS_SETTINGS = "xge-v1-affiliate-settings";

const defaultSettings: AffiliateSettings = {
  accountTheme: "朝ガジェ・会社員向け",
  disclosure:
    "※当ポストはアフィリエイト広告を含みます（Amazonアソシエイト）。",
};

type TabKey = "compose" | "add" | "settings";

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

function TabButton(props: {
  active: boolean;
  onClick: () => void;
  icon: ReactNode;
  label: string;
  sub: string;
}) {
  return (
    <button
      type="button"
      onClick={props.onClick}
      className={cn(
        "flex min-h-[52px] flex-1 flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-2 text-center transition-colors",
        props.active
          ? "bg-emerald-500/15 ring-2 ring-emerald-500/50"
          : "bg-slate-900/80 ring-1 ring-slate-800 hover:bg-slate-800",
      )}
    >
      <span className={cn(props.active ? "text-emerald-300" : "text-slate-500")}>
        {props.icon}
      </span>
      <span
        className={cn(
          "text-xs font-semibold",
          props.active ? "text-emerald-100" : "text-slate-200",
        )}
      >
        {props.label}
      </span>
      <span className="hidden text-[10px] text-slate-500 sm:block">{props.sub}</span>
    </button>
  );
}

export default function AmazonAffiliatePage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState<TabKey>("compose");
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
    setTab("compose");
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
      setDraft("通信エラー。通信環境を確認してください。");
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
      setTimeout(() => setCopyState("idle"), 2000);
    } catch {
      setCopyState("err");
    }
  }, [draft]);

  if (!mounted) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center text-sm text-slate-400">
        読み込み中…
      </div>
    );
  }

  const canAdd = title.trim().length > 0 && affiliateUrl.trim().length > 0;
  const step1Done = !!selected;
  const step2Done = draft.trim().length > 0;

  return (
    <div className="mx-auto max-w-lg lg:max-w-3xl">
      <header className="mb-5 space-y-2">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-emerald-500/90">
          Amazonアソシエイト
        </p>
        <h1 className="text-xl font-bold tracking-tight text-white sm:text-2xl">
          3タップの流れで投稿文案まで
        </h1>
        <p className="text-sm leading-relaxed text-slate-400">
          <span className="text-slate-300">① 商品を選ぶ</span>
          <span className="mx-1 text-slate-600">→</span>
          <span className="text-slate-300">② 文案を作る</span>
          <span className="mx-1 text-slate-600">→</span>
          <span className="text-slate-300">③ Xに貼る</span>
          。データはこの端末にだけ保存されます。
        </p>
      </header>

      {/* メインタブ */}
      <div className="mb-5 flex gap-2">
        <TabButton
          active={tab === "compose"}
          onClick={() => setTab("compose")}
          icon={<Sparkles className="h-5 w-5" aria-hidden />}
          label="作る"
          sub="投稿文案"
        />
        <TabButton
          active={tab === "add"}
          onClick={() => setTab("add")}
          icon={<PackagePlus className="h-5 w-5" aria-hidden />}
          label="登録"
          sub="商品追加"
        />
        <TabButton
          active={tab === "settings"}
          onClick={() => setTab("settings")}
          icon={<Settings2 className="h-5 w-5" aria-hidden />}
          label="設定"
          sub="テーマ・開示"
        />
      </div>

      {/* 進捗（作るタブ時） */}
      {tab === "compose" ? (
        <div className="mb-4 flex items-center gap-1 rounded-xl bg-slate-900/50 p-3 text-xs text-slate-400 ring-1 ring-slate-800">
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
              step1Done
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-slate-800 text-slate-500",
            )}
          >
            {step1Done ? <Check className="h-3.5 w-3.5" /> : "1"}
          </span>
          <span className={step1Done ? "text-slate-200" : ""}>商品を選ぶ</span>
          <span className="mx-1 text-slate-600">—</span>
          <span
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-bold",
              step2Done
                ? "bg-emerald-500/20 text-emerald-200"
                : "bg-slate-800 text-slate-500",
            )}
          >
            {step2Done ? <Check className="h-3.5 w-3.5" /> : "2"}
          </span>
          <span className={step2Done ? "text-slate-200" : ""}>文案作成</span>
          <span className="mx-1 text-slate-600">—</span>
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-[11px] font-bold text-slate-500">
            3
          </span>
          <span>コピー</span>
        </div>
      ) : null}

      {tab === "compose" ? (
        <div className="space-y-4">
          {products.length === 0 ? (
            <div className="rounded-2xl bg-slate-900/40 p-6 text-center ring-1 ring-slate-800">
              <p className="text-sm text-slate-300">まだ商品がありません。</p>
              <p className="mt-2 text-xs text-slate-500">
                下の「登録」から、名前とアフィURLだけ入れて保存してください。
              </p>
              <button
                type="button"
                onClick={() => setTab("add")}
                className="mt-4 w-full min-h-[48px] rounded-xl bg-emerald-500/90 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
              >
                商品を登録する
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium text-slate-500">タップして選択</p>
              <ul className="space-y-2">
                {products.map((p) => {
                  const active = p.id === selectedId;
                  return (
                    <li key={p.id}>
                      <button
                        type="button"
                        onClick={() => setSelectedId(p.id)}
                        className={cn(
                          "flex w-full min-h-[56px] items-start gap-3 rounded-2xl p-4 text-left transition-colors ring-1",
                          active
                            ? "bg-emerald-500/10 ring-emerald-500/50"
                            : "bg-slate-900/40 ring-slate-800 hover:bg-slate-900/70",
                        )}
                      >
                        <span
                          className={cn(
                            "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[11px]",
                            active
                              ? "border-emerald-500/60 bg-emerald-500/20 text-emerald-200"
                              : "border-slate-700 bg-slate-950 text-slate-600",
                          )}
                        >
                          {active ? <Check className="h-3.5 w-3.5" /> : ""}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-semibold text-slate-100">
                            {p.title}
                          </span>
                          {p.tags ? (
                            <span className="mt-1 block text-xs text-slate-500">{p.tags}</span>
                          ) : null}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeProduct(p.id);
                          }}
                          className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-rose-500/10 hover:text-rose-300"
                          aria-label="削除"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="rounded-2xl bg-slate-900/40 p-4 ring-1 ring-slate-800">
            <p className="mb-3 text-xs font-medium text-slate-400">文案の長さ</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setStyle("short")}
                className={cn(
                  "min-h-[48px] rounded-xl px-3 py-3 text-sm font-semibold transition-colors ring-1",
                  style === "short"
                    ? "bg-emerald-500/20 text-emerald-100 ring-emerald-500/50"
                    : "bg-slate-950 text-slate-400 ring-slate-800",
                )}
              >
                短文
                <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
                  朝1ポスト向け
                </span>
              </button>
              <button
                type="button"
                onClick={() => setStyle("thread_hint")}
                className={cn(
                  "min-h-[48px] rounded-xl px-3 py-3 text-sm font-semibold transition-colors ring-1",
                  style === "thread_hint"
                    ? "bg-emerald-500/20 text-emerald-100 ring-emerald-500/50"
                    : "bg-slate-950 text-slate-400 ring-slate-800",
                )}
              >
                少し長め
                <span className="mt-0.5 block text-[10px] font-normal text-slate-500">
                  スレ用の素
                </span>
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={generateDraft}
            disabled={!selected || loading}
            className="flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-white text-sm font-bold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Sparkles className="h-4 w-4" aria-hidden />
            {loading ? "つくっている…" : "この内容で文案を作成"}
          </button>

          {source !== "idle" ? (
            <p className="text-center text-[11px] text-slate-500">
              {source === "openai" ? "AIモード（OpenAI）" : "テンプレモード（APIキー不要）"}
            </p>
          ) : null}

          <label className="block">
            <span className="mb-2 block text-xs font-medium text-slate-400">
              文案（直語でもOK）
            </span>
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={10}
              placeholder={
                selected
                  ? "上のボタンで自動作成するか、ここに直接書いてもOKです"
                  : "先に商品を選んでください"
              }
              className="min-h-[200px] w-full rounded-2xl border border-slate-800 bg-slate-950 px-4 py-3 text-base leading-relaxed text-slate-100 outline-none ring-0 focus:border-emerald-500/50"
            />
          </label>

          <details className="rounded-xl bg-slate-900/30 p-3 text-xs text-slate-500 ring-1 ring-slate-800">
            <summary className="flex cursor-pointer items-center gap-2 font-medium text-slate-400">
              <HelpCircle className="h-4 w-4" />
              ヒント（長押しコピー・APIキー）
            </summary>
            <p className="mt-2 leading-relaxed">
              Vercelに環境変数 <code className="text-slate-400">OPENAI_API_KEY</code>{" "}
              を入れると、文案がAI版になります。Amazonのリンクは必ず正規のものを貼ってください。
            </p>
          </details>
        </div>
      ) : null}

      {tab === "add" ? (
        <div className="space-y-4 rounded-2xl bg-slate-900/40 p-4 ring-1 ring-slate-800">
          <p className="text-sm font-semibold text-slate-200">必須は2つだけ</p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">商品名</span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例：Anker モバイルバッテリー"
              className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-base text-slate-100 outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              アフィURL（amzn.to など）
            </span>
            <input
              value={affiliateUrl}
              onChange={(e) => setAffiliateUrl(e.target.value)}
              placeholder="https://amzn.to/xxxx"
              inputMode="url"
              autoComplete="off"
              className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-base text-slate-100 outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              メモ（任意・おすすめ）
            </span>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="どんな人が使う？ 失敗しない条件は？"
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              タグ（任意）
            </span>
            <input
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="通勤, iPhone, 仕事"
              className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-base text-slate-100 outline-none focus:border-emerald-500/50"
            />
          </label>
          <button
            type="button"
            onClick={addProduct}
            disabled={!canAdd}
            className="w-full min-h-[52px] rounded-2xl bg-emerald-500/90 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-40"
          >
            保存して「作る」へ
          </button>
        </div>
      ) : null}

      {tab === "settings" ? (
        <div className="space-y-4 rounded-2xl bg-slate-900/40 p-4 ring-1 ring-slate-800">
          <p className="text-sm font-semibold text-slate-200">アカウントの雰囲気</p>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">テーマ一言</span>
            <input
              value={settings.accountTheme}
              onChange={(e) =>
                setSettings((s) => ({ ...s, accountTheme: e.target.value }))
              }
              className="h-12 w-full rounded-xl border border-slate-800 bg-slate-950 px-4 text-base text-slate-100 outline-none focus:border-emerald-500/50"
            />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-slate-400">
              開示（文末に入ります）
            </span>
            <textarea
              value={settings.disclosure}
              onChange={(e) =>
                setSettings((s) => ({ ...s, disclosure: e.target.value }))
              }
              rows={3}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none focus:border-emerald-500/50"
            />
          </label>
          <p className="text-xs leading-relaxed text-slate-500">
            表現はご自身の責任で調整してください。迷ったらアソシエイトの運用ガイドを確認してください。
          </p>
        </div>
      ) : null}

      {/* 固定フッター：スマホでコピーが常に近い */}
      {tab === "compose" && draft.trim().length > 0 ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur-md lg:hidden">
          <button
            type="button"
            onClick={copyDraft}
            disabled={!draft.trim()}
            className="flex w-full min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-emerald-500/90 text-sm font-bold text-slate-950 hover:bg-emerald-400 disabled:opacity-40"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copyState === "ok" ? "コピーした！Xに貼ってね" : "コピーしてXに貼る"}
          </button>
          {copyState === "err" ? (
            <p className="mt-2 text-center text-xs text-rose-300">
              長押しでコピーできない場合は、上の文案を選択してコピーしてください。
            </p>
          ) : null}
        </div>
      ) : null}

      {/* PCではコピーを通常配置にも出す */}
      {tab === "compose" && draft.trim().length > 0 ? (
        <div className="mt-4 hidden lg:block">
          <button
            type="button"
            onClick={copyDraft}
            className="flex w-full max-w-sm min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-emerald-500/90 text-sm font-bold text-slate-950 hover:bg-emerald-400"
          >
            <Copy className="h-4 w-4" aria-hidden />
            {copyState === "ok" ? "コピー済み" : "コピーしてXに貼る"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
