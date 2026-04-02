/** Amazon商品ページのURLからASINとドメインを推定（短縮URLは呼び出し側で解決後に使用） */

export function extractAsinFromUrl(urlString: string): {
  asin: string;
  marketplaceHost: "www.amazon.co.jp" | "www.amazon.com";
} | null {
  let s = urlString.trim();
  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s}`;
  }

  let url: URL;
  try {
    url = new URL(s);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase().replace(/^www\./, "");
  const market: "www.amazon.co.jp" | "www.amazon.com" =
    host.endsWith("amazon.co.jp") || host === "amazon.co.jp"
      ? "www.amazon.co.jp"
      : host.endsWith("amazon.com") || host === "amazon.com"
        ? "www.amazon.com"
        : "www.amazon.co.jp";

  const combined = `${url.pathname}${url.search}`;
  const m = combined.match(
    /(?:\/dp\/|\/gp\/product\/|\/gp\/aw\/d\/|\/exec\/obidos\/ASIN\/|\/d\/)([A-Z0-9]{10})(?:[/?]|$)/i,
  );
  if (!m?.[1]) return null;

  return { asin: m[1].toUpperCase(), marketplaceHost: market };
}

export function productPageUrl(
  asin: string,
  marketplaceHost: "www.amazon.co.jp" | "www.amazon.com",
) {
  return `https://${marketplaceHost}/dp/${asin}`;
}

export function parseTitleFromAmazonHtml(html: string): string | null {
  const og =
    html.match(
      /<meta\s+property=["']og:title["']\s+content=["']([^"']*)["']/i,
    ) ||
    html.match(
      /<meta\s+content=["']([^"']*)["']\s+property=["']og:title["']/i,
    );
  if (og?.[1]) {
    return cleanAmazonTitle(decodeHtmlEntities(og[1]));
  }

  const titleMatch = html.match(/<title[^>]*>([^<]{3,500})<\/title>/i);
  if (titleMatch?.[1]) {
    return cleanAmazonTitle(decodeHtmlEntities(titleMatch[1]));
  }

  return null;
}

function decodeHtmlEntities(raw: string) {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
}

function cleanAmazonTitle(t: string) {
  return t
    .replace(/\s+/g, " ")
    .replace(/\s*[|:：]\s*Amazon.*$/i, "")
    .replace(/\s*｜\s*Amazon.*$/i, "")
    .trim();
}
