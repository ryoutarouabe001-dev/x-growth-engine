import { NextResponse } from "next/server";
import { buildTemplateDraft } from "@/lib/build-amazon-post";
import type { AmazonProduct, AffiliateSettings } from "@/types/affiliate";

type Body = {
  product: AmazonProduct;
  settings: AffiliateSettings;
  style?: "short" | "thread_hint";
};

async function generateWithOpenAI(
  product: AmazonProduct,
  settings: AffiliateSettings,
  style: "short" | "thread_hint",
): Promise<string | null> {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;

  const sys = `あなたは日本語でX（旧Twitter）向けの投稿文案を書くアシスタントです。
- 誇大表現や断定の宣伝は避け、体験メモ・用途・注意点のトーンにします。
- 必ず最後にユーザー指定の「開示」行をそのまま入れます（改行して単独行）。
- リンクURLは本文中に1回だけ、そのまま貼り付けます（短縮や改変はしません）。
- 文字数は${style === "short" ? "230文字前後（日本語）以内を目安" : "400文字前後まで"}に収めます。`;

  const user = JSON.stringify({
    accountTheme: settings.accountTheme,
    disclosure: settings.disclosure,
    style,
    product: {
      title: product.title,
      memo: product.memo,
      tags: product.tags,
      affiliateUrl: product.affiliateUrl,
    },
  });

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.7,
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
  const text = data.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function POST(req: Request) {
  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body.product?.title?.trim() || !body.product?.affiliateUrl?.trim()) {
    return NextResponse.json({ error: "title と affiliateUrl は必須です" }, { status: 400 });
  }

  const settings: AffiliateSettings = {
    disclosure:
      body.settings?.disclosure?.trim() ||
      "※当ポストはアフィリエイト広告を含みます（Amazonアソシエイト）。",
    accountTheme: body.settings?.accountTheme?.trim() || "朝ガジェ",
  };

  const style = body.style === "thread_hint" ? "thread_hint" : "short";

  const ai = await generateWithOpenAI(body.product, settings, style);
  if (ai) {
    return NextResponse.json({ source: "openai", text: ai });
  }

  const text = buildTemplateDraft(body.product, settings, style);
  return NextResponse.json({ source: "template", text });
}
