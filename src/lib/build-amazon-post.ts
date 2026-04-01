import type { AmazonProduct, AffiliateSettings } from "@/types/affiliate";

export type DraftStyle = "short" | "thread_hint";

function firstLine(text: string) {
  const t = text.trim();
  if (!t) return "";
  return t.split(/\n/)[0] ?? "";
}

/** OpenAIなしでも動く文案（朝ガジェ・短文向け） */
export function buildTemplateDraft(
  product: AmazonProduct,
  settings: AffiliateSettings,
  style: DraftStyle,
): string {
  const theme = settings.accountTheme.trim() || "ガジェット";
  const memo = firstLine(product.memo) || "用途がはっきりしていて失敗しにくい型";
  const tags = product.tags.trim() ? `（${product.tags}）` : "";

  const core =
    style === "short"
      ? [
          `【${theme}】今日の1つ${tags}`,
          `${product.title}`,
          `私のメモ：${product.memo.trim() || "買う前に確認したいのは用途と相性。"}`,
          "",
          `▼詳細・価格はこちら`,
          product.affiliateUrl.trim(),
          "",
          settings.disclosure.trim(),
        ]
      : [
          `【${theme}】週末にまとめ投稿用・スレッドの素${tags}`,
          `1/ ${product.title}`,
          `ポイント：${memo}`,
          `2/ 迷ったら「毎日使うか」「代替があるか」を先に決めると失敗が減る`,
          `3/ 価格変動するので最新はリンク先で`,
          "",
          product.affiliateUrl.trim(),
          "",
          settings.disclosure.trim(),
        ];

  return core.filter(Boolean).join("\n").trim();
}
