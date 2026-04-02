import { NextResponse } from "next/server";
import {
  extractAsinFromUrl,
  parseTitleFromAmazonHtml,
  productPageUrl,
} from "@/lib/amazon-lookup";

type Body = { url?: string; accountTheme?: string };

const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  "Accept-Language": "ja,en-US;q=0.9,en;q=0.8",
  Accept: "text/html,application/xhtml+xml",
};

async function fetchWithTimeout(url: string, ms: number) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, {
      redirect: "follow",
      headers: BROWSER_HEADERS,
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(t);
  }
}

async function suggestMemoTags(
  title: string,
  accountTheme: string,
): Promise<{ memo: string; tags: string } | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const sys = `あなたはSNS向けに商品を短く紹介するアシスタントです。
出力はJSONだけ。キーは memo, tags。
memo: 日本語で2文以内。誰向けか・よくある失敗回避を箇条書きではなく文章で。
tags: 日本語の短い単語をカンマ区切りで3〜5個（例: 通勤, iPhone, 仕事）。
誇大な効果は書かない。`;

  const user = JSON.stringify({
    productTitle: title,
    accountTheme: accountTheme || "ガジェット",
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.5,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: sys },
        { role: "user", content: user },
      ],
    }),
  });

  if (!res.ok) return null;
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const raw = data.choices?.[0]?.message?.content;
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw) as { memo?: string; tags?: string };
    return {
      memo: (obj.memo ?? "").trim(),
      tags: (obj.tags ?? "").trim(),
    };
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "JSONが不正です" }, { status: 400 });
  }

  const rawUrl = body.url?.trim();
  if (!rawUrl) {
    return NextResponse.json({ error: "url が空です" }, { status: 400 });
  }

  let resolved = rawUrl;
  if (!/^https?:\/\//i.test(resolved)) {
    resolved = `https://${resolved}`;
  }

  try {
    const first = await fetchWithTimeout(resolved, 15_000);
    resolved = first.url || resolved;
  } catch {
    return NextResponse.json(
      { error: "URLに接続できませんでした。リンクが切れていないか確認してください。" },
      { status: 502 },
    );
  }

  const parsed = extractAsinFromUrl(resolved);
  if (!parsed) {
    return NextResponse.json(
      {
        error:
          "商品ASINをURLから認識できませんでした。amazon.co.jp の商品ページまたは amzn.to などの短縮リンクを試してください。",
      },
      { status: 422 },
    );
  }

  const pageUrl = productPageUrl(parsed.asin, parsed.marketplaceHost);

  let html: string;
  try {
    const res = await fetchWithTimeout(pageUrl, 15_000);
    if (!res.ok) {
      return NextResponse.json(
        { error: "商品ページを取得できませんでした（ステータスエラー）。" },
        { status: 502 },
      );
    }
    html = await res.text();
  } catch {
    return NextResponse.json(
      { error: "商品ページの取得がタイムアウトしました。" },
      { status: 502 },
    );
  }

  const title = parseTitleFromAmazonHtml(html);
  if (!title) {
    return NextResponse.json(
      {
        error:
          "商品名をページから読み取れませんでした。Amazon側のブロックやページ構造の可能性があります。商品名は手入力してください。",
        asin: parsed.asin,
      },
      { status: 422 },
    );
  }

  const theme = body.accountTheme?.trim() ?? "";
  const ai = await suggestMemoTags(title, theme);

  return NextResponse.json({
    title,
    memo: ai?.memo ?? "",
    tags: ai?.tags ?? "",
    asin: parsed.asin,
    aiUsed: Boolean(ai),
  });
}
