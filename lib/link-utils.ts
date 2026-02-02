// Link detection and preview utilities

export interface LinkPreview {
  url: string;
  title?: string;
  description?: string;
  image?: string;
}

/**
 * Detect URLs in text
 */
export function detectURLs(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s<]+)/g;
  const matches = text.match(urlRegex);
  return matches ? Array.from(new Set(matches)) : [];
}

/**
 * Check if text contains URLs
 */
export function hasURLs(text: string): boolean {
  return /(https?:\/\/[^\s<]+)/.test(text);
}

/**
 * Highlight URLs in HTML content
 */
export function highlightURLs(html: string): string {
  const urlRegex = /(https?:\/\/[^\s<"'>]+)/g;

  return html.replace(urlRegex, (url) => {
    // Don't double-link already linked URLs
    if (html.includes(`href="${url}"`) || html.includes(`href='${url}'`)) {
      return url;
    }

    return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300">${url}</a>`;
  });
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname;
  } catch {
    return url;
  }
}

/**
 * Shorten URL for display
 */
export function shortenURL(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url;

  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    const path = urlObj.pathname + urlObj.search;

    if (path.length > maxLength - domain.length - 3) {
      return domain + '...' + path.slice(-(maxLength - domain.length - 6));
    }

    return domain + path;
  } catch {
    return url.slice(0, maxLength - 3) + '...';
  }
}
