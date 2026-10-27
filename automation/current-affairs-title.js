'use strict';

const GENERIC_TITLES = new Set([
  'news', 'newsroom', 'press releases', 'press release',
  'latest news', 'media centre', 'media center', 'read more',
  'learn more', 'more', 'home'
]);

function cleanTitle(value) {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/\s+/g, ' ')
    .replace(/^\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+/i, '')
    .replace(/\s+\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)\s*$/i, '')
    .replace(/^(?:(?:joint\s+)?news release|media release|departmental update|feature story|commentary|speech)\s+/i, '')
    .trim();
}

function titleFromUrl(value) {
  try {
    const url = new URL(String(value || ''), 'https://www.unesco.org');
    const parts = url.pathname.split('/').filter(Boolean);
    if (!parts.length) return null;
    const slug = parts[parts.length - 1]
      .replace(/\.(?:html?|amp)$/i, '')
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
    if (slug.length < 12 || GENERIC_TITLES.has(slug.toLowerCase())) return null;
    return slug.replace(/\b\w/g, letter => letter.toUpperCase());
  } catch (_) {
    return null;
  }
}

function normalizeArticleTitle(anchorText, articleUrl) {
  const title = cleanTitle(anchorText);
  if (title.length >= 12 && !GENERIC_TITLES.has(title.toLowerCase())) return title;
  return titleFromUrl(articleUrl);
}

module.exports = { normalizeArticleTitle };
