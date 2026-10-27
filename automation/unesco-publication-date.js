'use strict';

// Extract the publisher's original calendar date from the primary article
// metadata. Ignore datePublished values belonging to unrelated JSON-LD entities.
const ARTICLE_TYPES = new Set([
  'Article', 'NewsArticle', 'Report', 'BlogPosting',
  'ScholarlyArticle', 'PressRelease'
]);

function typeNames(value) {
  return (Array.isArray(value) ? value : [value])
    .filter(item => typeof item === 'string')
    .map(item => item.split(/[\/#]/).pop());
}

function collectArticleDates(value, output) {
  if (!value || typeof value !== 'object') return;
  if (Array.isArray(value)) {
    for (const item of value) collectArticleDates(item, output);
    return;
  }
  const types = typeNames(value['@type']);
  if (types.some(type => ARTICLE_TYPES.has(type)) &&
      typeof value.datePublished === 'string') {
    output.push(value.datePublished.trim());
  }
  for (const [key, child] of Object.entries(value)) {
    if (key !== 'datePublished') collectArticleDates(child, output);
  }
}

function extractPublicationValues(html) {
  const articleValues = [];
  for (const match of String(html || '').matchAll(
    /<script\b[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  )) {
    try {
      collectArticleDates(JSON.parse(match[1].replace(/^\s*<!--|-->\s*$/g, '')), articleValues);
    } catch (_) {
      // Ignore malformed unrelated JSON-LD blocks; a valid primary article
      // record or explicit publisher meta value may still be present.
    }
  }
  if (articleValues.length) return articleValues;

  // Fallback only when no typed article publication date was found.
  const values = [];
  for (const tagMatch of String(html || '').matchAll(/<meta\b[^>]*>/gi)) {
    const tag = tagMatch[0];
    const property = tag.match(/\bproperty\s*=\s*["']([^"']+)["']/i)?.[1];
    const name = tag.match(/\bname\s*=\s*["']([^"']+)["']/i)?.[1];
    const content = tag.match(/\bcontent\s*=\s*["']([^"']+)["']/i)?.[1];
    if (content && [property, name].filter(Boolean)
      .some(key => /^(?:article:published_time|datePublished)$/i.test(key.trim()))) {
      values.push(content.trim());
    }
  }
  return values;
}

function validCalendarDate(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(\d{4}-\d{2}-\d{2})(?:T|\s|$)/);
  if (!match || !Number.isFinite(Date.parse(text))) return null;
  const day = Date.parse(match[1] + 'T00:00:00.000Z');
  if (!Number.isFinite(day) ||
      new Date(day).toISOString().slice(0, 10) !== match[1]) return null;
  return match[1];
}

function extractOriginalPublicationDate(html) {
  const values = extractPublicationValues(html);
  if (!values.length) return null;
  const dates = values.map(validCalendarDate);
  if (dates.some(date => date === null)) return null;
  const unique = [...new Set(dates)];
  return unique.length === 1 ? unique[0] : null;
}

module.exports = { extractOriginalPublicationDate };
